import {
  disconnectInstagram,
  getDecryptedAccessToken,
  getInstagramConnectionForUser,
  markInstagramConnectionExpired,
  recordFollowerSnapshotIfChanged,
  saveInstagramConnection,
  updateInstagramConnectionToken,
} from "@/services/instagram/connection-service";
import {
  enrichInstagramMediaWithInsights,
  fetchInstagramMedia,
  fetchInstagramProfile,
  InstagramApiError,
  isInstagramReel,
  refreshLongLivedToken,
} from "@/services/instagram/meta-api-client";
import { normalizeInstagramMediaBatch } from "@/services/instagram/normalize-media";
import { upsertReelsFromInstagram } from "@/services/reels/reel-service";
import { prisma } from "@/lib/prisma";

export type InstagramSyncResult = {
  followersCount?: number;
  mediaPrepared: number;
  reelsCreated: number;
  reelsUpdated: number;
  reelsSkipped: number;
  lastSyncedAt: string;
};

function isAuthFailure(error: InstagramApiError): boolean {
  return error.status === 401 || error.status === 403;
}

async function handleInstagramApiAuthFailure(
  userId: string,
  error: unknown
): Promise<void> {
  if (error instanceof InstagramApiError && isAuthFailure(error)) {
    await markInstagramConnectionExpired(userId);
  }
}

async function ensureValidAccessToken(userId: string): Promise<string> {
  const connection = await getInstagramConnectionForUser(userId);
  if (!connection) {
    throw new InstagramApiError("Instagram not connected", "NOT_CONNECTED");
  }

  const accessToken = await getDecryptedAccessToken(userId);
  if (accessToken) {
    return accessToken;
  }

  const staleToken = connection.accessTokenEnc;
  const { decryptSecret } = await import("@/lib/crypto/encrypt");
  const rawToken = decryptSecret(staleToken);

  try {
    const refreshed = await refreshLongLivedToken(rawToken);
    const tokenExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

    await updateInstagramConnectionToken(
      userId,
      refreshed.accessToken,
      tokenExpiresAt
    );

    return refreshed.accessToken;
  } catch (error) {
    await handleInstagramApiAuthFailure(userId, error);
    throw error;
  }
}

export async function syncInstagramAccount(
  userId: string
): Promise<InstagramSyncResult> {
  try {
    const accessToken = await ensureValidAccessToken(userId);
    const profile = await fetchInstagramProfile(accessToken);
    const existing = await getInstagramConnectionForUser(userId);
    const tokenExpiresAt =
      existing?.tokenExpiresAt ?? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await saveInstagramConnection({
      userId,
      instagramUserId: profile.id,
      username: profile.username,
      accountType: profile.accountType,
      profilePictureUrl: profile.profilePictureUrl,
      followersCount: profile.followersCount,
      accessToken,
      tokenExpiresAt,
    });

    if (profile.followersCount != null) {
      await recordFollowerSnapshotIfChanged(userId, profile.followersCount);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { instagramUsername: profile.username },
    });

    const media = await fetchInstagramMedia(accessToken, 50);
    const reelMedia = media.filter(isInstagramReel);
    const mediaWithInsights = await enrichInstagramMediaWithInsights(
      reelMedia,
      accessToken
    );
    const normalized = normalizeInstagramMediaBatch(
      mediaWithInsights,
      profile.username
    );
    const upsertResult = await upsertReelsFromInstagram(userId, normalized);

    const lastSyncedAt = new Date().toISOString();

    await prisma.instagramConnection.update({
      where: { userId },
      data: { lastSyncedAt: new Date(lastSyncedAt) },
    });

    return {
      followersCount: profile.followersCount,
      mediaPrepared: normalized.length,
      reelsCreated: upsertResult.created,
      reelsUpdated: upsertResult.updated,
      reelsSkipped: upsertResult.skipped,
      lastSyncedAt,
    };
  } catch (error) {
    await handleInstagramApiAuthFailure(userId, error);
    throw error;
  }
}

export async function completeInstagramOAuth(
  userId: string,
  accessToken: string,
  tokenExpiresAt: Date,
  instagramUserId: string
): Promise<void> {
  try {
    const profile = await fetchInstagramProfile(accessToken);

    await saveInstagramConnection({
      userId,
      instagramUserId: profile.id || instagramUserId,
      username: profile.username,
      accountType: profile.accountType,
      profilePictureUrl: profile.profilePictureUrl,
      followersCount: profile.followersCount,
      accessToken,
      tokenExpiresAt,
    });

    if (profile.followersCount != null) {
      await recordFollowerSnapshotIfChanged(userId, profile.followersCount);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { instagramUsername: profile.username },
    });
  } catch (error) {
    await handleInstagramApiAuthFailure(userId, error);
    throw error;
  }
}

export { disconnectInstagram };
