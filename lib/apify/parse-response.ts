import type { ApifyReelItem } from "@/lib/apify/normalize";
import { InstagramFetchError } from "@/services/instagram/errors";

function isApifyReelItem(value: unknown): value is ApifyReelItem {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse run-sync-get-dataset-items response into reel items. */
export function parseApifyDatasetItems(body: unknown): ApifyReelItem[] {
  if (Array.isArray(body)) {
    return body.filter(isApifyReelItem);
  }

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data.filter(isApifyReelItem);
    }

    if (typeof record.error === "string" && record.error.trim()) {
      throw new InstagramFetchError("REEL_NOT_FOUND", record.error);
    }

    if (record.error && typeof record.error === "object") {
      const message = String(
        (record.error as Record<string, unknown>).message ?? "Apify actor error"
      );
      throw new InstagramFetchError("API_UNAVAILABLE", message.slice(0, 200));
    }
  }

  throw new InstagramFetchError("MALFORMED_RESPONSE");
}
