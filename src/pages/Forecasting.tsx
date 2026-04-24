// import { useState, useMemo, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { TrendingUp, Loader2, Info, AlertTriangle } from "lucide-react";
// import SummaryCard from "@/components/SummaryCard";
// import {
//   Tooltip as UITooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useNavigate } from "react-router-dom";
// import { toast } from "@/hooks/use-toast";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// interface ChartDataPoint {
//   period: string;
//   actual: number | null;
//   forecast: number | null;
// }

// const Forecasting = () => {
//   const navigate = useNavigate();

//   // API states
//   const [metadata, setMetadata] = useState(null);
//   const [forecastResult, setForecastResult] = useState(null);

//   // Form states
//   const [role, setRole] = useState<string>("");
//   const [entity, setEntity] = useState<string>("");
//   const [commodity, setCommodity] = useState<string>("");
//   const [region, setRegion] = useState<string>("");
//   const [type, setType] = useState<string>("");
//   const [quarter, setQuarter] = useState<string>("");
//   const [year, setYear] = useState<string>("");

//   const [loadingMetadata, setLoadingMetadata] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showResults, setShowResults] = useState(false);

//   // Fetch metadata on mount
//   useEffect(() => {
//     const fetchMetadata = async () => {
//       try {
//         const response = await fetch(
//           "https://d2m11qgy1b40kt.cloudfront.net/metadata",
//           {
//           method: "GET",
//           headers: {
//             "Accept" : "application/json",
//           },
//         },

//         );
//         if (!response.ok) throw new Error("Failed to fetch metadata");
//         const data = await response.json();
//         setMetadata(data);
//       } catch (error) {
//         console.error("Metadata fetch error:", error);
//         toast({
//           title: "Error",
//           description: "Failed to load metadata. Using fallback options.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoadingMetadata(false);
//       }
//     };

//     fetchMetadata();
//   }, []);

//   // Derived options from metadata (dynamic dropdowns)
//   const commodities = useMemo(() => metadata?.commodities || [], [metadata]);
//   const regionsList = useMemo(() => metadata?.regions || [], [metadata]);
//   const typesList = useMemo(() => metadata?.types || [], [metadata]);
//   const quartersList = useMemo(
//     () => metadata?.quarters || ["Q1", "Q2", "Q3", "Q4"],
//     [metadata],
//   );
//   const yearsList = useMemo(() => {
//     const pastYears = metadata?.years || [];
//     // Include future years for forecasting (API example uses 2026)
//     return [...new Set([2026, 2027])].sort((a, b) => a - b);
//   }, [metadata]);

//   const entities = useMemo(() => {
//     if (!role || !metadata) return [];
//     return role.toLowerCase() === "buyer"
//       ? metadata.buyer_ids || []
//       : metadata.seller_ids || [];
//   }, [role, metadata]);

//   const isBuyer = role.toLowerCase() === "buyer";

//   const canRun = !!(
//     role &&
//     entity &&
//     commodity &&
//     type &&
//     quarter &&
//     year &&
//     region
//   );

//   // Run forecast API call
//   const handleForecast = async () => {
//     if (!canRun) return;

//     setLoading(true);
//     setShowResults(false);
//     setForecastResult(null);

//     try {
//       const payload = {
//         entity_id: entity,
//         role: role.toLowerCase(),
//         commodity: commodity,
//         type: type,
//         year: parseInt(year),
//         quarter: quarter,
//         region: region,
//       };

//       const response = await fetch(
//         "https://d2m11qgy1b40kt.cloudfront.net/forecast",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept" : "application/json",
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       setForecastResult(data);
//       setShowResults(true);
//     } catch (error) {
//       console.error("Forecast error:", error);
//       toast({
//         title: "Forecast Failed",
//         description:
//           error.message || "Unable to generate forecast. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Prepare chart data (historical vs forecast)
//   const chartData = useMemo((): ChartDataPoint[] => {
//     if (!forecastResult) return [];

//     const historical = forecastResult.historical_trend || [];
//     const forecastTrend = forecastResult.forecast_trend || [];

//     const dataMap: Record<string, ChartDataPoint> = {};

//     // Process historical data
//     historical.forEach((item: any) => {
//       const period = item.period;
//       if (period) {
//         dataMap[period] = {
//           period,
//           actual: Number(item.quantity) || 0,
//           forecast: null,
//         };
//       }
//     });

