export class AvatarStorageError extends Error {
  constructor(
    readonly code: "NOT_CONFIGURED" | "UPLOAD_FAILED" | "DELETE_FAILED"
  ) {
    super(code);
    this.name = "AvatarStorageError";
  }
}

export function isAvatarStorageError(
  error: unknown
): error is AvatarStorageError {
  return error instanceof AvatarStorageError;
}

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function shouldUseLocalAvatarFilesystem(): boolean {
  return process.env.NODE_ENV !== "production" || !isBlobStorageEnabled();
}
