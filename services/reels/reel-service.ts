import { prisma } from "@/lib/prisma";
import { calcEngagementRate } from "@/lib/format";
import {
  buildDashboardStats,
  computeTopPerformingForPeriod,
  computeViewsOverTime,
  type ReelWithStats,
} from "@/services/analytics/calculations";
import type {
  ReelAnalyticsOverview,
  AnalyticsPeriod,
  ChartDataPoint,
  ReelDetail,
  ReelSortField,
  ReelWithEngagement,
  SortOrder,
  NormalizedReelData,
  ReelDataSource,
} from "@/types";
import { format } from "date-fns";
import { instagramUrlsMatch } from "@/services/instagram/normalize-url";

function buildReelDetailChartStats(
  stats: Array<{
    recordedAt: Date;
    views: number | null;
    likes: number | null;
    comments: number | null;
  }>
): ChartDataPoint[] {
  if (stats.length === 0) return [];

  const sorted = [...stats].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()
  );

  let prevViews: number | null = null;
  const points: ChartDataPoint[] = [];

  for (const [index, s] of sorted.entries()) {
    if (s.views == null) {
      continue;
    }

    const dailyViews =
      index === 0 || prevViews == null
        ? s.views
        : Math.max(0, s.views - prevViews);
    prevViews = s.views;

    const likes = s.likes ?? 0;
    const comments = s.comments ?? 0;

    points.push({
      isoDate: format(s.recordedAt, "yyyy-MM-dd"),
      date: format(s.recordedAt, "MMM d"),
      views: dailyViews,
      likes,
      comments,
      engagement:
        s.likes != null && s.comments != null
          ? calcEngagementRate(s.views, s.likes, s.comments)
          : 0,
    });
  }

  return points;
}

function mapReel(reel: {
  id: string;
  title: string;
  coverUrl: string | null;
  instagramUrl: string;
  shortCode?: string | null;
  ownerUsername?: string | null;
  caption?: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  publishedAt: Date;
  fetchedAt?: Date | null;
  syncedAt?: Date | null;
  source?: string;
}): ReelWithEngagement {
  const hasViewsData = reel.views != null;
  const hasLikesData = reel.likes != null;
  const hasCommentsData = reel.comments != null;
  const views = reel.views ?? 0;
  const likes = reel.likes ?? 0;
  const comments = reel.comments ?? 0;

  return {
    id: reel.id,
    title: reel.title,
    coverUrl: reel.coverUrl,
    instagramUrl: reel.instagramUrl,
    shortCode: reel.shortCode ?? null,
    ownerUsername: reel.ownerUsername ?? null,
    caption: reel.caption ?? null,
    views,
    likes,
    comments,
    publishedAt: reel.publishedAt.toISOString(),
    fetchedAt: reel.fetchedAt?.toISOString() ?? null,
    syncedAt: reel.syncedAt?.toISOString() ?? null,
    engagementRate:
      hasViewsData && hasLikesData && hasCommentsData
        ? calcEngagementRate(reel.views as number, reel.likes as number, reel.comments as number)
        : 0,
    hasViewsData,
    hasLikesData,
    hasCommentsData,
    source: (reel.source as ReelDataSource | undefined) ?? "manual",
  };
}

function resolveContentSource(
  reels: Array<{ source?: string }>
): ReelAnalyticsOverview["contentSource"] {
  const sources = new Set(
    reels.map((reel) => reel.source).filter(Boolean) as string[]
  );

  if (sources.size === 0) {
    return "mock";
  }

  if (sources.size === 1 && sources.has("instagram")) {
    return "instagram";
  }

  if (sources.has("instagram")) {
    return "mixed";
  }

  if (sources.has("apify")) {
    return "mixed";
  }

  return "mock";
}

/** Analytics uses real imported/synced reels; excludes explicit mock records. */
function filterReelsForAnalytics(reels: ReelWithStats[]): ReelWithStats[] {
  return reels.filter((reel) => reel.source !== "mock");
}

