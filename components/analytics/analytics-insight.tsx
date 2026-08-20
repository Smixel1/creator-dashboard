"use client";

import { cnChange } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { DashboardStats, ReelWithEngagement } from "@/types";

interface AnalyticsInsightProps {
  stats: DashboardStats;
  topReel?: ReelWithEngagement;
  periodLabel: string;
}

export function AnalyticsInsight({
  stats,
  topReel,
  periodLabel,
}: AnalyticsInsightProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const viewsChange = stats.totalViewsChange;
  const changeLabel = viewsChange !== undefined ? cnChange(viewsChange) : null;
  const positive = (viewsChange ?? 0) >= 0;

  if (stats.totalReels === 0) return null;

  return (
    <section className="creator-panel animate-enter-delay-2">
      <p className="section-eyebrow mb-2">{t("analytics.insightTitle")}</p>
      <p className="text-sm leading-relaxed text-foreground">
        {changeLabel ? (
          <>
            {t("analytics.insightViewsPeriod", {
              period: periodLabel,
              change: changeLabel,
            })}{" "}
            <span
              className={cn(
                "font-medium",
                positive ? "text-brand-sage" : "text-destructive"
              )}
            >
              {positive ? t("analytics.trendUp") : t("analytics.trendDown")}
            </span>
          </>
        ) : (
          t("analytics.insightNoComparison")
        )}
      </p>
      {topReel && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("analytics.insightBestReel", {
            title: topReel.title,
            views: formatNumber(topReel.views),
          })}
        </p>
      )}
    </section>
  );
}
