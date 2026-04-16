import { insights } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

const icons = [TrendingUp, AlertTriangle, Lightbulb, TrendingUp, TrendingUp];

const AIInsightsPanel = () => (
  <Card className="shadow-card h-fit">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" /> AI Insights
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {insights.map((msg, i) => {
          const Icon = icons[i % icons.length];
          return (
            <li key={i} className="flex items-start gap-2.5 text-sm animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="p-1 rounded bg-secondary shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-primary" />
              </div>
              <span className="text-muted-foreground leading-snug">{msg}</span>
            </li>
          );
        })}
      </ul>
    </CardContent>
  </Card>
);

export default AIInsightsPanel;
