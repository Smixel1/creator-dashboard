const DEFAULT_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
] as const;

export function isInstagramOAuthConfigured(): boolean {
  return Boolean(
    process.env.INSTAGRAM_CLIENT_ID?.trim() &&
      process.env.INSTAGRAM_CLIENT_SECRET?.trim() &&
      process.env.INSTAGRAM_REDIRECT_URI?.trim()
  );
}

export function getInstagramOAuthConfig() {
  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Instagram OAuth is not configured");
  }

  const scopes =
    process.env.INSTAGRAM_OAUTH_SCOPES?.split(",").map((s) => s.trim()) ??
    [...DEFAULT_SCOPES];

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    authorizeUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    graphBaseUrl: "https://graph.instagram.com",
  };
}

export function getAppBaseUrl(): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
