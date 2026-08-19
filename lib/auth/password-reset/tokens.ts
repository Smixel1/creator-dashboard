import { createHash, randomBytes } from "crypto";
import { PASSWORD_RESET_TOKEN_BYTES } from "@/lib/auth/password-reset/constants";

export function generatePasswordResetToken(): string {
  return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
