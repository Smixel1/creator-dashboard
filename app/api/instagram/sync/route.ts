import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getRequestTranslator } from "@/lib/i18n/request";
import { isInstagramOAuthConfigured } from "@/services/instagram/meta-oauth-service";
import { syncInstagramAccount } from "@/services/instagram/sync-service";
import { InstagramApiError } from "@/services/instagram/meta-api-client";
import { getInstagramConnectionPublic } from "@/services/instagram/connection-service";

export async function POST() {
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

  const connection = await getInstagramConnectionPublic(userId);
  if (connection.status === "not_connected") {
    return NextResponse.json(
      { error: t("instagram.notConnected") },
      { status: 400 }
    );
  }

  if (connection.status === "expired") {
    return NextResponse.json(
      { error: t("instagram.connectionExpired") },
      { status: 401 }
    );
  }

  try {
    const result = await syncInstagramAccount(userId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InstagramApiError) {
      if (error.code === "PERSONAL_ACCOUNT") {
        return NextResponse.json(
          { error: t("instagram.professionalRequired") },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: t("instagram.rateLimited") },
          { status: 429 }
        );
      }
      if (error.code === "NOT_CONNECTED") {
        return NextResponse.json(
          { error: t("instagram.notConnected") },
          { status: 400 }
        );
      }
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: t("instagram.connectionExpired") },
          { status: 401 }
        );
      }
    }

    console.error("[api/instagram/sync]", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: t("instagram.syncFailed") },
      { status: 500 }
    );
  }
}
