import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { LegalNav } from "@/components/legal/legal-nav";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";
import { LEGAL_LAST_UPDATED, PRODUCT_NAME } from "@/lib/legal/constants";

interface LegalPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export async function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="min-h-screen page-shell">
        <header className="border-b border-border/25 bg-card/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/login" className="inline-flex w-fit">
              <BrandLockup size="md" />
            </Link>
            <div className="flex flex-col gap-3 sm:items-end">
              <LegalNav />
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
          <div className="mb-8 space-y-3">
            <p className="section-eyebrow">Legal</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>

          <div className="surface-soft space-y-8 rounded-2xl border border-border/25 p-6 sm:p-10">
            {children}
          </div>
        </main>

        <footer className="border-t border-border/25 px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
            </p>
            <LegalNav />
          </div>
        </footer>
      </div>
    </LocaleProvider>
  );
}
