import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, getSessionUserId } from "@/lib/auth";
import { getProfileStats } from "@/services/reels/reel-service";
import { prisma } from "@/lib/prisma";
import { createProfileSchema } from "@/lib/validations";
import { getRequestTranslator } from "@/lib/i18n/request";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";
export async function GET() {
  const user = await getSessionUser();
  const { t } = await getRequestTranslator();

  if (!user) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const stats = await getProfileStats(user.id);
    return NextResponse.json({ user, stats });
  } catch {
    return NextResponse.json(
      { error: t("api.loadProfileFailed") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createProfileSchema(t).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        instagramUsername: parsed.data.instagramUsername || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        instagramUsername: true,
        createdAt: true,
      },
    });

    const cookieStore = await cookies();
    const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

    return NextResponse.json({
      user: { ...user, locale, createdAt: user.createdAt.toISOString() },
    });
  } catch {
    return NextResponse.json(
      { error: t("api.updateProfileFailed") },
      { status: 500 }
    );
  }
}
