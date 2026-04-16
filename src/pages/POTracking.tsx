import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { getPORequests, subscribePO, type PORequest } from "@/lib/poStore";

const statusColors: Record<PORequest["status"], string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Approved: "bg-blue-100 text-blue-800 border-blue-300",
  "In Progress": "bg-orange-100 text-orange-800 border-orange-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
};

const POTracking = () => {
  const [requests, setRequests] = useState<PORequest[]>(getPORequests());

  const refresh = useCallback(() => setRequests(getPORequests()), []);

  useEffect(() => {
    const unsub = subscribePO(refresh);
    return () => { unsub(); };
  }, [refresh]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">PO Request Tracking</h1>
        <p className="text-muted-foreground text-sm">Track all purchase order requests raised for additional supplies</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total POs</p>
            <p className="text-2xl font-bold font-display mt-1">{requests.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold font-display mt-1 text-yellow-600">{requests.filter(r => r.status === "Pending").length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-bold font-display mt-1 text-orange-600">{requests.filter(r => r.status === "In Progress").length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Qty Ordered</p>
            <p className="text-2xl font-bold font-display mt-1">{requests.reduce((a, r) => a + r.quantity, 0).toFixed(2)} Qt</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> All Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No PO requests raised yet. Raise a PO from the Forecasting module when demand exceeds supply.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.id}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{r.date}</TableCell>
                      <TableCell>{r.commodity}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{r.type}</Badge></TableCell>
                      <TableCell>{r.buyerEntity}</TableCell>
                      <TableCell className="font-medium">{r.dealerName}</TableCell>
                      <TableCell>{r.quantity} Qt</TableCell>
                      <TableCell>{r.quarter}</TableCell>
                      <TableCell>{r.year}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[r.status]}`}>{r.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POTracking;
