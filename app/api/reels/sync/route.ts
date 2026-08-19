import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { syncUserReels } from "@/services/reels/instagram-actions";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function POST() {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const result = await syncUserReels(userId, t);

    if (result.total === 0) {
      return NextResponse.json(
        { error: t("reels.syncEmpty") },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: t("reels.syncFailed") }, { status: 500 });
  }
}
