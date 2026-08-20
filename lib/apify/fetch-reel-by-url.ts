import { InstagramFetchError } from "@/services/instagram/errors";
import { normalizeInstagramReelUrl } from "@/services/instagram/normalize-url";
import { hasApifyToken, isApifyConfigured } from "@/lib/apify/config";
import {
  APIFY_RUN_SYNC_DATASET_ITEMS_URL,
  APIFY_TIMEOUT_MS,
  buildApifyReelScraperInput,
} from "@/lib/apify/constants";
import {
  buildApifyFetchDiagnostics,
  logApifyFetchFailure,
} from "@/lib/apify/log-diagnostics";
import { mapApifyHttpStatusToError } from "@/lib/apify/map-http-error";
import {
  mapApifyItemToReelData,
  type ApifyReelItem,
} from "@/lib/apify/normalize";
import { parseApifyDatasetItems } from "@/lib/apify/parse-response";
import { findMatchingApifyItem } from "@/lib/apify/verify-identity";
import type { NormalizedReelData } from "@/types";

/**
 * Canonical server-side entry point for fetching an Instagram Reel via Apify.
 * Returns data for the requested URL only, or throws on failure / identity mismatch.
 */
export async function fetchReelByInstagramUrl(
  url: string
): Promise<NormalizedReelData> {
  const normalizedUrl = normalizeInstagramReelUrl(url);

  if (!isApifyConfigured() || !hasApifyToken()) {
    const error = new InstagramFetchError("NOT_CONFIGURED");
    logApifyFetchFailure(
      "fetchReelByInstagramUrl",
      buildApifyFetchDiagnostics(normalizedUrl, error)
    );
    throw error;
  }

  const token = process.env.APIFY_API_TOKEN!.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  let responseBody: unknown;
  let httpStatus: number | undefined;

  try {
    const response = await fetch(APIFY_RUN_SYNC_DATASET_ITEMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildApifyReelScraperInput(normalizedUrl)),
      signal: controller.signal,
    });

    httpStatus = response.status;
    const responseText = await response.text();

    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      throw mapApifyHttpStatusToError(
        response.status,
        responseText.slice(0, 200)
      );
    }

    if (!response.ok) {
      throw mapApifyHttpStatusToError(
        response.status,
        typeof responseBody === "object" && responseBody
          ? JSON.stringify(responseBody).slice(0, 200)
          : responseText.slice(0, 200)
      );
    }

    const items = parseApifyDatasetItems(responseBody);

    if (items.length === 0) {
      throw new InstagramFetchError("REEL_NOT_FOUND");
    }

    const item = findMatchingApifyItem(normalizedUrl, items);

    if (!item) {
      throw new InstagramFetchError("IDENTITY_MISMATCH");
    }

    return mapApifyItemToReelData(item, normalizedUrl);
  } catch (error) {
    const finalError =
      error instanceof InstagramFetchError
        ? error
        : error instanceof Error && error.name === "AbortError"
          ? new InstagramFetchError("TIMEOUT", undefined, error)
          : new InstagramFetchError("API_UNAVAILABLE", undefined, error);

    logApifyFetchFailure(
      "fetchReelByInstagramUrl",
      buildApifyFetchDiagnostics(normalizedUrl, finalError, {
        httpStatus,
        body: responseBody,
        items: Array.isArray(responseBody)
          ? (responseBody as ApifyReelItem[])
          : undefined,
      })
    );

    throw finalError;
  } finally {
    clearTimeout(timeoutId);
  }
}
