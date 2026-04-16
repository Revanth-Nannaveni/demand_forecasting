export interface PORequest {
  id: string;
  date: string;
  commodity: string;
  type: string;
  buyerEntity: string;
  dealerName: string;
  quantity: number;
  quarter: string;
  year: string;
  status: "Pending" | "Approved" | "In Progress" | "Delivered";
}

let poRequests: PORequest[] = [
  { id: "PO-001", date: "2026-03-15", commodity: "Chilli", type: "Desi", buyerEntity: "B1", dealerName: "AgriConnect Traders", quantity: 209.89, quarter: "Q2", year: "2026", status: "Approved" },
  { id: "PO-002", date: "2026-03-18", commodity: "Wheat", type: "Standard", buyerEntity: "B19", dealerName: "AgriConnect Traders", quantity: 339.90, quarter: "Q1", year: "2026", status: "In Progress" },
  { id: "PO-003", date: "2026-03-22", commodity: "Chilli", type: "Organic", buyerEntity: "B7", dealerName: "AgriConnect Traders", quantity: 150.78, quarter: "Q3", year: "2026", status: "Pending" },
];

let nextId = 4;
const listeners: Set<() => void> = new Set();

export function getPORequests(): PORequest[] {
  return [...poRequests];
}

export function addPORequest(req: Omit<PORequest, "id" | "date" | "status">): PORequest {
  const po: PORequest = {
    ...req,
    id: `PO-${String(nextId++).padStart(3, "0")}`,
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
  };
  poRequests = [...poRequests, po];
  listeners.forEach(fn => fn());
  return po;
}

export function subscribePO(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
