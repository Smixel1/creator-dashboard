import { InstagramFetchError } from "@/services/instagram/errors";
import { normalizeInstagramReelUrl } from "@/services/instagram/normalize-url";
import {
  extractShortCodeFromUrl,
  shortCodesMatch,
} from "@/lib/apify/extract-shortcode";
import type { ApifyReelItem } from "@/lib/apify/normalize";

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

/**
 * Ensures the Apify item belongs to the requested Instagram Reel URL.
 * Throws IDENTITY_MISMATCH when identity cannot be confirmed.
 */
export function verifyApifyReelIdentity(
  requestedCanonicalUrl: string,
  item: ApifyReelItem
): void {
  const requestedShortCode = extractShortCodeFromUrl(requestedCanonicalUrl);
  const itemShortCode = readString(item.shortCode);

  if (!itemShortCode) {
    throw new InstagramFetchError("IDENTITY_MISMATCH");
  }

  if (!shortCodesMatch(itemShortCode, requestedShortCode)) {
    throw new InstagramFetchError("IDENTITY_MISMATCH");
  }

  const itemUrl = readString(item.url) ?? readString(item.inputUrl);
  if (itemUrl) {
    try {
      const normalizedItemUrl = normalizeInstagramReelUrl(itemUrl);
      if (normalizedItemUrl !== requestedCanonicalUrl) {
        throw new InstagramFetchError("IDENTITY_MISMATCH");
      }
    } catch (error) {
      if (error instanceof InstagramFetchError && error.code === "IDENTITY_MISMATCH") {
        throw error;
      }
      // Unparseable item URL — shortcode match is sufficient.
    }
  }
}

/** Pick the Apify item that matches the requested URL, if multiple are returned. */
export function findMatchingApifyItem(
  requestedCanonicalUrl: string,
  items: ApifyReelItem[]
): ApifyReelItem | null {
  const requestedShortCode = extractShortCodeFromUrl(requestedCanonicalUrl);

  for (const item of items) {
    const itemShortCode = readString(item.shortCode);
    if (!itemShortCode) continue;

    if (!shortCodesMatch(itemShortCode, requestedShortCode)) continue;

    const itemUrl = readString(item.url) ?? readString(item.inputUrl);
    if (itemUrl) {
      try {
        if (normalizeInstagramReelUrl(itemUrl) !== requestedCanonicalUrl) {
          continue;
        }
      } catch {
        // shortcode matched — accept
      }
    }

    return item;
  }

  return null;
}
