import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { AVATAR_PUBLIC_PREFIX } from "@/lib/avatar/constants";
import {
  AvatarStorageError,
  getAvatarStorageDiagnostics,
  hasBlobReadWriteToken,
  isBlobStorageEnabled,
  shouldUseLocalAvatarFilesystem,
} from "@/lib/avatar/storage-config";
import type { AvatarMimeType } from "@/lib/avatar/constants";
import {
  avatarUrlBelongsToUser,
  buildAvatarFilename,
  isManagedAvatarUrl,
  isVercelBlobAvatarUrl,
} from "@/lib/avatar/validate";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

async function ensureAvatarDir() {
  await mkdir(AVATAR_DIR, { recursive: true });
}

function getAvatarAbsolutePath(publicUrl: string): string {
  if (!isManagedAvatarUrl(publicUrl)) {
    throw new Error("Invalid avatar path");
  }

  const filename = publicUrl.slice(AVATAR_PUBLIC_PREFIX.length);
  const resolved = path.resolve(AVATAR_DIR, filename);

  if (!resolved.startsWith(AVATAR_DIR)) {
    throw new Error("Path traversal detected");
  }

  return resolved;
}

async function persistToFilesystem(
  userId: string,
  buffer: Buffer,
  extension: string
): Promise<string> {
  await ensureAvatarDir();

  const filename = buildAvatarFilename(userId, extension);
  const publicUrl = `${AVATAR_PUBLIC_PREFIX}${filename}`;
  const absolutePath = path.join(AVATAR_DIR, filename);

  await writeFile(absolutePath, buffer);
  return publicUrl;
}

function isBlobCredentialError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("no blob credentials found") ||
    message.includes("no read-write token found")
  );
}

function getBlobHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function mapBlobUploadError(error: unknown): AvatarStorageError {
  if (isBlobCredentialError(error)) {
    return new AvatarStorageError("NOT_CONFIGURED");
  }

  return new AvatarStorageError("UPLOAD_FAILED");
}

async function persistToBlob(
  userId: string,
  buffer: Buffer,
  extension: string,
  mimeType: AvatarMimeType
): Promise<string> {
  const filename = buildAvatarFilename(userId, extension);
  const pathname = `avatars/${filename}`;

  try {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });

    if (!blob.url) {
      throw new AvatarStorageError("UPLOAD_FAILED");
    }

    return blob.url;
  } catch (error) {
    const diagnostics = getAvatarStorageDiagnostics();
    console.error("[avatar/storage]", {
      errorCode: isBlobCredentialError(error)
        ? "NOT_CONFIGURED"
        : "UPLOAD_FAILED",
      httpStatus: getBlobHttpStatus(error),
      storageProvider: diagnostics.storageProvider,
      hasBlobToken: diagnostics.hasBlobToken,
      fileType: mimeType,
      fileSize: buffer.length,
    });

    throw mapBlobUploadError(error);
  }
}

export async function persistAvatarFile(
  userId: string,
  buffer: Buffer,
  extension: string,
  mimeType: AvatarMimeType
): Promise<string> {
  if (isBlobStorageEnabled()) {
    return persistToBlob(userId, buffer, extension, mimeType);
  }

  if (shouldUseLocalAvatarFilesystem()) {
    return persistToFilesystem(userId, buffer, extension);
  }

  console.error("[avatar/storage]", {
    errorCode: "NOT_CONFIGURED",
    storageProvider: "none",
    hasBlobToken: hasBlobReadWriteToken(),
    fileType: mimeType,
    fileSize: buffer.length,
  });

  throw new AvatarStorageError("NOT_CONFIGURED");
}

export async function deleteStoredAvatar(
  avatarUrl: string | null | undefined,
  userId: string
): Promise<void> {
  if (!avatarUrl || !avatarUrlBelongsToUser(avatarUrl, userId)) {
    return;
  }

  if (isManagedAvatarUrl(avatarUrl)) {
    try {
      await unlink(getAvatarAbsolutePath(avatarUrl));
    } catch {
      // Missing local files are fine.
    }
    return;
  }

  if (isVercelBlobAvatarUrl(avatarUrl) && isBlobStorageEnabled()) {
    try {
      const { del } = await import("@vercel/blob");
      await del(avatarUrl);
    } catch {
      // DB remains source of truth if remote delete fails.
    }
  }
}
