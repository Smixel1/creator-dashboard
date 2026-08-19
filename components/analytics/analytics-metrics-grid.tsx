"use client";

import { MetricCard } from "@/components/shared/metric-card";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { DashboardStats } from "@/types";

interface AnalyticsMetricsGridProps {
  stats: DashboardStats;
  periodLabel?: string;
  variant?: "card" | "ghost";
}

function formatEngagement(
  stats: DashboardStats,
  insufficientLabel: string
): string {
  if (!stats.hasEngagementData) return insufficientLabel;
  return `${stats.engagementRate.toFixed(1)}%`;
}

export function AnalyticsMetricsGrid({
  stats,
  periodLabel,
  variant = "ghost",
}: AnalyticsMetricsGridProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const insufficient = t("analytics.insufficientData");

  return (
    <section className="space-y-3">
      <h2 className="section-title">{t("analytics.mainMetrics")}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1 lg:gap-x-6">
        <MetricCard
          label={t("common.views")}
          value={formatNumber(stats.totalViews)}
          change={stats.totalViewsChange}
          highlight
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("common.likes")}
          value={formatNumber(stats.totalLikes)}
          change={stats.totalLikesChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("common.comments")}
          value={formatNumber(stats.totalComments)}
          change={stats.totalCommentsChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("common.engagement")}
          value={formatEngagement(stats, insufficient)}
          change={stats.engagementRateChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("common.reels")}
          value={String(stats.totalReels)}
          change={stats.totalReelsChange}
          className="col-span-2 lg:col-span-1"
          periodLabel={periodLabel}
          variant={variant}
        />
      </div>
    </section>
  );
}

export function AnalyticsAveragesGrid({
  stats,
  periodLabel,
  variant = "ghost",
}: AnalyticsMetricsGridProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const insufficient = t("analytics.insufficientData");

  const hasAverages =
    stats.totalReels > 0 ||
    stats.totalViews > 0 ||
    stats.totalLikes > 0 ||
    stats.totalComments > 0;

  if (!hasAverages) return null;

  return (
    <section className="open-section border-t border-border/25 pt-6">
      <h2 className="section-title">{t("analytics.averagesTitle")}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 lg:gap-x-6">
        <MetricCard
          label={t("analytics.avgViewsPerReel")}
          value={formatNumber(stats.averageViews)}
          change={stats.averageViewsChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("analytics.avgLikesPerReel")}
          value={formatNumber(stats.averageLikes)}
          change={stats.averageLikesChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("analytics.avgCommentsPerReel")}
          value={formatNumber(stats.averageComments)}
          change={stats.averageCommentsChange}
          periodLabel={periodLabel}
          variant={variant}
        />
        <MetricCard
          label={t("analytics.avgEngagement")}
          value={formatEngagement(stats, insufficient)}
          periodLabel={periodLabel}
          variant={variant}
        />
      </div>
    </section>
  );
}
