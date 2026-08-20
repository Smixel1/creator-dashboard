"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InlineStatsRow } from "@/components/shared/inline-stats-row";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { DashboardStats, SessionUser } from "@/types";

interface CreatorSnapshotProps {
  user: SessionUser;
  stats: DashboardStats;
}

export function CreatorSnapshot({ user, stats }: CreatorSnapshotProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatters();
  const firstName = user.name.split(" ")[0];
  const periodLabel = t("metrics.period30d");
  const engagementValue = stats.hasEngagementData
    ? `${stats.engagementRate.toFixed(1)}%`
    : t("analytics.insufficientData");
  const hasReels = stats.totalReels > 0;

  return (
    <section className="open-section space-y-6 pb-2 border-b border-border/25">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/profile" className="flex items-center gap-4 min-w-0 group">
          <Avatar className="h-14 w-14 ring-2 ring-border/25 group-hover:ring-brand-rose/25 transition-all">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="text-lg font-semibold bg-muted">
              {firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-base font-semibold truncate group-hover:text-brand-rose transition-colors">
              {user.name}
            </p>
            {user.instagramUsername ? (
              <p className="text-sm text-muted-foreground">
                @{user.instagramUsername}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("common.author")}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  hasReels ? "bg-brand-sage" : "bg-muted-foreground/40"
                )}
              />
              <span className="text-xs text-muted-foreground">
                {hasReels
                  ? t("dashboard.reelsTracked", { count: stats.totalReels })
                  : t("dashboard.noReelsYet")}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:ml-auto shrink-0">
          <span className="period-badge">{periodLabel}</span>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-medium link-accent"
          >
            {t("common.detailedAnalytics")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <InlineStatsRow
        items={[
          {
            label: t("common.views"),
            value: formatNumber(stats.totalViews),
            highlight: true,
            change: stats.totalViewsChange,
          },
          {
            label: t("common.engagement"),
            value: engagementValue,
            change: stats.engagementRateChange,
          },
          {
            label: t("common.likes"),
            value: formatNumber(stats.totalLikes),
            change: stats.totalLikesChange,
          },
        ]}
      />
    </section>
  );
}
