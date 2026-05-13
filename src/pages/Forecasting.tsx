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
import { ClipboardList, CheckCircle2 } from "lucide-react";

interface ChartDataPoint {
  period: string;
  actual: number | null;
  forecast: number | null;
}

const Forecasting = () => {
  const navigate = useNavigate();

  // const { activeCredentials, localFiles  } = useData();

  // const { 
  //   activeCredentials, 
  //   localFiles,
  //   forecastResult,
  //   setForecastResult,
  //   forecastParams,
  //   setForecastParams,
  // } = useData();
  const { 
    activeCredentials, 
    localFiles,
    forecastResult,
    setForecastResult,
    forecastParams,
    setForecastParams,
    showResults,
    setShowResults,
    showPOButton,
    setShowPOButton,
    poResult,
    setPoResult,
  } = useData();

  // API states
  const [metadata, setMetadata] = useState<any>(null);
  // const [forecastResult, setForecastResult] = useState<any>(null);
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
  // const [showResults, setShowResults] = useState(false);

  // const [poResult, setPoResult] = useState<any>(null);
  const [poLoading, setPoLoading] = useState(false);
  const [poError, setPoError] = useState<string | null>(null);

  // const [showPOButton, setShowPOButton] = useState(false);

  const fetchFilters = async (overrides: Record<string, any> = {}) => {
    setLoadingMetadata(true);
    try {
      const isLocal = activeCredentials?.data_source === "local";

      if (isLocal) {
        const fd = new FormData();
        fd.append("buyers_file", localFiles.buyer!);
        fd.append("sellers_file", localFiles.seller!);
        if (overrides.commodity ?? commodity) fd.append("commodity", overrides.commodity ?? commodity);
        if (overrides.region ?? region) fd.append("region", overrides.region ?? region);
        if (overrides.type ?? type) fd.append("type", overrides.type ?? type);
        if (overrides.role ?? role) fd.append("role", overrides.role ?? role);
        if (year) fd.append("year", year);
        if (quarter) fd.append("quarter", quarter);

        const response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/filters/local",
          { method: "POST", body: fd }
        );
        if (!response.ok) throw new Error("Failed to fetch filters");
        const data = await response.json();
        setMetadata(data);
      } else {
        const body = {
          data_source: activeCredentials?.data_source ?? "onelake",
          credentials: activeCredentials?.credentials ?? {},
          commodity: overrides.commodity !== undefined ? overrides.commodity : (commodity || null),
          region: overrides.region !== undefined ? overrides.region : (region || null),
          type: overrides.type !== undefined ? overrides.type : (type || null),
          role: overrides.role !== undefined ? overrides.role : (role || null),
          year: overrides.year !== undefined ? overrides.year : (year ? parseInt(year) : null),
          quarter: overrides.quarter !== undefined ? overrides.quarter : (quarter || null),
        };
        const response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/filters",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch filters");
        const data = await response.json();
        setMetadata(data);
      }
    } catch (error) {
      console.error("Filter fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load filter options.",
        variant: "destructive",
      });
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [activeCredentials]);

  // Derived options from metadata
  
  const commodities = useMemo(() => metadata?.commodities || [], [metadata]);
  const regionsList = useMemo(() => metadata?.regions || [], [metadata]);
  const typesList = useMemo(() => metadata?.types || [], [metadata]);
  // const quartersList = useMemo(
  //   () => metadata?.quarters || ["Q1", "Q2", "Q3", "Q4"],
  //   [metadata]
  // );
  // const yearsList = useMemo(() => [2025, 2026, 2027], []);

  const quartersList = useMemo(
    () => metadata?.quarters?.length > 0 ? metadata.quarters : ["Q1", "Q2", "Q3", "Q4"],
    [metadata]
  );

  const yearsList = useMemo(
    () => [2025, 2026, 2027],
    []
  );

  const entities = useMemo(() => {
    if (!role || !metadata) return [];
    return role.toLowerCase() === "buyer"
      ? metadata.buyer_ids || []
      : metadata.seller_ids || [];
  }, [role, metadata]);

  // const isBuyer = role.toLowerCase() === "buyer";
  const isBuyer = (role || forecastParams?.role || "").toLowerCase() === "buyer";

  const canRun = !!(
    role &&
    entity &&
    commodity &&
    type &&
    quarter &&
    year &&
    region
  );

  //added local and datasources endponits
  const handleForecast = async () => {
    if (!canRun) return;

    setLoading(true);
    setShowResults(false);
    setForecastResult(null);
    setErrorMessage("");

    // setPoResult(null);
    // setPoError(null);
    // setPoLoading(false);

    setShowPOButton(false);
    setPoResult(null);
    setPoError(null);
    setPoLoading(false);

    try {
      const isDefaultOneLake =
        activeCredentials?.data_source === "onelake" &&
        Object.keys(activeCredentials?.credentials ?? {}).length === 0;

      const isLocal = activeCredentials?.data_source === "local";

      let response;

      if (isLocal) {
        const fd = new FormData();
        fd.append("entity_id", entity);
        fd.append("role", role.toLowerCase());
        fd.append("commodity", commodity);
        fd.append("type", type);
        fd.append("year", year);
        fd.append("quarter", quarter);
        fd.append("region", region);
        fd.append("buyers_file", localFiles.buyer!);
        fd.append("sellers_file", localFiles.seller!);

        response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/forecast/local",
          { method: "POST", body: fd }
        );
      } else {
        const payload = {
          entity_id: entity,
          role: role.toLowerCase(),
          commodity,
          type,
          year: parseInt(year),
          quarter,
          region,
          // ...(isDefaultOneLake ? {} : activeCredentials),
          ...activeCredentials,
        };

        console.log("Exact payload being sent:", JSON.stringify(payload, null, 2));

        response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/forecast",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage("No forecast data found for the selected parameters.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        setErrorMessage("No forecast data available for the selected parameters.");
        return;
      }

      // setForecastResult(data);
      // setShowResults(true);
      setForecastResult(data);
      setForecastParams({ role, entity, commodity, region, type, quarter, year });
      setShowResults(true);

      // Auto-create PO if shortage exists
      // const shortage = data?.supply_summary?.shortage_procurement;
      // if (shortage && shortage > 0) {
      //   const payload = {
      //     entity_id: entity,
      //     role: role.toLowerCase(),
      //     commodity,
      //     type,
      //     year: parseInt(year),
      //     quarter,
      //     region,
      //     ...activeCredentials,
      //   };
      //   handleCreatePO(payload);
      // }

      const summary = data?.supply_summary || {};
      const market = summary.market_supply ?? 0;
      const shortage = summary.shortage_procurement ?? 0;

      if (isBuyer) {
        if (market === 0) {
          setErrorMessage("No supplier data available for this selection. Try changing region or type.");
          setShowResults(false);
          setShowPOButton(false);
        } else if (shortage > 0) {
          setShowPOButton(true);
        } else {
          setShowPOButton(false);
        }
      }
// For sellers — just show results, no PO logic needed
      // const summary = data?.supply_summary || {};
      // const market = summary.market_supply ?? 0;
      // const shortage = summary.shortage_procurement ?? 0;

      // if (market === 0) {
      //   setErrorMessage("No supplier data available for this selection. Try changing region or type.");
      //   setShowResults(false);
      //   setShowPOButton(false);
      // } else if (shortage > 0) {
      //   setShowPOButton(true);
      // } else {
      //   setShowPOButton(false);
      // }
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

  //handle auto po creation
  const handleCreatePO = async (forecastPayload: any) => {
    setPoLoading(true);
    setPoResult(null);
    setPoError(null);
    try {
      const isLocal = activeCredentials?.data_source === "local";
      let response;

      if (isLocal) {
        const fd = new FormData();
        fd.append("entity_id", forecastPayload.entity_id);
        fd.append("role", forecastPayload.role);
        fd.append("commodity", forecastPayload.commodity);
        fd.append("type", forecastPayload.type);
        fd.append("year", forecastPayload.year.toString());
        fd.append("quarter", forecastPayload.quarter);
        fd.append("region", forecastPayload.region);
        fd.append("buyers_file", localFiles.buyer!);
        fd.append("sellers_file", localFiles.seller!);

        response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/po/from-forecast/local",
          { method: "POST", body: fd }
        );
      } else {
        response = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/po/from-forecast",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(forecastPayload),
          }
        );
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPoResult(data);
    } catch (error: any) {
      setPoError(error.message || "Failed to create PO");
    } finally {
      setPoLoading(false);
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
  // const forecastSummary = useMemo(() => {
  //   if (!forecastResult?.supply_summary || !isBuyer) return null;

  //   const ss = forecastResult.supply_summary;
  //   const gap = ss.surplus || 0;

  //   return {
  //     totalSellerSupply: ss.total_supply || 0,
  //     totalDemand: ss.demand || forecastResult.forecast_quantity || 0,
  //     gap: gap,
  //     topSellers: ss.top_sellers || [],
  //     shortage: gap < 0 ? Math.abs(gap) : 0,
  //     matchingSellers: ss.top_sellers?.length || 0,
  //   };
  // }, [forecastResult, isBuyer]);

  const forecastSummary = useMemo(() => {
    if (!forecastResult?.supply_summary || !isBuyer) return null;

    const ss = forecastResult.supply_summary;
    return {
      marketSupply: ss.market_supply ?? 0,
      procurementSupply: ss.procurement_supply ?? 0,
      shortageProcurement: ss.shortage_procurement ?? 0,
      surplusMarket: ss.surplus_market ?? 0,
    };
  }, [forecastResult, isBuyer]);

  // Dynamic insights
  const insightMessages = useMemo(() => {
    if (!forecastResult) return [];
    const growth = forecastResult.growth_percent || 0;

    if (isBuyer) {
      const messages = [
        "Consider locking supply contracts early for better rates",
      ];
      if (growth !== 0) {
        messages.unshift(
          `${entity} shows ${growth >= 0 ? "increasing" : "decreasing"} ${commodity} demand trend`,
          `Forecasted demand is ${Math.abs(growth)}% ${growth >= 0 ? "higher" : "lower"} than previous`
        );
      }
      return messages;
    } else {
      const messages = [
        `${entity} has consistent ${commodity} supply trend`,
        "Monitor market conditions for optimal selling window",
      ];
      if (growth !== 0) {
        messages.splice(1, 0, `Projected supply growth: ${growth}%`);
      }
      return messages;
  }
}, [forecastResult, entity, commodity, isBuyer]);

  // const insightMessages = useMemo(() => {
  //   if (!forecastResult) return [];
  //   const growth = forecastResult.growth_percent || 0;

  //   if (isBuyer) {
  //     return [
  //       `${entity} shows ${growth >= 0 ? "increasing" : "decreasing"} ${commodity} demand trend`,
  //       `Forecasted demand is ${growth}% ${growth >= 0 ? "higher" : "lower"} than previous`,
  //       "Consider locking supply contracts early for better rates",
  //     ];
  //   } else {
  //     return [
  //       `${entity} has consistent ${commodity} supply trend`,
  //       `Projected supply growth: ${growth}%`,
  //       "Monitor market conditions for optimal selling window",
  //     ];
  //   }
  // }, [forecastResult, entity, commodity, isBuyer]);

  // const handleRoleChange = (v: string) => {
  //   setRole(v);
  //   setEntity("");
  //   setErrorMessage("");
  // };

  // const handleCommodityChange = (v: string) => {
  //   setCommodity(v);
  //   setEntity("");
  //   setType("");
  //   setErrorMessage("");
  // };
  const handleCommodityChange = (v: string) => {
    setCommodity(v);
    setEntity("");
    setType("");
    setRegion("");
    setErrorMessage("");
    fetchFilters({ commodity: v, region: null, type: null, role: role || null });
  };

  const handleRegionChange = (v: string) => {
    setRegion(v);
    setEntity("");
    setErrorMessage("");
    fetchFilters({ commodity: commodity || null, region: v, type: type || null, role: role || null });
  };

  const handleRoleChange = (v: string) => {
    setRole(v);
    setEntity("");
    setErrorMessage("");
    fetchFilters({ commodity: commodity || null, region: region || null, type: type || null, role: v });
  };

  const handleTypeChange = (v: string) => {
    setType(v);
    setEntity("");
    setErrorMessage("");
    fetchFilters({ commodity: commodity || null, region: region || null, type: v, role: role || null });
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
          {/* {loadingMetadata && (
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating filters...
            </div>
          )} */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* role */}
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

            {/* commodity */}
            <div className="space-y-1.5">
              <Label className="text-xs">Commodity</Label>
              {/* <Select value={commodity} onValueChange={handleCommodityChange}> */}
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

            {/* type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={handleTypeChange} disabled={!commodity}>
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

            {/* region */}
            <div className="space-y-1.5">
              <Label className="text-xs">Region</Label>
              <Select value={region} onValueChange={handleRegionChange} >
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

            {/* entity */}
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

            {/* quarter */}
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
            

            {/* year */}
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
          {/* PO Auto-Create Result */}
          {/* Shortage Banner + Create PO Button */}
          {showResults && isBuyer && forecastSummary && forecastSummary.shortageProcurement > 0 && (
            <Card className="shadow-card border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Shortage Detected</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Demand: <span className="font-medium">{forecastValues?.totalVal.toLocaleString()} Qt</span>
                        {" · "}
                        Procurement Supply: <span className="font-medium">{forecastSummary.procurementSupply.toLocaleString()} Qt</span>
                        {" · "}
                        Shortage: <span className="font-medium text-destructive">{forecastSummary.shortageProcurement.toLocaleString()} Qt</span>
                      </p>
                    </div>
                  </div>
                  {!poResult && (
                    <button
                      onClick={() => {
                        const payload = {
                          entity_id: entity,
                          role: role.toLowerCase(),
                          commodity,
                          type,
                          year: parseInt(year),
                          quarter,
                          region,
                          ...activeCredentials,
                        };
                        handleCreatePO(payload);
                      }}
                      disabled={poLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    >
                      {poLoading
                        ? <><Loader2 size={13} className="animate-spin" /> Creating PO...</>
                        : "Create Purchase Order"
                      }
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PO Result */}
          {(poLoading || poResult || poError) && (
            <Card className="shadow-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" /> Purchase Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {poLoading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Purchase Order...
                  </div>
                )}

                {poError && (
                  <p className="text-sm text-destructive">{poError}</p>
                )}

                {poResult && !poLoading && (
                  <>
                    {poResult.po_created ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">PO Created Successfully</span>
                        </div>

                        <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-1">
                          <p><span className="text-muted-foreground">Primary Supplier:</span> <span className="font-medium">{poResult.primary_supplier?.dealer}</span></p>
                          <p><span className="text-muted-foreground">Allocated Qty:</span> <span className="font-medium">{poResult.primary_supplier?.allocated_qty} Qt</span></p>
                          <p><span className="text-muted-foreground">Price:</span> <span className="font-medium">₹{poResult.primary_supplier?.price?.toLocaleString()}</span></p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Shortage</p>
                            <p className="font-semibold">{poResult.summary?.shortage} Qt</p>
                          </div>
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Coverage</p>
                            <p className="font-semibold">{poResult.summary?.coverage_percent}%</p>
                          </div>
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Priority</p>
                            <p className="font-semibold">{poResult.summary?.priority}</p>
                          </div>
                        </div>

                        {poResult.purchase_orders?.length > 0 && (
                          <div className="overflow-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 text-xs text-muted-foreground">PO ID</th>
                                  <th className="text-left py-2 text-xs text-muted-foreground">Dealer</th>
                                  <th className="text-left py-2 text-xs text-muted-foreground">Quantity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {poResult.purchase_orders.map((po: any) => (
                                  <tr key={po.po_id} className="border-b border-border/50">
                                    <td className="py-2 font-medium">{po.po_id}</td>
                                    <td className="py-2">{po.dealer}</td>
                                    <td className="py-2">{po.quantity} Qt</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                          Total PO Value: <span className="font-semibold text-foreground">₹{poResult.financials?.total_po_value?.toLocaleString()}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        {poResult.message || "No PO created"}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Main projection banner */}
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{entity}</span> is projected to{" "}
            {isBuyer ? "require" : "supply"}{" "}
            <span className="font-medium text-foreground">
              {forecastValues.totalVal.toLocaleString()} Qt
            </span>{" "}
            of {commodity} in {quarter} {year}, reflecting a{" "}
            {/* <span className="font-medium text-primary">{forecastValues.trend}</span> growth trend with{" "} */}
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
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs text-muted-foreground">Market Supply</p>
                    <p className="font-semibold mt-0.5">{forecastSummary.marketSupply.toLocaleString()} Qt</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs text-muted-foreground">Procurement Supply</p>
                    <p className="font-semibold mt-0.5">{forecastSummary.procurementSupply.toLocaleString()} Qt</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs text-muted-foreground">Forecasted Demand</p>
                    <p className="font-semibold mt-0.5">{forecastValues?.totalVal.toLocaleString()} Qt</p>
                  </div>
                  <div className={`p-3 rounded-lg ${forecastSummary.shortageProcurement > 0 ? "bg-destructive/10" : "bg-emerald-50 dark:bg-emerald-950/30"}`}>
                    <p className="text-xs text-muted-foreground">
                      {forecastSummary.shortageProcurement > 0 ? "Shortage" : "Surplus (Market)"}
                    </p>
                    <p className={`font-semibold mt-0.5 ${forecastSummary.shortageProcurement > 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {forecastSummary.shortageProcurement > 0
                        ? `${forecastSummary.shortageProcurement.toLocaleString()} Qt`
                        : `${forecastSummary.surplusMarket.toLocaleString()} Qt`}
                    </p>
                  </div>
                </div>

                {/* Supply sufficient message */}
                {forecastSummary.shortageProcurement <= 0 && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      Supply is sufficient. No Purchase Order required.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* {forecastSummary && isBuyer && (
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
          )} */}

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