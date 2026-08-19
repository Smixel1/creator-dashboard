import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { LoginBranding } from "@/components/login/login-branding";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";

interface AuthPageShellProps {
  children: ReactNode;
  /** Show desktop branding panel (login only). */
  showBranding?: boolean;
}

export async function AuthPageShell({
  children,
  showBranding = false,
}: AuthPageShellProps) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="min-h-screen flex page-shell">
        {showBranding && <LoginBranding />}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {!showBranding && (
              <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
                <BrandLockup size="md" />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </LocaleProvider>
  );
}
