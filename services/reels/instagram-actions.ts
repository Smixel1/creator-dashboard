import { prisma } from "@/lib/prisma";
import { fetchReelByInstagramUrl } from "@/lib/apify/fetch-reel-by-url";
import { isApifyUnavailable } from "@/lib/apify/config";
import {
  getInstagramErrorMessage,
  normalizeInstagramReelUrl,
  isInstagramFetchError,
  InstagramFetchError,
} from "@/services/instagram";
import {
  createReelFromUrl,
  findUserReelByInstagramUrl,
  getReelById,
  updateReelFromFetchedData,
} from "@/services/reels/reel-service";
import type { ReelDetail, ReelWithEngagement } from "@/types";
import type { Translator } from "@/lib/i18n";

export class ReelAlreadyExistsError extends Error {
  constructor() {
    super("REEL_ALREADY_EXISTS");
    this.name = "ReelAlreadyExistsError";
  }
}

export class ReelNotFoundError extends Error {
  constructor() {
    super("REEL_NOT_FOUND");
    this.name = "ReelNotFoundError";
  }
}

export async function addReelFromInstagramUrl(
  userId: string,
  rawUrl: string
): Promise<ReelWithEngagement> {
  const normalizedUrl = normalizeInstagramReelUrl(rawUrl);
  const existing = await findUserReelByInstagramUrl(userId, normalizedUrl);

  if (existing) {
    throw new ReelAlreadyExistsError();
  }

  const reelData = await fetchReelByInstagramUrl(normalizedUrl);

  return createReelFromUrl(userId, reelData.instagramUrl, reelData);
}

export interface SyncUserReelsResult {
  updated: number;
  failed: number;
  total: number;
  apifyUnavailable: boolean;
  errors: Array<{ reelId: string; title: string; message: string }>;
}

export async function syncUserReels(
  userId: string,
  t: Translator
): Promise<SyncUserReelsResult> {
  const reels = await prisma.reel.findMany({
    where: { userId, source: "apify" },
    orderBy: { publishedAt: "desc" },
  });

  const result: SyncUserReelsResult = {
    updated: 0,
    failed: 0,
    total: reels.length,
    apifyUnavailable: isApifyUnavailable(),
    errors: [],
  };

  for (const reel of reels) {
    try {
      const fetched = await fetchReelByInstagramUrl(reel.instagramUrl);
      assertReelIdentity(reel.shortCode, fetched.shortCode);
      await updateReelFromFetchedData(reel.id, fetched);
      result.updated += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push({
        reelId: reel.id,
        title: reel.title,
        message: getInstagramErrorMessage(error, t),
      });
    }
  }

  return result;
}

export async function syncSingleReel(
  userId: string,
  reelId: string
): Promise<ReelDetail> {
  const reel = await prisma.reel.findFirst({
    where: { id: reelId, userId },
  });

  if (!reel) {
    throw new ReelNotFoundError();
  }

  const fetched = await fetchReelByInstagramUrl(reel.instagramUrl);
  assertReelIdentity(reel.shortCode, fetched.shortCode);
  await updateReelFromFetchedData(reel.id, fetched);

  const updated = await getReelById(userId, reelId);
  if (!updated) {
    throw new ReelNotFoundError();
  }

  return updated;
}

function assertReelIdentity(
  storedShortCode: string | null | undefined,
  fetchedShortCode: string | undefined
) {
  if (!storedShortCode || !fetchedShortCode) {
    return;
  }

  if (storedShortCode.toLowerCase() !== fetchedShortCode.toLowerCase()) {
    throw new InstagramFetchError("IDENTITY_MISMATCH");
  }
}

export function mapAddReelError(error: unknown, t: Translator): string {
  if (error instanceof ReelAlreadyExistsError) {
    return t("api.reelAlreadyExists");
  }

  if (isInstagramFetchError(error)) {
    return getInstagramErrorMessage(error, t);
  }

  return t("api.genericError");
}

export function mapSyncReelError(error: unknown, t: Translator): string {
  if (error instanceof ReelNotFoundError) {
    return t("api.reelNotFound");
  }

  if (isInstagramFetchError(error)) {
    return getInstagramErrorMessage(error, t);
  }

  return t("reels.syncFailed");
}
