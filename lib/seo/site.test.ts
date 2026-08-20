import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPublicMetadata, getSiteUrl, privateAppMetadata } from "@/lib/seo/site";

describe("SEO site config", () => {
  it("builds canonical metadata for public pages", () => {
    const metadata = buildPublicMetadata({
      title: "Sign in — CreatorPulse",
      description: "Sign in to CreatorPulse",
      path: "/login",
    });

    assert.deepEqual(metadata.robots, { index: true, follow: true });
    assert.match(String(metadata.alternates?.canonical), /\/login$/);
    assert.equal(metadata.openGraph?.title, "Sign in — CreatorPulse");
  });

  it("marks private app routes as noindex", () => {
    const robots = privateAppMetadata.robots;
    assert.ok(robots && typeof robots === "object");
    assert.equal(robots.index, false);
    assert.equal(robots.follow, false);
  });

  it("resolves site URL with protocol", () => {
    const original = process.env.APP_URL;
    process.env.APP_URL = "https://example.com";
    assert.equal(getSiteUrl().toString(), "https://example.com/");
    process.env.APP_URL = original;
  });
});

describe("reel source labels", () => {
  it("maps known sources to i18n keys", async () => {
    const {
      getReelSourceLabelKey,
      shouldShowReelSource,
    } = await import("@/lib/reel-display");

    assert.equal(getReelSourceLabelKey("apify"), "reels.sourceApify");
    assert.equal(getReelSourceLabelKey("instagram"), "reels.sourceInstagram");
    assert.equal(getReelSourceLabelKey("manual"), "reels.sourceImported");
    assert.equal(shouldShowReelSource("mock"), false);
    assert.equal(shouldShowReelSource("apify"), true);
  });

  it("computes chart range from real stat dates", async () => {
    const { getChartStatsRange } = await import("@/lib/reel-display");

    assert.equal(getChartStatsRange([]), null);

    const range = getChartStatsRange([
      { date: "Jan 1", isoDate: "2026-01-01", views: 10 },
      { date: "Jan 5", isoDate: "2026-01-05", views: 20 },
    ]);

    assert.ok(range);
    assert.equal(range?.pointCount, 2);
    assert.equal(range?.daySpan, 5);
    assert.equal(range?.isSingleDay, false);
  });
});

describe("structured data", () => {
  it("builds website JSON-LD graph", async () => {
    const { getWebsiteStructuredData } = await import("@/lib/seo/structured-data");
    const data = getWebsiteStructuredData();
    assert.equal(data["@context"], "https://schema.org");
    assert.ok(Array.isArray(data["@graph"]));
    assert.equal(data["@graph"].length, 3);
  });
});
