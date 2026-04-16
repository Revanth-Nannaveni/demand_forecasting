// import { useState, useMemo } from "react";
// import { sellers, buyers, supplyTimeDataByCommodity, demandTimeDataByCommodity, commodities, getEntityTimeData, regions, quarters, years, type Commodity, type Region } from "@/lib/mockData";
// import SummaryCard from "@/components/SummaryCard";
// import { Users, Package, TrendingUp, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import {
//   ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
// } from "recharts";

// const SUPPLY_COLORS = ["hsl(152, 55%, 33%)", "hsl(85, 45%, 55%)"];
// const DEMAND_COLORS = ["hsl(210, 65%, 50%)", "hsl(210, 65%, 70%)"];

// const Dashboard = () => {
//   const [commodity, setCommodity] = useState<Commodity>("Paddy");
//   const [quarter, setQuarter] = useState<string>("all");
//   const [year, setYear] = useState<string>("all");
//   const [region, setRegion] = useState<string>("all");
//   const [selectedSeller, setSelectedSeller] = useState<string>("all");
//   const [selectedBuyer, setSelectedBuyer] = useState<string>("all");

//   const filteredSellers = useMemo(() => {
//     let list = sellers.filter(s => s.commodity === commodity);
//     if (region !== "all") list = list.filter(s => s.region === region);
//     return list;
//   }, [commodity, region]);

//   const filteredBuyers = useMemo(() => {
//     let list = buyers.filter(b => b.commodity === commodity);
//     if (region !== "all") list = list.filter(b => b.region === region);
//     return list;
//   }, [commodity, region]);

//   const displaySellers = useMemo(() =>
//     selectedSeller === "all" ? filteredSellers : filteredSellers.filter(s => s.id === selectedSeller),
//     [filteredSellers, selectedSeller]
//   );
//   const displayBuyers = useMemo(() =>
//     selectedBuyer === "all" ? filteredBuyers : filteredBuyers.filter(b => b.id === selectedBuyer),
//     [filteredBuyers, selectedBuyer]
//   );

//   const totalSellerQty = displaySellers.reduce((a, s) => a + s.quantity, 0);
//   const totalBuyerQty = displayBuyers.reduce((a, b) => a + b.quantity, 0);
//   const sellerT1 = displaySellers.filter(s => s.type === "T1").reduce((a, s) => a + s.quantity, 0);
//   const sellerT2 = totalSellerQty - sellerT1;
//   const buyerT1 = displayBuyers.filter(b => b.type === "T1").reduce((a, b) => a + b.quantity, 0);
//   const buyerT2 = totalBuyerQty - buyerT1;

//   const sellerPie = [{ name: "T1", value: sellerT1 }, { name: "T2", value: sellerT2 }].filter(d => d.value > 0);
//   const buyerPie = [{ name: "T1", value: buyerT1 }, { name: "T2", value: buyerT2 }].filter(d => d.value > 0);

//   const supplyTimeData = useMemo(() => {
//     let raw = selectedSeller !== "all" ? getEntityTimeData(selectedSeller, commodity) : supplyTimeDataByCommodity[commodity];
//     if (year !== "all" || quarter !== "all") {
//       raw = raw.filter(d => {
//         const [y, q] = d.period.split(" ");
//         if (year !== "all" && y !== year) return false;
//         if (quarter !== "all" && q !== quarter) return false;
//         return true;
//       });
//     }
//     return raw.map(d => ({ ...d, trend: d.t1 + d.t2 }));
//   }, [commodity, selectedSeller, quarter, year]);

//   const demandTimeData = useMemo(() => {
//     let raw = selectedBuyer !== "all" ? getEntityTimeData(selectedBuyer, commodity) : demandTimeDataByCommodity[commodity];
//     if (year !== "all" || quarter !== "all") {
//       raw = raw.filter(d => {
//         const [y, q] = d.period.split(" ");
//         if (year !== "all" && y !== year) return false;
//         if (quarter !== "all" && q !== quarter) return false;
//         return true;
//       });
//     }
//     return raw.map(d => ({ ...d, trend: d.t1 + d.t2 }));
//   }, [commodity, selectedBuyer, quarter, year]);

