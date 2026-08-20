import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAvatarStorageProvider,
  hasBlobReadWriteToken,
  isBlobStorageEnabled,
  shouldUseLocalAvatarFilesystem,
} from "@/lib/avatar/storage-config";
import {
  avatarUrlBelongsToUser,
  isManagedAvatarUrl,
  isVercelBlobAvatarUrl,
  validateAvatarBuffer,
  AvatarValidationError,
} from "@/lib/avatar/validate";
import {
  isAvatarUploadEntry,
  parseAvatarUploadEntry,
} from "@/lib/avatar/parse-upload";
import { deleteStoredAvatar } from "@/lib/avatar/storage";

const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

const WEBP_BYTES = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x20,
]);

function withEnv(
  values: Record<string, string | undefined>,
  run: () => void | Promise<void>
) {
  const original = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    original.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve(run()).finally(() => {
    for (const [key, value] of original.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

describe("avatar storage config", () => {
  it("detects blob storage from read-write token", async () => {
    await withEnv(
      {
        BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test_abc123",
        BLOB_STORE_ID: undefined,
        VERCEL: undefined,
        NODE_ENV: "production",
      },
      () => {
        assert.equal(hasBlobReadWriteToken(), true);
        assert.equal(isBlobStorageEnabled(), true);
        assert.equal(getAvatarStorageProvider(), "blob");
      }
    );
  });

  it("detects blob storage from linked store id", async () => {
    await withEnv(
      {
        BLOB_READ_WRITE_TOKEN: undefined,
        BLOB_STORE_ID: "store_123",
        VERCEL: "1",
        NODE_ENV: "production",
      },
      () => {
        assert.equal(isBlobStorageEnabled(), true);
        assert.equal(getAvatarStorageProvider(), "blob");
      }
    );
  });

  it("uses local filesystem in development without blob credentials", async () => {
    await withEnv(
      {
        BLOB_READ_WRITE_TOKEN: undefined,
        BLOB_STORE_ID: undefined,
        VERCEL: undefined,
        NODE_ENV: "development",
      },
      () => {
        assert.equal(isBlobStorageEnabled(), false);
        assert.equal(shouldUseLocalAvatarFilesystem(), true);
        assert.equal(getAvatarStorageProvider(), "local");
      }
    );
  });

  it("does not use local filesystem in production without blob credentials", async () => {
    await withEnv(
      {
        BLOB_READ_WRITE_TOKEN: undefined,
        BLOB_STORE_ID: undefined,
        VERCEL: undefined,
        NODE_ENV: "production",
      },
      () => {
        assert.equal(shouldUseLocalAvatarFilesystem(), false);
        assert.equal(getAvatarStorageProvider(), "none");
      }
    );
  });
});

describe("avatar buffer validation", () => {
  it("accepts valid JPG", () => {
    const result = validateAvatarBuffer(JPEG_BYTES);
    assert.equal(result.mimeType, "image/jpeg");
    assert.equal(result.extension, "jpg");
  });

  it("accepts valid PNG", () => {
    const result = validateAvatarBuffer(PNG_BYTES);
    assert.equal(result.mimeType, "image/png");
    assert.equal(result.extension, "png");
  });

  it("accepts valid WEBP", () => {
    const result = validateAvatarBuffer(WEBP_BYTES);
    assert.equal(result.mimeType, "image/webp");
    assert.equal(result.extension, "webp");
  });

  it("rejects invalid MIME/content", () => {
    assert.throws(
      () => validateAvatarBuffer(Buffer.from("not-an-image")),
      (error: unknown) => {
        assert.ok(error instanceof AvatarValidationError);
        assert.equal(error.code, "INVALID_TYPE");
        return true;
      }
    );
  });

  it("rejects oversized file", () => {
    const oversized = Buffer.concat([
      JPEG_BYTES,
      Buffer.alloc(2 * 1024 * 1024),
    ]);
    assert.throws(
      () => validateAvatarBuffer(oversized),
      (error: unknown) => {
        assert.ok(error instanceof AvatarValidationError);
        assert.equal(error.code, "TOO_LARGE");
        return true;
      }
    );
  });
});

describe("avatar upload parsing", () => {
  it("accepts Blob-like uploads without requiring File", () => {
    const blob = new Blob([JPEG_BYTES], { type: "image/jpeg" });
    assert.equal(
      isAvatarUploadEntry(blob as unknown as FormDataEntryValue),
      true
    );
  });

  it("parses valid JPG upload", async () => {
    const file = new File([JPEG_BYTES], "avatar.jpg", { type: "image/jpeg" });
    const parsed = await parseAvatarUploadEntry(file);
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.fileSize, JPEG_BYTES.length);
      assert.equal(parsed.clientMime, "image/jpeg");
    }
  });

  it("parses valid PNG upload", async () => {
    const file = new File([PNG_BYTES], "avatar.png", { type: "image/png" });
    const parsed = await parseAvatarUploadEntry(file);
    assert.equal(parsed.ok, true);
  });

  it("parses valid WEBP upload", async () => {
    const file = new File([WEBP_BYTES], "avatar.webp", { type: "image/webp" });
    const parsed = await parseAvatarUploadEntry(file);
    assert.equal(parsed.ok, true);
  });

  it("rejects invalid MIME before buffer validation", async () => {
    const file = new File([JPEG_BYTES], "avatar.bmp", { type: "image/bmp" });
    const parsed = await parseAvatarUploadEntry(file);
    assert.deepEqual(parsed, { ok: false, code: "INVALID_TYPE" });
  });

  it("rejects oversized upload", async () => {
    const file = new File([Buffer.alloc(2 * 1024 * 1024 + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    const parsed = await parseAvatarUploadEntry(file);
    assert.deepEqual(parsed, { ok: false, code: "TOO_LARGE" });
  });

  it("rejects missing upload entry", async () => {
    const parsed = await parseAvatarUploadEntry(null);
    assert.deepEqual(parsed, { ok: false, code: "MISSING_FILE" });
  });

  it("allows empty client MIME and validates from buffer later", async () => {
    const file = new File([JPEG_BYTES], "avatar.jpg", { type: "" });
    const parsed = await parseAvatarUploadEntry(file);
    assert.equal(parsed.ok, true);
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

  it("rejects Vercel Blob avatar URLs for another user", () => {
    const url =
      "https://abc123.public.blob.vercel-storage.com/avatars/otheruser-1234567890-deadbeef.webp";
    assert.equal(avatarUrlBelongsToUser(url, userId), false);
  });
});

describe("avatar deletion ownership", () => {
  it("does not delete another user's avatar URL", async () => {
    await withEnv(
      {
        BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test_abc123",
        NODE_ENV: "production",
      },
      async () => {
        await assert.doesNotReject(async () => {
          await deleteStoredAvatar(
            "https://abc123.public.blob.vercel-storage.com/avatars/otheruser-123.webp",
            "user_abc123"
          );
        });
      }
    );
  });
});

describe("avatar i18n copy", () => {
  it("returns explicit not-configured message in RU", async () => {
    const { ru } = await import("@/lib/i18n/ru");
    assert.equal(
      ru.profile.uploadNotConfigured,
      "Загрузка фото не настроена на сервере."
    );
  });
});

describe("production login copy", () => {
  it("does not expose seed credentials in i18n placeholders", async () => {
    const { ru } = await import("@/lib/i18n/ru");
    const { en } = await import("@/lib/i18n/en");

    for (const dict of [ru, en]) {
      assert.equal(dict.login.emailPlaceholder, "name@example.com");
      assert.doesNotMatch(dict.login.emailPlaceholder, /anna@creator\.io/i);
      assert.doesNotMatch(dict.login.passwordPlaceholder, /password123/i);
    }
  });
});
