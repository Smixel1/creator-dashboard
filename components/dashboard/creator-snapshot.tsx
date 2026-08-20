"use client";

import { InlineStatsRow } from "@/components/shared/inline-stats-row";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { DashboardStats } from "@/types";

interface CreatorSnapshotProps {
  stats: DashboardStats;
}

export function CreatorSnapshot({ stats }: CreatorSnapshotProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const engagementValue = stats.hasEngagementData
    ? `${stats.engagementRate.toFixed(1)}%`
    : t("analytics.insufficientData");

  return (
    <section className="surface-panel p-4 sm:p-5 animate-enter-delay-1">
      <p className="section-eyebrow mb-4">{t("dashboard.snapshotLabel")}</p>
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
            label: t("common.engagement"),
            value: engagementValue,
            change: stats.engagementRateChange,
            tone: stats.hasEngagementData ? "engagement" : "default",
          },
          {
            label: t("common.reels"),
            value: String(stats.totalReels),
          },
        ]}
      />
    </section>
  );
}
