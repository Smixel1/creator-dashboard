/** Apify actor: apify/instagram-reel-scraper */
export const APIFY_INSTAGRAM_REEL_ACTOR = "apify~instagram-reel-scraper";

export const APIFY_RUN_SYNC_DATASET_ITEMS_URL = `https://api.apify.com/v2/acts/${APIFY_INSTAGRAM_REEL_ACTOR}/run-sync-get-dataset-items`;

export const APIFY_TIMEOUT_MS = 120_000;

/** Actor input for a single direct Reel URL (see Apify input schema). */
export function buildApifyReelScraperInput(reelUrl: string) {
  return {
    username: [reelUrl],
    resultsLimit: 1,
  };
}
