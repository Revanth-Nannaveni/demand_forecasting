import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://d2m11qgy1b40kt.cloudfront.net";

const STATUS_OPTIONS = ["Pending", "In Progress", "Approved"];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Approved: "bg-blue-100 text-blue-800 border-blue-300",
  "In Progress": "bg-orange-100 text-orange-800 border-orange-300",
};

const POTracking = () => {
  const [pos, setPos] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [posRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/po/all`),
        fetch(`${API_BASE}/po/summary`),
      ]);
      const posData = await posRes.json();
      const summaryData = await summaryRes.json();
      setPos(posData.data || []);
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PO data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (poId: string, newStatus: string) => {
    setUpdatingId(poId);
    try {
      const res = await fetch(`${API_BASE}/po/update/${poId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update locally
      setPos((prev) =>
        prev.map((po) => (po.po_id === poId ? { ...po, status: newStatus } : po))
      );
      
      // Refresh summary
      const summaryRes = await fetch(`${API_BASE}/po/summary`);
      setSummary(await summaryRes.json());

      toast({
        title: "Status Updated",
        description: `PO ${poId} updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">PO Request Tracking</h1>
          <p className="text-muted-foreground text-sm">
            Track all purchase order requests raised for additional supplies
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total POs</p>
            <p className="text-2xl font-bold font-display mt-1">{summary?.total_pos ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold font-display mt-1 text-yellow-600">{summary?.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-bold font-display mt-1 text-orange-600">{summary?.in_progress ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold font-display mt-1 text-blue-600">{summary?.approved ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Qty</p>
            <p className="text-2xl font-bold font-display mt-1">{summary?.total_quantity?.toFixed(2) ?? 0} Qt</p>
          </CardContent>
        </Card>
      </div>

      {/* PO Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> All Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading POs...</span>
            </div>
          ) : pos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No PO requests yet. They will appear here after forecast detects a shortage.</p>
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
                  {pos.map((po) => (
                    <TableRow key={po.po_id}>
                      <TableCell className="font-medium">{po.po_id}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{po.created_date}</TableCell>
                      <TableCell>{po.commodity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{po.type}</Badge>
                      </TableCell>
                      <TableCell>{po.buyer}</TableCell>
                      <TableCell className="font-medium">{po.dealer}</TableCell>
                      <TableCell>{po.quantity} Qt</TableCell>
                      <TableCell>{po.quarter}</TableCell>
                      <TableCell>{po.year}</TableCell>
                      <TableCell>
                        {updatingId === po.po_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <select
                            value={po.status}
                            onChange={(e) => handleStatusChange(po.po_id, e.target.value)}
                            className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer ${statusColors[po.status] ?? ""}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
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