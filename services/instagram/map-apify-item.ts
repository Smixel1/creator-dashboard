import type { NormalizedReelData } from "@/types";
import { InstagramFetchError } from "./errors";
import { normalizeInstagramReelUrl } from "./normalize-url";

export type ApifyReelItem = Record<string, unknown>;

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }
  return undefined;
}

function readDate(value: unknown): Date | undefined {
  const raw = readString(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildTitle(caption: string | undefined, shortCode: string | undefined) {
  if (caption) {
    const firstLine = caption.split("\n")[0]?.trim();
    if (firstLine) {
      return firstLine.length > 200 ? `${firstLine.slice(0, 197)}...` : firstLine;
    }
  }

  if (shortCode) {
    return `Reels ${shortCode}`;
  }

  return "Instagram Reels";
}

export function mapApifyItemToReelData(
  item: ApifyReelItem,
  fallbackUrl: string
): NormalizedReelData {
  const itemError = readString(item.error);
  if (itemError) {
    throw new InstagramFetchError("REEL_NOT_FOUND", itemError);
  }

  const shortCode = readString(item.shortCode);
  const canonicalUrl = readString(item.url) ?? readString(item.inputUrl);
  let instagramUrl = fallbackUrl;

  try {
    instagramUrl = normalizeInstagramReelUrl(canonicalUrl ?? fallbackUrl);
  } catch {
    if (shortCode) {
      instagramUrl = `https://www.instagram.com/reel/${shortCode}/`;
    } else {
      instagramUrl = normalizeInstagramReelUrl(fallbackUrl);
    }
  }

  const coverUrl =
    readString(item.displayUrl) ??
    readString(item.thumbnailUrl) ??
    (Array.isArray(item.images)
      ? readString(item.images[0])
      : undefined);

  if (!coverUrl) {
    throw new InstagramFetchError("MISSING_STATISTICS");
  }

  const views =
    readNumber(item.videoPlayCount) ??
    readNumber(item.videoViewCount) ??
    readNumber(item.playCount) ??
    0;

  const likes =
    readNumber(item.likesCount) ??
    readNumber(item.likeCount) ??
    0;

  const comments =
    readNumber(item.commentsCount) ??
    readNumber(item.commentCount) ??
    0;

  const publishedAt = readDate(item.timestamp) ?? new Date();

  if (!readString(item.caption) && !shortCode && views === 0 && likes === 0) {
    throw new InstagramFetchError("MALFORMED_RESPONSE");
  }

  return {
    title: buildTitle(readString(item.caption), shortCode),
    coverUrl,
    views,
    likes,
    comments,
    publishedAt,
    instagramUrl,
    shortCode,
    externalId: readString(item.id),
    source: "manual",
  };
}
