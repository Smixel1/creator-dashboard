import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AvatarStorageError } from "@/lib/avatar/storage-config";
import { mapBlobUploadError, persistAvatarFile } from "@/lib/avatar/storage";

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

describe("persistAvatarFile storage selection", () => {
  it("returns NOT_CONFIGURED in production without blob credentials", async () => {
    await withEnv(
      {
        NODE_ENV: "production",
        BLOB_READ_WRITE_TOKEN: undefined,
        BLOB_STORE_ID: undefined,
      },
      async () => {
        await assert.rejects(
          () =>
            persistAvatarFile(
              "user_abc123",
              Buffer.from([0xff, 0xd8, 0xff]),
              "jpg",
              "image/jpeg"
            ),
          (error: unknown) => {
            assert.ok(error instanceof AvatarStorageError);
            assert.equal(error.code, "NOT_CONFIGURED");
            return true;
          }
        );
      }
    );
  });
});

describe("mapBlobUploadError", () => {
  it("maps missing blob credentials to NOT_CONFIGURED", () => {
    const error = mapBlobUploadError(
      new Error(
        "Vercel Blob: No blob credentials found. Pass a `token` option, set `BLOB_READ_WRITE_TOKEN`, or use `oidcToken` (or `VERCEL_OIDC_TOKEN`) with `storeId` or `BLOB_STORE_ID`."
      )
    );
    assert.equal(error.code, "NOT_CONFIGURED");
  });

  it("maps blob upload failures to UPLOAD_FAILED", () => {
    const error = mapBlobUploadError(
      Object.assign(new Error("Vercel Blob: Upload failed"), { status: 403 })
    );
    assert.equal(error.code, "UPLOAD_FAILED");
  });
});
