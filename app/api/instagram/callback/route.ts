import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/instagram/oauth/config";
import { verifyInstagramOAuthState } from "@/lib/instagram/oauth/state";
import { getSessionUserId } from "@/lib/auth";
import {
  exchangeInstagramAuthCode,
  mapInstagramOAuthCallbackError,
} from "@/services/instagram/meta-oauth-service";
import { completeInstagramOAuth } from "@/services/instagram/sync-service";
import { InstagramApiError } from "@/services/instagram/meta-api-client";

function redirectToProfile(status: string) {
  const base = getAppBaseUrl();
  return NextResponse.redirect(`${base}/profile?instagram=${status}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) {
    const mapped = mapInstagramOAuthCallbackError(error, errorReason);
    return redirectToProfile(mapped);
  }

  if (!code || !state) {
    return redirectToProfile("oauth_failed");
  }

  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return redirectToProfile("session_required");
  }

  try {
    const { userId } = await verifyInstagramOAuthState(state);

    if (userId !== sessionUserId) {
      return redirectToProfile("oauth_failed");
    }

    const tokens = await exchangeInstagramAuthCode(code);
    await completeInstagramOAuth(
      userId,
      tokens.accessToken,
      tokens.tokenExpiresAt,
      tokens.instagramUserId
    );

    return redirectToProfile("connected");
  } catch (err) {
    if (err instanceof InstagramApiError) {
      if (err.code === "PERSONAL_ACCOUNT") {
        return redirectToProfile("professional_required");
      }
      if (err.status === 429) {
        return redirectToProfile("rate_limited");
      }
    }

    console.error("[api/instagram/callback]", err instanceof Error ? err.message : err);
    return redirectToProfile("oauth_failed");
  }
}
