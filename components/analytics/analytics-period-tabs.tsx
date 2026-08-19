"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/providers/locale-provider";
import type { AnalyticsPeriod } from "@/types";

interface AnalyticsPeriodTabsProps {
  period: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  disabled?: boolean;
}

const PERIODS: AnalyticsPeriod[] = ["7d", "30d", "90d", "all"];

export function AnalyticsPeriodTabs({
  period,
  onChange,
  disabled,
}: AnalyticsPeriodTabsProps) {
  const t = useTranslations();

  const labels: Record<AnalyticsPeriod, string> = {
    "7d": t("metrics.period7d"),
    "30d": t("metrics.period30d"),
    "90d": t("metrics.period90d"),
    all: t("metrics.allTime"),
  };

  return (
    <div
      className="inline-flex gap-0.5 rounded-full bg-muted/60 p-0.5"
      role="tablist"
      aria-label={t("metrics.analyticsPeriod")}
    >
      {PERIODS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={period === value}
          disabled={disabled}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
            period === value
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );
}

export function usePeriodLabel(period: AnalyticsPeriod): string {
  const t = useTranslations();
  const labels: Record<AnalyticsPeriod, string> = {
    "7d": t("metrics.period7d"),
    "30d": t("metrics.period30d"),
    "90d": t("metrics.period90d"),
    all: t("metrics.allTime"),
  };
  return labels[period];
}
