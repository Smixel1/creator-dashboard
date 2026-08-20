import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { AVATAR_MAX_SIZE_MB } from "@/lib/avatar/constants";
import {
  getAvatarStorageDiagnostics,
  isAvatarStorageError,
} from "@/lib/avatar/storage-config";
import {
  parseAvatarUploadEntry,
  type AvatarUploadParseErrorCode,
} from "@/lib/avatar/parse-upload";
import {
  AvatarValidationError,
} from "@/lib/avatar/validate";
import { saveUserAvatar } from "@/services/profile/avatar-service";
import type { Translator } from "@/lib/i18n";
import { getRequestTranslator } from "@/lib/i18n/request";

function mapParseError(code: AvatarUploadParseErrorCode, t: Translator): string {
  switch (code) {
    case "TOO_LARGE":
      return t("profile.imageTooLarge", { max: AVATAR_MAX_SIZE_MB });
    case "INVALID_TYPE":
      return t("profile.invalidImageType");
    default:
      return t("profile.uploadError");
  }
}

function mapAvatarError(error: unknown, t: Translator): string {
  if (error instanceof AvatarValidationError) {
    switch (error.code) {
      case "TOO_LARGE":
        return t("profile.imageTooLarge", { max: AVATAR_MAX_SIZE_MB });
      case "INVALID_TYPE":
        return t("profile.invalidImageType");
      default:
        return t("profile.uploadError");
    }
  }

  if (isAvatarStorageError(error)) {
    if (error.code === "NOT_CONFIGURED") {
      return t("profile.uploadNotConfigured");
    }
    return t("profile.uploadError");
  }

  return t("api.avatarUploadFailed");
}

function getErrorStatus(error: unknown): number {
  if (error instanceof AvatarValidationError) {
    return 400;
  }

  if (isAvatarStorageError(error)) {
    if (error.code === "NOT_CONFIGURED") {
      return 503;
    }
    return 500;
  }

  return 500;
}

function logAvatarUploadFailure(
  error: unknown,
  context: {
    fileType?: string;
    fileSize?: number;
  }
) {
  const diagnostics = getAvatarStorageDiagnostics();
  console.error("[profile/avatar]", {
    errorCode:
      error instanceof AvatarValidationError
        ? error.code
        : isAvatarStorageError(error)
          ? error.code
          : error instanceof Error
            ? error.name
            : "UNKNOWN",
    httpStatus: getErrorStatus(error),
    storageProvider: diagnostics.storageProvider,
    hasBlobToken: diagnostics.hasBlobToken,
    fileType: context.fileType,
    fileSize: context.fileSize,
  });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  let fileType: string | undefined;
  let fileSize: number | undefined;

  try {
    const formData = await request.formData();
    const parsed = await parseAvatarUploadEntry(formData.get("avatar"));

    if (!parsed.ok) {
      logAvatarUploadFailure(new Error(parsed.code), {});
      return NextResponse.json(
        { error: mapParseError(parsed.code, t) },
        { status: 400 }
      );
    }

    fileType = parsed.clientMime || undefined;
    fileSize = parsed.fileSize;

    const avatarUrl = await saveUserAvatar(userId, parsed.buffer);

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    logAvatarUploadFailure(error, { fileType, fileSize });
    return NextResponse.json(
      { error: mapAvatarError(error, t) },
      { status: getErrorStatus(error) }
    );
  }
}
