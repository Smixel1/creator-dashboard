import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getRequestTranslator } from "@/lib/i18n/request";
import {
  buildInstagramAuthorizeUrl,
  createInstagramConnectState,
  isInstagramOAuthConfigured,
} from "@/services/instagram/meta-oauth-service";

export async function GET() {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  if (!isInstagramOAuthConfigured()) {
    return NextResponse.json(
      { error: t("instagram.notConfigured") },
      { status: 503 }
    );
  }

  const state = await createInstagramConnectState(userId);
  const url = buildInstagramAuthorizeUrl(state);

  return NextResponse.redirect(url);
}