//     // Process forecast data
//     forecastTrend.forEach((item: any) => {
//       const period = item.period;
//       if (period) {
//         if (!dataMap[period]) {
//           dataMap[period] = {
//             period,
//             actual: null,
//             forecast: Number(item.quantity) || 0,
//           };
//         } else {
//           dataMap[period].forecast = Number(item.quantity) || 0;
//         }
//       }
//     });

//     // Convert to array and sort chronologically
//     return Object.values(dataMap).sort((a, b) =>
//       a.period.localeCompare(b.period),
//     );
//   }, [forecastResult]);

//   // Forecast values for display (single quantity from API)
//   const forecastValues = useMemo(() => {
//     if (!forecastResult) return null;
//     return {
//       totalVal: forecastResult.forecast_quantity || 0,
//       trend: `${forecastResult.growth_percent || 0}%`,
//       confidence: forecastResult.confidence_score || 0,
//     };
//   }, [forecastResult]);

//   // Forecast summary (uses supply_summary from API when available for buyers)
//   const forecastSummary = useMemo(() => {
//     if (!forecastResult?.supply_summary || !isBuyer) return null;

//     const ss = forecastResult.supply_summary;
//     const gap = ss.surplus || 0;

//     return {
//       totalSellerSupply: ss.total_supply || 0,
//       totalDemand: ss.demand || forecastResult.forecast_quantity || 0,
//       gap: gap,
//       topSellers: ss.top_sellers || [],
//       shortage: gap < 0 ? Math.abs(gap) : 0,
//       matchingSellers: ss.top_sellers ? ss.top_sellers.length : 0,
//     };
//   }, [forecastResult, isBuyer]);

//   // Dynamic insights (based on real API data)
//   const insightMessages = useMemo(() => {
//     if (!forecastResult) return [];
//     const growth = forecastResult.growth_percent || 0;

//     if (isBuyer) {
//       return [
//         `${entity} shows ${growth >= 0 ? "increasing" : "decreasing"} ${commodity} demand trend`,
//         `Forecasted demand is ${growth}% ${growth >= 0 ? "higher" : "lower"} than previous`,
//         "Consider locking supply contracts early for better rates",
//       ];
//     } else {
//       return [
//         `${entity} has consistent ${commodity} supply trend`,
//         `Projected supply growth: ${growth}%`,
//         "Monitor market conditions for optimal selling window",
//       ];
//     }
//   }, [forecastResult, entity, commodity, isBuyer]);

//   const handleRoleChange = (v: string) => {
//     setRole(v);
//     setEntity("");
//   };

//   const handleCommodityChange = (v: string) => {
//     setCommodity(v);
//     setEntity("");
//     setType("");
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center gap-2">
//         <h1 className="text-2xl font-bold font-display">Forecasting</h1>
//         <UITooltip>
//           <TooltipTrigger>
//             <Info className="w-4 h-4 text-muted-foreground" />
//           </TooltipTrigger>
//           <TooltipContent className="max-w-xs">
//             <p className="text-xs">
//               Forecast is generated using historical transaction data and
//               time-series models.
//             </p>
//           </TooltipContent>
//         </UITooltip>
//       </div>

//       <Card className="shadow-card">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-sm">Forecast Parameters</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {/* Commodity */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Commodity</Label>
//               <Select value={commodity} onValueChange={handleCommodityChange}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select commodity" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {commodities.map((c) => (
//                     <SelectItem key={c} value={c}>
//                       {c}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Region */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Region</Label>
//               <Select value={region} onValueChange={setRegion}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select region" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {regionsList.map((r) => (
//                     <SelectItem key={r} value={r}>
//                       {r}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Role */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Role</Label>
//               <Select value={role} onValueChange={handleRoleChange}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Buyer">Buyer</SelectItem>
//                   <SelectItem value="Seller">Seller</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Entity */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Entity</Label>
//               <Select
//                 value={entity}
//                 onValueChange={setEntity}
//                 disabled={!role || entities.length === 0}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select entity" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {entities.map((id) => (
//                     <SelectItem key={id} value={id}>
//                       {id}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Type */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Type</Label>
//               <Select
//                 value={type}
//                 onValueChange={setType}
//                 disabled={!commodity}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {typesList.map((t) => (
//                     <SelectItem key={t} value={t}>
//                       {t}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Quarter */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Quarter</Label>
//               <Select value={quarter} onValueChange={setQuarter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select quarter" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {quartersList.map((q) => (
//                     <SelectItem key={q} value={q}>
//                       {q}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Year */}
//             <div className="space-y-1.5">
//               <Label className="text-xs">Year</Label>
//               <Select value={year} onValueChange={setYear}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select year" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {yearsList.map((y) => (
//                     <SelectItem key={y} value={y.toString()}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Button
//             className="mt-6 w-30"
//             onClick={handleForecast}
//             disabled={!canRun || loading || loadingMetadata}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                 Running Forecast...
//               </>
//             ) : (
//               "Run Forecast"
//             )}
//           </Button>
//         </CardContent>
//       </Card>

