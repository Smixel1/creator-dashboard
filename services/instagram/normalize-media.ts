import type { NormalizedReelData } from "@/types";
import {
  isInstagramReel,
  type InstagramMediaItem,
} from "@/services/instagram/meta-api-client";

/** Maps Instagram Graph media to the app's normalized reel shape (Reels UI layer). */
export function normalizeInstagramMediaItem(
  item: InstagramMediaItem,
  username?: string
): NormalizedReelData | null {
  if (!isInstagramReel(item)) {
    return null;
  }

  const coverUrl = item.thumbnailUrl ?? item.mediaUrl ?? "";
  if (!coverUrl || !item.permalink) {
    return null;
  }

  const caption = item.caption?.trim();
  const title =
    caption?.slice(0, 120) ||
    item.permalink.split("/").filter(Boolean).pop() ||
    "Reel";

  return {
    title,
    coverUrl,
    views: item.insights?.views ?? null,
    likes: item.likeCount ?? null,
    comments: item.commentsCount ?? null,
    publishedAt: item.timestamp ? new Date(item.timestamp) : new Date(),
    instagramUrl: item.permalink,
    externalId: item.id,
    source: "instagram",
    username: item.username ?? username,
    mediaType: item.mediaProductType ?? item.mediaType,
    mediaUrl: item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl,
    caption,
    shares: item.insights?.shares ?? null,
    reach: item.insights?.reach ?? null,
  };
}

export function normalizeInstagramMediaBatch(
  items: InstagramMediaItem[],
  username?: string
): NormalizedReelData[] {
  return items
    .map((item) => normalizeInstagramMediaItem(item, username))
    .filter((item): item is NormalizedReelData => item !== null);
}
