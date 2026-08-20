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
import type { RegisterInput } from "@/lib/validations";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations();
  const { registerSchema } = useValidationSchemas();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver(registerSchema), [registerSchema]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
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
        setError(body.error ?? t("register.registerFailed"));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("register.networkError"));
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
        <Label htmlFor="name">{t("register.name")}</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder={t("register.namePlaceholder")}
          disabled={isSubmitting}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("register.email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("register.emailPlaceholder")}
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("register.password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("register.passwordPlaceholder")}
            className="pr-10"
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword ? t("register.hidePassword") : t("register.showPassword")
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("register.confirmPasswordPlaceholder")}
            className="pr-10"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showConfirmPassword
                ? t("register.hidePassword")
                : t("register.showPassword")
            }
            tabIndex={-1}
          >
            {showConfirmPassword ? (
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

      <Button type="submit" className="w-full rounded-full h-11" disabled={isSubmitting}>
        {isSubmitting ? t("register.creating") : t("register.createAccount")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("register.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium link-accent">
          {t("register.signInLink")}
        </Link>
      </p>
    </form>
  );
}