//       {loading && (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="w-8 h-8 animate-spin text-primary" />
//         </div>
//       )}

//       {showResults && forecastResult && forecastValues && (
//         <div className="space-y-4 animate-fade-in">
//           {/* Main projection banner */}
//           <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
//             <span className="font-medium text-foreground">{entity}</span> is
//             projected to {isBuyer ? "require" : "supply"}{" "}
//             <span className="font-medium text-foreground">
//               {forecastValues.totalVal.toLocaleString()} Qt
//             </span>{" "}
//             of {commodity} in {quarter} {year}, reflecting a{" "}
//             <span className="font-medium text-primary">
//               {forecastValues.trend}
//             </span>{" "}
//             growth trend with{" "}
//             <span className="font-medium text-primary">
//               {forecastValues.confidence}%
//             </span>{" "}
//             confidence.
//           </div>

//           {/* Buyer-specific Supply Summary using API supply_summary */}
//           {forecastSummary && isBuyer && (
//             <Card className="shadow-card border-primary/20">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm flex items-center gap-2">
//                   <TrendingUp className="w-4 h-4 text-primary" /> Market Supply
//                   Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-sm text-muted-foreground">
//                   Total forecasted supply from sellers:{" "}
//                   <span className="font-medium">
//                     {forecastSummary.totalSellerSupply.toLocaleString()} Qt
//                   </span>
//                   <br />
//                   Your projected demand:{" "}
//                   <span className="font-medium">
//                     {forecastSummary.totalDemand.toLocaleString()} Qt
//                   </span>
//                   <br />
//                   {forecastSummary.gap >= 0 ? (
//                     <span className="text-supply font-medium">
//                       Surplus of {forecastSummary.gap.toLocaleString()} Qt
//                     </span>
//                   ) : (
//                     <span className="text-destructive font-medium">
//                       Shortage of {forecastSummary.shortage.toLocaleString()} Qt
//                     </span>
//                   )}
//                 </p>

//                 {forecastSummary.topSellers.length > 0 && (
//                   <div>
//                     <p className="text-sm font-medium mb-2">Top Sellers:</p>
//                     <div className="flex gap-2 flex-wrap">
//                       {forecastSummary.topSellers.map((seller) => (
//                         <Badge key={seller} variant="outline">
//                           {seller}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {/* Summary Cards (adapted to single quantity from API) */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             <SummaryCard
//               title={
//                 isBuyer
//                   ? `Forecasted ${commodity} Demand`
//                   : `Forecasted ${commodity} Supply`
//               }
//               value={`${forecastValues.totalVal.toLocaleString()} Qt`}
//               icon={TrendingUp}
//               trend={forecastValues.trend}
//             />
//             <SummaryCard
//               title="Confidence"
//               value={`${forecastValues.confidence}%`}
//               icon={TrendingUp}
//             />
//           </div>

