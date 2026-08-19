import { InstagramFetchError } from "./errors";

const REEL_PATH_PATTERN = /\/reels?\/([A-Za-z0-9_-]+)/i;

export function normalizeInstagramReelUrl(url: string): string {
  let parsed: URL;

  try {
    parsed = new URL(url.trim());
  } catch {
    throw new InstagramFetchError("INVALID_URL");
  }

  const hostname = parsed.hostname.replace(/^www\./, "");
  if (hostname !== "instagram.com") {
    throw new InstagramFetchError("INVALID_URL");
  }

  const match = parsed.pathname.match(REEL_PATH_PATTERN);
  if (!match?.[1]) {
    throw new InstagramFetchError("INVALID_URL");
  }

  return `https://www.instagram.com/reel/${match[1]}/`;
}

export function instagramUrlsMatch(a: string, b: string): boolean {
  try {
    return normalizeInstagramReelUrl(a) === normalizeInstagramReelUrl(b);
  } catch {
    return a.trim() === b.trim();
  }
}
