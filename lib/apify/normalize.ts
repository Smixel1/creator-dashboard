import type { NormalizedReelData } from "@/types";
import { InstagramFetchError } from "@/services/instagram/errors";
import { verifyApifyReelIdentity } from "@/lib/apify/verify-identity";
import type { ApifyNormalizedReel } from "@/lib/apify/types";

export type ApifyReelItem = Record<string, unknown>;

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }
  return null;
}

function readDate(value: unknown): Date | null {
  const raw = readString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readOwnerUsername(item: ApifyReelItem): string | undefined {
  return (
    readString(item.ownerUsername) ??
    readString((item.owner as Record<string, unknown> | undefined)?.username) ??
    readString(item.username)
  );
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

export function normalizeApifyReelItem(
  item: ApifyReelItem,
  requestedCanonicalUrl: string
): ApifyNormalizedReel {
  const itemError = readString(item.error);
  if (itemError) {
    throw new InstagramFetchError("REEL_NOT_FOUND", itemError);
  }

  verifyApifyReelIdentity(requestedCanonicalUrl, item);

  const shortCode = readString(item.shortCode);
  if (!shortCode) {
    throw new InstagramFetchError("IDENTITY_MISMATCH");
  }

  const thumbnailUrl =
    readString(item.displayUrl) ??
    readString(item.thumbnailUrl) ??
    readString(item.coverUrl) ??
    (Array.isArray(item.images) ? readString(item.images[0]) : undefined);

  const views =
    readNumber(item.videoPlayCount) ??
    readNumber(item.videoViewCount) ??
    readNumber(item.playCount);

  const likes = readNumber(item.likesCount) ?? readNumber(item.likeCount);
  const comments =
    readNumber(item.commentsCount) ?? readNumber(item.commentCount);

  const caption = readString(item.caption);
  const publishedAt = readDate(item.timestamp);

  if (!publishedAt) {
    throw new InstagramFetchError("MALFORMED_RESPONSE");
  }

  if (!caption && views == null && likes == null && comments == null) {
    throw new InstagramFetchError("MALFORMED_RESPONSE");
  }

  return {
    instagramUrl: requestedCanonicalUrl,
    shortCode,
    ownerUsername: readOwnerUsername(item),
    caption,
    thumbnailUrl: thumbnailUrl ?? null,
    publishedAt,
    views,
    likes,
    comments,
    externalId: readString(item.id),
    fetchedAt: new Date(),
  };
}

export function toNormalizedReelData(
  reel: ApifyNormalizedReel
): NormalizedReelData {
  return {
    title: buildTitle(reel.caption, reel.shortCode),
    coverUrl: reel.thumbnailUrl,
    views: reel.views,
    likes: reel.likes,
    comments: reel.comments,
    publishedAt: reel.publishedAt,
    instagramUrl: reel.instagramUrl,
    shortCode: reel.shortCode,
    externalId: reel.externalId,
    source: "apify",
    username: reel.ownerUsername,
    caption: reel.caption,
    thumbnailUrl: reel.thumbnailUrl ?? undefined,
    fetchedAt: reel.fetchedAt,
  };
}

export function mapApifyItemToReelData(
  item: ApifyReelItem,
  requestedCanonicalUrl: string
): NormalizedReelData {
  return toNormalizedReelData(
    normalizeApifyReelItem(item, requestedCanonicalUrl)
  );
}