//   const topSellers = useMemo(() =>
//     [...filteredSellers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
//     [filteredSellers]
//   );
//   const topBuyers = useMemo(() =>
//     [...filteredBuyers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
//     [filteredBuyers]
//   );

//   const gapInsight = useMemo(() => {
//     const supplyAll = supplyTimeDataByCommodity[commodity];
//     const demandAll = demandTimeDataByCommodity[commodity];
//     const sLast = supplyAll[supplyAll.length - 1];
//     const sPrev = supplyAll[supplyAll.length - 2];
//     const dLast = demandAll[demandAll.length - 1];
//     const dPrev = demandAll[demandAll.length - 2];

//     const supplyTotal = sLast.t1 + sLast.t2;
//     const supplyPrevTotal = sPrev.t1 + sPrev.t2;
//     const demandTotal = dLast.t1 + dLast.t2;
//     const demandPrevTotal = dPrev.t1 + dPrev.t2;

//     const supplyGrowth = Math.round(((supplyTotal - supplyPrevTotal) / supplyPrevTotal) * 100);
//     const demandGrowth = Math.round(((demandTotal - demandPrevTotal) / demandPrevTotal) * 100);
//     const gap = supplyTotal - demandTotal;

//     return { supplyTotal, demandTotal, supplyGrowth, demandGrowth, gap, period: sLast.period };
//   }, [commodity]);

//   const handleCommodityChange = (val: Commodity) => {
//     setCommodity(val);
//     setSelectedSeller("all");
//     setSelectedBuyer("all");
//   };

//   const renderPieLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     return (
//       <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
//         {value}
//       </text>
//     );
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold font-display">Dashboard</h1>
//           <p className="text-muted-foreground text-sm">Overview of supply & demand</p>
//         </div>
//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="space-y-1">
//             <Label className="text-xs">Commodity</Label>
//             <Select value={commodity} onValueChange={handleCommodityChange}>
//               <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-1">
//             <Label className="text-xs">Quarter</Label>
//             <Select value={quarter} onValueChange={setQuarter}>
//               <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-1">
//             <Label className="text-xs">Year</Label>
//             <Select value={year} onValueChange={setYear}>
//               <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-1">
//             <Label className="text-xs">Region</Label>
//             <Select value={region} onValueChange={setRegion}>
//               <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </div>

