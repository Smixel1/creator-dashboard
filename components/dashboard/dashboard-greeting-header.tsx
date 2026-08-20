"use client";

import { AddReelModal } from "@/components/reels/add-reel-modal";
import { useTranslations } from "@/components/providers/locale-provider";

interface DashboardGreetingHeaderProps {
  greeting: string;
  isDemoMode?: boolean;
}

export function DashboardGreetingHeader({
  greeting,
  isDemoMode = false,
}: DashboardGreetingHeaderProps) {
  const t = useTranslations();

  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-border/25 animate-enter">
      <div className="space-y-1.5 min-w-0 max-w-2xl">
        <h1 className="editorial-heading text-2xl sm:text-3xl lg:text-[2rem] font-semibold leading-tight tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("dashboard.subtitle")}
        </p>
      </div>
      <AddReelModal isDemoMode={isDemoMode} />
    </header>
  );
}
