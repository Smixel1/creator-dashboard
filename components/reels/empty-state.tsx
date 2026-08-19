"use client";

import { Clapperboard, SearchX } from "lucide-react";
import { AddReelModal } from "@/components/reels/add-reel-modal";
import { useTranslations } from "@/components/providers/locale-provider";

export function EmptyReelsState({
  isDemoMode = false,
  instagramConnected = false,
}: {
  isDemoMode?: boolean;
  instagramConnected?: boolean;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-16 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
        <Clapperboard className="h-6 w-6 text-brand-rose" />
      </div>
      <h3 className="text-base font-semibold">
        {instagramConnected
          ? t("reels.emptyInstagramTitle")
          : t("reels.emptyTitle")}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
        {instagramConnected
          ? t("reels.emptyInstagramDesc")
          : t("reels.emptyDesc")}
      </p>
      {!instagramConnected && (
        <div className="mt-6">
          <AddReelModal
            isDemoMode={isDemoMode}
            trigger={
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("common.addReels")}
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}

export function ReelsNoSearchResults({ query }: { query: string }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/30 bg-muted/20 py-14 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{t("reels.noResultsTitle")}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
        {t("reels.noResultsDesc", { query })}
      </p>
    </div>
  );
}
