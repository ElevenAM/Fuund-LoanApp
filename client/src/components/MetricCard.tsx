import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricCardProps {
  label: string;
  value: string;
  tooltip?: string;
  trend?: "up" | "down" | "neutral";
  status?: "good" | "warning" | "neutral";
}

export default function MetricCard({
  label,
  value,
  tooltip,
  trend,
  status = "neutral",
}: MetricCardProps) {
  const statusColors = {
    good: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    neutral: "text-foreground",
  };

  return (
    <Card className="p-6" data-testid={`card-metric-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            {label}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 cursor-help" data-testid="icon-info" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          {trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" data-testid="icon-trend-up" />}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" data-testid="icon-trend-down" />}
        </div>
        <p className={`text-3xl font-semibold tabular-nums ${statusColors[status]}`} data-testid="text-metric-value">
          {value}
        </p>
      </div>
    </Card>
  );
}
