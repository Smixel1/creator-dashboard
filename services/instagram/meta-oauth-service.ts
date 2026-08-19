import {
  getInstagramOAuthConfig,
  isInstagramOAuthConfigured,
} from "@/lib/instagram/oauth/config";
import { createInstagramOAuthState } from "@/lib/instagram/oauth/state";
import {
  exchangeForLongLivedToken,
  InstagramApiError,
} from "@/services/instagram/meta-api-client";

export { isInstagramOAuthConfigured };

interface ShortLivedTokenResponse {
  access_token: string;
  user_id: string | number;
}

export function buildInstagramAuthorizeUrl(state: string): string {
  const { authorizeUrl, clientId, redirectUri, scopes } =
    getInstagramOAuthConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(","),
    response_type: "code",
    state,
  });

  return `${authorizeUrl}?${params.toString()}`;
}

export async function createInstagramConnectState(userId: string): Promise<string> {
  return createInstagramOAuthState(userId);
}

export async function exchangeInstagramAuthCode(code: string): Promise<{
  accessToken: string;
  instagramUserId: string;
  tokenExpiresAt: Date;
}> {
  const { tokenUrl, clientId, clientSecret, redirectUri } =
    getInstagramOAuthConfig();

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const payload = (await res.json()) as ShortLivedTokenResponse & {
    error_type?: string;
    error_message?: string;
  };

  if (!res.ok || !payload.access_token) {
    throw new InstagramApiError(
      payload.error_message ?? "Instagram authorization failed",
      payload.error_type,
      res.status
    );
  }

  const longLived = await exchangeForLongLivedToken(payload.access_token);
  const tokenExpiresAt = new Date(Date.now() + longLived.expiresIn * 1000);

  return {
    accessToken: longLived.accessToken,
    instagramUserId: String(payload.user_id),
    tokenExpiresAt,
  };
}

export function mapInstagramOAuthCallbackError(
  error: string | null,
  reason: string | null
): string {
  if (error === "access_denied") {
    return "access_denied";
  }
  if (reason === "user_denied") {
    return "access_denied";
  }
  return "oauth_failed";
}