//           {/* Historical vs Forecast Chart (uses real API trends) */}
//           <Card className="shadow-card">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm">
//                 Historical vs Forecast — {entity} ({commodity})
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="h-72">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={chartData}>
//                   <defs>
//                     <linearGradient
//                       id="colorActual"
//                       x1="0"
//                       y1="0"
//                       x2="0"
//                       y2="1"
//                     >
//                       <stop
//                         offset="5%"
//                         stopColor="hsl(168, 65%, 55%)"
//                         stopOpacity={0.8}
//                       />
//                       <stop
//                         offset="95%"
//                         stopColor="hsl(168, 65%, 55%)"
//                         stopOpacity={0.1}
//                       />
//                     </linearGradient>
//                     <linearGradient
//                       id="colorForecast"
//                       x1="0"
//                       y1="0"
//                       x2="0"
//                       y2="1"
//                     >
//                       <stop
//                         offset="5%"
//                         stopColor="hsl(120, 60%, 75%)"
//                         stopOpacity={0.6}
//                       />
//                       <stop
//                         offset="95%"
//                         stopColor="hsl(120, 60%, 75%)"
//                         stopOpacity={0.05}
//                       />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     stroke="hsl(140,15%,90%)"
//                   />
//                   <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//                   <YAxis tick={{ fontSize: 10 }} />
//                   <Tooltip />
//                   <Legend />
//                   <Area
//                     type="monotone"
//                     dataKey="actual"
//                     stroke="hsl(168, 65%, 45%)"
//                     strokeWidth={2}
//                     fill="url(#colorActual)"
//                     name="Historical"
//                     dot={false}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="forecast"
//                     stroke="hsl(120, 60%, 65%)"
//                     strokeWidth={2}
//                     fill="url(#colorForecast)"
//                     name="Forecast"
//                     dot={false}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Insights (dynamic based on API response) */}
//           <Card className="shadow-card">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <AlertTriangle className="w-4 h-4 text-warning" /> Insights
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-2">
//                 {insightMessages.map((msg, i) => (
//                   <li key={i} className="flex items-start gap-2 text-sm">
//                     <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
//                     <span className="text-muted-foreground">{msg}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {!loading && !showResults && (
//         <div className="text-center py-16 text-muted-foreground text-sm">
//           <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
//           <p>
//             Configure parameters above and click "Run Forecast" to generate
//             predictions.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Forecasting;

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { useData } from "@/context/DataContext";

interface ChartDataPoint {
  period: string;
  actual: number | null;
  forecast: number | null;
}

