import { calcEngagementRate } from "@/lib/format";
import type { AnalyticsPeriod, ChartDataPoint, DashboardStats } from "@/types";
import { format, subDays } from "date-fns";

export type ReelStatRow = {
  views: number | null;
  likes: number | null;
  comments: number | null;
  recordedAt: Date;
};

export type ReelWithStats = {
  id: string;
  title: string;
  coverUrl: string | null;
  instagramUrl: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  publishedAt: Date;
  source?: string;
  stats: ReelStatRow[];
};

export interface PeriodAggregate {
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  engagementRate: number;
  hasEngagementData: boolean;
}

export function getPeriodStart(period: AnalyticsPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    default:
      return null;
  }
}

export function getPeriodLengthDays(period: AnalyticsPeriod): number | null {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return null;
  }
}

export function findLatestStatAtOrBefore(
  stats: ReelStatRow[],
  at: Date
): ReelStatRow | null {
  let latest: ReelStatRow | null = null;
  for (const stat of stats) {
    if (stat.recordedAt <= at) {
      if (!latest || stat.recordedAt > latest.recordedAt) {
        latest = stat;
      }
    }
  }
  return latest;
}

function deltaFromStatPair(
  endValue: number | null | undefined,
  baselineValue: number | null | undefined
): number | null {
  if (endValue == null) {
    return null;
  }
  if (baselineValue == null) {
    return endValue;
  }
  return Math.max(0, endValue - baselineValue);
}

export function computeReelMetricDeltas(
  reel: ReelWithStats,
  rangeStart: Date,
  rangeEnd: Date
) {
  const baseline = findLatestStatAtOrBefore(reel.stats, rangeStart);
  const end = findLatestStatAtOrBefore(reel.stats, rangeEnd);

  if (!end) {
    if (reel.publishedAt >= rangeStart && reel.publishedAt <= rangeEnd) {
      return {
        views: reel.views,
        likes: reel.likes,
        comments: reel.comments,
      };
    }
    return { views: null, likes: null, comments: null };
  }

  return {
    views: deltaFromStatPair(end.views, baseline?.views),
    likes: deltaFromStatPair(end.likes, baseline?.likes),
    comments: deltaFromStatPair(end.comments, baseline?.comments),
  };
}

function countReelsInPeriod(
  reels: ReelWithStats[],
  rangeStart: Date,
  rangeEnd: Date
): number {
  return reels.filter(
    (reel) =>
      reel.publishedAt >= rangeStart &&
      reel.publishedAt <= rangeEnd
  ).length;
}

function countActiveReels(
  reels: ReelWithStats[],
  rangeStart: Date,
  rangeEnd: Date
): number {
  const publishedInPeriod = countReelsInPeriod(reels, rangeStart, rangeEnd);
  const withActivity = reels.filter((reel) => {
    const delta = computeReelMetricDeltas(reel, rangeStart, rangeEnd);
    return (
      (delta.views != null && delta.views > 0) ||
      (delta.likes != null && delta.likes > 0) ||
      (delta.comments != null && delta.comments > 0)
    );
  }).length;

  return Math.max(publishedInPeriod, withActivity);
}

function countReelsWithMetric(
  reels: ReelWithStats[],
  rangeStart: Date,
  rangeEnd: Date,
  metric: "views" | "likes" | "comments"
): number {
  return reels.filter((reel) => {
    const delta = computeReelMetricDeltas(reel, rangeStart, rangeEnd);
    return delta[metric] != null;
  }).length;
}

