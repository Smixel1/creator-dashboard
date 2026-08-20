"use client";

import { InlineStatsRow } from "@/components/shared/inline-stats-row";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { DashboardStats } from "@/types";

interface AnalyticsMetricsGridProps {
  stats: DashboardStats;
}

function formatEngagement(
  stats: DashboardStats,
  insufficientLabel: string
): string {
  if (!stats.hasEngagementData) return insufficientLabel;
  return `${stats.engagementRate.toFixed(1)}%`;
}

export function AnalyticsMetricsGrid({ stats }: AnalyticsMetricsGridProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const insufficient = t("analytics.insufficientData");

  return (
    <section className="space-y-3">
      <h2 className="section-title">{t("analytics.mainMetrics")}</h2>
      <InlineStatsRow
        items={[
          {
            label: t("common.views"),
            value: formatNumber(stats.totalViews),
            change: stats.totalViewsChange,
            tone: "views",
          },
          {
            label: t("common.likes"),
            value: formatNumber(stats.totalLikes),
            change: stats.totalLikesChange,
          },
          {
            label: t("common.comments"),
            value: formatNumber(stats.totalComments),
            change: stats.totalCommentsChange,
          },
          {
            label: t("common.engagement"),
            value: formatEngagement(stats, insufficient),
            change: stats.engagementRateChange,
            tone: stats.hasEngagementData ? "engagement" : "default",
          },
          {
            label: t("common.reels"),
            value: String(stats.totalReels),
            change: stats.totalReelsChange,
          },
        ]}
      />
    </section>
  );
}

export function AnalyticsAveragesGrid({ stats }: AnalyticsMetricsGridProps) {
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
      <h2 className="section-title mb-3">{t("analytics.averagesTitle")}</h2>
      <InlineStatsRow
        items={[
          {
            label: t("analytics.avgViewsPerReel"),
            value: formatNumber(stats.averageViews),
            change: stats.averageViewsChange,
            tone: "views",
          },
          {
            label: t("analytics.avgLikesPerReel"),
            value: formatNumber(stats.averageLikes),
            change: stats.averageLikesChange,
          },
          {
            label: t("analytics.avgCommentsPerReel"),
            value: formatNumber(stats.averageComments),
            change: stats.averageCommentsChange,
          },
          {
            label: t("analytics.avgEngagement"),
            value: formatEngagement(stats, insufficient),
            tone: stats.hasEngagementData ? "engagement" : "default",
          },
        ]}
      />
    </section>
  );
}
