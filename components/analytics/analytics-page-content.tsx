"use client";

import { useCallback, useState } from "react";
import { Clapperboard, TrendingDown, TrendingUp } from "lucide-react";
import { EmptyStatePanel } from "@/components/shared/empty-state-panel";
import { AddReelModal } from "@/components/reels/add-reel-modal";
import { Button } from "@/components/ui/button";
import { cnChange } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { ViewsChart } from "@/components/charts/views-chart";
import {
  AnalyticsPeriodTabs,
  usePeriodLabel,
} from "@/components/analytics/analytics-period-tabs";
import {
  AnalyticsAveragesGrid,
  AnalyticsMetricsGrid,
} from "@/components/analytics/analytics-metrics-grid";
import { AnalyticsTopReels } from "@/components/analytics/analytics-top-reels";
import { AnalyticsInsight } from "@/components/analytics/analytics-insight";
import { AnalyticsSourceBreakdown } from "@/components/analytics/analytics-source-breakdown";
import { ErrorPanel } from "@/components/shared/error-panel";
import { cn } from "@/lib/utils";
import type { AnalyticsOverview, AnalyticsPeriod } from "@/types";

interface AnalyticsPageContentProps {
  initialAnalytics: AnalyticsOverview;
}

export function AnalyticsPageContent({
  initialAnalytics,
}: AnalyticsPageContentProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const [period, setPeriod] = useState<AnalyticsPeriod>(
    initialAnalytics.period
  );
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodLabel = usePeriodLabel(period);
  const {
    stats,
    viewsOverTime,
    topPerforming,
    contentSource,
  } = analytics;
  const viewsChange = stats.totalViewsChange;
  const hasViewsChange = viewsChange !== undefined;
  const positive = (viewsChange ?? 0) >= 0;

  const loadPeriod = useCallback(
    async (newPeriod: AnalyticsPeriod) => {
      if (newPeriod === period && !error) return;
      setPeriod(newPeriod);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/analytics?period=${newPeriod}`);
        const body = await res.json();

        if (!res.ok) {
          setError(body.error ?? t("analytics.loadError"));
          return;
        }

        setAnalytics(body as AnalyticsOverview);
      } catch {
        setError(t("analytics.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [period, error, t]
  );

  const hasAnyReels =
    topPerforming.length > 0 ||
    stats.totalReels > 0 ||
    analytics.recentReels.length > 0;

  const hasPeriodActivity =
    stats.totalViews > 0 ||
    stats.totalLikes > 0 ||
    stats.totalComments > 0 ||
    viewsOverTime.length > 0;

  return (
    <div className="content-canvas stack-section-lg pb-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
            {t("analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("analytics.subtitle")}
          </p>
        </div>
        <AnalyticsPeriodTabs
          period={period}
          onChange={loadPeriod}
          disabled={loading}
        />
      </header>

      {error && (
        <ErrorPanel
          title={error}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPeriod(period)}
            >
              {t("analytics.retryLoad")}
            </Button>
          }
        />
      )}

      {!hasAnyReels && !loading ? (
        <EmptyStatePanel
          icon={<Clapperboard className="h-6 w-6 text-brand-rose" />}
          eyebrow={t("reels.onboardingEyebrow")}
          title={t("analytics.noDataTitle")}
          description={t("analytics.noDataDesc")}
          action={
            <AddReelModal
              trigger={<Button>{t("common.addReels")}</Button>}
            />
          }
        />
      ) : (
        <div className={cn("stack-section relative", loading && "pointer-events-none")}>
          <section className="open-section pb-6 border-b border-border/25">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_1.4fr] gap-8 lg:gap-10 items-start">
            <div className="space-y-2">
              <p className="section-eyebrow">{t("analytics.performance")}</p>
              {loading ? (
                <div className="h-12 w-40 animate-pulse rounded-lg bg-muted/50" />
              ) : (
                <p className="metric-value metric-value-views">
                  {formatNumber(stats.totalViews)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("metrics.viewsInPeriod", { period: periodLabel })}
              </p>
              {!loading && hasViewsChange && cnChange(viewsChange) && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium mt-1 rounded-lg px-2.5 py-1",
                    positive
                      ? "text-brand-sage bg-brand-sage/10"
                      : "text-destructive bg-destructive/10"
                  )}
                >
                  {positive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {cnChange(viewsChange)}
                  <span className="text-xs font-normal opacity-80">
                    {t("analytics.vsPrevious")}
                  </span>
                </div>
              )}
            </div>

            <div className={cn(loading && "opacity-60")}>
              <AnalyticsMetricsGrid stats={stats} />
            </div>
            </div>
          </section>

          <div className={cn("stack-section space-y-6", loading && "opacity-50")}>
            <AnalyticsAveragesGrid stats={stats} />

            <section className="open-section border-t border-border/25 pt-6">
              <div className="mb-4">
                <h3 className="section-title">{t("metrics.viewsChart")}</h3>
              </div>
              {loading ? (
                <div className="animate-pulse rounded-xl bg-muted/40 h-[240px]" />
              ) : viewsOverTime.length === 0 ? (
                <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground text-center px-4">
                  {hasPeriodActivity
                    ? t("metrics.noDataForPeriod")
                    : t("analytics.noStatsPeriod")}
                </div>
              ) : (
                <ViewsChart
                  data={viewsOverTime}
                  height={240}
                  gradientId="analyticsViewsGradient"
                />
              )}
            </section>

            <section className="open-section border-t border-border/25 pt-6">
              <div className="mb-4">
                <h3 className="section-title">{t("analytics.engagementChart")}</h3>
              </div>
              {loading ? (
                <div className="animate-pulse rounded-xl bg-muted/40 h-[220px]" />
              ) : viewsOverTime.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground text-center px-4">
                  {t("metrics.noDataForPeriod")}
                </div>
              ) : (
                <ViewsChart
                  data={viewsOverTime}
                  dataKey="engagement"
                  colorVar="--chart-2"
                  height={220}
                  gradientId="analyticsEngagementGradient"
                />
              )}
            </section>

            <AnalyticsSourceBreakdown
              contentSource={contentSource}
              totalReels={stats.totalReels}
            />

            <AnalyticsInsight
              stats={stats}
              topReel={topPerforming[0]}
              periodLabel={periodLabel}
            />

            <AnalyticsTopReels reels={topPerforming} />
          </div>

          {loading && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-32">
              <p className="text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
                {t("common.loading")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
