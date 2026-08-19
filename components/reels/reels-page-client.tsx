"use client";

import { useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ReelCard } from "@/components/reels/reel-card";
import { ReelListView } from "@/components/reels/reel-list-view";
import {
  EmptyReelsState,
  ReelsNoSearchResults,
} from "@/components/reels/empty-state";
import { AddReelModal } from "@/components/reels/add-reel-modal";
import { SyncReelsButton } from "@/components/reels/sync-reels-button";
import { ReelsSearchBar } from "@/components/reels/reels-search-bar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { ReelWithEngagement } from "@/types";

type SortValue =
  | "publishedAt"
  | "views"
  | "likes"
  | "comments"
  | "engagementRate";

interface ReelsPageClientProps {
  reels: ReelWithEngagement[];
  isDemoMode?: boolean;
  instagramConnected?: boolean;
}

export function ReelsPageClient({
  reels,
  isDemoMode = false,
  instagramConnected = false,
}: ReelsPageClientProps) {
  const t = useTranslations();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<SortValue>("publishedAt");

  const SORT_OPTIONS = useMemo(
    () =>
      [
        { value: "publishedAt" as const, label: t("reels.sortNewest") },
        { value: "views" as const, label: t("reels.sortViews") },
        { value: "likes" as const, label: t("reels.sortLikes") },
        { value: "comments" as const, label: t("reels.sortComments") },
        { value: "engagementRate" as const, label: t("reels.sortEngagement") },
      ] as const,
    [t]
  );

  const filtered = useMemo(() => {
    let result = [...reels];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "likes":
          return b.likes - a.likes;
        case "comments":
          return b.comments - a.comments;
        case "engagementRate":
          return b.engagementRate - a.engagementRate;
        default:
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
      }
    });

    return result;
  }, [reels, debouncedSearch, sortBy]);

  const header = (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-2 border-b border-border/25">
      <div className="space-y-1">
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
          {t("reels.title")}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {reels.length > 0
            ? t("reels.subtitle")
            : t("reels.emptyDesc")}
        </p>
        {reels.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("reels.collectionMeta", { count: reels.length })}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {reels.length > 0 && (
          <SyncReelsButton isDemoMode={isDemoMode} />
        )}
        <AddReelModal isDemoMode={isDemoMode} />
      </div>
    </header>
  );

  if (reels.length === 0) {
    return (
      <div className="content-canvas stack-section pb-4">
        {header}
        <EmptyReelsState
          isDemoMode={isDemoMode}
          instagramConnected={instagramConnected}
        />
      </div>
    );
  }

  return (
    <div className="content-canvas stack-section pb-4">
      {header}

      <div className="flex flex-wrap items-center gap-2 min-h-9">
        <ReelsSearchBar value={search} onChange={setSearch} />
        <Select
          value={sortBy}
          onValueChange={(v) => v && setSortBy(v as SortValue)}
        >
          <SelectTrigger className="w-auto h-9 text-sm rounded-lg border-border/30 bg-transparent gap-1.5 px-2.5 min-w-[148px]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ??
                t("common.sort")}
            </span>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-border/30 p-0.5 ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors duration-200",
              view === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t("common.grid")}
            aria-pressed={view === "grid"}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors duration-200",
              view === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t("common.list")}
            aria-pressed={view === "list"}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <ReelsNoSearchResults query={debouncedSearch} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      ) : (
        <ReelListView reels={filtered} />
      )}
    </div>
  );
}
