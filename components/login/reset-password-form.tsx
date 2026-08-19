"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { ResetPasswordInput } from "@/lib/validations";

interface ResetPasswordFormProps {
  token: string;
}

type FormState = "validating" | "invalid" | "form" | "success";

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const { resetPasswordSchema } = useValidationSchemas();
  const [state, setState] = useState<FormState>("validating");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(
    () => zodResolver(resetPasswordSchema),
    [resetPasswordSchema]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver,
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("token", token);
  }, [token, setValue]);

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token.trim()) {
        setState("invalid");
        return;
      }

      try {
        const res = await fetch(
          `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        );
        const body = (await res.json()) as { valid?: boolean };
        if (!cancelled) {
          setState(body.valid ? "form" : "invalid");
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
        }
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(data: ResetPasswordInput) {
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 400 && body.error) {
          setState("invalid");
          return;
        }
        setError(body.error ?? t("passwordRecovery.resetFailed"));
        return;
      }

      setState("success");
    } catch {
      setError(t("login.networkError"));
    }
  }

  if (state === "validating") {
    return (
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        {t("common.loading")}
      </p>
    );
  }

  if (state === "invalid") {
    return (
      <div className="space-y-5 text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
            {t("passwordRecovery.resetTitle")}
          </h1>
          <p className="text-sm text-destructive">{t("passwordRecovery.invalidToken")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/forgot-password")}
        >
          {t("passwordRecovery.requestNewLink")}
        </Button>
        <div>
          <Link href="/login" className="text-sm font-medium link-accent">
            {t("passwordRecovery.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-5 text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
            {t("passwordRecovery.passwordChanged")}
          </h1>
        </div>
        <Button
          type="button"
          className="rounded-full"
          onClick={() => router.push("/login")}
        >
          {t("passwordRecovery.signIn")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
          {t("passwordRecovery.resetTitle")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("passwordRecovery.resetDesc")}
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
        <input type="hidden" {...register("token")} />

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("passwordRecovery.newPassword")}</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              disabled={isSubmitting}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword ? t("login.hidePassword") : t("login.showPassword")
              }
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("passwordRecovery.confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirm ? t("login.hidePassword") : t("login.showPassword")
              }
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
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
            ? t("common.saving")
            : t("passwordRecovery.changePassword")}
        </Button>
      </form>

      <Link href="/login" className="inline-flex text-sm font-medium link-accent">
        {t("passwordRecovery.backToLogin")}
      </Link>
    </div>
  );
}
