import { prisma } from "@/lib/prisma";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import {
  getInstagramService,
  getInstagramErrorMessage,
  normalizeInstagramReelUrl,
  isInstagramFetchError,
} from "@/services/instagram";
import { generateStatHistory } from "@/services/instagram/mock-instagram-service";
import {
  createReelFromUrl,
  findUserReelByInstagramUrl,
  updateReelFromFetchedData,
} from "@/services/reels/reel-service";
import type { ReelWithEngagement } from "@/types";
import type { Translator } from "@/lib/i18n";

export class ReelAlreadyExistsError extends Error {
  constructor() {
    super("REEL_ALREADY_EXISTS");
    this.name = "ReelAlreadyExistsError";
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

  const service = getInstagramService();
  const reelData = await service.fetchReel(normalizedUrl);

  const reel = await createReelFromUrl(userId, reelData.instagramUrl, reelData);

  if (isInstagramDemoMode()) {
    const history = generateStatHistory(
      reelData.views ?? 0,
      reelData.likes ?? 0,
      reelData.comments ?? 0,
      14
    );

    await prisma.reelStat.createMany({
      data: history.slice(1).map((stat) => ({
        reelId: reel.id,
        views: stat.views,
        likes: stat.likes,
        comments: stat.comments,
        recordedAt: stat.recordedAt,
      })),
    });
  }

  return reel;
}

export interface SyncUserReelsResult {
  updated: number;
  failed: number;
  total: number;
  demoMode: boolean;
  errors: Array<{ reelId: string; title: string; message: string }>;
}

export async function syncUserReels(
  userId: string,
  t: Translator
): Promise<SyncUserReelsResult> {
  const service = getInstagramService();
  const reels = await prisma.reel.findMany({
    where: { userId },
    orderBy: { publishedAt: "desc" },
  });

  const result: SyncUserReelsResult = {
    updated: 0,
    failed: 0,
    total: reels.length,
    demoMode: isInstagramDemoMode(),
    errors: [],
  };

  for (const reel of reels) {
    try {
      const fetched = await service.fetchReel(reel.instagramUrl);
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

export function mapAddReelError(error: unknown, t: Translator): string {
  if (error instanceof ReelAlreadyExistsError) {
    return t("api.reelAlreadyExists");
  }

  if (isInstagramFetchError(error)) {
    return getInstagramErrorMessage(error, t);
  }

  return t("api.genericError");
}