export function computePeriodAggregate(
  reels: ReelWithStats[],
  rangeStart: Date,
  rangeEnd: Date
): PeriodAggregate {
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  for (const reel of reels) {
    const delta = computeReelMetricDeltas(reel, rangeStart, rangeEnd);
    if (delta.views != null) totalViews += delta.views;
    if (delta.likes != null) totalLikes += delta.likes;
    if (delta.comments != null) totalComments += delta.comments;
  }

  const totalReels = countReelsInPeriod(reels, rangeStart, rangeEnd);
  const activeReels = countActiveReels(reels, rangeStart, rangeEnd);
  const viewsDenominator = countReelsWithMetric(reels, rangeStart, rangeEnd, "views");
  const likesDenominator = countReelsWithMetric(reels, rangeStart, rangeEnd, "likes");
  const commentsDenominator = countReelsWithMetric(
    reels,
    rangeStart,
    rangeEnd,
    "comments"
  );
  const fallbackDenominator = activeReels > 0 ? activeReels : totalReels;

  const averageViews =
    viewsDenominator > 0
      ? Math.round(totalViews / viewsDenominator)
      : 0;
  const averageLikes =
    likesDenominator > 0
      ? Math.round(totalLikes / likesDenominator)
      : fallbackDenominator > 0
        ? Math.round(totalLikes / fallbackDenominator)
        : 0;
  const averageComments =
    commentsDenominator > 0
      ? Math.round(totalComments / commentsDenominator)
      : fallbackDenominator > 0
        ? Math.round(totalComments / fallbackDenominator)
        : 0;
  const hasEngagementData = totalViews > 0;
  const engagementRate = hasEngagementData
    ? calcEngagementRate(totalViews, totalLikes, totalComments)
    : 0;

  return {
    totalReels,
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    averageLikes,
    averageComments,
    engagementRate,
    hasEngagementData,
  };
}

export function computeAllTimeAggregate(reels: ReelWithStats[]): PeriodAggregate {
  const totalReels = reels.length;
  const reelsWithViews = reels.filter((reel) => reel.views != null);
  const reelsWithLikes = reels.filter((reel) => reel.likes != null);
  const reelsWithComments = reels.filter((reel) => reel.comments != null);

  const totalViews = reelsWithViews.reduce(
    (sum, reel) => sum + (reel.views as number),
    0
  );
  const totalLikes = reelsWithLikes.reduce(
    (sum, reel) => sum + (reel.likes as number),
    0
  );
  const totalComments = reelsWithComments.reduce(
    (sum, reel) => sum + (reel.comments as number),
    0
  );
  const averageViews =
    reelsWithViews.length > 0
      ? Math.round(totalViews / reelsWithViews.length)
      : 0;
  const averageLikes =
    reelsWithLikes.length > 0
      ? Math.round(totalLikes / reelsWithLikes.length)
      : 0;
  const averageComments =
    reelsWithComments.length > 0
      ? Math.round(totalComments / reelsWithComments.length)
      : 0;
  const hasEngagementData = totalViews > 0;
  const engagementRate = hasEngagementData
    ? calcEngagementRate(totalViews, totalLikes, totalComments)
    : 0;

  return {
    totalReels,
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    averageLikes,
    averageComments,
    engagementRate,
    hasEngagementData,
  };
}

export function calcPercentChange(
  current: number,
  previous: number
): number | undefined {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

function hasPreviousPeriodData(previous: PeriodAggregate): boolean {
  return (
    previous.totalViews > 0 ||
    previous.totalReels > 0 ||
    previous.totalLikes > 0 ||
    previous.totalComments > 0
  );
}

export function buildDashboardStats(
  reels: ReelWithStats[],
  period: AnalyticsPeriod
): DashboardStats {
  const now = new Date();
  const periodStart = getPeriodStart(period);
  const periodDays = getPeriodLengthDays(period);

  if (period === "all" || !periodStart || !periodDays) {
    const aggregate = computeAllTimeAggregate(reels);
    return {
      ...aggregate,
      totalReelsChange: undefined,
      totalViewsChange: undefined,
      totalLikesChange: undefined,
      totalCommentsChange: undefined,
      averageViewsChange: undefined,
      averageLikesChange: undefined,
      averageCommentsChange: undefined,
      engagementRateChange: undefined,
    };
  }

  const current = computePeriodAggregate(reels, periodStart, now);
  const previousStart = subDays(periodStart, periodDays);
  const previous = computePeriodAggregate(reels, previousStart, periodStart);
  const hasPreviousData = hasPreviousPeriodData(previous);

  return {
    ...current,
    totalReelsChange: hasPreviousData
      ? calcPercentChange(current.totalReels, previous.totalReels)
      : undefined,
    totalViewsChange: hasPreviousData
      ? calcPercentChange(current.totalViews, previous.totalViews)
      : undefined,
    totalLikesChange: hasPreviousData
      ? calcPercentChange(current.totalLikes, previous.totalLikes)
      : undefined,
    totalCommentsChange: hasPreviousData
      ? calcPercentChange(current.totalComments, previous.totalComments)
      : undefined,
    averageViewsChange: hasPreviousData
      ? calcPercentChange(current.averageViews, previous.averageViews)
      : undefined,
    averageLikesChange: hasPreviousData
      ? calcPercentChange(current.averageLikes, previous.averageLikes)
      : undefined,
    averageCommentsChange: hasPreviousData
      ? calcPercentChange(current.averageComments, previous.averageComments)
      : undefined,
    engagementRateChange:
      hasPreviousData &&
      current.hasEngagementData &&
      previous.hasEngagementData
        ? calcPercentChange(current.engagementRate, previous.engagementRate)
        : undefined,
  };
}

function aggregateWeeklyPoints(
  points: ChartDataPoint[]
): ChartDataPoint[] {
  const weekly = new Map<string, { views: number; isoDate: string }>();

  for (const point of points) {
    const iso = point.isoDate ?? point.date;
    const date = new Date(iso);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = format(weekStart, "yyyy-MM-dd");
    const existing = weekly.get(key);
    weekly.set(key, {
      views: (existing?.views ?? 0) + point.views,
      isoDate: key,
    });
  }

  return Array.from(weekly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, { views }]) => ({
      isoDate,
      date: format(new Date(isoDate), "MMM d"),
      views,
    }));
}

