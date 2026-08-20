"use client";

import { Clapperboard, SearchX } from "lucide-react";
import { AddReelModal } from "@/components/reels/add-reel-modal";
import { Button } from "@/components/ui/button";
import { EmptyStatePanel } from "@/components/shared/empty-state-panel";
import { useTranslations } from "@/components/providers/locale-provider";

export function EmptyReelsState({
  isDemoMode = false,
}: {
  isDemoMode?: boolean;
}) {
  const t = useTranslations();

  return (
    <EmptyStatePanel
      icon={<Clapperboard className="h-6 w-6 text-brand-rose" />}
      eyebrow={t("reels.onboardingEyebrow")}
      title={t("reels.onboardingTitle")}
      description={t("reels.onboardingDesc")}
      action={
        <AddReelModal
          isDemoMode={isDemoMode}
          trigger={<Button size="lg">{t("common.addReels")}</Button>}
        />
      }
    />
  );
}

export function ReelsNoSearchResults({ query }: { query: string }) {
  const t = useTranslations();

  return (
    <EmptyStatePanel
      variant="soft"
      icon={<SearchX className="h-5 w-5 text-muted-foreground" />}
      title={t("reels.noResultsTitle")}
      description={t("reels.noResultsDesc", { query })}
      className="py-12"
    />
  );
}
