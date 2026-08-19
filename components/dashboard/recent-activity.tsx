"use client";

import Link from "next/link";
import { formatPercent } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { ReelWithEngagement } from "@/types";

interface RecentActivityProps {
  reels: ReelWithEngagement[];
}

export function RecentActivity({ reels }: RecentActivityProps) {
  const t = useTranslations();
  const { formatDate, formatNumber } = useFormatters();

  if (reels.length === 0) return null;

  return (
    <section className="open-section border-t border-border/25 pt-5">
      <div className="mb-4">
        <h2 className="section-title">{t("dashboard.recentEvents")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.recentEventsDesc")}
        </p>
      </div>

      <div className="divide-y divide-border/25">
        {reels.map((reel) => (
          <Link
            key={reel.id}
            href={`/reels/${reel.id}`}
            className="group flex items-center gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-muted/10 -mx-1 px-1 rounded-lg"
          >
            <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reel.coverUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">
                <span className="text-muted-foreground">
                  {t("dashboard.reelEvent")}{" "}
                </span>
                <span className="font-medium group-hover:text-brand-rose transition-colors">
                  «{reel.title.length > 42
                    ? `${reel.title.slice(0, 42)}…`
                    : reel.title}»
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  {t("dashboard.viewsEvent", {
                    views: formatNumber(reel.views),
                  })}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(reel.publishedAt)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold tabular-nums rounded-md px-1.5 py-0.5",
                  reel.engagementRate >= 5
                    ? "text-brand-sage bg-brand-sage/10"
                    : "text-muted-foreground bg-muted/50"
                )}
              >
                {formatPercent(reel.engagementRate)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
