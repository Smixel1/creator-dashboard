import { NextResponse } from "next/server";
import { createForgotPasswordSchema } from "@/lib/validations";
import { requestPasswordReset } from "@/services/auth/password-reset-service";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function POST(request: Request) {
  const { t } = await getRequestTranslator();

  try {
    const body = await request.json();
    const schema = createForgotPasswordSchema(t);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("validation.invalidData") },
        { status: 400 }
      );
    }

    await requestPasswordReset(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/forgot-password]", error);
    return NextResponse.json(
      { error: t("passwordRecovery.requestFailed") },
      { status: 500 }
    );
  }
}
