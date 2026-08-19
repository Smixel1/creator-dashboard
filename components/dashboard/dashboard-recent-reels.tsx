"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReelCard } from "@/components/reels/reel-card";
import { useTranslations } from "@/components/providers/locale-provider";
import type { ReelWithEngagement } from "@/types";

interface DashboardRecentReelsProps {
  reels: ReelWithEngagement[];
  topReelId?: string;
}

export function DashboardRecentReels({ reels, topReelId }: DashboardRecentReelsProps) {
  const t = useTranslations();

  if (reels.length === 0) return null;

  return (
    <section className="open-section space-y-5 pt-2 border-t border-border/20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="editorial-heading text-xl sm:text-2xl font-semibold leading-tight">
            {t("dashboard.recentReels")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.recentReelsDesc")}
          </p>
        </div>
        <Link
          href="/reels"
          className="inline-flex items-center gap-1 text-xs font-medium link-accent shrink-0"
        >
          {t("common.allReels")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {reels.slice(0, 4).map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            showCaption
            showBadge={reel.id === topReelId}
          />
        ))}
      </div>
    </section>
  );
}
