import "dotenv/config";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth-session";

const BASE = process.env.APP_URL ?? "http://localhost:3000";

async function authedFetch(
  path: string,
  token: string,
  method: "GET" | "POST" = "GET"
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Cookie: `creator_session=${token}` },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function main() {
  const reelOwner = await prisma.reel.findFirst({
    select: { userId: true },
    orderBy: { createdAt: "asc" },
  });

  if (!reelOwner) {
    console.log(JSON.stringify({ error: "NO_USERS_WITH_REELS" }, null, 2));
    return;
  }

  const userId = reelOwner.userId;
  const token = await createSessionToken(userId);

  const instagramCountBefore = await prisma.reel.count({
    where: { userId, source: "instagram" },
  });

  const connection = await prisma.instagramConnection.findUnique({
    where: { userId },
    select: {
      username: true,
      followersCount: true,
      lastSyncedAt: true,
      tokenExpiresAt: true,
    },
  });

  const snapshotCountBefore = await prisma.instagramFollowerSnapshot.count({
    where: { userId },
  });

  const sync1 = await authedFetch("/api/instagram/sync", token, "POST");
  const instagramCountAfterSync1 = await prisma.reel.count({
    where: { userId, source: "instagram" },
  });

  const sync2 = await authedFetch("/api/instagram/sync", token, "POST");
  const instagramCountAfterSync2 = await prisma.reel.count({
    where: { userId, source: "instagram" },
  });

  const snapshotCountAfter = await prisma.instagramFollowerSnapshot.count({
    where: { userId },
  });

  const [analytics, reels] = await Promise.all([
    authedFetch("/api/analytics?period=30d", token),
    authedFetch("/api/reels", token),
  ]);

  const instagramReels = await prisma.reel.findMany({
    where: { userId, source: "instagram" },
    select: {
      instagramMediaId: true,
      views: true,
      likes: true,
      comments: true,
      reach: true,
      shares: true,
      syncedAt: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        userId,
        oauthConfigured: Boolean(
          process.env.INSTAGRAM_CLIENT_ID &&
            process.env.INSTAGRAM_CLIENT_SECRET &&
            process.env.INSTAGRAM_REDIRECT_URI
        ),
        connection,
        syncCounts: {
          before: instagramCountBefore,
          afterSync1: instagramCountAfterSync1,
          afterSync2: instagramCountAfterSync2,
        },
        followerSnapshots: {
          before: snapshotCountBefore,
          after: snapshotCountAfter,
        },
        sync1,
        sync2,
        analytics: analytics.body
          ? {
              contentSource: analytics.body.contentSource,
              followersSource: analytics.body.followersSource,
              followersHasData: analytics.body.followers?.hasData,
              stats: analytics.body.stats,
            }
          : analytics,
        reelsApiCount: Array.isArray(reels.body) ? reels.body.length : null,
        instagramReelsInDb: instagramReels.length,
        reachSharesInDb: {
          withReach: instagramReels.filter((r) => r.reach != null).length,
          withShares: instagramReels.filter((r) => r.shares != null).length,
        },
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
