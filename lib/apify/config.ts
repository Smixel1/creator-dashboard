/** Server-side Apify configuration (never expose token to client). */

export function hasApifyToken(): boolean {
  return Boolean(process.env.APIFY_API_TOKEN?.trim());
}

export function isApifyConfigured(): boolean {
  return process.env.USE_APIFY === "true" && hasApifyToken();
}

export function isApifyEnabled(): boolean {
  return isApifyConfigured();
}

/** True when URL import / refresh via Apify is unavailable. */
export function isApifyUnavailable(): boolean {
  return !isApifyConfigured();
}
