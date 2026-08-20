import type { Translator } from "@/lib/i18n";
import { InstagramFetchError, isInstagramFetchError } from "./errors";

export function getInstagramErrorMessage(
  error: unknown,
  t: Translator
): string {
  if (isInstagramFetchError(error)) {
    switch (error.code) {
      case "INVALID_URL":
        return t("instagram.errors.invalidUrl");
      case "REEL_NOT_FOUND":
        return t("instagram.errors.reelNotFound");
      case "API_UNAVAILABLE":
        return t("instagram.errors.apiUnavailable");
      case "TIMEOUT":
        return t("instagram.errors.timeout");
      case "RATE_LIMIT":
        return t("instagram.errors.rateLimit");
      case "MALFORMED_RESPONSE":
        return t("instagram.errors.malformedResponse");
      case "MISSING_STATISTICS":
        return t("instagram.errors.missingStatistics");
      case "NOT_CONFIGURED":
        return t("instagram.errors.notConfigured");
      case "IDENTITY_MISMATCH":
        return t("instagram.errors.identityMismatch");
      default:
        return t("instagram.errors.generic");
    }
  }

  return t("instagram.errors.generic");
}

export function toInstagramFetchError(error: unknown): InstagramFetchError {
  if (isInstagramFetchError(error)) {
    return error;
  }

  return new InstagramFetchError("API_UNAVAILABLE");
}
