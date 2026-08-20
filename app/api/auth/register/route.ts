import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthConfigReady, logAuthError } from "@/lib/auth/log-auth-error";
import { normalizeAuthEmail } from "@/lib/auth/normalize-email";
import { createAuthenticatedResponse } from "@/lib/auth-session";
import { createRegisterSchema } from "@/lib/validations";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/request";

export async function POST(request: Request) {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  if (!isAuthConfigReady()) {
    console.error("[auth/register] AUTH_SECRET is not configured");
    return NextResponse.json(
      { error: t("register.registerFailed") },
      { status: 500 }
    );
  }

  try {
    const registerSchema = createRegisterSchema(t);
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const email = normalizeAuthEmail(parsed.data.email);
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: t("register.emailExists") },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
      },
      select: { id: true },
    });

    return createAuthenticatedResponse(user.id, locale);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: t("register.emailExists") },
        { status: 409 }
      );
    }

    logAuthError("auth/register", error);
    return NextResponse.json(
      { error: t("register.registerFailed") },
      { status: 500 }
    );
  }
}
