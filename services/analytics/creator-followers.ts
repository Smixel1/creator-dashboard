import { format, subDays } from "date-fns";
import {
  getFollowerSnapshotsForPeriod,
  getInstagramConnectionForUser,
  getOldestFollowerSnapshotBefore,
} from "@/services/instagram/connection-service";
import {
  getMockFollowersMetrics,
  getMockFollowersOverTime,
} from "@/lib/mock/creator-followers";
import type { AnalyticsPeriod, ChartDataPoint, FollowersMetrics } from "@/types";

export type CreatorFollowersSource = "instagram" | "mock";

export interface CreatorFollowersData {
  metrics: FollowersMetrics;
  overTime: ChartDataPoint[];
  source: CreatorFollowersSource;
  hasHistoricalData: boolean;
}

function periodStart(period: AnalyticsPeriod): Date | null {
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

function buildMetricsFromSnapshots(
  current: number,
  previous: number | null
): FollowersMetrics {
  if (previous == null || previous === current) {
    return {
      current,
      previous: previous ?? current,
      growth: 0,
      growthPercent: 0,
      hasHistoricalData: false,
      hasData: true,
      source: "instagram",
    };
  }

  const growth = current - previous;
  const growthPercent = previous > 0 ? (growth / previous) * 100 : 0;

  return {
    current,
    previous,
    growth,
    growthPercent,
    hasHistoricalData: true,
    hasData: true,
    source: "instagram",
  };
}

function buildUnavailableInstagramFollowersMetrics(): FollowersMetrics {
  return {
    current: 0,
    previous: 0,
    growth: 0,
    growthPercent: 0,
    hasHistoricalData: false,
    hasData: false,
    source: "instagram",
  };
}

function buildChartFromSnapshots(
  snapshots: { followersCount: number; recordedAt: Date }[],
  current: number
): ChartDataPoint[] {
  if (snapshots.length === 0) {
    const now = new Date();
    return [
      {
        date: format(now, "MMM d"),
        isoDate: now.toISOString(),
        views: 0,
        followers: current,
      },
    ];
  }

  return snapshots.map((snapshot) => ({
    date: format(snapshot.recordedAt, "MMM d"),
    isoDate: snapshot.recordedAt.toISOString(),
    views: 0,
    followers: snapshot.followersCount,
  }));
}

async function getInstagramFollowersData(
  userId: string,
  period: AnalyticsPeriod
): Promise<CreatorFollowersData | null> {
  const connection = await getInstagramConnectionForUser(userId);
  if (!connection) {
    return null;
  }

  const expired =
    connection.tokenExpiresAt != null &&
    connection.tokenExpiresAt.getTime() <= Date.now();

  if (expired) {
    return null;
  }

  if (connection.followersCount == null) {
    return {
      metrics: buildUnavailableInstagramFollowersMetrics(),
      overTime: [],
      source: "instagram",
      hasHistoricalData: false,
    };
  }

  const current = connection.followersCount;
  const since = periodStart(period);
  const snapshots = since
    ? await getFollowerSnapshotsForPeriod(userId, since)
    : await getFollowerSnapshotsForPeriod(userId, new Date(0));

  let previous: number | null = null;
  if (snapshots.length >= 2) {
    previous = snapshots[0].followersCount;
  } else if (since) {
    const before = await getOldestFollowerSnapshotBefore(userId, since);
    previous = before?.followersCount ?? null;
  }

  const metrics = buildMetricsFromSnapshots(current, previous);
  const overTime = buildChartFromSnapshots(snapshots, current);

  return {
    metrics,
    overTime,
    source: "instagram",
    hasHistoricalData: metrics.hasHistoricalData ?? false,
  };
}

/** Unified followers data source — Instagram when connected, otherwise explicit mock fallback. */
export async function getCreatorFollowersData(
  userId: string,
  period: AnalyticsPeriod = "30d"
): Promise<CreatorFollowersData> {
  const instagramData = await getInstagramFollowersData(userId, period);
  if (instagramData) {
    return instagramData;
  }

  return {
    metrics: {
      ...getMockFollowersMetrics(period),
      source: "mock",
      hasHistoricalData: true,
      hasData: true,
    },
    overTime: getMockFollowersOverTime(period),
    source: "mock",
    hasHistoricalData: true,
  };
}

export async function getAnalyticsWithFollowers(
  userId: string,
  period: AnalyticsPeriod
) {
  const { getAnalyticsOverview } = await import("@/services/reels/reel-service");
  const analytics = await getAnalyticsOverview(userId, period);
  const followersData = await getCreatorFollowersData(userId, period);

  return {
    ...analytics,
    followers: followersData.metrics,
    followersOverTime: followersData.overTime,
    followersSource: followersData.source,
    followersHasHistoricalData: followersData.hasHistoricalData,
  };
}
