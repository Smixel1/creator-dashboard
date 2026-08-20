"use client";

import Link from "next/link";
import { formatEngagementRate } from "@/lib/format";
import {
  formatReelMetric,
  getReelDisplayCaption,
  reelHasEngagementData,
  reelMetricHasData,
} from "@/lib/reel-display";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { ReelCoverImage } from "@/components/reels/reel-cover-image";
import { cn } from "@/lib/utils";
import type { ReelWithEngagement } from "@/types";

type FeaturedMetricTone = "default" | "views" | "engagement";

interface DashboardFeaturedReelProps {
  reel: ReelWithEngagement;
}

export function DashboardFeaturedReel({ reel }: DashboardFeaturedReelProps) {
  const t = useTranslations();
  const { formatNumber, formatDate } = useFormatters();
  const insufficient = t("analytics.insufficientData");
  const displayCaption = getReelDisplayCaption(reel);

  const metrics: Array<{
    label: string;
    value: string;
    tone: FeaturedMetricTone;
  }> = [
    {
      label: t("common.views"),
      value: formatReelMetric(
        reel.views,
        reelMetricHasData(reel, "views"),
        formatNumber,
        insufficient,
      ),
      tone: "views",
    },
    {
      label: t("common.likes"),
      value: formatReelMetric(
        reel.likes,
        reelMetricHasData(reel, "likes"),
        formatNumber,
        insufficient,
      ),
      tone: "default",
    },
    {
      label: t("common.comments"),
      value: formatReelMetric(
        reel.comments,
        reelMetricHasData(reel, "comments"),
        formatNumber,
        insufficient,
      ),
      tone: "default",
    },
    {
      label: t("common.engagement"),
      value: formatEngagementRate(
        reel.views,
        reel.engagementRate,
        insufficient,
        reelHasEngagementData(reel),
      ),
      tone: "engagement",
    },
  ];

  return (
    <section className="open-section space-y-4 border-t border-border/20 pt-6 animate-enter-delay-2">
      <div>
        <p className="section-eyebrow">{t("dashboard.featuredReel")}</p>
        <h2 className="editorial-heading mt-1 text-2xl sm:text-3xl font-semibold">
          {t("dashboard.topPerformer")}
        </h2>
      </div>

      <Link
        href={`/reels/${reel.id}`}
        className="surface-panel group block overflow-hidden transition-shadow hover:shadow-md"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[9/16] w-full shrink-0 overflow-hidden bg-muted/40 sm:w-44 md:w-52 lg:w-56">
            <ReelCoverImage
              src={reel.coverUrl}
              alt={displayCaption}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              priority
            />
            <span className="absolute left-3 top-3 status-badge border-0 bg-brand-rose/90 text-white shadow-sm">
              {t("common.bestReels")}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-rose sm:text-xl">
                {displayCaption}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("common.published")} · {formatDate(reel.publishedAt)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-tile">
                  <p className="metric-label mb-2">{metric.label}</p>
                  <p
                    className={cn(
                      "metric-value-sm",
                      metric.tone === "views" &&
                        reelMetricHasData(reel, "views") &&
                        "metric-value-views",
                      metric.tone === "engagement" &&
                        reelHasEngagementData(reel) &&
                        "metric-value-engagement",
                    )}
                  >
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
