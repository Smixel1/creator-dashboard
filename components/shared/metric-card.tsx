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
  highlight?: boolean;
  periodLabel?: string;
  /** card = bordered surface; ghost = open inline metric */
  variant?: "card" | "ghost";
}

export function MetricCard({
  label,
  value,
  change,
  className,
  highlight = false,
  periodLabel,
  variant = "card",
}: MetricCardProps) {
  const t = useTranslations();
  const positive = (change ?? 0) >= 0;
  const hasChange = change !== undefined;
  const isGhost = variant === "ghost";

  return (
    <div
      className={cn(
        isGhost ? "px-0 py-2" : "surface-soft px-4 py-3.5",
        highlight && !isGhost && "ring-1 ring-brand-rose/15",
        className
      )}
    >
      <p className="metric-name mb-1.5">{label}</p>
      <p
        className={cn(
          "font-semibold tabular-nums tracking-tight leading-none",
          highlight
            ? "editorial-heading text-3xl sm:text-4xl text-brand-rose"
            : isGhost
              ? "text-xl sm:text-2xl text-foreground"
              : "text-2xl text-foreground"
        )}
      >
        {value}
      </p>
      {hasChange ? (
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
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
