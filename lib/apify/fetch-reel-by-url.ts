import { InstagramFetchError } from "@/services/instagram/errors";
import { normalizeInstagramReelUrl } from "@/services/instagram/normalize-url";
import { hasApifyToken, isApifyConfigured } from "@/lib/apify/config";
import {
  mapApifyItemToReelData,
  type ApifyReelItem,
} from "@/lib/apify/normalize";
import { findMatchingApifyItem } from "@/lib/apify/verify-identity";
import type { NormalizedReelData } from "@/types";

const APIFY_ACTOR = "apify/instagram-reel-scraper";
const APIFY_TIMEOUT_MS = 120_000;

function mapHttpStatusToError(status: number): InstagramFetchError {
  if (status === 401 || status === 403) {
    return new InstagramFetchError("NOT_CONFIGURED");
  }
  if (status === 429) {
    return new InstagramFetchError("RATE_LIMIT");
  }
  if (status === 408 || status === 504) {
    return new InstagramFetchError("TIMEOUT");
  }
  return new InstagramFetchError("API_UNAVAILABLE");
}

/**
 * Canonical server-side entry point for fetching an Instagram Reel via Apify.
 * Returns data for the requested URL only, or throws on failure / identity mismatch.
 */
export async function fetchReelByInstagramUrl(
  url: string
): Promise<NormalizedReelData> {
  if (!isApifyConfigured() || !hasApifyToken()) {
    throw new InstagramFetchError("NOT_CONFIGURED");
  }

  const token = process.env.APIFY_API_TOKEN!.trim();
  const normalizedUrl = normalizeInstagramReelUrl(url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR)}/run-sync-get-dataset-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          directUrls: [normalizedUrl],
          resultsLimit: 1,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw mapHttpStatusToError(response.status);
    }

    const items = (await response.json()) as ApifyReelItem[];

    if (!Array.isArray(items) || items.length === 0) {
      throw new InstagramFetchError("REEL_NOT_FOUND");
    }

    const item = findMatchingApifyItem(normalizedUrl, items);

    if (!item) {
      throw new InstagramFetchError("IDENTITY_MISMATCH");
    }

    return mapApifyItemToReelData(item, normalizedUrl);
  } catch (error) {
    if (error instanceof InstagramFetchError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new InstagramFetchError("TIMEOUT", undefined, error);
    }

    throw new InstagramFetchError("API_UNAVAILABLE", undefined, error);
  } finally {
    clearTimeout(timeoutId);
  }
}
