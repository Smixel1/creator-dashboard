import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import {
  mapSyncReelError,
  ReelNotFoundError,
  syncSingleReel,
} from "@/services/reels/instagram-actions";
import { isInstagramFetchError } from "@/services/instagram";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  const { id } = await params;

  try {
    const reel = await syncSingleReel(userId, id);
    return NextResponse.json(reel);
  } catch (error) {
    if (error instanceof ReelNotFoundError) {
      return NextResponse.json(
        { error: t("api.reelNotFound") },
        { status: 404 }
      );
    }

    const message = mapSyncReelError(error, t);
    const status = isInstagramFetchError(error) ? 422 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
