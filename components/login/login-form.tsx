"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations();
  const { loginSchema } = useValidationSchemas();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver(loginSchema), [loginSchema]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver,
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "same-origin",
      });

      let body: { error?: string; success?: boolean } = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }

      if (!res.ok) {
        setError(
          body.error ??
            (res.status === 401
              ? t("login.invalidCredentials")
              : t("login.loginFailed"))
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("login.networkError"));
    }
  }

  return (
    <form
      method="post"
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
          placeholder={t("login.emailPlaceholder")}
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium link-accent shrink-0"
          >
            {t("passwordRecovery.forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("login.passwordPlaceholder")}
            autoComplete="current-password"
            className="pr-10"
            disabled={isSubmitting}
            {...register("password")}
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
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
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

      <Button type="submit" className="w-full rounded-full h-11" disabled={isSubmitting}>
        {isSubmitting ? t("login.signingIn") : t("login.signIn")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link href="/register" className="font-medium link-accent">
          {t("login.createAccountLink")}
        </Link>
      </p>
    </form>
  );
}
