import { getInstagramOAuthConfig } from "@/lib/instagram/oauth/config";

export class InstagramApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "InstagramApiError";
  }
}

export interface InstagramProfile {
  id: string;
  username: string;
  accountType?: string;
  followersCount?: number;
  profilePictureUrl?: string;
}

export interface InstagramMediaInsights {
  views?: number;
  reach?: number;
  shares?: number;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  mediaType: string;
  mediaProductType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string;
  likeCount?: number;
  commentsCount?: number;
  username?: string;
  insights?: InstagramMediaInsights;
}

/** Official Reels marker: Instagram Graph `media_product_type` (not `media_type`). */
export function isInstagramReel(
  item: Pick<InstagramMediaItem, "mediaProductType">
): boolean {
  const productType = item.mediaProductType?.toUpperCase();
  return productType === "REELS" || productType === "REEL";
}

function mapApiError(status: number, body: unknown): InstagramApiError {
  const payload = body as {
    error?: { message?: string; code?: number; type?: string };
  };
  const message = payload.error?.message ?? "Instagram API request failed";
  const code = payload.error?.type ?? String(payload.error?.code ?? status);
  return new InstagramApiError(message, code, status);
}

function mapMediaItem(item: Record<string, unknown>): InstagramMediaItem {
  return {
    id: String(item.id),
    caption: typeof item.caption === "string" ? item.caption : undefined,
    mediaType: String(item.media_type ?? "UNKNOWN"),
    mediaProductType:
      typeof item.media_product_type === "string"
        ? item.media_product_type
        : undefined,
    mediaUrl: typeof item.media_url === "string" ? item.media_url : undefined,
    thumbnailUrl:
      typeof item.thumbnail_url === "string" ? item.thumbnail_url : undefined,
    permalink: typeof item.permalink === "string" ? item.permalink : undefined,
    timestamp: typeof item.timestamp === "string" ? item.timestamp : undefined,
    likeCount: typeof item.like_count === "number" ? item.like_count : undefined,
    commentsCount:
      typeof item.comments_count === "number" ? item.comments_count : undefined,
    username: typeof item.username === "string" ? item.username : undefined,
  };
}

export async function fetchInstagramProfile(
  accessToken: string
): Promise<InstagramProfile> {
  const { graphBaseUrl } = getInstagramOAuthConfig();
  const url = new URL(`${graphBaseUrl}/v21.0/me`);
  url.searchParams.set(
    "fields",
    "user_id,username,account_type,followers_count,profile_picture_url"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const body = await res.json();

  if (!res.ok) {
    throw mapApiError(res.status, body);
  }

  const accountType = body.account_type as string | undefined;
  if (accountType && accountType === "PERSONAL") {
    throw new InstagramApiError(
      "Professional Instagram account required",
      "PERSONAL_ACCOUNT"
    );
  }

  return {
    id: String(body.user_id ?? body.id),
    username: body.username,
    accountType,
    followersCount:
      typeof body.followers_count === "number" ? body.followers_count : undefined,
    profilePictureUrl: body.profile_picture_url,
  };
}

export async function fetchInstagramMediaInsights(
  mediaId: string,
  accessToken: string,
  mediaProductType?: string
): Promise<InstagramMediaInsights> {
  if (!isInstagramReel({ mediaProductType })) {
    return {};
  }

  const { graphBaseUrl } = getInstagramOAuthConfig();
  const url = new URL(`${graphBaseUrl}/v21.0/${mediaId}/insights`);
  url.searchParams.set("metric", "views,reach,shares");
  url.searchParams.set("access_token", accessToken);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = (await res.json()) as {
      data?: { name?: string; values?: { value?: number }[] }[];
      error?: { message?: string };
    };

    if (!res.ok) {
      console.warn(
        `[instagram/insights] media ${mediaId}: ${body.error?.message ?? res.status}`
      );
      return {};
    }

    const insights: InstagramMediaInsights = {};
    for (const metric of body.data ?? []) {
      const value = metric.values?.[0]?.value;
      if (typeof value !== "number" || !Number.isFinite(value)) continue;

      const normalized = Math.max(0, Math.floor(value));
      switch (metric.name) {
        case "views":
          insights.views = normalized;
          break;
        case "reach":
          insights.reach = normalized;
          break;
        case "shares":
          insights.shares = normalized;
          break;
        default:
          break;
      }
    }

    return insights;
  } catch (error) {
    console.warn(
      `[instagram/insights] media ${mediaId}:`,
      error instanceof Error ? error.message : error
    );
    return {};
  }
}

export async function fetchInstagramMedia(
  accessToken: string,
  maxItems = 50
): Promise<InstagramMediaItem[]> {
  const { graphBaseUrl } = getInstagramOAuthConfig();
  const pageSize = Math.min(25, maxItems);
  let nextUrl: string | null = new URL(`${graphBaseUrl}/v21.0/me/media`).toString();
  const collected: InstagramMediaItem[] = [];

  while (nextUrl && collected.length < maxItems) {
    const url = new URL(nextUrl);
    if (!url.searchParams.has("limit")) {
      url.searchParams.set("limit", String(pageSize));
    }
    if (!url.searchParams.has("fields")) {
      url.searchParams.set(
        "fields",
        "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,username"
      );
    }
    if (!url.searchParams.has("access_token")) {
      url.searchParams.set("access_token", accessToken);
    }

    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = (await res.json()) as {
      data?: Record<string, unknown>[];
      paging?: { next?: string };
      error?: { message?: string };
    };

    if (!res.ok) {
      throw mapApiError(res.status, body);
    }

    const pageItems = (body.data ?? []).map(mapMediaItem);
    collected.push(...pageItems);
    nextUrl = body.paging?.next ?? null;
  }

  return collected.slice(0, maxItems);
}

export async function enrichInstagramMediaWithInsights(
  items: InstagramMediaItem[],
  accessToken: string
): Promise<InstagramMediaItem[]> {
  const enriched: InstagramMediaItem[] = [];

  for (const item of items) {
    const insights = await fetchInstagramMediaInsights(
      item.id,
      accessToken,
      item.mediaProductType
    );

    enriched.push({
      ...item,
      insights,
    });
  }

  return enriched;
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const { graphBaseUrl, clientSecret } = getInstagramOAuthConfig();
  const url = new URL(`${graphBaseUrl}/access_token`);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("access_token", shortLivedToken);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const body = await res.json();

  if (!res.ok) {
    throw mapApiError(res.status, body);
  }

  return {
    accessToken: body.access_token,
    expiresIn: body.expires_in ?? 60 * 60 * 24 * 60,
  };
}

export async function refreshLongLivedToken(accessToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const { graphBaseUrl } = getInstagramOAuthConfig();
  const url = new URL(`${graphBaseUrl}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const body = await res.json();

  if (!res.ok) {
    throw mapApiError(res.status, body);
  }

  return {
    accessToken: body.access_token,
    expiresIn: body.expires_in ?? 60 * 60 * 24 * 60,
  };
}
