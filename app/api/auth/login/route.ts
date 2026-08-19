import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth-session";
import { createLoginSchema } from "@/lib/validations";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/request";
import {
  getLocaleCookieOptions,
  LOCALE_COOKIE,
} from "@/lib/locale-cookie";

export async function POST(request: Request) {
  try {
    const locale = await getRequestLocale();
    const t = createTranslator(locale);
    const loginSchema = createLoginSchema(t);

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: t("login.invalidCredentials") },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: t("login.invalidCredentials") },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, token, getSessionCookieOptions());
    response.cookies.set(LOCALE_COOKIE, locale, getLocaleCookieOptions());
    return response;
  } catch (error) {
    console.error("[auth/login]", error);
    const t = createTranslator(await getRequestLocale());
    return NextResponse.json(
      { error: t("login.loginFailed") },
      { status: 500 }
    );
  }
}
