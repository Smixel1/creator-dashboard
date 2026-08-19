export type InstagramErrorCode =
  | "INVALID_URL"
  | "REEL_NOT_FOUND"
  | "API_UNAVAILABLE"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "MALFORMED_RESPONSE"
  | "MISSING_STATISTICS"
  | "NOT_CONFIGURED";

export class InstagramFetchError extends Error {
  readonly code: InstagramErrorCode;

  constructor(
    code: InstagramErrorCode,
    message?: string,
    cause?: unknown
  ) {
    super(message ?? code);
    this.name = "InstagramFetchError";
    this.code = code;
    if (cause instanceof Error && cause.stack) {
      this.cause = cause;
    }
  }
}

export function isInstagramFetchError(
  error: unknown
): error is InstagramFetchError {
  return error instanceof InstagramFetchError;
}
