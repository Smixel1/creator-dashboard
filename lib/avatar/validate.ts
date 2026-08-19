import { randomBytes } from "crypto";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from "./constants";

export class AvatarValidationError extends Error {
  constructor(
    readonly code: "INVALID_TYPE" | "TOO_LARGE" | "INVALID_FILE"
  ) {
    super(code);
    this.name = "AvatarValidationError";
  }
}

type DetectedImageType = "jpeg" | "png" | "webp" | "gif";

const MIME_BY_TYPE: Record<DetectedImageType, AvatarMimeType> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const EXT_BY_TYPE: Record<DetectedImageType, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
};

function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return "gif";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

export function validateAvatarBuffer(buffer: Buffer): {
  mimeType: AvatarMimeType;
  extension: string;
} {
  if (!buffer.length) {
    throw new AvatarValidationError("INVALID_FILE");
  }

  if (buffer.length > AVATAR_MAX_BYTES) {
    throw new AvatarValidationError("TOO_LARGE");
  }

  const detected = detectImageType(buffer);
  if (!detected) {
    throw new AvatarValidationError("INVALID_TYPE");
  }

  return {
    mimeType: MIME_BY_TYPE[detected],
    extension: EXT_BY_TYPE[detected],
  };
}

export function assertAllowedClientMime(mimeType: string): void {
  if (
    !AVATAR_ALLOWED_MIME_TYPES.includes(mimeType as AvatarMimeType)
  ) {
    throw new AvatarValidationError("INVALID_TYPE");
  }
}

export function buildAvatarFilename(userId: string, extension: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const token = randomBytes(8).toString("hex");
  return `${safeUserId}-${Date.now()}-${token}.${extension}`;
}

export function isManagedAvatarUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^\/uploads\/avatars\/[a-zA-Z0-9._-]+$/.test(url);
}

export function avatarUrlBelongsToUser(url: string, userId: string): boolean {
  const filename = url.slice("/uploads/avatars/".length);
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return filename.startsWith(`${safeUserId}-`);
}
