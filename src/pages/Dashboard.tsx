import { useState, useMemo, useEffect } from "react";
import SummaryCard from "@/components/SummaryCard";
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  Database,
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
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useData } from "@/context/DataContext";


// ================= TYPES =================
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

// ================= HELPERS =================
const TYPE_COLORS: Record<string, string> = {
  Organic: "#10b981",
  Premium: "#14b8a6",
  Desi: "#eab308",
  Standard: "#6366f1",
};

const SOURCE_LABELS: Record<string, string> = {
  onelake: "OneLake (default)",
  onelake_custom: "OneLake (custom)",   // ← add this
  local: "Local Upload",
  s3: "AWS S3",
  adls: "Azure ADLS",
};

const rowToTransaction = (
  row: Record<string, any>,
  idField: "seller_id" | "buyer_id",
): Transaction | null => {
  const get = (keys: string[]) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return String(row[k]);
    }
    return "";
  };

  const id = get([idField, idField.toUpperCase(), "id"]);
  const commodity = get(["commodity", "Commodity"]).toLowerCase();
  if (!id || !commodity) return null;

  return {
    id,
    commodity,
    type: get(["type", "Type"]) || "Standard",
    date: get(["date", "Date", "transaction_date"]),
    year:
      get(["year", "Year"]) ||
      get(["date", "Date"]).split("-").pop() ||
      "",
    quantity: parseFloat(get(["quantity", "Quantity"]) || "0") || 0,
    price: parseFloat(get(["price", "Price"]) || "0") || 0,
    region: get(["region", "Region"]) || "Unknown",
  };
};

const getQuarterPeriod = (dateStr: string): string => {
  if (!dateStr) return "Unknown";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "Unknown";

  let month = parseInt(parts[1]);
  let day = parseInt(parts[0]);
  const year = parseInt(parts[2]);

  if (month > 12) {
    const temp = month;
    month = day;
    day = temp;
  }

  let quarter: number;
  if (month <= 3) quarter = 1;
  else if (month <= 6) quarter = 2;
  else if (month <= 9) quarter = 3;
  else quarter = 4;

  return `${year} Q${quarter}`;
};

