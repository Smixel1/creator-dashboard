import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { AVATAR_PUBLIC_PREFIX } from "@/lib/avatar/constants";
import {
  avatarUrlBelongsToUser,
  buildAvatarFilename,
  isManagedAvatarUrl,
  validateAvatarBuffer,
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

async function deleteManagedAvatar(publicUrl: string, userId: string) {
  if (!isManagedAvatarUrl(publicUrl) || !avatarUrlBelongsToUser(publicUrl, userId)) {
    return;
  }

  try {
    await unlink(getAvatarAbsolutePath(publicUrl));
  } catch {
    // Ignore missing files — DB remains source of truth.
  }
}

export async function saveUserAvatar(
  userId: string,
  fileBuffer: Buffer
): Promise<string> {
  const { extension } = validateAvatarBuffer(fileBuffer);
  await ensureAvatarDir();

  const filename = buildAvatarFilename(userId, extension);
  const publicUrl = `${AVATAR_PUBLIC_PREFIX}${filename}`;
  const absolutePath = path.join(AVATAR_DIR, filename);

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (!existing) {
    throw new Error("User not found");
  }

  await writeFile(absolutePath, fileBuffer);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
    });
  } catch (error) {
    await unlink(absolutePath).catch(() => undefined);
    throw error;
  }

  if (existing.avatarUrl) {
    await deleteManagedAvatar(existing.avatarUrl, userId);
  }

  return publicUrl;
}
