import { NextResponse } from "next/server";
import { createResetPasswordSchema } from "@/lib/validations";
import { resetPasswordWithToken } from "@/services/auth/password-reset-service";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function POST(request: Request) {
  const { t } = await getRequestTranslator();

  try {
    const body = await request.json();
    const schema = createResetPasswordSchema(t);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.newPassword
    );

    if (result === "invalid") {
      return NextResponse.json(
        { error: t("passwordRecovery.invalidToken") },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/reset-password]", error);
    return NextResponse.json(
      { error: t("passwordRecovery.resetFailed") },
      { status: 500 }
    );
  }
}
