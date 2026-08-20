import type { ReelWithEngagement } from "@/types";

export function getReelDisplayCaption(reel: ReelWithEngagement): string {
  return reel.caption?.trim() || reel.title;
}

export function reelMetricHasData(
  reel: ReelWithEngagement,
  metric: "views" | "likes" | "comments"
): boolean {
  switch (metric) {
    case "views":
      return reel.hasViewsData !== false;
    case "likes":
      return reel.hasLikesData !== false;
    case "comments":
      return reel.hasCommentsData !== false;
  }
}

export function reelHasEngagementData(reel: ReelWithEngagement): boolean {
  return (
    reelMetricHasData(reel, "views") &&
    reelMetricHasData(reel, "likes") &&
    reelMetricHasData(reel, "comments") &&
    reel.views > 0
  );
}

export function formatReelMetric(
  value: number,
  hasData: boolean,
  formatNumber: (value: number) => string,
  insufficientLabel: string
): string {
  return hasData ? formatNumber(value) : insufficientLabel;
}

export function getReelFreshnessLabel(
  reel: ReelWithEngagement,
  formatDate: (date: string | Date) => string,
  updatedLabel: string
): string | null {
  const timestamp = reel.syncedAt ?? reel.fetchedAt;
  if (!timestamp) return null;
  return `${updatedLabel} · ${formatDate(timestamp)}`;
}
