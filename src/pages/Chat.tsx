import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, Bot, User, Trash2,
  TrendingUp, BarChart2, Package, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from "recharts";
import { useData } from "@/context/DataContext";

const API_BASE = "https://d2m11qgy1b40kt.cloudfront.net";
const STORAGE_KEY = "farmgate_chat_v2";

// ── Types ────────────────────────────────────────────────────────────────────
type DropdownOptions = Record<string, string[]>;

type SupplySummary = {
  market_supply: number;
  procurement_supply: number;
  demand: number;
  surplus_market: number;
  shortage_procurement: number;
  top_sellers: any[];
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: { title: string; value: any }[];
  tableData?: Record<string, any>[];
  chartData?: { type: string; points: { label: string; value: number }[] };
  forecastData?: {
    historical: { period: string; quantity: number }[];
    forecast: { period: string; quantity: number }[];
  };
  supplySummary?: SupplySummary;
  // Step-by-step: only ONE field shown at a time
  missingInput?: {
    field: string;
    options: string[];
    remainingFields: string[];
    remainingOptions: DropdownOptions;
    previousQuery: string;
  };
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your FarmGate assistant. Ask me about demand, supply, forecasts, or PO status.",
};

const SUGGESTIONS = [
  "Show top buyers",
  "Total demand for chilli",
  "Show PO summary",
  "Forecast details",
];

const FIELD_LABELS: Record<string, string> = {
  buyer_id: "Buyer ID",
  seller_id: "Seller ID",
  region: "Region",
  commodity: "Commodity",
  type: "Type",
  year: "Year",
  quarter: "Quarter",
};

const SHOW_MORE_THRESHOLD = 6;

// ── Markdown renderer ────────────────────────────────────────────────────────
const renderInline = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-semibold text-foreground">{p}</strong>
          : p
      )}
    </>
  );
};

const renderMarkdown = (text: string) => {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const num = line.match(/^(\d+)\.\s+(.*)/);
        if (num) return (
          <div key={i} className="flex gap-2">
            <span className="font-semibold text-primary shrink-0">{num[1]}.</span>
            <span>{renderInline(num[2])}</span>
          </div>
        );
        const bul = line.match(/^[-*]\s+(.*)/);
        if (bul) return (
          <div key={i} className="flex gap-2">
            <span className="text-primary shrink-0">•</span>
            <span>{renderInline(bul[1])}</span>
          </div>
        );
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

// ── Step-by-step single-field selector ──────────────────────────────────────
const MissingInputWidget = ({
  missingInput,
  onSelect,
}: {
  missingInput: NonNullable<Message["missingInput"]>;
  onSelect: (query: string) => void;
}) => {
  const [showAll, setShowAll] = useState(false);
  const label = FIELD_LABELS[missingInput.field] || missingInput.field.replace(/_/g, " ");
  const opts = missingInput.options;
  const visible = showAll ? opts : opts.slice(0, SHOW_MORE_THRESHOLD);

  return (
    <div className="w-full rounded-xl border border-border bg-background p-3 mt-1 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
        Select {label}
        {missingInput.remainingFields.length > 0 && (
          <span className="text-muted-foreground/50 font-normal">
            {" "}→ then {missingInput.remainingFields.map((f) => FIELD_LABELS[f] || f).join(" → ")}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(`${missingInput.previousQuery} for ${opt}`)}
            className="px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150"
          >
            {opt}
          </button>
        ))}
        {!showAll && opts.length > SHOW_MORE_THRESHOLD && (
          <button
            onClick={() => setShowAll(true)}
            className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            +{opts.length - SHOW_MORE_THRESHOLD} more
          </button>
        )}
      </div>
    </div>
  );
};

