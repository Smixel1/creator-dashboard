"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { ForgotPasswordInput } from "@/lib/validations";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const { forgotPasswordSchema } = useValidationSchemas();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(
    () => zodResolver(forgotPasswordSchema),
    [forgotPasswordSchema]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver,
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? t("passwordRecovery.requestFailed"));
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t("login.networkError"));
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5 text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
            {t("passwordRecovery.checkEmailTitle")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("passwordRecovery.checkEmailDesc")}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium link-accent"
        >
          {t("passwordRecovery.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
          {t("passwordRecovery.forgotTitle")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("passwordRecovery.forgotDesc")}
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full rounded-full h-11"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("passwordRecovery.sending")
            : t("passwordRecovery.sendResetLink")}
        </Button>
      </form>

      <Link href="/login" className="inline-flex text-sm font-medium link-accent">
        {t("passwordRecovery.backToLogin")}
      </Link>
    </div>
  );
}
