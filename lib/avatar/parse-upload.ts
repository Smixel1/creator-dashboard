import { AVATAR_MAX_BYTES } from "@/lib/avatar/constants";
import {
  assertAllowedClientMime,
  AvatarValidationError,
} from "@/lib/avatar/validate";

export type AvatarUploadParseErrorCode =
  | "MISSING_FILE"
  | "TOO_LARGE"
  | "INVALID_TYPE";

export type AvatarUploadParseResult =
  | {
      ok: true;
      buffer: Buffer;
      clientMime: string;
      fileSize: number;
    }
  | {
      ok: false;
      code: AvatarUploadParseErrorCode;
    };

export function isAvatarUploadEntry(
  entry: FormDataEntryValue | null
): entry is File {
  if (!entry || typeof entry === "string") {
    return false;
  }

  return entry.size > 0;
}

export async function parseAvatarUploadEntry(
  entry: FormDataEntryValue | null
): Promise<AvatarUploadParseResult> {
  if (!isAvatarUploadEntry(entry)) {
    return { ok: false, code: "MISSING_FILE" };
  }

  if (entry.size > AVATAR_MAX_BYTES) {
    return { ok: false, code: "TOO_LARGE" };
  }

  const clientMime = entry.type?.trim() ?? "";
  if (clientMime) {
    try {
      assertAllowedClientMime(clientMime);
    } catch (error) {
      if (error instanceof AvatarValidationError) {
        return { ok: false, code: "INVALID_TYPE" };
      }
      throw error;
    }
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  if (!buffer.length) {
    return { ok: false, code: "MISSING_FILE" };
  }

  return {
    ok: true,
    buffer,
    clientMime,
    fileSize: entry.size,
  };
}
