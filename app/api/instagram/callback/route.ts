import { NextResponse } from "next/server";
import { verifyInstagramOAuthState } from "@/lib/instagram/oauth/state";
import { getSessionUserId } from "@/lib/auth";
import {
  exchangeInstagramAuthCode,
  mapInstagramOAuthCallbackError,
} from "@/services/instagram/meta-oauth-service";
import { completeInstagramOAuth } from "@/services/instagram/sync-service";
import { InstagramApiError } from "@/services/instagram/meta-api-client";

function redirectToProfile(request: Request, status: string) {
  const base = new URL(request.url).origin;
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
    return redirectToProfile(request, mapped);
  }

  if (!code || !state) {
    return redirectToProfile(request, "oauth_failed");
  }

  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return redirectToProfile(request, "session_required");
  }

  try {
    const { userId } = await verifyInstagramOAuthState(state);

    if (userId !== sessionUserId) {
      return redirectToProfile(request, "oauth_failed");
    }

    const tokens = await exchangeInstagramAuthCode(code);
    await completeInstagramOAuth(
      userId,
      tokens.accessToken,
      tokens.tokenExpiresAt,
      tokens.instagramUserId
    );

    return redirectToProfile(request, "connected");
  } catch (err) {
    if (err instanceof InstagramApiError) {
      if (err.code === "PERSONAL_ACCOUNT") {
        return redirectToProfile(request, "professional_required");
      }
      if (err.status === 429) {
        return redirectToProfile(request, "rate_limited");
      }
    }

    console.error("[api/instagram/callback]", err instanceof Error ? err.message : err);
    return redirectToProfile(request, "oauth_failed");
  }
}
