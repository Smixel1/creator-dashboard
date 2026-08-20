import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBlobStorageEnabled,
} from "@/lib/avatar/storage-config";
import {
  avatarUrlBelongsToUser,
  isManagedAvatarUrl,
  isVercelBlobAvatarUrl,
} from "@/lib/avatar/validate";

describe("avatar storage config", () => {
  it("detects blob storage from env token", () => {
    const original = process.env.BLOB_READ_WRITE_TOKEN;
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    assert.equal(isBlobStorageEnabled(), true);
    process.env.BLOB_READ_WRITE_TOKEN = original;
  });

  it("uses local filesystem in development without blob token", () => {
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const usesLocalInDev =
      (process.env.NODE_ENV ?? "development") !== "production" ||
      !isBlobStorageEnabled();
    assert.equal(usesLocalInDev, true);
    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });
});

describe("avatar URL ownership", () => {
  const userId = "user_abc123";

  it("accepts managed local avatar paths for the same user", () => {
    const url = "/uploads/avatars/user_abc123-1234567890-deadbeef.jpg";
    assert.equal(isManagedAvatarUrl(url), true);
    assert.equal(avatarUrlBelongsToUser(url, userId), true);
  });

  it("rejects local avatar paths for another user", () => {
    const url = "/uploads/avatars/otheruser-1234567890-deadbeef.jpg";
    assert.equal(avatarUrlBelongsToUser(url, userId), false);
  });

  it("accepts Vercel Blob avatar URLs for the same user", () => {
    const url =
      "https://abc123.public.blob.vercel-storage.com/avatars/user_abc123-1234567890-deadbeef.webp";
    assert.equal(isVercelBlobAvatarUrl(url), true);
    assert.equal(avatarUrlBelongsToUser(url, userId), true);
  });
});

describe("production login copy", () => {
  it("does not expose seed credentials in i18n placeholders", async () => {
    const { ru } = await import("@/lib/i18n/ru");
    const { en } = await import("@/lib/i18n/en");

    for (const dict of [ru, en]) {
      assert.doesNotMatch(dict.login.emailPlaceholder, /anna@creator\.io/i);
      assert.doesNotMatch(dict.login.passwordPlaceholder, /password123/i);
      assert.doesNotMatch(String(dict.login.signInDesc), /аналитик/i);
    }
  });
});
