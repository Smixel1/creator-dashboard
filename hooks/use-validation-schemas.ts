"use client";

import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  createChangePasswordSchema,
  createForgotPasswordSchema,
  createLoginSchema,
  createProfileSchema,
  createRegisterSchema,
  createReelUrlSchema,
  createResetPasswordSchema,
} from "@/lib/validations";

export function useValidationSchemas() {
  const { t } = useLocale();

  return useMemo(
    () => ({
      loginSchema: createLoginSchema(t),
      registerSchema: createRegisterSchema(t),
      profileSchema: createProfileSchema(t),
      reelUrlSchema: createReelUrlSchema(t),
      changePasswordSchema: createChangePasswordSchema(t),
      forgotPasswordSchema: createForgotPasswordSchema(t),
      resetPasswordSchema: createResetPasswordSchema(t),
    }),
    [t]
  );
}
