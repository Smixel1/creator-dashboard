import { InstagramFetchError } from "@/services/instagram/errors";

export function mapApifyHttpStatusToError(
  status: number,
  bodyText?: string
): InstagramFetchError {
  const detail = bodyText?.trim().slice(0, 200);

  switch (status) {
    case 401:
      return new InstagramFetchError(
        "NOT_CONFIGURED",
        detail || "Apify token rejected (401)"
      );
    case 403:
      return new InstagramFetchError(
        "API_UNAVAILABLE",
        detail || "Apify access denied (403)"
      );
    case 404:
      return new InstagramFetchError(
        "API_UNAVAILABLE",
        detail || "Apify actor endpoint not found (404)"
      );
    case 408:
    case 504:
      return new InstagramFetchError("TIMEOUT", detail);
    case 429:
      return new InstagramFetchError("RATE_LIMIT", detail);
    case 400:
      return new InstagramFetchError(
        "MALFORMED_RESPONSE",
        detail || "Apify rejected request input (400)"
      );
    default:
      if (status >= 500) {
        return new InstagramFetchError(
          "API_UNAVAILABLE",
          detail || `Apify server error (${status})`
        );
      }
      return new InstagramFetchError(
        "API_UNAVAILABLE",
        detail || `Apify request failed (${status})`
      );
  }
}