// ================= DASHBOARD =================
const Dashboard = () => {
  // Pull data + loading state from context (fetched at app start)
  const { data, activeSource, isLoading, fetchError } = useData();

  const [rawSellers, setRawSellers] = useState<Transaction[]>([]);
  const [rawBuyers, setRawBuyers] = useState<Transaction[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const [commodity, setCommodity] = useState("");
  const [region, setRegion] = useState("all");
  const [year, setYear] = useState("all");
  const [quarter, setQuarter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [selectedBuyer, setSelectedBuyer] = useState("all");

  // Derive the human-readable label for the active source
  const sourceLabel = SOURCE_LABELS[activeSource] ?? activeSource.toUpperCase();

  // Whenever context data changes, parse it into Transaction arrays
  useEffect(() => {
    if (!data) return;

    try {
      const sellers = (data.seller?.rows || [])
        .map((r: any) => rowToTransaction(r, "seller_id"))
        .filter(Boolean) as Transaction[];

      const buyers = (data.buyer?.rows || [])
        .map((r: any) => rowToTransaction(r, "buyer_id"))
        .filter(Boolean) as Transaction[];

      setRawSellers(sellers);
      setRawBuyers(buyers);
      setParseError(null);
    } catch (err: any) {
      setParseError("Failed to process data: " + (err.message || "unknown error"));
    }
  }, [data]);

  // Auto-select first commodity when data loads
  const commoditiesList = useMemo(
    () => Array.from(new Set(rawSellers.map((s) => s.commodity))).sort(),
    [rawSellers],
  );

  useEffect(() => {
    if (commoditiesList.length > 0 && !commoditiesList.includes(commodity)) {
      setCommodity(commoditiesList[0]);
    }
  }, [commoditiesList]);

  // ── Aggregation ─────────────────────────────────────────────────────────────
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
    return Array.from(map.values()).map((e) => ({
      ...e,
      lastTransaction: e.dates.sort().pop() || "",
    }));
  };

  const periodSellers = useMemo(
    () => getPeriodAggregated(rawSellers, commodity, year, quarter),
    [rawSellers, commodity, year, quarter],
  );
  const periodBuyers = useMemo(
    () => getPeriodAggregated(rawBuyers, commodity, year, quarter),
    [rawBuyers, commodity, year, quarter],
  );

  const filteredSellers = useMemo(
    () => (region === "all" ? periodSellers : periodSellers.filter((s) => s.region === region)),
    [periodSellers, region],
  );
  const filteredBuyers = useMemo(
    () => (region === "all" ? periodBuyers : periodBuyers.filter((b) => b.region === region)),
    [periodBuyers, region],
  );

  const availableSellerIds = useMemo(
    () => Array.from(new Set(filteredSellers.map((s) => s.id))).sort(),
    [filteredSellers],
  );
  const availableBuyerIds = useMemo(
    () => Array.from(new Set(filteredBuyers.map((b) => b.id))).sort(),
    [filteredBuyers],
  );

  useEffect(() => {
    if (selectedSeller !== "all" && !availableSellerIds.includes(selectedSeller))
      setSelectedSeller("all");
  }, [availableSellerIds]);

  useEffect(() => {
    if (selectedBuyer !== "all" && !availableBuyerIds.includes(selectedBuyer))
      setSelectedBuyer("all");
  }, [availableBuyerIds]);

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

  const sellerTypeBreakdown = useMemo(() => {
    const bd: Record<string, number> = {};
    displaySellers.forEach((s) => {
      bd[s.type] = (bd[s.type] || 0) + s.quantity;
    });
    return Object.entries(bd)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [displaySellers]);

  const buyerTypeBreakdown = useMemo(() => {
    const bd: Record<string, number> = {};
    displayBuyers.forEach((b) => {
      bd[b.type] = (bd[b.type] || 0) + b.quantity;
    });
    return Object.entries(bd)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [displayBuyers]);

  const topSellers = useMemo(
    () => [...displaySellers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    [displaySellers],
  );
  const topBuyers = useMemo(
    () => [...displayBuyers].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    [displayBuyers],
  );

  const gapInsight = useMemo(() => {
    const supplyTotal = displaySellers.reduce((sum, s) => sum + s.quantity, 0);
    const demandTotal = displayBuyers.reduce((sum, b) => sum + b.quantity, 0);
    return { supplyTotal, demandTotal, gap: supplyTotal - demandTotal };
  }, [displaySellers, displayBuyers]);

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

  const renderPieLabel = ({
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Live Supply &amp; Demand Overview
          </p>
          {!isLoading && !fetchError && (
            <div className="mt-1 flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">
                {sourceLabel}
              </span>
            </div>
          )}
        </div>

        {/* Filters — only show when data is ready */}
        {!isLoading && !fetchError && !parseError && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Commodity</Label>
              <Select
                value={commodity}
                onValueChange={(v) => {
                  setCommodity(v);
                  setSelectedSeller("all");
                  setSelectedBuyer("all");
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {commoditiesList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
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
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center text-lg text-muted-foreground">
          Loading data from OneLake…
        </div>
      )}

      {/* Fetch error */}
      {!isLoading && fetchError && (
        <div className="flex h-64 items-center justify-center text-destructive text-center px-6">
          <div>
            <p className="font-semibold mb-2">Failed to load data</p>
            <p className="text-sm">{fetchError}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the backend is running on <code>http://localhost:8000</code>, then reload the page.
            </p>
          </div>
        </div>
      )}

      {/* Parse error */}
      {!isLoading && !fetchError && parseError && (
        <div className="flex h-64 items-center justify-center text-destructive text-center px-6">
          {parseError}
        </div>
      )}

      {/* Main content — only when data is ready and parsed */}
      {!isLoading && !fetchError && !parseError && (
        <>
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
                    {commodity.charAt(0).toUpperCase() +
                      commodity.slice(1).toLowerCase()}{" "}
                    · {region === "all" ? "All Regions" : region}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-supply" />
                    Supply:{" "}
                    <strong>{gapInsight.supplyTotal.toLocaleString()} Qt</strong>
                  </span>
                  <span>
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
            {/* ── Supply Side ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold font-display text-supply flex items-center gap-2">
                  <Package className="w-5 h-5" /> Sellers (Supply)
                </h2>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Seller</Label>
                  <Select
                    value={selectedSeller}
                    onValueChange={setSelectedSeller}
                  >
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

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Top Sellers by Quantity
                  </CardTitle>
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

            {/* ── Demand Side ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold font-display text-demand flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Buyers (Demand)
                </h2>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Buyer</Label>
                  <Select
                    value={selectedBuyer}
                    onValueChange={setSelectedBuyer}
                  >
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

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Top Buyers by Quantity
                  </CardTitle>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
