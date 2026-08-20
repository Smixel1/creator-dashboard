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

export type AvatarStorageProvider = "blob" | "local" | "none";

export function hasBlobReadWriteToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function hasBlobStoreId(): boolean {
  return Boolean(process.env.BLOB_STORE_ID?.trim());
}

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function isBlobStorageEnabled(): boolean {
  return hasBlobReadWriteToken() || hasBlobStoreId();
}

export function shouldUseLocalAvatarFilesystem(): boolean {
  return process.env.NODE_ENV !== "production" && !isBlobStorageEnabled();
}

export function getAvatarStorageProvider(): AvatarStorageProvider {
  if (isBlobStorageEnabled()) {
    return "blob";
  }

  if (shouldUseLocalAvatarFilesystem()) {
    return "local";
  }

  return "none";
}

export function getAvatarStorageDiagnostics() {
  return {
    storageProvider: getAvatarStorageProvider(),
    hasBlobToken: hasBlobReadWriteToken(),
    hasBlobStoreId: hasBlobStoreId(),
    isVercelRuntime: isVercelRuntime(),
  };
}
