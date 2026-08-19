import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getReelById, deleteReel } from "@/services/reels/reel-service";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function GET(
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
    const reel = await getReelById(userId, id);
    if (!reel) {
      return NextResponse.json(
        { error: t("api.reelNotFound") },
        { status: 404 }
      );
    }
    return NextResponse.json(reel);
  } catch {
    return NextResponse.json(
      { error: t("api.loadReelsFailed") },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await deleteReel(userId, id);
    if (!deleted) {
      return NextResponse.json(
        { error: t("api.reelNotFound") },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: t("api.deleteReelFailed") },
      { status: 500 }
    );
  }
}