const Forecasting = () => {
  const navigate = useNavigate();

  const { activeCredentials } = useData();

  // API states
  const [metadata, setMetadata] = useState<any>(null);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form states
  const [role, setRole] = useState<string>("");
  const [entity, setEntity] = useState<string>("");
  const [commodity, setCommodity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [quarter, setQuarter] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch metadata on mount
  // useEffect(() => {
  //   const fetchMetadata = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://d2m11qgy1b40kt.cloudfront.net/metadata",
  //         {
  //           method: "GET",
  //           headers: { Accept: "application/json" },
  //         }
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch metadata");
  //       const data = await response.json();
  //       setMetadata(data);
  //     } catch (error) {
  //       console.error("Metadata fetch error:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to load metadata. Using fallback options.",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setLoadingMetadata(false);
  //     }
  //   };

  //   fetchMetadata();
  // }, []);

  useEffect(() => {
    console.log("activeCredentials:", JSON.stringify(activeCredentials, null, 2));
    const fetchMetadata = async () => {
      if (!activeCredentials) {
        setLoadingMetadata(false);
        return;
      }
      try {
        const response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/metadata",
          {
            method: "POST", // ← change from GET to POST
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(activeCredentials), // ← send credentials
          }
        );
        if (!response.ok) throw new Error("Failed to fetch metadata");
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error("Metadata fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load metadata. Using fallback options.",
          variant: "destructive",
        });
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [activeCredentials]); // ← re-fetch when source changes

  // Derived options from metadata
  const commodities = useMemo(() => metadata?.commodities || [], [metadata]);
  const regionsList = useMemo(() => metadata?.regions || [], [metadata]);
  const typesList = useMemo(() => metadata?.types || [], [metadata]);
  const quartersList = useMemo(
    () => metadata?.quarters || ["Q1", "Q2", "Q3", "Q4"],
    [metadata]
  );
  const yearsList = useMemo(() => [2025, 2026, 2027], []);

  const entities = useMemo(() => {
    if (!role || !metadata) return [];
    return role.toLowerCase() === "buyer"
      ? metadata.buyer_ids || []
      : metadata.seller_ids || [];
  }, [role, metadata]);

  const isBuyer = role.toLowerCase() === "buyer";

  const canRun = !!(
    role &&
    entity &&
    commodity &&
    type &&
    quarter &&
    year &&
    region
  );

  // Run forecast API call with better error handling
  const handleForecast = async () => {
    if (!canRun) return;

    setLoading(true);
    setShowResults(false);
    setForecastResult(null);
    setErrorMessage("");

    try {
      // const payload = {
      //   entity_id: entity,
      //   role: role.toLowerCase(),
      //   commodity: commodity,
      //   type: type,
      //   year: parseInt(year),
      //   quarter: quarter,
      //   region: region,
      // };

      const payload = {
        entity_id: entity,
        role: role.toLowerCase(),
        commodity: commodity,
        type: type,
        year: parseInt(year),
        quarter: quarter,
        region: region,
        ...activeCredentials, // ← spread data_source and credentials
      };

      const response = await fetch(
        "https://d2m11qgy1b40kt.cloudfront.net/forecast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage("No forecast data found for the selected parameters.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Additional check if data is empty or invalid
      if (!data || Object.keys(data).length === 0) {
        setErrorMessage("No forecast data available for the selected parameters.");
        return;
      }

      setForecastResult(data);
      setShowResults(true);
    } catch (error: any) {
      console.error("Forecast error:", error);
      const message = error.message?.includes("404") 
        ? "No forecast data found for the selected parameters."
        : (error.message || "Unable to generate forecast. Please try again.");
      
      setErrorMessage(message);
      
      toast({
        title: "Forecast Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!forecastResult) return [];

    const historical = forecastResult.historical_trend || [];
    const forecastTrend = forecastResult.forecast_trend || [];

    const dataMap: Record<string, ChartDataPoint> = {};

    historical.forEach((item: any) => {
      const period = item?.period;
      if (period) {
        dataMap[period] = {
          period,
          actual: Number(item.quantity) || 0,
          forecast: null,
        };
      }
    });

    forecastTrend.forEach((item: any) => {
      const period = item?.period;
      if (period) {
        if (!dataMap[period]) {
          dataMap[period] = {
            period,
            actual: null,
            forecast: Number(item.quantity) || 0,
          };
        } else {
          dataMap[period].forecast = Number(item.quantity) || 0;
        }
      }
    });

    return Object.values(dataMap).sort((a, b) =>
      a.period.localeCompare(b.period)
    );
  }, [forecastResult]);

  // Find the transition point for separator line
  const separatorPeriod = useMemo(() => {
    if (chartData.length === 0) return null;
    const firstForecast = chartData.find(
      (d) => d.forecast !== null && (d.actual === null || d.actual === 0)
    );
    return firstForecast?.period || null;
  }, [chartData]);

  // Forecast values
  const forecastValues = useMemo(() => {
    if (!forecastResult) return null;
    return {
      totalVal: forecastResult.forecast_quantity || 0,
      trend: `${forecastResult.growth_percent || 0}%`,
      confidence: forecastResult.confidence_score || 0,
    };
  }, [forecastResult]);

  // Forecast summary for buyers
  const forecastSummary = useMemo(() => {
    if (!forecastResult?.supply_summary || !isBuyer) return null;

    const ss = forecastResult.supply_summary;
    const gap = ss.surplus || 0;

    return {
      totalSellerSupply: ss.total_supply || 0,
      totalDemand: ss.demand || forecastResult.forecast_quantity || 0,
      gap: gap,
      topSellers: ss.top_sellers || [],
      shortage: gap < 0 ? Math.abs(gap) : 0,
      matchingSellers: ss.top_sellers?.length || 0,
    };
  }, [forecastResult, isBuyer]);

  // Dynamic insights
  const insightMessages = useMemo(() => {
    if (!forecastResult) return [];
    const growth = forecastResult.growth_percent || 0;

    if (isBuyer) {
      return [
        `${entity} shows ${growth >= 0 ? "increasing" : "decreasing"} ${commodity} demand trend`,
        `Forecasted demand is ${growth}% ${growth >= 0 ? "higher" : "lower"} than previous`,
        "Consider locking supply contracts early for better rates",
      ];
    } else {
      return [
        `${entity} has consistent ${commodity} supply trend`,
        `Projected supply growth: ${growth}%`,
        "Monitor market conditions for optimal selling window",
      ];
    }
  }, [forecastResult, entity, commodity, isBuyer]);

  const handleRoleChange = (v: string) => {
    setRole(v);
    setEntity("");
    setErrorMessage("");
  };

  const handleCommodityChange = (v: string) => {
    setCommodity(v);
    setEntity("");
    setType("");
    setErrorMessage("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold font-display">Forecasting</h1>
        <UITooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              Forecast is generated using historical transaction data and time-series models.
            </p>
          </TooltipContent>
        </UITooltip>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Forecast Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* <div className="space-y-1.5">
              <Label className="text-xs">Commodity</Label>
              <Select value={commodity} onValueChange={handleCommodityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map((c: string) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-1.5">
              <Label className="text-xs">Commodity</Label>
              <Select value={commodity} onValueChange={handleCommodityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map((c: string) => {
                    // Display with first letter capital, but keep original value
                    const displayName = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
                    
                    return (
                      <SelectItem key={c} value={c}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regionsList.map((r: string) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Entity</Label>
              <Select
                value={entity}
                onValueChange={setEntity}
                disabled={!role || entities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((id: string) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType} disabled={!commodity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typesList.map((t: string) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quartersList.map((q: string) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="mt-6 w-30"
            onClick={handleForecast}
            disabled={!canRun || loading || loadingMetadata}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Running Forecast...
              </>
            ) : (
              "Run Forecast"
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* No Data / Error State */}
      {errorMessage && !loading && (
        <Card className="shadow-card border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">No Data Found</h3>
            <p className="text-muted-foreground max-w-md">{errorMessage}</p>
            <p className="text-sm text-muted-foreground mt-4">
              Please try different parameters (commodity, entity, or time period).
            </p>
          </CardContent>
        </Card>
      )}

      {showResults && forecastResult && forecastValues && !errorMessage && (
        <div className="space-y-4 animate-fade-in">
          {/* Main projection banner */}
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{entity}</span> is projected to{" "}
            {isBuyer ? "require" : "supply"}{" "}
            <span className="font-medium text-foreground">
              {forecastValues.totalVal.toLocaleString()} Qt
            </span>{" "}
            of {commodity} in {quarter} {year}, reflecting a{" "}
            <span className="font-medium text-primary">{forecastValues.trend}</span> growth trend with{" "}
            <span className="font-medium text-primary">{forecastValues.confidence}%</span> confidence.
          </div>

          {/* Buyer Supply Summary */}
          {forecastSummary && isBuyer && (
            <Card className="shadow-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Market Supply Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Total forecasted supply from sellers:{" "}
                  <span className="font-medium">
                    {forecastSummary.totalSellerSupply.toLocaleString()} Qt
                  </span>
                  <br />
                  Your projected demand:{" "}
                  <span className="font-medium">
                    {forecastSummary.totalDemand.toLocaleString()} Qt
                  </span>
                  <br />
                  {forecastSummary.gap >= 0 ? (
                    <span className="text-emerald-600 font-medium">
                      Surplus of {forecastSummary.gap.toLocaleString()} Qt
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      Shortage of {forecastSummary.shortage.toLocaleString()} Qt
                    </span>
                  )}
                </p>

                {forecastSummary.topSellers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Top Sellers:</p>
                    <div className="flex gap-2 flex-wrap">
                      {forecastSummary.topSellers.map((seller: string) => (
                        <Badge key={seller} variant="outline">
                          {seller}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryCard
              title={isBuyer ? `Forecasted ${commodity} Demand` : `Forecasted ${commodity} Supply`}
              value={`${forecastValues.totalVal.toLocaleString()} Qt`}
              icon={TrendingUp}
              trend={forecastValues.trend}
            />
            <SummaryCard
              title="Confidence"
              value={`${forecastValues.confidence}%`}
              icon={TrendingUp}
            />
          </div>

          {/* Improved Historical vs Forecast Chart */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Historical vs Forecast — {entity} ({commodity})
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.75} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.08} />
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.70} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="line" />

                  <Area
                    type="natural"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorActual)"
                    name="Historical"
                    dot={false}
                  />

                  <Area
                    type="natural"
                    dataKey="forecast"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#colorForecast)"
                    name="Forecast"
                    dot={false}
                  />

                  {separatorPeriod && (
                    <ReferenceLine
                      x={separatorPeriod}
                      stroke="#6b7280"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "Forecast Begins",
                        position: "top",
                        fill: "#6b7280",
                        fontSize: 11,
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insightMessages.map((msg, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-muted-foreground">{msg}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !showResults && !errorMessage && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>
            Configure parameters above and click "Run Forecast" to generate predictions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Forecasting;