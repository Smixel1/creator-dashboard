import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserReels } from "@/services/reels/reel-service";
import {
  addReelFromInstagramUrl,
  mapAddReelError,
  ReelAlreadyExistsError,
} from "@/services/reels/instagram-actions";
import { createReelUrlSchema } from "@/lib/validations";
import { normalizeInstagramReelUrl, isInstagramFetchError } from "@/services/instagram";
import { getRequestTranslator } from "@/lib/i18n/request";

export async function GET() {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const reels = await getUserReels(userId);
    return NextResponse.json(reels);
  } catch {
    return NextResponse.json(
      { error: t("api.loadReelsFailed") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createReelUrlSchema(t).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("api.invalidUrl") },
        { status: 400 }
      );
    }

    try {
      normalizeInstagramReelUrl(parsed.data.instagramUrl);
    } catch {
      return NextResponse.json({ error: t("api.invalidUrl") }, { status: 400 });
    }

    const reel = await addReelFromInstagramUrl(userId, parsed.data.instagramUrl);
    return NextResponse.json(reel, { status: 201 });
  } catch (error) {
    if (error instanceof ReelAlreadyExistsError) {
      return NextResponse.json(
        { error: t("api.reelAlreadyExists") },
        { status: 409 }
      );
    }

    if (isInstagramFetchError(error)) {
      console.error("[api/reels:POST]", {
        code: error.code,
        message: error.message.slice(0, 200),
      });
    } else {
      console.error("[api/reels:POST]", {
        errorType: error instanceof Error ? error.name : typeof error,
        message:
          error instanceof Error ? error.message.slice(0, 200) : "unknown",
      });
    }

    const message = mapAddReelError(error, t);
    const status = isInstagramFetchError(error) ? 422 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
