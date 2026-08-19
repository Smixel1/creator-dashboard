"use client";

import Link from "next/link";
import { ArrowUpRight, Eye, Heart, MessageCircle } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { ReelWithEngagement } from "@/types";

interface AnalyticsTopReelsProps {
  reels: ReelWithEngagement[];
}

export function AnalyticsTopReels({ reels }: AnalyticsTopReelsProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();

  if (reels.length === 0) return null;

  return (
    <section className="open-section border-t border-border/25 pt-6">
      <header className="mb-4">
        <h2 className="section-title">{t("analytics.topReelsTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("analytics.topReelsDesc")}
        </p>
      </header>

      <div className="divide-y divide-border/25">
        {reels.map((reel, index) => (
          <Link
            key={reel.id}
            href={`/reels/${reel.id}`}
            className="group flex items-center gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-muted/10 -mx-1 px-1 rounded-lg"
          >
            <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0 tabular-nums">
              {index + 1}
            </span>
            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reel.coverUrl}
                alt={reel.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1 group-hover:text-brand-rose transition-colors">
                {reel.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(reel.views)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(reel.likes)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {formatNumber(reel.comments)}
                </span>
                <span className="font-medium text-brand-sage">
                  {reel.views > 0
                    ? formatPercent(reel.engagementRate)
                    : t("analytics.insufficientData")}
                </span>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-rose shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
