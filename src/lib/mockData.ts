export const commodities = ["Paddy", "Chilli", "Tomato", "Wheat", "Maize"] as const;
export type Commodity = typeof commodities[number];

export const regions = ["North", "South", "East", "West", "Central"] as const;
export type Region = typeof regions[number];

export const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
export const years = ["2024", "2025", "2026"] as const;

export interface Seller {
  id: string;
  commodity: Commodity;
  type: "T1" | "T2";
  quantity: number;
  lastTransaction: string;
  region: Region;
}

export interface Buyer {
  id: string;
  commodity: Commodity;
  type: "T1" | "T2";
  quantity: number;
  lastTransaction: string;
  region: Region;
}

export interface Allocation {
  buyerId: string;
  commodity: Commodity;
  requiredQuantity: number;
  allocatedSellers: string[];
  fulfilledPercent: number;
  status: "Fully Fulfilled" | "Partially Fulfilled" | "Not Fulfilled";
}

export interface TimeData {
  period: string;
  t1: number;
  t2: number;
}

export interface ForecastPoint {
  period: string;
  actual: number | null;
  forecast: number | null;
}

const regionList: Region[] = ["North", "South", "East", "West", "Central"];

function genSellers(commodity: Commodity, baseQty: number, startId: number): Seller[] {
  return [
    { id: `S${String(startId).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 0.9), lastTransaction: "2025-12-15", region: regionList[0] },
    { id: `S${String(startId + 1).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.64), lastTransaction: "2025-11-20", region: regionList[1] },
    { id: `S${String(startId + 2).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 1.2), lastTransaction: "2026-01-10", region: regionList[2] },
    { id: `S${String(startId + 3).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.56), lastTransaction: "2025-10-05", region: regionList[3] },
    { id: `S${String(startId + 4).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 1.02), lastTransaction: "2026-02-18", region: regionList[4] },
    { id: `S${String(startId + 5).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.78), lastTransaction: "2026-01-25", region: regionList[0] },
    { id: `S${String(startId + 6).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 1.44), lastTransaction: "2026-03-02", region: regionList[1] },
    { id: `S${String(startId + 7).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.37), lastTransaction: "2025-09-14", region: regionList[2] },
  ];
}

function genBuyers(commodity: Commodity, baseQty: number, startId: number): Buyer[] {
  return [
    { id: `B${String(startId).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 1.0), lastTransaction: "2026-01-20", region: regionList[0] },
    { id: `B${String(startId + 1).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.7), lastTransaction: "2025-12-10", region: regionList[1] },
    { id: `B${String(startId + 2).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 1.4), lastTransaction: "2026-02-05", region: regionList[2] },
    { id: `B${String(startId + 3).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 0.84), lastTransaction: "2025-11-18", region: regionList[3] },
    { id: `B${String(startId + 4).padStart(3, "0")}`, commodity, type: "T1", quantity: Math.round(baseQty * 0.6), lastTransaction: "2026-03-01", region: regionList[4] },
    { id: `B${String(startId + 5).padStart(3, "0")}`, commodity, type: "T2", quantity: Math.round(baseQty * 1.1), lastTransaction: "2026-01-12", region: regionList[0] },
  ];
}

function genSupplyTime(base: number): TimeData[] {
  return [
    { period: "2024 Q1", t1: Math.round(base * 0.8), t2: Math.round(base * 0.5) },
    { period: "2024 Q2", t1: Math.round(base * 0.95), t2: Math.round(base * 0.62) },
    { period: "2024 Q3", t1: Math.round(base * 1.1), t2: Math.round(base * 0.7) },
    { period: "2024 Q4", t1: Math.round(base * 1.05), t2: Math.round(base * 0.68) },
    { period: "2025 Q1", t1: Math.round(base * 1.2), t2: Math.round(base * 0.75) },
    { period: "2025 Q2", t1: Math.round(base * 1.35), t2: Math.round(base * 0.82) },
    { period: "2025 Q3", t1: Math.round(base * 1.4), t2: Math.round(base * 0.85) },
    { period: "2025 Q4", t1: Math.round(base * 1.5), t2: Math.round(base * 0.9) },
  ];
}