// ── Forecast area chart ──────────────────────────────────────────────────────
const ForecastChart = ({ data }: { data: NonNullable<Message["forecastData"]> }) => {
  const merged = [
    ...data.historical.map((d) => ({ period: d.period, actual: d.quantity, forecast: null as number | null })),
    ...data.forecast.map((d) => ({ period: d.period, actual: null as number | null, forecast: d.quantity })),
  ].sort((a, b) => a.period.localeCompare(b.period));

  const seen = new Set<string>();
  const chartPoints = merged.filter((d) => {
    if (seen.has(d.period)) return false;
    seen.add(d.period);
    return true;
  });

  const splitPeriod = chartPoints.find((p) => p.actual === null)?.period;
  if (chartPoints.length === 0) return null;

  return (
    <div className="w-full rounded-xl border border-border bg-muted/20 p-3 mt-1">
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 font-medium">
        <TrendingUp size={11} className="text-blue-500" /> Demand Trend
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={chartPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid hsl(var(--border))" }}
            formatter={(v: any) => [v != null ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—", ""]}
          />
          {splitPeriod && (
            <ReferenceLine
              x={splitPeriod}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 2"
              strokeOpacity={0.4}
            />
          )}
          <Area type="monotone" dataKey="actual"   stroke="#10b981" strokeWidth={2} fill="url(#gActual)"   name="Historical" dot={false} connectNulls={false} />
          <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} fill="url(#gForecast)" name="Forecast"   dot={false} connectNulls={false} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1.5 justify-end">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />Historical
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />Forecast
        </span>
      </div>
    </div>
  );
};

// ── Supply summary ───────────────────────────────────────────────────────────
const SupplyCard = ({ summary }: { summary: SupplySummary }) => {
  const fmt = (n: number) =>
    Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const shortage = summary.shortage_procurement > 0;

  return (
    <div className="w-full rounded-xl border border-border bg-muted/20 p-3 mt-1 space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Package size={11} /> Supply Overview
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Demand",         value: fmt(summary.demand),              color: "text-foreground" },
          { label: "Market Supply",  value: fmt(summary.market_supply),       color: "text-emerald-600" },
          { label: "Procurement",    value: fmt(summary.procurement_supply),  color: "text-blue-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-background p-2 text-center">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className={`text-sm font-bold mt-0.5 tabular-nums ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
      {(shortage || summary.surplus_market !== 0) && (
        <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium
          ${shortage
            ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/30 dark:border-red-900"
            : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900"
          }`}>
          <AlertCircle size={11} />
          {shortage
            ? `Procurement shortage of ${fmt(summary.shortage_procurement)} Qt`
            : `Market surplus of ${fmt(Math.abs(summary.surplus_market))} Qt`}
        </div>
      )}
    </div>
  );
};

// ── Expandable data table ────────────────────────────────────────────────────
const ROWS_INITIAL = 10;

const DataTable = ({ rows }: { rows: Record<string, any>[] }) => {
  const [expanded, setExpanded] = useState(false);
  const cols    = Object.keys(rows[0]).slice(0, 6);
  const visible = expanded ? rows : rows.slice(0, ROWS_INITIAL);
  const hidden  = rows.length - ROWS_INITIAL;

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {cols.map((k) => (
                <th key={k} className="text-left px-3 py-2 text-muted-foreground font-medium capitalize whitespace-nowrap">
                  {k.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                {cols.map((k, j) => (
                  <td key={j} className="px-3 py-2 text-foreground whitespace-nowrap">
                    {typeof row[k] === "number" ? row[k].toLocaleString() : String(row[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > ROWS_INITIAL && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full px-3 py-2 text-xs text-primary font-medium bg-muted/30 hover:bg-muted/60 border-t border-border transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>▲ Show less</>
          ) : (
            <>▼ Show {hidden} more row{hidden !== 1 ? "s" : ""}</>
          )}
        </button>
      )}
    </div>
  );
};

// ── Bar chart ────────────────────────────────────────────────────────────────
const BarChartWidget = ({ data }: { data: NonNullable<Message["chartData"]> }) => {
  if (!data.points.length) return null;
  return (
    <div className="w-full rounded-xl border border-border bg-muted/20 p-3 mt-1">
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 font-medium">
        <BarChart2 size={11} /> Chart
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.points} margin={{ top: 4, right: 16, left: -20, bottom: 40 }} barSize={22} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} interval={0} angle={-35} textAnchor="end" />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: number) => v.toLocaleString()} />
          <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Metric cards ─────────────────────────────────────────────────────────────
const MetricCards = ({ cards }: { cards: { title: string; value: any }[] }) => (
  <div className={`grid gap-2 w-full ${
    cards.length === 1 ? "grid-cols-1" :
    cards.length === 2 ? "grid-cols-2" : "grid-cols-3"
  }`}>
    {cards.map((card, i) => (
      <Card key={i} className="shadow-none border border-border">
        <CardContent className="p-3 text-center">
          <p className="text-[11px] text-muted-foreground leading-tight">{card.title}</p>
          <p className="text-base font-bold mt-0.5 tabular-nums">{card.value}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

// ── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({
  msg,
  onOptionSelect,
}: {
  msg: Message;
  onOptionSelect: (q: string) => void;
}) => (
  <div className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    {msg.role === "assistant" && (
      <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={13} className="text-primary" />
      </div>
    )}

    <div className={`max-w-[82%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
      <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
        ${msg.role === "user"
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted/60 text-foreground rounded-tl-sm border border-border/60"
        }`}>
        {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
      </div>

      {msg.missingInput && (
        <MissingInputWidget missingInput={msg.missingInput} onSelect={onOptionSelect} />
      )}

      {msg.cards && msg.cards.length > 0 && <MetricCards cards={msg.cards} />}
      {msg.forecastData && <ForecastChart data={msg.forecastData} />}
      {msg.supplySummary && <SupplyCard summary={msg.supplySummary} />}
      {msg.chartData && <BarChartWidget data={msg.chartData} />}

      {msg.tableData && msg.tableData.length > 0 && (
        <DataTable rows={msg.tableData} />
      )}
    </div>

    {msg.role === "user" && (
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <User size={13} className="text-primary-foreground" />
      </div>
    )}
  </div>
);

// ── Parse API response ───────────────────────────────────────────────────────
function parseResponse(data: any): Omit<Message, "id" | "role"> {

  // 1. Missing inputs — show ONE field at a time ─────────────────────────────
  if (data.type === "missing_inputs" && data.options) {
    const fields = Object.keys(data.options);
    const [firstField, ...rest] = fields;
    const firstLabel = FIELD_LABELS[firstField] || firstField.replace(/_/g, " ");
    const restLabels = rest.map((f) => FIELD_LABELS[f] || f.replace(/_/g, " "));
    return {
      content: rest.length > 0
        ? `Please select the **${firstLabel}** to continue.`
        : `Please select the **${firstLabel}** to continue.`,
      missingInput: {
        field: firstField,
        options: data.options[firstField],
        remainingFields: rest,
        remainingOptions: Object.fromEntries(rest.map((f) => [f, data.options[f]])),
        previousQuery: data.previous_query || "",
      },
    };
  }

  // 2. Flat forecast shape ───────────────────────────────────────────────────
  // Your backend returns: { forecast_quantity, growth_percent, confidence_score,
  //                         historical_trend, forecast_trend, supply_summary, summary }
  const hasForecastFields =
    "forecast_quantity" in data ||
    "historical_trend" in data ||
    "forecast_trend" in data;

  if (hasForecastFields) {
    const qty        = data.forecast_quantity ?? 0;
    const growth     = data.growth_percent ?? 0;
    const confidence = data.confidence_score ?? 0;
    const historical: { period: string; quantity: number }[] = data.historical_trend || [];
    const forecast:   { period: string; quantity: number }[] = data.forecast_trend   || [];
    const supply: SupplySummary | undefined =
      data.supply_summary && typeof data.supply_summary === "object"
        ? data.supply_summary
        : undefined;

    const qtyFmt = qty.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const summaryText =
      data.summary ||
      `Forecasted demand is **${qtyFmt} Qt**${
        growth !== 0 ? `, with a ${growth > 0 ? "+" : ""}${growth}% growth trend` : ""
      } at **${confidence}% confidence**.`;

    return {
      content: summaryText,
      cards: [
        { title: "Forecast (Qt)", value: qtyFmt },
        ...(growth !== 0 ? [{ title: "Growth", value: `${growth > 0 ? "+" : ""}${growth}%` }] : []),
        { title: "Confidence", value: `${confidence}%` },
      ],
      forecastData:
        historical.length > 0 || forecast.length > 0
          ? { historical, forecast }
          : undefined,
      supplySummary: supply,
    };
  }

  // 3. Nested forecast (legacy) ──────────────────────────────────────────────
  if (data.type === "forecast" && data.data?.forecast_data) {
    const fd         = data.data.forecast_data;
    const qty        = fd.forecast_quantity ?? 0;
    const growth     = fd.growth_percent ?? 0;
    const confidence = fd.confidence_score ?? 0;
    return {
      content: data.summary || `Forecasted demand: **${qty.toLocaleString()} Qt** (${confidence}% confidence).`,
      cards: [
        { title: "Forecast (Qt)", value: qty.toLocaleString() },
        ...(growth !== 0 ? [{ title: "Growth", value: `${growth}%` }] : []),
        { title: "Confidence", value: `${confidence}%` },
      ],
      forecastData: {
        historical: fd.historical_trend || [],
        forecast:   fd.forecast_trend   || [],
      },
    };
  }

  // 4. Chart data ────────────────────────────────────────────────────────────
  if (data.chart_data?.x?.length > 0 && data.chart_data?.y?.length > 0) {
    const points = data.chart_data.x.map((label: string, i: number) => ({
      label,
      value: data.chart_data.y[i] ?? 0,
    }));
    return {
      content: data.summary || "Here's the chart.",
      cards: data.cards?.length > 0 ? data.cards : undefined,
      chartData: { type: data.chart_data.chart_type || "bar", points },
    };
  }

  // 5. Array → table ─────────────────────────────────────────────────────────
  if (Array.isArray(data.data) && data.data.length > 0) {
    const normalized = data.data.map((item: any) =>
      typeof item === "string" ? { Value: item } : item
    );
    return {
      content: data.summary || "Here's what I found.",
      cards: data.cards?.length > 0 ? data.cards : undefined,
      tableData: normalized,
    };
  }

  // 6. Object → key/value (skip internal forecast fields) ───────────────────
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const SKIP = new Set([
      "forecast_quantity","growth_percent","confidence_score",
      "historical_trend","forecast_trend","supply_summary",
    ]);
    const rows = Object.entries(data.data)
      .filter(([k]) => !SKIP.has(k))
      .map(([k, v]) => ({
        Key:   k.replace(/_/g, " "),
        Value: typeof v === "object" ? JSON.stringify(v) : String(v),
      }));
    return {
      content: data.summary || "Here's what I found.",
      cards: data.cards?.length > 0 ? data.cards : undefined,
      tableData: rows.length > 0 ? rows : undefined,
    };
  }

  // 7. Fallback ──────────────────────────────────────────────────────────────
  return {
    content: data.summary || "Here's what I found.",
    cards: data.cards?.length > 0 ? data.cards : undefined,
  };
}

// ── localStorage helpers ─────────────────────────────────────────────────────
function saveMessages(msgs: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
}
function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Message[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [WELCOME_MESSAGE];
}

// ── Main Chat ────────────────────────────────────────────────────────────────
const Chat = () => {
  const { activeCredentials, localFiles } = useData();

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { saveMessages(messages); }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Direct forecast parser (when query already contains all params) ──────────
  const parseForecastQuery = (q: string) => {
    const lower = q.toLowerCase();
    if (!/forecast|predict|demand|supply|future/.test(lower)) return null;

    const quarterMatch = lower.match(/\b(q[1-4])\b/);
    const yearMatch    = lower.match(/\b(202[4-7])\b/);
    const entityMatch  = q.match(/\b([BS]\d+)\b/i);
    const role = entityMatch
      ? entityMatch[1].toUpperCase().startsWith("B") ? "buyer" : "seller"
      : null;

    const commodities = ["wheat","rice","maize","chilli","tomato","cotton","soybean","sugarcane"];
    const regions     = ["punjab","telangana","karnataka","maharashtra","gujarat","rajasthan","up","mp","andhra pradesh","haryana","tamil nadu"];
    const commodity   = commodities.find((c) => lower.includes(c)) || null;
    const region      = regions.find((r) => lower.includes(r)) || null;

    if (!entityMatch || !commodity || !quarterMatch || !yearMatch) return null;

    const stopwords = new Set(["for","in","the","of","and","a","an","demand","supply","forecast","predict","future","me","show",...commodities,...regions]);
    const type = lower.replace(/[^a-z0-9 ]/g,"").split(/\s+/)
      .find((w) => w.length > 2 && !stopwords.has(w) && !/^(q[1-4]|202[0-9]|b\d+|s\d+)$/.test(w)) || "general";

    return {
      entity_id: entityMatch[1].toUpperCase(),
      role,
      commodity,
      type,
      region: region || "",
      quarter: quarterMatch[1].toUpperCase(),
      year: parseInt(yearMatch[1]),
    };
  };

  const callForecastAPI = async (params: ReturnType<typeof parseForecastQuery>) => {
    if (!params) return null;
    const isLocal = activeCredentials?.data_source === "local";
    if (isLocal) {
      const fd = new FormData();
      Object.entries(params).forEach(([k, v]) => fd.append(k, String(v)));
      if (localFiles?.buyer)  fd.append("buyers_file",  localFiles.buyer);
      if (localFiles?.seller) fd.append("sellers_file", localFiles.seller);
      const res = await fetch(`${API_BASE}/forecast/local`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Forecast API ${res.status}`);
      return res.json();
    } else {
      const res = await fetch(`${API_BASE}/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, ...activeCredentials }),
      });
      if (!res.ok) throw new Error(`Forecast API ${res.status}`);
      return res.json();
    }
  };

  const sendMessage = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const isLocal = activeCredentials?.data_source === "local";

      // Try direct forecast if fully parseable
      const forecastParams = parseForecastQuery(query);
      if (forecastParams) {
        const data = await callForecastAPI(forecastParams);
        if (data && Object.keys(data).length > 0) {
          const parsed = parseResponse(data);
          setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), role: "assistant", ...parsed }]);
          return;
        }
      }

      // /chat endpoint
      let res: Response;
      // if (isLocal) {
      //   const fd = new FormData();
      //   fd.append("query", query);
      //   if (localFiles?.buyer)  fd.append("buyers_file",  localFiles.buyer);
      //   if (localFiles?.seller) fd.append("sellers_file", localFiles.seller);
      //   res = await fetch(`${API_BASE}/chat`, { method: "POST", body: fd });
      // } else {
      //   const fd = new FormData();
      //   fd.append("query", query);
      //   if (activeCredentials?.data_source)
      //     fd.append("data_source", activeCredentials.data_source);
      //   if (activeCredentials?.credentials && typeof activeCredentials.credentials === "object") {
      //     Object.entries(activeCredentials.credentials).forEach(([k, v]) => fd.append(k, String(v)));
      //   }
      //   res = await fetch(`${API_BASE}/chat`, { method: "POST", body: fd });
      // }

      // With this:
      const fd = new FormData();
      fd.append("query", query);
      res = await fetch(`${API_BASE}/chat`, { method: "POST", body: fd });

      if (!res.ok) throw new Error(`Server ${res.status}: ${await res.text()}`);
      const data = await res.json();
      console.log("Chat API response:", data);

      const parsed = parseResponse(data);

      // Fix truncated non-prompt summaries
      if (!parsed.missingInput && parsed.content) {
        const t = parsed.content.trimEnd();
        if (t.length > 0 && !/[.!?*]$/.test(t)) parsed.content = t + "…";
      }

      setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), role: "assistant", ...parsed }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, {
        id: (Date.now()+1).toString(),
        role: "assistant",
        content: `Sorry, I couldn't process that. ${err?.message || "Please try again."}`,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    const fresh = [WELCOME_MESSAGE];
    setMessages(fresh);
    saveMessages(fresh);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display">Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask about demand, supply, forecasts and purchase orders
          </p>
        </div>
        <Button
          variant="ghost" size="sm" onClick={clearChat}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={14} className="mr-1.5" /> Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onOptionSelect={sendMessage} />
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-primary" />
            </div>
            <div className="bg-muted/60 rounded-2xl rounded-tl-sm border border-border/60 px-3.5 py-2.5 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips — only on fresh chat */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap py-3 flex-shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-border flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder="Ask me anything about your data…"
          className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/50 focus:bg-background transition-colors text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          size="sm"
          className="rounded-xl px-4 h-10"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};

export default Chat;