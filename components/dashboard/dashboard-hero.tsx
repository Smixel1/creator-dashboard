"use client";

import { AddReelModal } from "@/components/reels/add-reel-modal";
import { useTranslations } from "@/components/providers/locale-provider";

interface DashboardHeroProps {
  greeting: string;
}

export function DashboardHero({ greeting }: DashboardHeroProps) {
  const t = useTranslations();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 animate-enter">
      <div className="space-y-2 min-w-0">
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold leading-tight">
          {greeting}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {t("dashboard.subtitle")}
        </p>
      </div>
      <AddReelModal />
    </header>
  );
}
