import { InstagramFetchError } from "@/services/instagram/errors";

const REEL_PATH_PATTERN = /\/reels?\/([A-Za-z0-9_-]+)/i;

/** Extract Instagram Reel shortcode from a canonical or raw URL. */
export function extractShortCodeFromUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    const match = parsed.pathname.match(REEL_PATH_PATTERN);
    if (!match?.[1]) {
      throw new InstagramFetchError("INVALID_URL");
    }
    return match[1];
  } catch (error) {
    if (error instanceof InstagramFetchError) {
      throw error;
    }
    throw new InstagramFetchError("INVALID_URL");
  }
}

export function shortCodesMatch(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