//       {/* Demand-Supply Gap Insight Card */}
//       <Card className="shadow-card border-l-4" style={{ borderLeftColor: gapInsight.gap >= 0 ? "hsl(152, 60%, 40%)" : "hsl(0, 72%, 51%)" }}>
//         <CardContent className="p-4">
//           <div className="flex flex-wrap items-center gap-6">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5 text-warning" />
//               <span className="font-semibold font-display text-sm">Demand-Supply Insight</span>
//               <Badge variant="outline" className="text-xs">{commodity} · {quarter === "all" ? "All Quarters" : quarter} · {year === "all" ? "All Years" : year} · {region === "all" ? "All Regions" : region}</Badge>
//             </div>
//             <div className="flex flex-wrap items-center gap-4 text-sm">
//               <span className="flex items-center gap-1">
//                 <ArrowUpRight className="w-4 h-4 text-supply" />
//                 Supply: <strong>{gapInsight.supplyTotal.toLocaleString()} Qt</strong> (+{gapInsight.supplyGrowth}%)
//               </span>
//               <span className="flex items-center gap-1">
//                 {gapInsight.demandGrowth > gapInsight.supplyGrowth
//                   ? <ArrowUpRight className="w-4 h-4 text-destructive" />
//                   : <ArrowDownRight className="w-4 h-4 text-supply" />}
//                 Demand: <strong>{gapInsight.demandTotal.toLocaleString()} Qt</strong> (+{gapInsight.demandGrowth}%)
//               </span>
//               <span className="font-medium">
//                 {gapInsight.gap >= 0 ? (
//                   <span className="text-supply">Surplus of {gapInsight.gap.toLocaleString()} Qt</span>
//                 ) : (
//                   <span className="text-destructive">Shortage gap of {Math.abs(gapInsight.gap).toLocaleString()} Qt</span>
//                 )}
//               </span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Supply Side */}
//         <div className="space-y-4">
//           <div className="flex items-center justify-between flex-wrap gap-2">
//             <h2 className="text-lg font-semibold font-display text-supply flex items-center gap-2">
//               <Package className="w-5 h-5" /> Sellers (Supply)
//             </h2>
//             <div className="space-y-1">
//               <Label className="text-xs">Seller</Label>
//               <Select value={selectedSeller} onValueChange={setSelectedSeller}>
//                 <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Sellers</SelectItem>
//                   {filteredSellers.map(s => <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <SummaryCard title="Total Sellers" value={displaySellers.length} icon={Users} />
//             <SummaryCard title="Total Quantity" value={`${totalSellerQty.toLocaleString()} Qt`} icon={Package} trend={`+${gapInsight.supplyGrowth}% vs last quarter`} />
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//             <Card className="shadow-card">
//               <CardHeader className="pb-2"><CardTitle className="text-sm">Supply Over Time</CardTitle></CardHeader>
//               <CardContent className="h-52">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart data={supplyTimeData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
//                     <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//                     <YAxis tick={{ fontSize: 10 }} />
//                     <Tooltip />
//                     <Bar dataKey="t1" fill={SUPPLY_COLORS[0]} radius={[4, 4, 0, 0]} name="T1" />
//                     <Bar dataKey="t2" fill={SUPPLY_COLORS[1]} radius={[4, 4, 0, 0]} name="T2" />
//                     <Line type="monotone" dataKey="trend" stroke="hsl(152, 55%, 25%)" strokeWidth={2} dot={false} name="Trend" />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//             <Card className="shadow-card">
//               <CardHeader className="pb-2"><CardTitle className="text-sm">T1 vs T2 Split</CardTitle></CardHeader>
//               <CardContent className="h-52 flex items-center justify-center">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={sellerPie} dataKey="value" cx="50%" cy="50%" outerRadius={65} labelLine={false} label={renderPieLabel}>
//                       {sellerPie.map((_, i) => <Cell key={i} fill={SUPPLY_COLORS[i]} />)}
//                     </Pie>
//                     <Legend wrapperStyle={{ fontSize: 12 }} />
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>

          // <Card className="shadow-card">
          //   <CardHeader className="pb-2"><CardTitle className="text-sm">Top Sellers by Quantity</CardTitle></CardHeader>
          //   <CardContent>
          //     <div className="space-y-2">
          //       {topSellers.map((s, i) => (
          //         <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          //           <div className="flex items-center gap-2">
          //             <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
          //             <span className="font-medium text-sm">{s.id}</span>
          //             <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
          //             <Badge variant="secondary" className="text-[10px]">{s.region}</Badge>
          //           </div>
          //           <span className="text-sm font-semibold">{s.quantity} Qt</span>
          //         </div>
          //       ))}
          //     </div>
          //   </CardContent>
          // </Card>

