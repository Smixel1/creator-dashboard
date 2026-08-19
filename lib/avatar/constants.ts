export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export const AVATAR_ACCEPT = AVATAR_ALLOWED_MIME_TYPES.join(",");

export const AVATAR_MAX_SIZE_MB = AVATAR_MAX_BYTES / (1024 * 1024);

export const AVATAR_PUBLIC_PREFIX = "/uploads/avatars/";
