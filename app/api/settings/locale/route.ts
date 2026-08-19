import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOCALES } from "@/lib/i18n";
import { getRequestTranslator } from "@/lib/i18n/request";
import {
  getLocaleCookieOptions,
  LOCALE_COOKIE,
  parseLocale,
} from "@/lib/locale-cookie";

const localeSchema = z.object({
  locale: z.enum(["ru", "en"]),
});

export async function PATCH(request: Request) {
  const { t } = await getRequestTranslator();

  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
    }

    const body = await request.json();
    const parsed = localeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: t("api.invalidLocale") },
        { status: 400 }
      );
    }

    const locale = parseLocale(parsed.data.locale);
    if (!LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: t("api.invalidLocale") },
        { status: 400 }
      );
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { locale },
      });
    } catch (dbError) {
      console.warn("[settings/locale] DB update skipped:", dbError);
    }

    const response = NextResponse.json({ success: true, locale });
    response.cookies.set(LOCALE_COOKIE, locale, getLocaleCookieOptions());
    return response;
  } catch (error) {
    console.error("[settings/locale]", error);
    return NextResponse.json(
      { error: t("api.localeUpdateFailed") },
      { status: 500 }
    );
  }
}
