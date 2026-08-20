"use client";

import { cn } from "@/lib/utils";
import { cnChange } from "@/lib/format";
import { useTranslations } from "@/components/providers/locale-provider";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  className?: string;
  periodLabel?: string;
  tone?: "default" | "views" | "engagement";
  /** card = bordered surface; ghost = open inline metric */
  variant?: "card" | "ghost";
}

export function MetricCard({
  label,
  value,
  change,
  className,
  periodLabel,
  tone = "default",
  variant = "card",
}: MetricCardProps) {
  const t = useTranslations();
  const positive = (change ?? 0) >= 0;
  const hasChange = change !== undefined;
  const isGhost = variant === "ghost";

  return (
    <div
      className={cn(
        isGhost ? "px-0 py-2" : "metric-tile",
        className
      )}
    >
      <p className="metric-label mb-2">{label}</p>
      <p
        className={cn(
          "metric-value-sm",
          tone === "views" && "metric-value-views",
          tone === "engagement" && "metric-value-engagement",
        )}
      >
        {value}
      </p>
      {hasChange ? (
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
            positive ? "text-brand-sage" : "text-destructive"
          )}
        >
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {cnChange(change) ?? t("common.dash")}
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {periodLabel ?? t("common.forPeriod")}
        </p>
      )}
    </div>
  );
}
