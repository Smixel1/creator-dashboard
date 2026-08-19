import { z } from "zod";
import type { Translator } from "@/lib/i18n";

export function createLoginSchema(t: Translator) {
  return z.object({
    email: z.string().email(t("validation.email")),
    password: z.string().min(6, t("validation.passwordMin")),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createProfileSchema(t: Translator) {
  return z.object({
    name: z.string().min(2, t("validation.nameMin")),
    instagramUsername: z
      .string()
      .regex(/^[a-zA-Z0-9._]{1,30}$/, t("validation.instagramUsername"))
      .optional()
      .or(z.literal("")),
  });
}

export type ProfileInput = z.infer<ReturnType<typeof createProfileSchema>>;

const instagramReelPattern =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?(\?.*)?$/i;

export function createReelUrlSchema(t: Translator) {
  return z.object({
    instagramUrl: z
      .string()
      .url(t("validation.reelUrl"))
      .refine(
        (url) => {
          try {
            const parsed = new URL(url);
            return (
              parsed.hostname.replace("www.", "") === "instagram.com" &&
              instagramReelPattern.test(url)
            );
          } catch {
            return false;
          }
        },
        { message: t("validation.reelUrl") }
      ),
  });
}

export type ReelUrlInput = z.infer<ReturnType<typeof createReelUrlSchema>>;

export function createChangePasswordSchema(t: Translator) {
  return z
    .object({
      currentPassword: z.string().min(1, t("validation.currentPasswordRequired")),
      newPassword: z.string().min(6, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordMatch"),
      path: ["confirmPassword"],
    });
}

export type ChangePasswordInput = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export function createForgotPasswordSchema(t: Translator) {
  return z.object({
    email: z.string().email(t("validation.email")),
  });
}

export type ForgotPasswordInput = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export function createResetPasswordSchema(t: Translator) {
  return z
    .object({
      token: z.string().min(1, t("passwordRecovery.invalidToken")),
      newPassword: z.string().min(6, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordMatch"),
      path: ["confirmPassword"],
    });
}

export type ResetPasswordInput = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

// Default schemas for server-side API routes (Russian fallback via translator)
import { createTranslator } from "@/lib/i18n";

const defaultT = createTranslator("ru");
export const loginSchema = createLoginSchema(defaultT);
export const profileSchema = createProfileSchema(defaultT);
export const reelUrlSchema = createReelUrlSchema(defaultT);
