export function isApifyConfigured(): boolean {
  return (
    process.env.USE_APIFY === "true" && Boolean(process.env.APIFY_API_TOKEN)
  );
}

export function isInstagramDemoMode(): boolean {
  return !isApifyConfigured();
}

export type InstagramDataSource = "apify" | "mock";

export function getInstagramDataSource(): InstagramDataSource {
  return isApifyConfigured() ? "apify" : "mock";
}
