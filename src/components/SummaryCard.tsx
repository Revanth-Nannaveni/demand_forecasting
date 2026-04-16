import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

const SummaryCard = ({ title, value, icon: Icon, trend, className }: SummaryCardProps) => (
  <Card className={cn("shadow-card hover:shadow-card-hover transition-shadow", className)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold font-display mt-1 text-foreground">{value}</p>
          {trend && <p className="text-xs text-supply mt-1">{trend}</p>}
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SummaryCard;
