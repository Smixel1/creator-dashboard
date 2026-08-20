import { prisma } from "@/lib/prisma";
import {
  AvatarStorageError,
  isAvatarStorageError,
} from "@/lib/avatar/storage-config";
import { deleteStoredAvatar, persistAvatarFile } from "@/lib/avatar/storage";
import { validateAvatarBuffer } from "@/lib/avatar/validate";

export async function saveUserAvatar(
  userId: string,
  fileBuffer: Buffer
): Promise<string> {
  const { extension, mimeType } = validateAvatarBuffer(fileBuffer);

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (!existing) {
    throw new Error("User not found");
  }

  const publicUrl = await persistAvatarFile(
    userId,
    fileBuffer,
    extension,
    mimeType
  );

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
    });
  } catch (error) {
    await deleteStoredAvatar(publicUrl, userId).catch(() => undefined);
    throw error;
  }

  if (existing.avatarUrl) {
    await deleteStoredAvatar(existing.avatarUrl, userId);
  }

  return publicUrl;
}

export { AvatarStorageError, isAvatarStorageError };
