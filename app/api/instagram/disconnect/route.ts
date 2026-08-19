import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getRequestTranslator } from "@/lib/i18n/request";
import { disconnectInstagram } from "@/services/instagram/sync-service";

export async function POST() {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    await disconnectInstagram(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/instagram/disconnect]", error);
    return NextResponse.json(
      { error: t("instagram.disconnectFailed") },
      { status: 500 }
    );
  }
}