//           <Card className="shadow-card">
//             <CardHeader className="pb-2"><CardTitle className="text-sm">Seller Records</CardTitle></CardHeader>
//             <CardContent className="overflow-auto max-h-64">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Region</TableHead><TableHead>Qty</TableHead><TableHead>Last Txn</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {displaySellers.map(s => (
//                     <TableRow key={s.id}>
//                       <TableCell className="font-medium">{s.id}</TableCell>
//                       <TableCell><span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">{s.type}</span></TableCell>
//                       <TableCell className="text-xs">{s.region}</TableCell>
//                       <TableCell>{s.quantity}</TableCell>
//                       <TableCell className="text-muted-foreground text-xs">{s.lastTransaction}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Demand Side */}
//         <div className="space-y-4">
//           <div className="flex items-center justify-between flex-wrap gap-2">
//             <h2 className="text-lg font-semibold font-display text-demand flex items-center gap-2">
//               <ShoppingCart className="w-5 h-5" /> Buyers (Demand)
//             </h2>
//             <div className="space-y-1">
//               <Label className="text-xs">Buyer</Label>
//               <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
//                 <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Buyers</SelectItem>
//                   {filteredBuyers.map(b => <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <SummaryCard title="Total Buyers" value={displayBuyers.length} icon={Users} />
//             <SummaryCard title="Total Quantity" value={`${totalBuyerQty.toLocaleString()} Qt`} icon={TrendingUp} trend={`+${gapInsight.demandGrowth}% vs last quarter`} />
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//             <Card className="shadow-card">
//               <CardHeader className="pb-2"><CardTitle className="text-sm">Demand Over Time</CardTitle></CardHeader>
//               <CardContent className="h-52">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart data={demandTimeData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
//                     <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//                     <YAxis tick={{ fontSize: 10 }} />
//                     <Tooltip />
//                     <Bar dataKey="t1" fill={DEMAND_COLORS[0]} radius={[4, 4, 0, 0]} name="T1" />
//                     <Bar dataKey="t2" fill={DEMAND_COLORS[1]} radius={[4, 4, 0, 0]} name="T2" />
//                     <Line type="monotone" dataKey="trend" stroke="hsl(210, 65%, 35%)" strokeWidth={2} dot={false} name="Trend" />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//             <Card className="shadow-card">
//               <CardHeader className="pb-2"><CardTitle className="text-sm">T1 vs T2 Split</CardTitle></CardHeader>
//               <CardContent className="h-52 flex items-center justify-center">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={buyerPie} dataKey="value" cx="50%" cy="50%" outerRadius={65} labelLine={false} label={renderPieLabel}>
//                       {buyerPie.map((_, i) => <Cell key={i} fill={DEMAND_COLORS[i]} />)}
//                     </Pie>
//                     <Legend wrapperStyle={{ fontSize: 12 }} />
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>

//           <Card className="shadow-card">
//             <CardHeader className="pb-2"><CardTitle className="text-sm">Top Buyers by Quantity</CardTitle></CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 {topBuyers.map((b, i) => (
//                   <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
//                       <span className="font-medium text-sm">{b.id}</span>
//                       <Badge variant="outline" className="text-[10px]">{b.type}</Badge>
//                       <Badge variant="secondary" className="text-[10px]">{b.region}</Badge>
//                     </div>
//                     <span className="text-sm font-semibold">{b.quantity} Qt</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="shadow-card">
//             <CardHeader className="pb-2"><CardTitle className="text-sm">Buyer Records</CardTitle></CardHeader>
//             <CardContent className="overflow-auto max-h-64">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Region</TableHead><TableHead>Qty</TableHead><TableHead>Last Txn</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {displayBuyers.map(b => (
//                     <TableRow key={b.id}>
//                       <TableCell className="font-medium">{b.id}</TableCell>
//                       <TableCell><span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">{b.type}</span></TableCell>
//                       <TableCell className="text-xs">{b.region}</TableCell>
//                       <TableCell>{b.quantity}</TableCell>
//                       <TableCell className="text-muted-foreground text-xs">{b.lastTransaction}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { useState, useMemo, useEffect } from "react";
// Add this import
import { useAuth, logout } from "@/hooks/useAuth";
//const { user } = useAuth();
import SummaryCard from "@/components/SummaryCard";
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const TYPE_COLORS: Record<string, string> = {
  Organic: "#10b981",
  Premium: "#14b8a6",
  Desi: "#eab308",
  Standard: "#6366f1",
};

// ==================== TYPES ====================
type Transaction = {
  id: string;
  commodity: string;
  type: string;
  date: string;
  year: string;
  quantity: number;
  price: number;
  region: string;
};

type AggregatedEntity = {
  id: string;
  commodity: string;
  type: string;
  region: string;
  quantity: number;
  lastTransaction: string;
};

// ==================== CSV PARSER ====================
const parseCSV = (
  csvText: string,
  idField: "seller_id" | "buyer_id",
): Transaction[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace("\r", "").toLowerCase());

  const data: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: any = {};

    headers.forEach((header, idx) => {
      let val = values[idx]?.trim().replace("\r", "") || "";

      if (header === "quantity" || header === "price") {
        row[header] = parseFloat(val) || 0;
      } else if (header === idField) {
        row.id = val;
      } else if (header === "year") {
        row.year = val;
      } else {
        row[header] = val;
      }
    });

    if (row.id && row.commodity) {
      row.region = row.region || "Unknown";
      row.year = row.year || "";
      data.push(row as Transaction);
    }
  }

  return data;
};

