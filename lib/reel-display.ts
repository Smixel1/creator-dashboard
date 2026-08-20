import type { ReelWithEngagement, ChartDataPoint } from "@/types";
import { differenceInCalendarDays } from "date-fns";

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

export type ReelSourceLabelKey =
  | "reels.sourceApify"
  | "reels.sourceInstagram"
  | "reels.sourceImported";

export function getReelSourceLabelKey(
  source: string | null | undefined
): ReelSourceLabelKey {
  switch (source) {
    case "apify":
      return "reels.sourceApify";
    case "instagram":
      return "reels.sourceInstagram";
    default:
      return "reels.sourceImported";
  }
}

export function shouldShowReelSource(source: string | null | undefined): boolean {
  return source === "apify" || source === "instagram";
}

export function getChartStatsRange(points: ChartDataPoint[]) {
  if (points.length === 0) return null;

  const dates = points
    .map((point) => point.isoDate)
    .filter((value): value is string => Boolean(value))
    .map((isoDate) => new Date(isoDate));

  if (dates.length === 0) return null;

  const start = new Date(Math.min(...dates.map((date) => date.getTime())));
  const end = new Date(Math.max(...dates.map((date) => date.getTime())));
  const daySpan = differenceInCalendarDays(end, start) + 1;

  return {
    pointCount: points.length,
    daySpan,
    start,
    end,
    isSingleDay: daySpan <= 1,
  };
}
