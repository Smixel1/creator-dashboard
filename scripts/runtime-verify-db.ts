import "dotenv/config";
import { prisma } from "../lib/prisma";

function summarizeReel(reel: {
  id: string;
  title: string;
  source: string;
  instagramMediaId: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  reach: number | null;
  shares: number | null;
  publishedAt: Date;
  syncedAt: Date | null;
}) {
  return {
    id: reel.id.slice(0, 8),
    title: reel.title.slice(0, 40),
    source: reel.source,
    instagramMediaId: reel.instagramMediaId,
    views: reel.views,
    likes: reel.likes,
    comments: reel.comments,
    reach: reel.reach,
    shares: reel.shares,
    publishedAt: reel.publishedAt.toISOString(),
    syncedAt: reel.syncedAt?.toISOString() ?? null,
  };
}

async function main() {
  const connections = await prisma.instagramConnection.findMany({
    select: {
      userId: true,
      username: true,
      followersCount: true,
      lastSyncedAt: true,
      tokenExpiresAt: true,
      user: { select: { email: true, name: true } },
    },
  });

  const snapshots = await prisma.instagramFollowerSnapshot.findMany({
    orderBy: { recordedAt: "desc" },
    take: 20,
    select: {
      userId: true,
      followersCount: true,
      recordedAt: true,
    },
  });

  const reels = await prisma.reel.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      userId: true,
      title: true,
      source: true,
      instagramMediaId: true,
      views: true,
      likes: true,
      comments: true,
      reach: true,
      shares: true,
      publishedAt: true,
      syncedAt: true,
    },
  });

  const stats = await prisma.reelStat.findMany({
    orderBy: { recordedAt: "desc" },
    take: 20,
    select: {
      reelId: true,
      views: true,
      likes: true,
      comments: true,
      reach: true,
      shares: true,
      recordedAt: true,
    },
  });

  const bySource = reels.reduce<Record<string, number>>((acc, reel) => {
    acc[reel.source] = (acc[reel.source] ?? 0) + 1;
    return acc;
  }, {});

  const instagramReels = reels.filter((reel) => reel.source === "instagram");

  const duplicateMediaIds = (() => {
    const map = new Map<string, number>();
    for (const reel of instagramReels) {
      if (!reel.instagramMediaId) continue;
      const key = `${reel.userId}|${reel.instagramMediaId}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].filter(([, count]) => count > 1);
  })();

  console.log(
    JSON.stringify(
      {
        connections: connections.map((c) => ({
          email: c.user.email,
          username: c.username,
          followersCount: c.followersCount,
          lastSyncedAt: c.lastSyncedAt?.toISOString() ?? null,
          tokenExpired:
            c.tokenExpiresAt != null && c.tokenExpiresAt.getTime() <= Date.now(),
        })),
        reelCounts: {
          total: reels.length,
          bySource,
          instagram: instagramReels.length,
        },
        duplicateInstagramMediaIds: duplicateMediaIds,
        instagramReelsSample: instagramReels.slice(0, 5).map(summarizeReel),
        nullMetricsSample: instagramReels
          .filter(
            (reel) =>
              reel.views == null ||
              reel.likes == null ||
              reel.comments == null
          )
          .slice(0, 3)
          .map(summarizeReel),
        reachSharesPresent: {
          reelsWithReach: instagramReels.filter((r) => r.reach != null).length,
          reelsWithShares: instagramReels.filter((r) => r.shares != null)
            .length,
        },
        followerSnapshots: snapshots,
        recentStats: stats,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
