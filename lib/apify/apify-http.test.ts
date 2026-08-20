import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APIFY_INSTAGRAM_REEL_ACTOR,
  APIFY_RUN_SYNC_DATASET_ITEMS_URL,
  buildApifyReelScraperInput,
} from "@/lib/apify/constants";
import { mapApifyHttpStatusToError } from "@/lib/apify/map-http-error";
import { parseApifyDatasetItems } from "@/lib/apify/parse-response";
import { InstagramFetchError } from "@/services/instagram/errors";

describe("buildApifyReelScraperInput", () => {
  it("uses username array for direct reel URL", () => {
    const url = "https://www.instagram.com/reel/ABC123/";
    assert.deepEqual(buildApifyReelScraperInput(url), {
      username: [url],
      resultsLimit: 1,
    });
  });
});

describe("Apify endpoint constants", () => {
  it("uses tilde actor id in sync URL", () => {
    assert.equal(APIFY_INSTAGRAM_REEL_ACTOR, "apify~instagram-reel-scraper");
    assert.match(
      APIFY_RUN_SYNC_DATASET_ITEMS_URL,
      /apify~instagram-reel-scraper/
    );
  });
});

describe("mapApifyHttpStatusToError", () => {
  it("maps 401 to NOT_CONFIGURED", () => {
    const error = mapApifyHttpStatusToError(401);
    assert.equal(error.code, "NOT_CONFIGURED");
  });

  it("maps 403 to API_UNAVAILABLE", () => {
    const error = mapApifyHttpStatusToError(403);
    assert.equal(error.code, "API_UNAVAILABLE");
  });

  it("maps 429 to RATE_LIMIT", () => {
    const error = mapApifyHttpStatusToError(429);
    assert.equal(error.code, "RATE_LIMIT");
  });

  it("maps 408 to TIMEOUT", () => {
    const error = mapApifyHttpStatusToError(408);
    assert.equal(error.code, "TIMEOUT");
  });

  it("maps 400 to MALFORMED_RESPONSE", () => {
    const error = mapApifyHttpStatusToError(400);
    assert.equal(error.code, "MALFORMED_RESPONSE");
  });

  it("maps 500 to API_UNAVAILABLE", () => {
    const error = mapApifyHttpStatusToError(500);
    assert.equal(error.code, "API_UNAVAILABLE");
  });
});

describe("parseApifyDatasetItems", () => {
  it("parses array responses", () => {
    const items = parseApifyDatasetItems([
      { shortCode: "ABC123", url: "https://www.instagram.com/reel/ABC123/" },
    ]);
    assert.equal(items.length, 1);
    assert.equal(items[0].shortCode, "ABC123");
  });

  it("returns empty array for empty dataset", () => {
    assert.deepEqual(parseApifyDatasetItems([]), []);
  });

  it("throws MALFORMED_RESPONSE for unexpected payload", () => {
    assert.throws(
      () => parseApifyDatasetItems({ foo: "bar" }),
      (error: unknown) =>
        error instanceof InstagramFetchError &&
        error.code === "MALFORMED_RESPONSE"
    );
  });
});
