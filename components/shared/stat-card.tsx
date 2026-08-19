import { cn } from "@/lib/utils";
import { cnChange } from "@/lib/format";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  className?: string;
}

export function StatCard({ label, value, change, className }: StatCardProps) {
  const positive = (change ?? 0) >= 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 soft-shadow",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {change !== undefined && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            positive ? "text-emerald-600" : "text-red-500"
          )}
        >
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {cnChange(change)}
        </div>
      )}
    </div>
  );
}
