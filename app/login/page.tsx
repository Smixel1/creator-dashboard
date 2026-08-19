import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { LoginBranding } from "@/components/login/login-branding";
import { LoginForm } from "@/components/login/login-form";
import { LoginHeader } from "@/components/login/login-header";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="min-h-screen flex page-shell">
        <LoginBranding />
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <LoginHeader />
            <div className="rounded-2xl bg-card p-6 sm:p-8 border border-border/25">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </LocaleProvider>
  );
}
