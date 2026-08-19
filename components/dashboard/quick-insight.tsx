"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cnChange, formatPercent } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { ReelWithEngagement } from "@/types";
import type { DashboardStats } from "@/types";

interface QuickInsightProps {
  stats: DashboardStats;
  topReel?: ReelWithEngagement;
}

/** Compact analytical note — not a decorative AI widget. */
export function QuickInsight({ stats, topReel }: QuickInsightProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const viewsChange = stats.totalViewsChange;
  const hasViewsChange = viewsChange !== undefined;
  const positive = (viewsChange ?? 0) >= 0;
  const changeLabel = hasViewsChange ? cnChange(viewsChange) : null;

  return (
    <section className="open-section border-t border-border/25 pt-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="section-eyebrow">{t("dashboard.insightLabel")}</p>
          <p className="text-sm leading-relaxed text-foreground">
            {topReel ? (
              <>
                {t("dashboard.bestReelsNow")}{" "}
                <span className="font-medium">«{topReel.title}»</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {t("dashboard.viewsCount", {
                    views: formatNumber(topReel.views),
                  })}{" "}
                  · {t("dashboard.engagementCount", {
                    engagement: formatPercent(topReel.engagementRate),
                  })}
                </span>
              </>
            ) : (
              t("dashboard.emptyInsight")
            )}
          </p>
          {stats.totalViews > 0 && changeLabel && (
            <p
              className={cn(
                "text-xs font-medium",
                positive ? "text-brand-sage" : "text-destructive"
              )}
            >
              {t("metrics.viewsChangeInPeriod", {
                period: t("metrics.period30d"),
                change: changeLabel,
              })}
            </p>
          )}
        </div>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-medium link-accent shrink-0"
        >
          {t("common.detailedAnalytics")}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
