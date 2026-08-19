"use client";

import Link from "next/link";
import {
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { formatEngagementRate } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { ReelWithEngagement } from "@/types";

interface ReelCardProps {
  reel: ReelWithEngagement;
  variant?: "grid" | "featured" | "compact" | "top" | "recent";
  showBadge?: boolean;
  showCaption?: boolean;
  className?: string;
}

export function ReelCard({
  reel,
  variant = "grid",
  showBadge = false,
  showCaption = true,
  className,
}: ReelCardProps) {
  const t = useTranslations();
  const { formatNumber, formatDate } = useFormatters();
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const useCaption = showCaption && variant !== "compact";
  const engagementLabel = formatEngagementRate(
    reel.hasViewsData === false ? 0 : reel.views,
    reel.engagementRate,
    t("analytics.insufficientData")
  );
  const viewsLabel =
    reel.hasViewsData === false
      ? t("analytics.insufficientData")
      : formatNumber(reel.views);

  return (
    <article
      className={cn(
        "group transition-all duration-250",
        useCaption &&
          "rounded-xl overflow-hidden border border-border/25 bg-card hover:border-brand-rose/20",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted/40",
          useCaption ? "rounded-t-xl" : "rounded-xl",
          isFeatured ? "aspect-[4/5]" : "aspect-[3/4]"
        )}
      >
        <Link href={`/reels/${reel.id}`} className="block h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={reel.coverUrl}
            alt={reel.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <div className="absolute inset-0 gradient-overlay-soft opacity-0 pointer-events-none hidden md:block md:group-hover:opacity-100 transition-opacity duration-250" />

        {showBadge && (
          <span className="absolute top-2.5 left-2.5 status-badge bg-brand-rose/90 text-white border-0 shadow-sm">
            {t("common.bestReels")}
          </span>
        )}

        <a
          href={reel.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-sm"
          aria-label={t("common.openInstagram")}
        >
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-2 opacity-0 pointer-events-none hidden md:block md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-250">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {viewsLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {formatNumber(reel.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatNumber(reel.comments)}
            </span>
          </div>
        </div>

        {isCompact && (
          <div className="absolute bottom-2.5 left-2.5 group-hover:opacity-0 transition-opacity duration-200">
            <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
              {viewsLabel}
            </span>
          </div>
        )}
      </div>

      {useCaption && (
        <Link href={`/reels/${reel.id}`} className="block p-3 space-y-2">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand-rose transition-colors">
            {reel.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("common.published")} · {formatDate(reel.publishedAt)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Eye className="h-3 w-3 shrink-0" />
              {viewsLabel}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Heart className="h-3 w-3 shrink-0" />
              {formatNumber(reel.likes)}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageCircle className="h-3 w-3 shrink-0" />
              {formatNumber(reel.comments)}
            </span>
            <span
              className={cn(
                "tabular-nums",
                reel.hasViewsData !== false &&
                  reel.views > 0 &&
                  "text-brand-sage font-medium"
              )}
            >
              {engagementLabel}
            </span>
          </div>
        </Link>
      )}
    </article>
  );
}