// ==================== ROBUST QUARTER PARSER (handles both DD-MM-YYYY and MM-DD-YYYY) ====================
const getQuarterPeriod = (dateStr: string): string => {
  if (!dateStr) return "Unknown";

  const parts = dateStr.split("-");
  if (parts.length !== 3) return "Unknown";

  let month = parseInt(parts[1]);
  let day = parseInt(parts[0]);
  const year = parseInt(parts[2]);

  // If second part > 12 → it's MM-DD-YYYY format → swap
  if (month > 12) {
    const temp = month;
    month = day;
    day = temp;
  }

  let quarter: number;
  if (month >= 1 && month <= 3) quarter = 1;
  else if (month >= 4 && month <= 6) quarter = 2;
  else if (month >= 7 && month <= 9) quarter = 3;
  else quarter = 4;

  return `${year} Q${quarter}`;
};

// ==================== DASHBOARD ====================
const Dashboard = () => {
  const [rawSellers, setRawSellers] = useState<Transaction[]>([]);
  const [rawBuyers, setRawBuyers] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commodity, setCommodity] = useState<string>("chilli");
  const [quarter, setQuarter] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");

  const SELLERS_S3_URL =
    "https://demand-forecasting-agri.s3.ap-south-1.amazonaws.com/data/sellers.csv";
  const BUYERS_S3_URL =
    "https://demand-forecasting-agri.s3.ap-south-1.amazonaws.com/data/buyers.csv";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sRes, bRes] = await Promise.all([
          fetch(SELLERS_S3_URL),
          fetch(BUYERS_S3_URL),
        ]);
        if (!sRes.ok || !bRes.ok) throw new Error("Failed to fetch CSV files");

        const sellersText = await sRes.text();
        const buyersText = await bRes.text();

        setRawSellers(parseCSV(sellersText, "seller_id"));
        setRawBuyers(parseCSV(buyersText, "buyer_id"));
      } catch (err: any) {
        setError(err.message || "Failed to load data from S3");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Unified period aggregation (works for "all" + specific year/quarter)
  const getPeriodAggregated = (
    rawData: Transaction[],
    comm: string,
    selectedYear: string,
    selectedQuarter: string,
  ) => {
    const map = new Map<string, any>();

    rawData.forEach((tx) => {
      if (tx.commodity !== comm) return;

      const period = getQuarterPeriod(tx.date);
      const quarterPart = period.split(" ")[1];

      // Apply filters only when not "all"
      if (selectedYear !== "all" && tx.year !== selectedYear) return;
      if (selectedQuarter !== "all" && quarterPart !== selectedQuarter) return;

      const key = `${tx.id}-${tx.commodity}-${tx.type}`;
      if (!map.has(key)) {
        map.set(key, {
          id: tx.id,
          commodity: tx.commodity,
          type: tx.type,
          region: tx.region,
          quantity: 0,
          dates: [],
        });
      }

      const entry = map.get(key);
      entry.quantity += tx.quantity;
      entry.dates.push(tx.date);
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      lastTransaction: entry.dates.sort().pop() || "",
    }));
  };

  const periodSellers = useMemo(() => {
    return getPeriodAggregated(rawSellers, commodity, year, quarter);
  }, [rawSellers, commodity, year, quarter]);

  const periodBuyers = useMemo(() => {
    return getPeriodAggregated(rawBuyers, commodity, year, quarter);
  }, [rawBuyers, commodity, year, quarter]);

  const filteredSellers = useMemo(() => {
    let list = periodSellers;
    if (region !== "all") list = list.filter((s) => s.region === region);
    return list;
  }, [periodSellers, region]);

  const filteredBuyers = useMemo(() => {
    let list = periodBuyers;
    if (region !== "all") list = list.filter((b) => b.region === region);
    return list;
  }, [periodBuyers, region]);

  // Unique IDs for dropdowns (no duplicates)
  const availableSellerIds = useMemo(() => {
    return Array.from(new Set(filteredSellers.map((s) => s.id))).sort();
  }, [filteredSellers]);

  const availableBuyerIds = useMemo(() => {
    return Array.from(new Set(filteredBuyers.map((b) => b.id))).sort();
  }, [filteredBuyers]);

  // Reset selected ID if it becomes invalid after filter change
  useEffect(() => {
    if (selectedSeller !== "all" && !availableSellerIds.includes(selectedSeller)) {
      setSelectedSeller("all");
    }
  }, [availableSellerIds, selectedSeller]);

  useEffect(() => {
    if (selectedBuyer !== "all" && !availableBuyerIds.includes(selectedBuyer)) {
      setSelectedBuyer("all");
    }
  }, [availableBuyerIds, selectedBuyer]);

  const displaySellers = useMemo(
    () =>
      selectedSeller === "all"
        ? filteredSellers
        : filteredSellers.filter((s) => s.id === selectedSeller),
    [filteredSellers, selectedSeller],
  );

  const displayBuyers = useMemo(
    () =>
      selectedBuyer === "all"
        ? filteredBuyers
        : filteredBuyers.filter((b) => b.id === selectedBuyer),
    [filteredBuyers, selectedBuyer],
  );

  // Unique counts for summary cards
  const totalUniqueSellers = useMemo(
    () => new Set(displaySellers.map((s) => s.id)).size,
    [displaySellers],
  );

  const totalUniqueBuyers = useMemo(
    () => new Set(displayBuyers.map((b) => b.id)).size,
    [displayBuyers],
  );

  const totalSellerQty = displaySellers.reduce((a, s) => a + s.quantity, 0);
  const totalBuyerQty = displayBuyers.reduce((a, b) => a + b.quantity, 0);

  // Dynamic Type Breakdown for Pie Charts
  const sellerTypeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    displaySellers.forEach((s) => {
      breakdown[s.type] = (breakdown[s.type] || 0) + s.quantity;
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [displaySellers]);

  const buyerTypeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    displayBuyers.forEach((b) => {
      breakdown[b.type] = (breakdown[b.type] || 0) + b.quantity;
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [displayBuyers]);

  // Time Series Data (kept for future use)
  const supplyTimeData = useMemo(() => {
    const grouped = new Map<string, Record<string, number>>();
    rawSellers.forEach((tx) => {
      if (tx.commodity !== commodity) return;
      const period = getQuarterPeriod(tx.date);
      if (!grouped.has(period)) grouped.set(period, {});
      const entry = grouped.get(period)!;
      entry[tx.type] = (entry[tx.type] || 0) + tx.quantity;
    });
    const sorted = Array.from(grouped.keys()).sort();
    return sorted.map((period) => ({ period, ...grouped.get(period)! }));
  }, [rawSellers, commodity]);

  const demandTimeData = useMemo(() => {
    const grouped = new Map<string, Record<string, number>>();
    rawBuyers.forEach((tx) => {
      if (tx.commodity !== commodity) return;
      const period = getQuarterPeriod(tx.date);
      if (!grouped.has(period)) grouped.set(period, {});
      const entry = grouped.get(period)!;
      entry[tx.type] = (entry[tx.type] || 0) + tx.quantity;
    });
    const sorted = Array.from(grouped.keys()).sort();
    return sorted.map((period) => ({ period, ...grouped.get(period)! }));
  }, [rawBuyers, commodity]);

  const topSellers = useMemo(
    () =>
      [...displaySellers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    [displaySellers],
  );

  const topBuyers = useMemo(
    () =>
      [...displayBuyers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    [displayBuyers],
  );

  const gapInsight = useMemo(() => {
    const supplyTotal = displaySellers.reduce((sum, s) => sum + s.quantity, 0);
    const demandTotal = displayBuyers.reduce((sum, b) => sum + b.quantity, 0);
    return {
      supplyTotal,
      demandTotal,
      gap: supplyTotal - demandTotal,
    };
  }, [displaySellers, displayBuyers]);

  // Dropdown lists
  const commoditiesList = useMemo(
    () => Array.from(new Set(rawSellers.map((s) => s.commodity))).sort(),
    [rawSellers],
  );

  const regionsList = useMemo(() => {
    const regs = new Set<string>();
    rawSellers.forEach((s) => {
      if (s.region?.trim()) regs.add(s.region.trim());
    });
    rawBuyers.forEach((b) => {
      if (b.region?.trim()) regs.add(b.region.trim());
    });
    return Array.from(regs).sort();
  }, [rawSellers, rawBuyers]);

  const yearsList = useMemo(() => {
    const ys = new Set<string>();
    rawSellers.forEach((s) => {
      if (s.year) ys.add(s.year);
    });
    rawBuyers.forEach((b) => {
      if (b.year) ys.add(b.year);
    });
    return Array.from(ys).sort().reverse();
  }, [rawSellers, rawBuyers]);

  const quartersList = ["Q1", "Q2", "Q3", "Q4"];

  const handleCommodityChange = (val: string) => {
    setCommodity(val);
    setSelectedSeller("all");
    setSelectedBuyer("all");
  };

  const renderPieLabel = ({
    name,
    value,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      >
        {value.toFixed(0)}
      </text>
    );
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center text-lg">
        Loading data....
      </div>
    );
  if (error)
    return (
      <div className="flex h-96 items-center justify-center text-destructive">
        {error}
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Live Supply &amp; Demand Overview
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Commodity</Label>
            <Select value={commodity} onValueChange={handleCommodityChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commoditiesList.map((c) => {
                  const displayName =
                    c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
                  return (
                    <SelectItem key={c} value={c}>
                      {displayName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regionsList.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearsList.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Quarter</Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Quarters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                {quartersList.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Gap Insight */}
      <Card
        className="shadow-card border-l-4"
        style={{
          borderLeftColor:
            gapInsight.gap >= 0 ? "hsl(152, 60%, 40%)" : "hsl(0, 72%, 51%)",
        }}
      >
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="font-semibold font-display text-sm">
                Demand-Supply Insight
              </span>
              <Badge variant="outline" className="text-xs">
                {commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase()} · {region === "all" ? "All Regions" : region}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-supply" />
                Supply:{" "}
                <strong>{gapInsight.supplyTotal.toLocaleString()} Qt</strong>
              </span>
              <span className="flex items-center gap-1">
                Demand:{" "}
                <strong>{gapInsight.demandTotal.toLocaleString()} Qt</strong>
              </span>
              <span className="font-medium">
                {gapInsight.gap >= 0 ? (
                  <span className="text-supply">
                    Surplus of {gapInsight.gap.toLocaleString()} Qt
                  </span>
                ) : (
                  <span className="text-destructive">
                    Shortage of {Math.abs(gapInsight.gap).toLocaleString()} Qt
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display text-supply flex items-center gap-2">
              <Package className="w-5 h-5" /> Sellers (Supply)
            </h2>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Seller</Label>
              <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Sellers" />
                </SelectTrigger>
                <SelectContent className="h-64">
                  <SelectItem value="all">All Sellers</SelectItem>
                  {availableSellerIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Total Sellers"
              value={totalUniqueSellers}
              icon={Users}
            />
            <SummaryCard
              title="Total Quantity"
              value={`${totalSellerQty.toLocaleString()} Qt`}
              icon={Package}
            />
          </div>

          {/* Type Split */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Type Split (Sellers)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sellerTypeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {sellerTypeBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TYPE_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          {/* <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Sellers by Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topSellers.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{s.id}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {s.type}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {s.region}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold">
                      {s.quantity.toFixed(2)} Qt
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Sellers by Quantity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topSellers.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <span className="font-medium text-sm">{s.id}</span>
                      <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{s.region}</Badge>
                    </div>
                    <span className="text-sm font-semibold">{s.quantity.toFixed(2)} Qt</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Seller Records</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Last Txn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySellers.map((s) => (
                    <TableRow key={`${s.id}-${s.type}`}>
                      <TableCell className="font-medium">{s.id}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                          {s.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{s.region}</TableCell>
                      <TableCell className="font-medium">
                        {s.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {s.lastTransaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Demand Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display text-demand flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Buyers (Demand)
            </h2>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Buyer</Label>
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Buyers" />
                </SelectTrigger>
                <SelectContent className="h-64">
                  <SelectItem value="all">All Buyers</SelectItem>
                  {availableBuyerIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Total Buyers"
              value={totalUniqueBuyers}
              icon={Users}
            />
            <SummaryCard
              title="Total Quantity"
              value={`${totalBuyerQty.toLocaleString()} Qt`}
              icon={TrendingUp}
            />
          </div>

          {/* Type Split */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Type Split (Buyers)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buyerTypeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {buyerTypeBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TYPE_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Buyers */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Buyers by Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topBuyers.map((b, i) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{b.id}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {b.type}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {b.region}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold">
                      {b.quantity.toFixed(2)} Qt
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Buyer Records</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Last Txn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayBuyers.map((b) => (
                    <TableRow key={`${b.id}-${b.type}`}>
                      <TableCell className="font-medium">{b.id}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                          {b.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{b.region}</TableCell>
                      <TableCell className="font-medium">
                        {b.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {b.lastTransaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// pages/Dashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Example of a protected page that uses the useAuth hook.
// If the user is not logged in they are sent back to /login.

// import { useState, useMemo, useEffect } from "react";
// import SummaryCard from "@/components/SummaryCard";
// import {
//   Users,
//   Package,
//   TrendingUp,
//   ShoppingCart,
//   AlertTriangle,
//   ArrowUpRight,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

// const Dashboard = () => {
//   // ✅ AUTH STATE
//   const [user, setUser] = useState<any>(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   // ✅ EXISTING STATES
//   const [rawSellers, setRawSellers] = useState<any[]>([]);
//   const [rawBuyers, setRawBuyers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ AUTH CHECK
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/api/me", {
//           credentials: "include",
//         });

//         if (res.status === 401) {
//           window.location.href = "/login";
//           return;
//         }

//         const data = await res.json();
//         setUser(data.user);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setAuthLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // ✅ FETCH DATA
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const sRes = await fetch(
//           "https://demand-forecasting-agri.s3.ap-south-1.amazonaws.com/data/sellers.csv"
//         );
//         const bRes = await fetch(
//           "https://demand-forecasting-agri.s3.ap-south-1.amazonaws.com/data/buyers.csv"
//         );

//         const sellersText = await sRes.text();
//         const buyersText = await bRes.text();

//         setRawSellers(sellersText.split("\n"));
//         setRawBuyers(buyersText.split("\n"));
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // ✅ AUTH LOADING SCREEN
//   if (authLoading) {
//     return (
//       <div className="flex h-96 items-center justify-center text-lg">
//         Checking authentication...
//       </div>
//     );
//   }

//   // ✅ DATA LOADING
//   if (loading) {
//     return (
//       <div className="flex h-96 items-center justify-center text-lg">
//         Loading data...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">
//             Welcome, {user?.name || "User"}
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Supply & Demand Dashboard
//           </p>
//         </div>

//         {/* LOGOUT BUTTON */}
//         <button
//           className="bg-red-500 text-white px-4 py-2 rounded"
//           onClick={() => {
//             window.location.href = "http://localhost:8000/auth/logout";
//           }}
//         >
//           Logout
//         </button>
//       </div>

//       {/* SUMMARY */}
//       <div className="grid grid-cols-2 gap-4">
//         <SummaryCard
//           title="Total Sellers"
//           value={rawSellers.length}
//           icon={Users}
//         />
//         <SummaryCard
//           title="Total Buyers"
//           value={rawBuyers.length}
//           icon={ShoppingCart}
//         />
//       </div>

//       {/* INSIGHT CARD */}
//       <Card>
//         <CardContent className="p-4 flex items-center gap-3">
//           <AlertTriangle />
//           <span>Demand-Supply insights will be shown here</span>
//         </CardContent>
//       </Card>

//       {/* SAMPLE TABLE */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Sample Data</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Data</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {rawSellers.slice(0, 5).map((row, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{row}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Dashboard;