export function computeViewsOverTime(
  reels: ReelWithStats[],
  period: AnalyticsPeriod
): ChartDataPoint[] {
  const now = new Date();
  const periodStart = getPeriodStart(period);
  const rangeStart = periodStart ?? new Date(0);
  const dailyDeltas = new Map<string, number>();

  for (const reel of reels) {
    const statsInRange = reel.stats.filter(
      (stat) => stat.recordedAt >= rangeStart && stat.recordedAt <= now
    );

    const baselineStat = findLatestStatAtOrBefore(reel.stats, rangeStart);
    let prevViews =
      baselineStat?.views != null ? baselineStat.views : null;

    const sorted = [...statsInRange].sort(
      (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()
    );

    for (const stat of sorted) {
      if (stat.views == null) continue;

      const delta =
        prevViews != null
          ? Math.max(0, stat.views - prevViews)
          : stat.views;
      prevViews = stat.views;
      if (delta === 0) continue;
      const key = format(stat.recordedAt, "yyyy-MM-dd");
      dailyDeltas.set(key, (dailyDeltas.get(key) ?? 0) + delta);
    }

    if (statsInRange.length === 0 && periodStart) {
      const delta = computeReelMetricDeltas(reel, rangeStart, now);
      if (delta.views != null && delta.views > 0) {
        const key = format(reel.publishedAt, "yyyy-MM-dd");
        dailyDeltas.set(key, (dailyDeltas.get(key) ?? 0) + delta.views);
      }
    }
  }

  let points: ChartDataPoint[] = Array.from(dailyDeltas.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, views]) => ({
      isoDate,
      date: format(new Date(isoDate), "MMM d"),
      views,
    }));

  if (points.length > 45) {
    points = aggregateWeeklyPoints(points);
  }

  return points;
}

export function computeTopPerformingForPeriod(
  reels: ReelWithStats[],
  period: AnalyticsPeriod,
  limit = 6
) {
  const now = new Date();
  const periodStart = getPeriodStart(period);

  const ranked = reels
    .map((reel) => {
      if (!periodStart) {
        const views = reel.views;
        if (views == null) return null;
        return {
          id: reel.id,
          title: reel.title,
          coverUrl: reel.coverUrl,
          instagramUrl: reel.instagramUrl,
          views,
          likes: reel.likes ?? 0,
          comments: reel.comments ?? 0,
          publishedAt: reel.publishedAt.toISOString(),
          engagementRate:
            reel.likes != null && reel.comments != null
              ? calcEngagementRate(views, reel.likes, reel.comments)
              : 0,
        };
      }

      const delta = computeReelMetricDeltas(reel, periodStart, now);
      if (delta.views == null) return null;

      return {
        id: reel.id,
        title: reel.title,
        coverUrl: reel.coverUrl,
        instagramUrl: reel.instagramUrl,
        views: delta.views,
        likes: delta.likes ?? 0,
        comments: delta.comments ?? 0,
        publishedAt: reel.publishedAt.toISOString(),
        engagementRate:
          delta.views > 0 &&
          delta.likes != null &&
          delta.comments != null
            ? calcEngagementRate(delta.views, delta.likes, delta.comments)
            : 0,
      };
    })
    .filter((reel): reel is NonNullable<typeof reel> => reel != null)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return ranked;
}