export async function getUserReels(
  userId: string,
  options?: {
    search?: string;
    sortBy?: ReelSortField;
    sortOrder?: SortOrder;
  }
): Promise<ReelWithEngagement[]> {
  const reels = await prisma.reel.findMany({
    where: {
      userId,
      ...(options?.search
        ? { title: { contains: options.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: {
      [options?.sortBy ?? "publishedAt"]: options?.sortOrder ?? "desc",
    },
  });

  return reels.map(mapReel);
}

export async function getReelById(
  userId: string,
  reelId: string
): Promise<ReelDetail | null> {
  const reel = await prisma.reel.findFirst({
    where: { id: reelId, userId },
    include: {
      stats: { orderBy: { recordedAt: "asc" } },
    },
  });

  if (!reel) return null;

  const stats = buildReelDetailChartStats(reel.stats);

  return {
    ...mapReel(reel),
    stats,
  };
}

async function fetchUserReelsWithStats(userId: string): Promise<ReelWithStats[]> {
  return prisma.reel.findMany({
    where: { userId },
    include: { stats: { orderBy: { recordedAt: "asc" } } },
  });
}

export async function getAnalyticsOverview(
  userId: string,
  period: AnalyticsPeriod = "30d"
): Promise<ReelAnalyticsOverview> {
  const allReels = await fetchUserReelsWithStats(userId);
  const reels = filterReelsForAnalytics(allReels);
  const stats = buildDashboardStats(reels, period);
  const viewsOverTime = computeViewsOverTime(reels, period);
  const topPerforming = computeTopPerformingForPeriod(reels, period, 6);

  const mapped = reels.map(mapReel);
  const recentReels = [...mapped]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 6);

  return {
    period,
    stats,
    viewsOverTime,
    topPerforming,
    recentReels,
    contentSource: resolveContentSource(reels),
  };
}

export async function deleteReel(userId: string, reelId: string) {
  const reel = await prisma.reel.findFirst({
    where: { id: reelId, userId },
  });
  if (!reel) return false;
  await prisma.reel.delete({ where: { id: reelId } });
  return true;
}

export async function findUserReelByInstagramUrl(userId: string, url: string) {
  const reels = await prisma.reel.findMany({
    where: { userId },
    select: { id: true, instagramUrl: true, instagramMediaId: true },
  });

  return (
    reels.find((reel) => instagramUrlsMatch(reel.instagramUrl, url)) ?? null
  );
}

export async function findUserReelByInstagramMediaId(
  userId: string,
  instagramMediaId: string
) {
  return prisma.reel.findFirst({
    where: { userId, instagramMediaId },
    select: { id: true },
  });
}

function metricsChanged(
  current: {
    views: number | null;
    likes: number | null;
    comments: number | null;
    reach: number | null;
    shares: number | null;
  },
  next: NormalizedReelData
): boolean {
  return (
    current.views !== next.views ||
    current.likes !== next.likes ||
    current.comments !== next.comments ||
    current.reach !== (next.reach ?? null) ||
    current.shares !== (next.shares ?? null)
  );
}

export async function updateReelFromFetchedData(
  reelId: string,
  data: NormalizedReelData
) {
  const latestStat = await prisma.reelStat.findFirst({
    where: { reelId },
    orderBy: { recordedAt: "desc" },
  });

  const shouldCreateStat =
    !latestStat ||
    latestStat.views !== data.views ||
    latestStat.likes !== data.likes ||
    latestStat.comments !== data.comments ||
    latestStat.reach !== (data.reach ?? null) ||
    latestStat.shares !== (data.shares ?? null);

  await prisma.$transaction(async (tx) => {
    const now = new Date();
    const isApifySource = data.source === "apify";

    await tx.reel.update({
      where: { id: reelId },
      data: {
        title: data.title,
        coverUrl: data.coverUrl,
        instagramUrl: data.instagramUrl,
        instagramMediaId: data.externalId,
        shortCode: data.shortCode,
        ownerUsername: data.username,
        caption: data.caption,
        source: data.source ?? "manual",
        views: data.views,
        likes: data.likes,
        comments: data.comments,
        reach: data.reach ?? null,
        shares: data.shares ?? null,
        publishedAt: data.publishedAt,
        fetchedAt: isApifySource ? (data.fetchedAt ?? now) : undefined,
        syncedAt:
          data.source === "instagram" || isApifySource ? now : undefined,
      },
    });

    if (shouldCreateStat) {
      await tx.reelStat.create({
        data: {
          reelId,
          views: data.views,
          likes: data.likes,
          comments: data.comments,
          reach: data.reach ?? null,
          shares: data.shares ?? null,
        },
      });
    }
  });
}

export async function createReelFromUrl(
  userId: string,
  instagramUrl: string,
  data: Omit<NormalizedReelData, "instagramUrl"> & { instagramUrl?: string }
) {
  const canonicalUrl = data.instagramUrl ?? instagramUrl;
  const now = new Date();
  const isApifySource = data.source === "apify";

  const reel = await prisma.reel.create({
    data: {
      userId,
      instagramUrl: canonicalUrl,
      instagramMediaId: data.externalId,
      shortCode: data.shortCode,
      ownerUsername: data.username,
      caption: data.caption,
      source: data.source ?? "manual",
      title: data.title,
      coverUrl: data.coverUrl,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      reach: data.reach ?? null,
      shares: data.shares ?? null,
      publishedAt: data.publishedAt,
      fetchedAt: isApifySource ? (data.fetchedAt ?? now) : null,
      syncedAt:
        data.source === "instagram" || isApifySource ? now : undefined,
      stats: {
        create: {
          views: data.views,
          likes: data.likes,
          comments: data.comments,
          reach: data.reach ?? null,
          shares: data.shares ?? null,
        },
      },
    },
  });

  return mapReel(reel);
}

export async function upsertReelsFromInstagram(
  userId: string,
  items: NormalizedReelData[]
): Promise<{ created: number; updated: number; skipped: number }> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const syncedAt = new Date();

  for (const item of items) {
    if (!item.externalId) {
      skipped++;
      continue;
    }

    const byMediaId = await findUserReelByInstagramMediaId(
      userId,
      item.externalId
    );
    const byUrl = byMediaId
      ? null
      : await findUserReelByInstagramUrl(userId, item.instagramUrl);
    const existingId = byMediaId?.id ?? byUrl?.id;

    if (existingId) {
      const existing = await prisma.reel.findUnique({
        where: { id: existingId },
        select: {
          views: true,
          likes: true,
          comments: true,
          reach: true,
          shares: true,
        },
      });

      if (existing && !metricsChanged(existing, item)) {
        await prisma.reel.update({
          where: { id: existingId },
          data: {
            title: item.title,
            coverUrl: item.coverUrl,
            instagramUrl: item.instagramUrl,
            instagramMediaId: item.externalId,
            source: "instagram",
            publishedAt: item.publishedAt,
            syncedAt,
          },
        });
      } else {
        await updateReelFromFetchedData(existingId, {
          ...item,
          source: "instagram",
        });
      }

      updated++;
      continue;
    }

    await createReelFromUrl(userId, item.instagramUrl, {
      ...item,
      source: "instagram",
    });
    created++;
  }

  return { created, updated, skipped };
}

export async function getProfileStats(userId: string) {
  const allReels = await fetchUserReelsWithStats(userId);
  const reels = filterReelsForAnalytics(allReels);
  const totalReels = reels.length;
  const totalViews = reels.reduce(
    (sum, reel) => (reel.views != null ? sum + reel.views : sum),
    0
  );

  return {
    totalReels,
    totalViews,
  };
}
