import {
  hasApifyToken,
  isApifyConfigured,
  isApifyEnabled,
  isApifyUnavailable,
} from "@/lib/apify/config";

export {
  hasApifyToken,
  isApifyConfigured,
  isApifyEnabled,
  isApifyUnavailable,
};

/** True when URL import / refresh via Apify is unavailable. */
export function isInstagramDemoMode(): boolean {
  return isApifyUnavailable();
}

export type InstagramDataSource = "apify" | "unavailable";

export function getInstagramDataSource(): InstagramDataSource {
  return isApifyConfigured() ? "apify" : "unavailable";
}
