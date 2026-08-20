import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { getSessionUser, getSessionUserId } from "@/lib/auth";

import { getServerLocale } from "@/lib/i18n/server";

import { LocaleProvider } from "@/components/providers/locale-provider";

import { AppSidebar } from "@/components/layout/app-sidebar";

import { MobileNav } from "@/components/layout/mobile-nav";

import { BottomNav } from "@/components/layout/bottom-nav";



export default async function AppLayout({ children }: { children: ReactNode }) {

  const user = await getSessionUser();



  if (!user) {

    const userId = await getSessionUserId();

    if (userId) {
      redirect("/api/auth/clear-stale-session");
    }

    redirect("/login");

  }



  const locale = await getServerLocale();



  return (

    <LocaleProvider initialLocale={locale}>

      <div className="min-h-screen page-shell">

        <AppSidebar />

        <MobileNav />

        <main className="lg:pl-[16rem] pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-0">

          <div className="app-main-inner mx-auto max-w-[76rem]">

            {children}

          </div>

        </main>

        <BottomNav />

      </div>

    </LocaleProvider>

  );

}

