import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { destroySession, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChangePasswordSchema } from "@/lib/validations";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function PATCH(request: Request) {
  const { t } = await getRequestTranslator();

  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
    }

    const body = await request.json();
    const schema = createChangePasswordSchema(t);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
    }

    const validCurrent = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!validCurrent) {
      return NextResponse.json(
        { error: t("api.invalidCurrentPassword") },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await destroySession();

    return NextResponse.json({ success: true, reauth: true });
  } catch (error) {
    console.error("[settings/password]", error);
    return NextResponse.json(
      { error: t("api.passwordUpdateFailed") },
      { status: 500 }
    );
  }
}
