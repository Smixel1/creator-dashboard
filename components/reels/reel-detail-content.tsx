"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { formatEngagementRate } from "@/lib/format";
import {
  formatReelMetric,
  getReelDisplayCaption,
  getReelFreshnessLabel,
  getReelSourceLabelKey,
  getChartStatsRange,
  reelHasEngagementData,
  reelMetricHasData,
  shouldShowReelSource,
} from "@/lib/reel-display";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { useDeleteReel } from "@/hooks/use-delete-reel";
import { ViewsChart } from "@/components/charts/views-chart";
import { ReelCard } from "@/components/reels/reel-card";
import { DeleteReelDialog } from "@/components/reels/delete-reel-dialog";
import { RefreshReelButton } from "@/components/reels/refresh-reel-button";
import { ReelCoverImage } from "@/components/reels/reel-cover-image";
import { EmptyStatePanel } from "@/components/shared/empty-state-panel";
import { ErrorPanel } from "@/components/shared/error-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReelDetail, ReelWithEngagement } from "@/types";

interface ReelDetailContentProps {
  reel: ReelDetail;
  related: ReelWithEngagement[];
}

export function ReelDetailContent({ reel, related }: ReelDetailContentProps) {
  const router = useRouter();
  const t = useTranslations();
  const { formatDate, formatNumber } = useFormatters();
  const { deleteReel, deletingId, error, clearError } = useDeleteReel();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const insufficient = t("analytics.insufficientData");
  const displayCaption = getReelDisplayCaption(reel);
  const freshnessLabel = getReelFreshnessLabel(
    reel,
    formatDate,
    t("reels.lastUpdated")
  );
  const viewsLabel = formatReelMetric(
    reel.views,
    reelMetricHasData(reel, "views"),
    formatNumber,
    insufficient
  );
  const likesLabel = formatReelMetric(
    reel.likes,
    reelMetricHasData(reel, "likes"),
    formatNumber,
    insufficient
  );
  const commentsLabel = formatReelMetric(
    reel.comments,
    reelMetricHasData(reel, "comments"),
    formatNumber,
    insufficient
  );
  const engagementLabel = formatEngagementRate(
    reel.views,
    reel.engagementRate,
    insufficient,
    reelHasEngagementData(reel)
  );
  const hasStats = reel.stats.length > 0;
  const statsRange = hasStats ? getChartStatsRange(reel.stats) : null;
  const sourceKey = getReelSourceLabelKey(reel.source);

  async function handleDelete() {
    const success = await deleteReel(reel.id);
    if (success) {
      router.push("/reels");
      router.refresh();
    }
  }

  return (
    <div className="content-canvas stack-section-lg pb-6">
      <Link
        href="/reels"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors animate-enter"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("reels.backToReels")}
      </Link>

      {error && (
        <ErrorPanel
          title={error}
          action={
            <Button type="button" variant="outline" size="sm" onClick={clearError}>
              {t("common.close")}
            </Button>
          }
        />
      )}

      <section className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-8 lg:gap-12 items-start animate-enter-delay-1">
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="content-card overflow-hidden soft-shadow relative aspect-[3/4] bg-muted/40">
            <ReelCoverImage
              src={reel.coverUrl}
              alt={displayCaption}
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {shouldShowReelSource(reel.source) && (
                <span className="source-pill">{t(sourceKey)}</span>
              )}
              {freshnessLabel && (
                <span className="text-xs text-muted-foreground">
                  {freshnessLabel}
                </span>
              )}
            </div>
            {reel.ownerUsername && (
              <p className="text-sm font-medium text-muted-foreground">
                @{reel.ownerUsername}
              </p>
            )}
            <h1 className="editorial-heading text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
              {displayCaption}
            </h1>
          </header>

          <div className="creator-panel">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="metric-tile">
                <p className="metric-label mb-2">{t("common.views")}</p>
                <p
                  className={cn(
                    "metric-value-sm",
                    reelMetricHasData(reel, "views")
                      ? "metric-value-views"
                      : "text-muted-foreground",
                  )}
                >
                  {viewsLabel}
                </p>
              </div>
              <div className="metric-tile">
                <p className="metric-label mb-2">{t("common.likes")}</p>
                <p
                  className={cn(
                    "metric-value-sm",
                    !reelMetricHasData(reel, "likes") && "text-muted-foreground",
                  )}
                >
                  {likesLabel}
                </p>
              </div>
              <div className="metric-tile">
                <p className="metric-label mb-2">{t("common.comments")}</p>
                <p
                  className={cn(
                    "metric-value-sm",
                    !reelMetricHasData(reel, "comments") &&
                      "text-muted-foreground",
                  )}
                >
                  {commentsLabel}
                </p>
              </div>
              <div className="metric-tile">
                <p className="metric-label mb-2">{t("common.engagement")}</p>
                <p
                  className={cn(
                    "metric-value-sm",
                    reelHasEngagementData(reel)
                      ? "metric-value-engagement"
                      : "text-muted-foreground",
                  )}
                >
                  {engagementLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-panel overflow-hidden divide-y divide-border/20">
            <InfoRow
              label={t("common.published")}
              value={formatDate(reel.publishedAt)}
            />
            <InfoRow label={t("reels.infoSource")} value={t(sourceKey)} />
            <InfoRow
              label={t("reels.infoFetched")}
              value={
                reel.fetchedAt || reel.syncedAt
                  ? formatDate(reel.fetchedAt ?? reel.syncedAt!)
                  : insufficient
              }
              muted={!reel.fetchedAt && !reel.syncedAt}
            />
            <div className="detail-info-row px-4 sm:px-5">
              <span className="text-xs font-medium text-muted-foreground">
                Instagram
              </span>
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm link-accent break-all text-right sm:text-left"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {reel.instagramUrl}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <RefreshReelButton reelId={reel.id} disabled={deletingId !== null} />
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-[var(--brand-coral-hover)] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {t("common.openInstagram")}
            </a>
            <Button
              type="button"
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => setDeleteOpen(true)}
              disabled={deletingId !== null}
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </section>

      <section className="open-section space-y-5 animate-enter-delay-2">
        <div>
          <p className="section-eyebrow mb-1">{t("reels.timeline")}</p>
          <h2 className="editorial-heading text-xl sm:text-2xl font-semibold">
            {t("reels.performanceTimeline")}
          </h2>
          {statsRange && (
            <p className="text-sm text-muted-foreground mt-2">
              {statsRange.isSingleDay
                ? t("reels.statsRangeSingle", {
                    count: statsRange.pointCount,
                    date: formatDate(statsRange.start),
                  })
                : t("reels.statsRange", {
                    count: statsRange.pointCount,
                    days: statsRange.daySpan,
                    start: formatDate(statsRange.start),
                    end: formatDate(statsRange.end),
                  })}
            </p>
          )}
        </div>

        {hasStats ? (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="surface-panel p-4 sm:p-5 space-y-4 soft-shadow">
              <p className="metric-label">{t("common.views")}</p>
              <ViewsChart
                data={reel.stats}
                height={220}
                gradientId="detailViews"
              />
            </div>
            <div className="surface-panel p-4 sm:p-5 space-y-4 soft-shadow">
              <p className="metric-label">{t("common.engagement")}</p>
              <ViewsChart
                data={reel.stats}
                dataKey="engagement"
                colorVar="--brand-sage"
                height={220}
                gradientId="detailEngagement"
              />
            </div>
          </div>
        ) : (
          <EmptyStatePanel
            variant="soft"
            icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
            title={t("reels.statsEmpty")}
            description={t("reels.statsEmptyRefresh")}
            className="py-10"
          />
        )}
      </section>

      {related.length > 0 && (
        <section className="open-section space-y-5">
          <div>
            <p className="section-eyebrow mb-1">{t("reels.related")}</p>
            <h2 className="editorial-heading text-xl sm:text-2xl font-semibold">
              {t("reels.otherReels")}
            </h2>
          </div>
          <div className="editorial-grid">
            {related.map((item) => (
              <ReelCard key={item.id} reel={item} />
            ))}
          </div>
        </section>
      )}

      <DeleteReelDialog
        open={deleteOpen}
        title={displayCaption}
        loading={deletingId !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (deletingId === null) {
            setDeleteOpen(false);
            clearError();
          }
        }}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="detail-info-row px-4 sm:px-5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
