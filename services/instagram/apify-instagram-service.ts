import type { NormalizedReelData } from "@/types";
import type { InstagramService } from "./types";
import { InstagramFetchError } from "./errors";
import { mapApifyItemToReelData, type ApifyReelItem } from "./map-apify-item";
import { normalizeInstagramReelUrl } from "./normalize-url";

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

export class ApifyInstagramService implements InstagramService {
  async fetchReel(url: string): Promise<NormalizedReelData> {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new InstagramFetchError("NOT_CONFIGURED");
    }

    const normalizedUrl = normalizeInstagramReelUrl(url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR)}/run-sync-get-dataset-items?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const item = items?.[0];

      if (!item) {
        throw new InstagramFetchError("REEL_NOT_FOUND");
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
}
