"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { formatEngagementRate } from "@/lib/format";
import {
  formatReelMetric,
  getReelDisplayCaption,
  reelHasEngagementData,
  reelMetricHasData,
} from "@/lib/reel-display";
import { useFormatters } from "@/hooks/use-formatters";
import { useTranslations } from "@/components/providers/locale-provider";
import { useDeleteReel } from "@/hooks/use-delete-reel";
import { DeleteReelDialog } from "@/components/reels/delete-reel-dialog";
import { ReelCoverImage } from "@/components/reels/reel-cover-image";
import type { ReelWithEngagement } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReelListViewProps {
  reels: ReelWithEngagement[];
}

export function ReelListView({ reels }: ReelListViewProps) {
  const t = useTranslations();
  const { formatDate, formatNumber } = useFormatters();
  const { deleteReel, deletingId, error, clearError } = useDeleteReel();
  const [pendingDelete, setPendingDelete] = useState<ReelWithEngagement | null>(
    null
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    const success = await deleteReel(pendingDelete.id);
    if (success) {
      setPendingDelete(null);
    }
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive flex items-center justify-between gap-3"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs underline underline-offset-2 shrink-0"
          >
            {t("common.close")}
          </button>
        </div>
      )}

      <div className="rounded-xl bg-card overflow-hidden border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">
                  {t("common.reels")}
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  {t("common.date")}
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">
                  {t("common.views")}
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  {t("common.likes")}
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                  {t("common.comments")}
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  {t("common.engagement")}
                </th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 w-12">
                  <span className="sr-only">{t("common.actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {reels.map((reel) => {
                const isDeleting = deletingId === reel.id;
                const insufficient = t("analytics.insufficientData");
                const engagementLabel = formatEngagementRate(
                  reel.views,
                  reel.engagementRate,
                  insufficient,
                  reelHasEngagementData(reel)
                );
                const displayCaption = getReelDisplayCaption(reel);

                return (
                  <tr
                    key={reel.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/reels/${reel.id}`}
                        className="flex items-center gap-3 group min-w-[180px]"
                      >
                        <ReelCoverImage
                          src={reel.coverUrl}
                          alt={reel.title}
                          className="h-12 w-9 rounded-lg object-cover shrink-0"
                          placeholderClassName="h-12 w-9 rounded-lg shrink-0"
                        />
                        <span className="font-medium line-clamp-2 group-hover:text-brand-rose transition-colors">
                          {displayCaption}
                        </span>
                        {reel.ownerUsername && (
                          <span className="text-xs text-muted-foreground">
                            @{reel.ownerUsername}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {formatDate(reel.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {formatReelMetric(
                          reel.views,
                          reelMetricHasData(reel, "views"),
                          formatNumber,
                          insufficient
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        {formatReelMetric(
                          reel.likes,
                          reelMetricHasData(reel, "likes"),
                          formatNumber,
                          insufficient
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <MessageCircle className="h-3 w-3 text-muted-foreground" />
                        {formatReelMetric(
                          reel.comments,
                          reelMetricHasData(reel, "comments"),
                          formatNumber,
                          insufficient
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span
                        className={
                          reelHasEngagementData(reel)
                            ? "text-brand-sage font-medium tabular-nums"
                            : "text-muted-foreground text-xs"
                        }
                      >
                        {engagementLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isDeleting ? (
                        <span className="inline-flex p-1.5 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            nativeButton
                            render={
                              <button
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                aria-label={t("common.actions")}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  reel.instagramUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                              {t("common.openInstagram")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setPendingDelete(reel)}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteReelDialog
        open={pendingDelete !== null}
        title={pendingDelete?.title}
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deletingId === null) {
            setPendingDelete(null);
            clearError();
          }
        }}
      />
    </>
  );
}
