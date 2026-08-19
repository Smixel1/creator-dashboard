import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/crypto/encrypt";
import { isInstagramOAuthConfigured } from "@/lib/instagram/oauth/config";
import type { InstagramConnectionPublic } from "@/types/instagram";

export type InstagramConnectionStatus =
  | "not_connected"
  | "connected"
  | "expired";

export type { InstagramConnectionPublic };

export async function getInstagramConnectionForUser(userId: string) {
  return prisma.instagramConnection.findUnique({
    where: { userId },
  });
}

export async function getInstagramConnectionPublic(
  userId: string
): Promise<InstagramConnectionPublic> {
  const configured = isInstagramOAuthConfigured();
  const connection = await getInstagramConnectionForUser(userId);

  if (!connection) {
    return { status: "not_connected", configured };
  }

  const expired =
    connection.tokenExpiresAt != null &&
    connection.tokenExpiresAt.getTime() <= Date.now();

  return {
    status: expired ? "expired" : "connected",
    configured,
    username: connection.username,
    profilePictureUrl: connection.profilePictureUrl ?? undefined,
    accountType: connection.accountType ?? undefined,
    followersCount: connection.followersCount ?? undefined,
    lastSyncedAt: connection.lastSyncedAt?.toISOString(),
  };
}

export async function getDecryptedAccessToken(userId: string): Promise<string | null> {
  const connection = await getInstagramConnectionForUser(userId);
  if (!connection) return null;

  if (
    connection.tokenExpiresAt &&
    connection.tokenExpiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  try {
    return decryptSecret(connection.accessTokenEnc);
  } catch {
    return null;
  }
}

export async function saveInstagramConnection(input: {
  userId: string;
  instagramUserId: string;
  username: string;
  accountType?: string;
  profilePictureUrl?: string;
  followersCount?: number;
  accessToken: string;
  tokenExpiresAt: Date;
}) {
  const accessTokenEnc = encryptSecret(input.accessToken);

  return prisma.instagramConnection.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      instagramUserId: input.instagramUserId,
      username: input.username,
      accountType: input.accountType,
      profilePictureUrl: input.profilePictureUrl,
      followersCount: input.followersCount,
      accessTokenEnc,
      tokenExpiresAt: input.tokenExpiresAt,
      lastSyncedAt: new Date(),
    },
    update: {
      instagramUserId: input.instagramUserId,
      username: input.username,
      accountType: input.accountType,
      profilePictureUrl: input.profilePictureUrl,
      followersCount: input.followersCount,
      accessTokenEnc,
      tokenExpiresAt: input.tokenExpiresAt,
      lastSyncedAt: new Date(),
    },
  });
}

export async function updateInstagramConnectionToken(
  userId: string,
  accessToken: string,
  tokenExpiresAt: Date
) {
  return prisma.instagramConnection.update({
    where: { userId },
    data: {
      accessTokenEnc: encryptSecret(accessToken),
      tokenExpiresAt,
    },
  });
}

export async function markInstagramConnectionExpired(userId: string) {
  return prisma.instagramConnection.update({
    where: { userId },
    data: { tokenExpiresAt: new Date(0) },
  });
}

export async function disconnectInstagram(userId: string) {
  await prisma.$transaction([
    prisma.instagramFollowerSnapshot.deleteMany({ where: { userId } }),
    prisma.instagramConnection.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { instagramUsername: null },
    }),
  ]);
}

export async function recordFollowerSnapshot(userId: string, followersCount: number) {
  return prisma.instagramFollowerSnapshot.create({
    data: { userId, followersCount },
  });
}

export async function recordFollowerSnapshotIfChanged(
  userId: string,
  followersCount: number
) {
  const latest = await prisma.instagramFollowerSnapshot.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
  });

  if (latest?.followersCount === followersCount) {
    return null;
  }

  return recordFollowerSnapshot(userId, followersCount);
}

export async function getFollowerSnapshotsForPeriod(
  userId: string,
  since: Date
) {
  return prisma.instagramFollowerSnapshot.findMany({
    where: {
      userId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });
}

export async function getOldestFollowerSnapshotBefore(
  userId: string,
  before: Date
) {
  return prisma.instagramFollowerSnapshot.findFirst({
    where: {
      userId,
      recordedAt: { lt: before },
    },
    orderBy: { recordedAt: "desc" },
  });
}
