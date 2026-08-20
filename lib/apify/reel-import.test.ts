import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractShortCodeFromUrl, shortCodesMatch } from "@/lib/apify/extract-shortcode";
import {
  findMatchingApifyItem,
  verifyApifyReelIdentity,
} from "@/lib/apify/verify-identity";
import {
  mapApifyItemToReelData,
  normalizeApifyReelItem,
} from "@/lib/apify/normalize";
import { InstagramFetchError } from "@/services/instagram/errors";
import { normalizeInstagramReelUrl } from "@/services/instagram/normalize-url";

describe("extractShortCodeFromUrl", () => {
  it("extracts shortcode from canonical reel URL", () => {
    assert.equal(
      extractShortCodeFromUrl("https://www.instagram.com/reel/ABC123/"),
      "ABC123"
    );
  });

  it("extracts shortcode from /reels/ variant", () => {
    assert.equal(
      extractShortCodeFromUrl("https://instagram.com/reels/XYZ789/?utm_source=ig"),
      "XYZ789"
    );
  });

  it("throws on URL without reel path", () => {
    assert.throws(
      () => extractShortCodeFromUrl("https://instagram.com/p/ABC123/"),
      (error: unknown) =>
        error instanceof InstagramFetchError && error.code === "INVALID_URL"
    );
  });
});

describe("shortCodesMatch", () => {
  it("matches case-insensitively", () => {
    assert.equal(shortCodesMatch("ABC123", "abc123"), true);
    assert.equal(shortCodesMatch("ABC123", "XYZ789"), false);
  });
});

describe("normalizeInstagramReelUrl", () => {
  it("normalizes reel URL variants", () => {
    assert.equal(
      normalizeInstagramReelUrl("https://instagram.com/reel/AbC123"),
      "https://www.instagram.com/reel/AbC123/"
    );
  });

  it("rejects non-reel paths", () => {
    assert.throws(
      () => normalizeInstagramReelUrl("https://instagram.com/p/ABC123/"),
      (error: unknown) =>
        error instanceof InstagramFetchError && error.code === "INVALID_URL"
    );
  });
});

describe("verifyApifyReelIdentity", () => {
  const requested = "https://www.instagram.com/reel/ABC123/";

  it("passes when shortcode matches", () => {
    assert.doesNotThrow(() =>
      verifyApifyReelIdentity(requested, {
        shortCode: "ABC123",
        url: requested,
      })
    );
  });

  it("fails when shortcode mismatches", () => {
    assert.throws(
      () =>
        verifyApifyReelIdentity(requested, {
          shortCode: "XYZ789",
          url: "https://www.instagram.com/reel/XYZ789/",
        }),
      (error: unknown) =>
        error instanceof InstagramFetchError &&
        error.code === "IDENTITY_MISMATCH"
    );
  });

  it("fails when shortcode is missing", () => {
    assert.throws(
      () => verifyApifyReelIdentity(requested, { url: requested }),
      (error: unknown) =>
        error instanceof InstagramFetchError &&
        error.code === "IDENTITY_MISMATCH"
    );
  });
});

describe("findMatchingApifyItem", () => {
  const requested = "https://www.instagram.com/reel/ABC123/";

  it("returns matching item from multiple results", () => {
    const match = findMatchingApifyItem(requested, [
      { shortCode: "WRONG1" },
      { shortCode: "ABC123", url: requested },
      { shortCode: "WRONG2" },
    ]);

    assert.equal(match?.shortCode, "ABC123");
  });

  it("returns null when no item matches", () => {
    const match = findMatchingApifyItem(requested, [
      { shortCode: "WRONG1" },
      { shortCode: "WRONG2" },
    ]);

    assert.equal(match, null);
  });
});

describe("normalizeApifyReelItem", () => {
  const requested = "https://www.instagram.com/reel/ABC123/";

  it("normalizes valid Apify payload", () => {
    const normalized = normalizeApifyReelItem(
      {
        shortCode: "ABC123",
        url: requested,
        displayUrl: "https://cdn.example.com/cover.jpg",
        timestamp: "2024-01-15T12:00:00.000Z",
        videoPlayCount: 1000,
        likesCount: 50,
        commentsCount: 5,
        caption: "Test caption",
        ownerUsername: "creator",
        id: "ext-1",
      },
      requested
    );

    assert.equal(normalized.instagramUrl, requested);
    assert.equal(normalized.shortCode, "ABC123");
    assert.equal(normalized.thumbnailUrl, "https://cdn.example.com/cover.jpg");
    assert.equal(normalized.views, 1000);
    assert.equal(normalized.likes, 50);
    assert.equal(normalized.comments, 5);
  });

  it("allows missing thumbnail", () => {
    const normalized = normalizeApifyReelItem(
      {
        shortCode: "ABC123",
        url: requested,
        timestamp: "2024-01-15T12:00:00.000Z",
        likesCount: 1,
      },
      requested
    );

    assert.equal(normalized.thumbnailUrl, null);
  });

  it("rejects identity mismatch", () => {
    assert.throws(
      () =>
        normalizeApifyReelItem(
          {
            shortCode: "XYZ789",
            url: "https://www.instagram.com/reel/XYZ789/",
            timestamp: "2024-01-15T12:00:00.000Z",
            likesCount: 1,
          },
          requested
        ),
      (error: unknown) =>
        error instanceof InstagramFetchError &&
        error.code === "IDENTITY_MISMATCH"
    );
  });

  it("rejects missing publishedAt", () => {
    assert.throws(
      () =>
        normalizeApifyReelItem(
          {
            shortCode: "ABC123",
            url: requested,
            likesCount: 1,
          },
          requested
        ),
      (error: unknown) =>
        error instanceof InstagramFetchError &&
        error.code === "MALFORMED_RESPONSE"
    );
  });
});

describe("mapApifyItemToReelData", () => {
  it("sets source to apify", () => {
    const data = mapApifyItemToReelData(
      {
        shortCode: "ABC123",
        url: "https://www.instagram.com/reel/ABC123/",
        timestamp: "2024-01-15T12:00:00.000Z",
        likesCount: 10,
      },
      "https://www.instagram.com/reel/ABC123/"
    );

    assert.equal(data.source, "apify");
    assert.equal(data.shortCode, "ABC123");
  });
});
