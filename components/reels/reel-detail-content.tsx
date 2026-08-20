"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { formatEngagementRate } from "@/lib/format";
import {
  formatReelMetric,
  getReelDisplayCaption,
  getReelFreshnessLabel,
  reelHasEngagementData,
  reelMetricHasData,
} from "@/lib/reel-display";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { useDeleteReel } from "@/hooks/use-delete-reel";
import { ViewsChart } from "@/components/charts/views-chart";
import { ReelCard } from "@/components/reels/reel-card";
import { DeleteReelDialog } from "@/components/reels/delete-reel-dialog";
import { RefreshReelButton } from "@/components/reels/refresh-reel-button";
import { ReelCoverImage } from "@/components/reels/reel-cover-image";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReelDetail, ReelWithEngagement } from "@/types";

interface ReelDetailContentProps {
  reel: ReelDetail;
  related: ReelWithEngagement[];
}

function sourceLabel(
  source: ReelDetail["source"],
  t: ReturnType<typeof useTranslations>
): string {
  switch (source) {
    case "apify":
      return t("reels.sourceApify");
    case "instagram":
      return t("reels.sourceInstagram");
    default:
      return t("reels.sourceImported");
  }
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
  const engagementLabel = formatEngagementRate(
    reel.views,
    reel.engagementRate,
    insufficient,
    reelHasEngagementData(reel)
  );
  const hasStats = reel.stats.length > 0;

  async function handleDelete() {
    const success = await deleteReel(reel.id);
    if (success) {
      router.push("/reels");
      router.refresh();
    }
  }

  return (
    <div className="content-canvas stack-section pb-4">
      <Link
        href="/reels"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("reels.backToReels")}
      </Link>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive flex items-center justify-between gap-3"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs underline underline-offset-2 shrink-0"
          >
            {t("common.close")}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="rounded-2xl overflow-hidden bg-muted/30 border border-border/30 max-w-md mx-auto lg:mx-0">
            <ReelCoverImage
              src={reel.coverUrl}
              alt={displayCaption}
              className="w-full aspect-[3/4] object-cover"
              placeholderClassName="w-full aspect-[3/4]"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <header className="space-y-3 pb-4 border-b border-border/25">
            <div className="flex flex-wrap items-center gap-2">
              <span className="status-badge bg-muted text-muted-foreground">
                {sourceLabel(reel.source, t)}
              </span>
              {freshnessLabel && (
                <span className="text-xs text-muted-foreground">
                  {freshnessLabel}
                </span>
              )}
            </div>
            <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold leading-tight line-clamp-3">
              {displayCaption}
            </h1>
            {reel.ownerUsername && (
              <p className="text-sm font-medium text-muted-foreground">
                @{reel.ownerUsername}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {t("common.published")} · {formatDate(reel.publishedAt)}
            </p>
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-rose transition-colors break-all"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {reel.instagramUrl}
            </a>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricBlock
              label={t("common.views")}
              value={formatReelMetric(
                reel.views,
                reelMetricHasData(reel, "views"),
                formatNumber,
                insufficient
              )}
              muted={!reelMetricHasData(reel, "views")}
            />
            <MetricBlock
              label={t("common.likes")}
              value={formatReelMetric(
                reel.likes,
                reelMetricHasData(reel, "likes"),
                formatNumber,
                insufficient
              )}
              muted={!reelMetricHasData(reel, "likes")}
            />
            <MetricBlock
              label={t("common.comments")}
              value={formatReelMetric(
                reel.comments,
                reelMetricHasData(reel, "comments"),
                formatNumber,
                insufficient
              )}
              muted={!reelMetricHasData(reel, "comments")}
            />
            <MetricBlock
              label={t("common.engagement")}
              value={engagementLabel}
              highlight={reelHasEngagementData(reel)}
              muted={!reelHasEngagementData(reel)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <RefreshReelButton reelId={reel.id} disabled={deletingId !== null} />
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
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
      </div>

      <section className="space-y-4 pt-4">
        <SectionHeader
          label={t("reels.timeline")}
          title={t("reels.performanceTimeline")}
        />
        {hasStats ? (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t("common.views")}
              </p>
              <ViewsChart
                data={reel.stats}
                height={180}
                gradientId="detailViews"
              />
            </div>
            <div className="rounded-xl border border-border/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t("common.engagement")}
              </p>
              <ViewsChart
                data={reel.stats}
                dataKey="engagement"
                colorVar="--brand-sage"
                height={180}
                gradientId="detailEngagement"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 py-12 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("reels.statsEmptyRefresh")}
            </p>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <SectionHeader
            label={t("reels.related")}
            title={t("reels.otherReels")}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {related.map((r) => (
              <ReelCard key={r.id} reel={r} />
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

function MetricBlock({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xl sm:text-2xl font-semibold tabular-nums leading-none",
          highlight && "text-brand-sage",
          muted && "text-muted-foreground text-lg sm:text-xl font-medium"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
