"use client";

import { BrandLockup } from "@/components/shared/brand-lockup";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";

/** Abstract product preview — CSS-only, no stock photography. */
function ProductPreviewMock() {
  return (
    <div className="relative mt-14 max-w-[17rem] ml-2" aria-hidden>
      <div className="surface-soft rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="h-2 w-16 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-accent" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-accent/80 px-2 py-2 space-y-1.5">
            <div className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
            <div className="editorial-heading text-lg font-semibold text-brand-rose leading-none">
              24K
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border/25 px-2 py-2 space-y-1.5">
            <div className="h-1.5 w-6 rounded-full bg-muted-foreground/20" />
            <div className="text-lg font-semibold tabular-nums leading-none">12</div>
          </div>
          <div className="rounded-lg bg-card border border-border/25 px-2 py-2 space-y-1.5">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/20" />
            <div className="text-lg font-semibold tabular-nums leading-none">4.8%</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-lg bg-muted/70 overflow-hidden relative"
            >
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/8 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoginBranding() {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center gradient-accent p-12 overflow-hidden">
      <div className="relative z-10 max-w-md">
        <div className="mb-10">
          <BrandLockup size="lg" showDescriptor={locale === "ru"} />
        </div>

        <h2 className="editorial-heading text-4xl font-semibold leading-tight mb-5">
          {t("login.headline1")}
          <br />
          <span className="text-brand-rose">{t("login.headline2")}</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-base">
          {t("login.description")}
        </p>
      </div>

      <div className="relative z-10">
        <ProductPreviewMock />
      </div>
    </div>
  );
}
