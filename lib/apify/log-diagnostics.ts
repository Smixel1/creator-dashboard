import { extractShortCodeFromUrl } from "@/lib/apify/extract-shortcode";
import { hasApifyToken, isApifyConfigured } from "@/lib/apify/config";
import type { ApifyReelItem } from "@/lib/apify/normalize";
import { isInstagramFetchError } from "@/services/instagram/errors";

function readShortCode(item: ApifyReelItem | undefined): string | null {
  if (!item) return null;
  const value = item.shortCode;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function summarizeApifyBody(body: unknown): Record<string, unknown> {
  if (Array.isArray(body)) {
    return {
      type: "array",
      length: body.length,
      shortCodes: body
        .slice(0, 5)
        .map((item) =>
          item && typeof item === "object"
            ? readShortCode(item as ApifyReelItem)
            : null
        ),
    };
  }

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    return {
      type: "object",
      keys: Object.keys(record).slice(0, 10),
      errorType:
        typeof record.error === "object" && record.error
          ? (record.error as Record<string, unknown>).type ?? null
          : typeof record.error === "string"
            ? record.error
            : null,
      message:
        typeof record.message === "string"
          ? record.message.slice(0, 200)
          : typeof record.error === "object" && record.error
            ? String(
                (record.error as Record<string, unknown>).message ?? ""
              ).slice(0, 200) || null
            : null,
    };
  }

  return { type: typeof body };
}

export interface ApifyFetchDiagnostics {
  useApify: boolean;
  hasApifyToken: boolean;
  requestedCanonicalUrl?: string;
  requestedShortCode?: string;
  httpStatus?: number;
  apifyBodySummary?: Record<string, unknown>;
  returnedItemCount?: number;
  returnedShortCode?: string | null;
  errorCode?: string;
  errorType?: string;
  errorMessage?: string;
}

export function logApifyFetchFailure(
  context: string,
  diagnostics: ApifyFetchDiagnostics
) {
  console.error(`[apify:${context}]`, diagnostics);
}

export function buildApifyFetchDiagnostics(
  requestedUrl: string,
  error: unknown,
  extras?: {
    httpStatus?: number;
    body?: unknown;
    items?: ApifyReelItem[];
    matchedItem?: ApifyReelItem | null;
  }
): ApifyFetchDiagnostics {
  let requestedShortCode: string | undefined;

  try {
    requestedShortCode = extractShortCodeFromUrl(requestedUrl);
  } catch {
    requestedShortCode = undefined;
  }

  const diagnostics: ApifyFetchDiagnostics = {
    useApify: process.env.USE_APIFY === "true",
    hasApifyToken: hasApifyToken(),
    requestedCanonicalUrl: requestedUrl,
    requestedShortCode,
    httpStatus: extras?.httpStatus,
    returnedItemCount: extras?.items?.length,
    returnedShortCode: readShortCode(extras?.matchedItem ?? undefined),
  };

  if (extras?.body !== undefined) {
    diagnostics.apifyBodySummary = summarizeApifyBody(extras.body);
  }

  if (isInstagramFetchError(error)) {
    diagnostics.errorCode = error.code;
    diagnostics.errorMessage = error.message;
  } else if (error instanceof Error) {
    diagnostics.errorType = error.name;
    diagnostics.errorMessage = error.message.slice(0, 200);
  }

  if (!isApifyConfigured()) {
    diagnostics.errorCode = diagnostics.errorCode ?? "NOT_CONFIGURED";
  }

  return diagnostics;
}
