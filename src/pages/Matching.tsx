import { allocations, sellers, buyers } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import SummaryCard from "@/components/SummaryCard";
import { Package, ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Matching = () => {
  const totalSupply = sellers.reduce((a, s) => a + s.quantity, 0);
  const totalDemand = buyers.reduce((a, b) => a + b.quantity, 0);
  const diff = totalSupply - totalDemand;

  const statusColor = (s: string) =>
    s === "Fully Fulfilled" ? "text-surplus" : s === "Partially Fulfilled" ? "text-warning" : "text-shortage";
  const statusBg = (s: string) =>
    s === "Fully Fulfilled" ? "bg-surplus/10" : s === "Partially Fulfilled" ? "bg-warning/10" : "bg-shortage/10";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Demand-Supply Matching</h1>
        <p className="text-muted-foreground text-sm">Allocation of sellers to buyer orders</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard title="Total Supply" value={`${totalSupply} Qt`} icon={Package} />
        <SummaryCard title="Total Demand" value={`${totalDemand} Qt`} icon={ShoppingCart} />
        <SummaryCard
          title={diff >= 0 ? "Surplus" : "Shortage"}
          value={`${Math.abs(diff)} Qt`}
          icon={diff >= 0 ? CheckCircle : AlertTriangle}
          trend={diff >= 0 ? "Supply exceeds demand" : "Demand exceeds supply"}
        />
        <SummaryCard
          title="Fulfillment Rate"
          value={`${Math.round(allocations.reduce((a, al) => a + al.fulfilledPercent, 0) / allocations.length)}%`}
          icon={CheckCircle}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Allocation Table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer ID</TableHead>
                <TableHead>Required Qty</TableHead>
                <TableHead>Allocated Sellers</TableHead>
                <TableHead>Fulfilled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map(a => (
                <TableRow key={a.buyerId}>
                  <TableCell className="font-medium">{a.buyerId}</TableCell>
                  <TableCell>{a.requiredQuantity} Qt</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {a.allocatedSellers.length > 0
                        ? a.allocatedSellers.map(s => (
                            <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">{s}</span>
                          ))
                        : <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={a.fulfilledPercent} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground">{a.fulfilledPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusColor(a.status), statusBg(a.status))}>
                      {a.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Matching;