function genDemandTime(base: number): TimeData[] {
  return [
    { period: "2024 Q1", t1: Math.round(base * 0.7), t2: Math.round(base * 0.45) },
    { period: "2024 Q2", t1: Math.round(base * 0.85), t2: Math.round(base * 0.55) },
    { period: "2024 Q3", t1: Math.round(base * 1.0), t2: Math.round(base * 0.65) },
    { period: "2024 Q4", t1: Math.round(base * 1.05), t2: Math.round(base * 0.7) },
    { period: "2025 Q1", t1: Math.round(base * 1.15), t2: Math.round(base * 0.78) },
    { period: "2025 Q2", t1: Math.round(base * 1.3), t2: Math.round(base * 0.85) },
    { period: "2025 Q3", t1: Math.round(base * 1.45), t2: Math.round(base * 0.92) },
    { period: "2025 Q4", t1: Math.round(base * 1.6), t2: Math.round(base * 1.0) },
  ];
}

const commodityConfig: Record<Commodity, { sellerBase: number; buyerBase: number; timeBase: number; sellerStart: number; buyerStart: number }> = {
  Paddy:  { sellerBase: 500, buyerBase: 500, timeBase: 1000, sellerStart: 1, buyerStart: 1 },
  Chilli: { sellerBase: 300, buyerBase: 280, timeBase: 600, sellerStart: 9, buyerStart: 7 },
  Tomato: { sellerBase: 400, buyerBase: 420, timeBase: 800, sellerStart: 17, buyerStart: 13 },
  Wheat:  { sellerBase: 550, buyerBase: 520, timeBase: 1100, sellerStart: 25, buyerStart: 19 },
  Maize:  { sellerBase: 350, buyerBase: 330, timeBase: 700, sellerStart: 33, buyerStart: 25 },
};

export const sellers: Seller[] = commodities.flatMap(c => genSellers(c, commodityConfig[c].sellerBase, commodityConfig[c].sellerStart));
export const buyers: Buyer[] = commodities.flatMap(c => genBuyers(c, commodityConfig[c].buyerBase, commodityConfig[c].buyerStart));

export const supplyTimeDataByCommodity: Record<Commodity, TimeData[]> = Object.fromEntries(
  commodities.map(c => [c, genSupplyTime(commodityConfig[c].timeBase)])
) as Record<Commodity, TimeData[]>;

export const demandTimeDataByCommodity: Record<Commodity, TimeData[]> = Object.fromEntries(
  commodities.map(c => [c, genDemandTime(commodityConfig[c].timeBase)])
) as Record<Commodity, TimeData[]>;

export const supplyTimeData = supplyTimeDataByCommodity.Paddy;
export const demandTimeData = demandTimeDataByCommodity.Paddy;

