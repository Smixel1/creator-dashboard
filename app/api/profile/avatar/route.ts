import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { AVATAR_MAX_BYTES } from "@/lib/avatar/constants";
import {
  assertAllowedClientMime,
  AvatarValidationError,
} from "@/lib/avatar/validate";
import { saveUserAvatar } from "@/services/profile/avatar-service";
import type { Translator } from "@/lib/i18n";
import { getRequestTranslator } from "@/lib/i18n/request";

function mapAvatarError(error: unknown, t: Translator): string {
  if (error instanceof AvatarValidationError) {
    switch (error.code) {
      case "TOO_LARGE":
        return t("profile.imageTooLarge", { max: 2 });
      case "INVALID_TYPE":
        return t("profile.invalidImageType");
      default:
        return t("profile.uploadError");
    }
  }

  return t("api.avatarUploadFailed");
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const entry = formData.get("avatar");

    if (!(entry instanceof File) || entry.size === 0) {
      return NextResponse.json(
        { error: t("profile.uploadError") },
        { status: 400 }
      );
    }

    if (entry.size > AVATAR_MAX_BYTES) {
      return NextResponse.json(
        { error: t("profile.imageTooLarge", { max: 2 }) },
        { status: 400 }
      );
    }

    try {
      assertAllowedClientMime(entry.type);
    } catch {
      return NextResponse.json(
        { error: t("profile.invalidImageType") },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const avatarUrl = await saveUserAvatar(userId, buffer);

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("[profile/avatar]", error);
    const status = error instanceof AvatarValidationError ? 400 : 500;
    return NextResponse.json(
      { error: mapAvatarError(error, t) },
      { status }
    );
  }
}
