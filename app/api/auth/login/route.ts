import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAuthConfigReady, logAuthError } from "@/lib/auth/log-auth-error";
import { normalizeAuthEmail } from "@/lib/auth/normalize-email";
import { createAuthenticatedResponse } from "@/lib/auth-session";
import { createLoginSchema } from "@/lib/validations";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/request";

export async function POST(request: Request) {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  if (!isAuthConfigReady()) {
    console.error("[auth/login] AUTH_SECRET is not configured");
    return NextResponse.json({ error: t("login.loginFailed") }, { status: 500 });
  }

  try {
    const loginSchema = createLoginSchema(t);
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const email = normalizeAuthEmail(parsed.data.email);
    const { password } = parsed.data;
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

    return createAuthenticatedResponse(user.id, locale);
  } catch (error) {
    logAuthError("auth/login", error);
    return NextResponse.json({ error: t("login.loginFailed") }, { status: 500 });
  }
}
