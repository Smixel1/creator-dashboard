"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cnChange } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { ViewsChart } from "@/components/charts/views-chart";
import { cn } from "@/lib/utils";
import type { ChartDataPoint, FollowersMetrics } from "@/types";

interface AnalyticsFollowersSectionProps {
  metrics: FollowersMetrics;
  overTime: ChartDataPoint[];
  periodLabel: string;
  loading?: boolean;
  hasHistoricalData?: boolean;
}

export function AnalyticsFollowersSection({
  metrics,
  overTime,
  periodLabel,
  loading,
  hasHistoricalData = true,
}: AnalyticsFollowersSectionProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const positive = metrics.growth >= 0;
  const changeLabel =
    hasHistoricalData && metrics.hasHistoricalData !== false
      ? cnChange(metrics.growthPercent)
      : null;

  return (
    <section className="open-section border-t border-border/25 pt-6">
      <div className="mb-5">
        <h2 className="section-title">{t("analytics.followersTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("analytics.followersDesc", { period: periodLabel })}
        </p>
      </div>

      <div
        className={cn(
          "grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pb-6 border-b border-border/20",
          loading && "opacity-60"
        )}
      >
        <div className="space-y-1">
          <p className="metric-label mb-2">{t("analytics.currentFollowers")}</p>
          <p className="metric-value-sm metric-value-views">
            {metrics.hasData !== false
              ? formatNumber(metrics.current)
              : t("analytics.insufficientData")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="metric-label mb-2">{t("analytics.previousFollowers")}</p>
          <p className="metric-value-sm">
            {hasHistoricalData && metrics.hasHistoricalData !== false
              ? formatNumber(metrics.previous)
              : t("analytics.insufficientData")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="metric-label mb-2">{t("analytics.followersGrowth")}</p>
          <p
            className={cn(
              "metric-value-sm",
              hasHistoricalData && metrics.hasHistoricalData !== false
                ? positive
                  ? "metric-value-engagement"
                  : "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {hasHistoricalData && metrics.hasHistoricalData !== false ? (
              <>
                {positive ? "+" : ""}
                {formatNumber(metrics.growth)}
              </>
            ) : (
              t("analytics.insufficientData")
            )}
          </p>
        </div>
        <div className="space-y-1">
          <p className="metric-label mb-2">
            {t("analytics.followersGrowthPercent")}
          </p>
          {changeLabel && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-lg font-semibold tabular-nums",
                positive ? "text-brand-sage" : "text-destructive"
              )}
            >
              {positive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {changeLabel}
            </div>
          )}
        </div>
      </div>

      <div className="pt-5">
        <h3 className="section-title mb-4">{t("metrics.followersChart")}</h3>
        {loading ? (
          <div className="animate-pulse rounded-xl bg-muted/40 h-[220px]" />
        ) : (
          <ViewsChart
            data={overTime}
            dataKey="followers"
            height={220}
            gradientId="analyticsFollowersGradient"
          />
        )}
      </div>
    </section>
  );
}