// Forecast data generators
export function generateForecastData(entityId: string, commodity: Commodity, type: "T1" | "T2" | "Both"): ForecastPoint[] {
  const hash = entityId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = commodityConfig[commodity]?.timeBase ?? 800;
  const typeMultiplier = type === "T1" ? 1.0 : type === "T2" ? 0.65 : 1.5;
  const entityVariance = (hash % 30) / 100;

  return [
    { period: "2024 Q1", actual: Math.round(base * 0.6 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2024 Q2", actual: Math.round(base * 0.7 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2024 Q3", actual: Math.round(base * 0.8 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2024 Q4", actual: Math.round(base * 0.85 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2025 Q1", actual: Math.round(base * 0.9 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2025 Q2", actual: Math.round(base * 0.95 * typeMultiplier * (1 + entityVariance)), forecast: null },
    { period: "2025 Q3", actual: Math.round(base * 1.0 * typeMultiplier * (1 + entityVariance)), forecast: Math.round(base * 1.0 * typeMultiplier * (1 + entityVariance)) },
    { period: "2025 Q4", actual: null, forecast: Math.round(base * 1.1 * typeMultiplier * (1 + entityVariance)) },
    { period: "2026 Q1", actual: null, forecast: Math.round(base * 1.2 * typeMultiplier * (1 + entityVariance)) },
    { period: "2026 Q2", actual: null, forecast: Math.round(base * 1.3 * typeMultiplier * (1 + entityVariance)) },
  ];
}

// High-demand buyers - these will always have demand > supply for their commodity
// Use the THIRD buyer (index 2) for each commodity as the high-demand case
const highDemandBuyers: Record<Commodity, string> = {
  Paddy: "B003",
  Chilli: "B009",
  Tomato: "B015",
  Wheat: "B021",
  Maize: "B027",
};

export function isHighDemandBuyer(entityId: string): boolean {
  return Object.values(highDemandBuyers).includes(entityId);
}

export function getForecastValues(entityId: string, commodity: Commodity, type: "T1" | "T2" | "Both") {
  const data = generateForecastData(entityId, commodity, type);
  const lastForecast = data.filter(d => d.forecast !== null);
  let t1Val = type === "T1" || type === "Both" ? lastForecast[lastForecast.length - 1]?.forecast ?? 0 : 0;
  let t2Val = type === "T2" || type === "Both" ? Math.round((lastForecast[lastForecast.length - 1]?.forecast ?? 0) * 0.65) : 0;
  
  // Inflate demand for high-demand buyers to ensure demand > supply
  if (isHighDemandBuyer(entityId)) {
    t1Val = Math.round(t1Val * 5.5);
    t2Val = Math.round(t2Val * 5.5);
  }

  const hash = entityId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const confidence = 78 + (hash % 18);
  const dataPoints = 24 + (hash % 20);
  const trend = `+${8 + (hash % 15)}%`;
  return { t1Val, t2Val, confidence, dataPoints, trend };
}

// Alternate dealers for shortage cases
export interface AlternateDealer {
  name: string;
  commodity: Commodity;
  type: "T1" | "T2" | "Both";
  availableQty: number;
  region: Region;
  rating: number;
}

export const alternateDealers: AlternateDealer[] = [
  { name: "AgriConnect Traders", commodity: "Paddy", type: "T1", availableQty: 800, region: "South", rating: 4.5 },
  { name: "GreenField Supplies", commodity: "Paddy", type: "T2", availableQty: 550, region: "North", rating: 4.2 },
  { name: "HarvestPro Corp", commodity: "Paddy", type: "Both", availableQty: 1200, region: "East", rating: 4.8 },
  { name: "SpiceWorld Distributors", commodity: "Chilli", type: "T1", availableQty: 400, region: "South", rating: 4.3 },
  { name: "RedHot Traders", commodity: "Chilli", type: "T2", availableQty: 320, region: "West", rating: 4.0 },
  { name: "ChilliKing Exports", commodity: "Chilli", type: "Both", availableQty: 650, region: "Central", rating: 4.6 },
  { name: "FreshVeg Holdings", commodity: "Tomato", type: "T1", availableQty: 600, region: "North", rating: 4.1 },
  { name: "TomatoFarm Direct", commodity: "Tomato", type: "T2", availableQty: 450, region: "East", rating: 4.4 },
  { name: "VeggieLink Co", commodity: "Tomato", type: "Both", availableQty: 900, region: "South", rating: 4.7 },
  { name: "FarmLink Supplies", commodity: "Wheat", type: "T1", availableQty: 950, region: "Central", rating: 4.5 },
  { name: "GoldenGrain Corp", commodity: "Wheat", type: "T2", availableQty: 700, region: "North", rating: 4.3 },
  { name: "WheatPro International", commodity: "Wheat", type: "Both", availableQty: 1400, region: "West", rating: 4.9 },
  { name: "CornField Traders", commodity: "Maize", type: "T1", availableQty: 500, region: "East", rating: 4.2 },
  { name: "MaizeMax Supplies", commodity: "Maize", type: "T2", availableQty: 380, region: "South", rating: 4.0 },
  { name: "AgriMaize Global", commodity: "Maize", type: "Both", availableQty: 850, region: "Central", rating: 4.6 },
];

export const allocations: Allocation[] = [
  { buyerId: "B001", commodity: "Paddy", requiredQuantity: 500, allocatedSellers: ["S001", "S005"], fulfilledPercent: 100, status: "Fully Fulfilled" },
  { buyerId: "B002", commodity: "Paddy", requiredQuantity: 350, allocatedSellers: ["S002"], fulfilledPercent: 91, status: "Partially Fulfilled" },
  { buyerId: "B003", commodity: "Paddy", requiredQuantity: 700, allocatedSellers: ["S003", "S007"], fulfilledPercent: 100, status: "Fully Fulfilled" },
  { buyerId: "B004", commodity: "Paddy", requiredQuantity: 420, allocatedSellers: ["S004", "S006"], fulfilledPercent: 75, status: "Partially Fulfilled" },
  { buyerId: "B005", commodity: "Paddy", requiredQuantity: 300, allocatedSellers: ["S008"], fulfilledPercent: 62, status: "Partially Fulfilled" },
  { buyerId: "B006", commodity: "Paddy", requiredQuantity: 550, allocatedSellers: [], fulfilledPercent: 0, status: "Not Fulfilled" },
  { buyerId: "B007", commodity: "Chilli", requiredQuantity: 280, allocatedSellers: ["S009", "S013"], fulfilledPercent: 100, status: "Fully Fulfilled" },
  { buyerId: "B008", commodity: "Chilli", requiredQuantity: 196, allocatedSellers: ["S010"], fulfilledPercent: 82, status: "Partially Fulfilled" },
  { buyerId: "B013", commodity: "Tomato", requiredQuantity: 420, allocatedSellers: ["S017", "S021"], fulfilledPercent: 95, status: "Partially Fulfilled" },
  { buyerId: "B014", commodity: "Tomato", requiredQuantity: 294, allocatedSellers: [], fulfilledPercent: 0, status: "Not Fulfilled" },
];

export const forecastLineData = generateForecastData("B001", "Paddy", "Both");

export const insights = [
  "Expected Demand Increase of ~15% in Q2 2026",
  "Potential Supply Shortage in T1 Paddy by Q3",
  "Suggested Action: Onboard 3+ new sellers for T2",
  "Buyer B003 shows consistent demand growth trend",
  "T1 demand is growing 20% faster than T2",
];

export function getEntityTimeData(entityId: string, commodity: Commodity): TimeData[] {
  const hash = entityId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = commodityConfig[commodity]?.timeBase ?? 800;
  const variance = 0.5 + (hash % 50) / 100;
  return [
    { period: "2024 Q1", t1: Math.round(base * 0.3 * variance), t2: Math.round(base * 0.2 * variance) },
    { period: "2024 Q2", t1: Math.round(base * 0.35 * variance), t2: Math.round(base * 0.22 * variance) },
    { period: "2024 Q3", t1: Math.round(base * 0.4 * variance), t2: Math.round(base * 0.25 * variance) },
    { period: "2024 Q4", t1: Math.round(base * 0.38 * variance), t2: Math.round(base * 0.24 * variance) },
    { period: "2025 Q1", t1: Math.round(base * 0.42 * variance), t2: Math.round(base * 0.27 * variance) },
    { period: "2025 Q2", t1: Math.round(base * 0.48 * variance), t2: Math.round(base * 0.3 * variance) },
    { period: "2025 Q3", t1: Math.round(base * 0.5 * variance), t2: Math.round(base * 0.32 * variance) },
    { period: "2025 Q4", t1: Math.round(base * 0.55 * variance), t2: Math.round(base * 0.35 * variance) },
  ];
}

// Filter time data by quarter and year
export function filterTimeDataBySelection(data: TimeData[], quarter?: string, year?: string): TimeData[] {
  if (!quarter && !year) return data;
  return data.filter(d => {
    const [y, q] = d.period.split(" ");
    if (year && y !== year) return false;
    if (quarter && q !== quarter) return false;
    return true;
  });
}
