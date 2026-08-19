"use client";



import { BrandLockup } from "@/components/shared/brand-lockup";

import { useTranslations } from "@/components/providers/locale-provider";



export function LoginHeader() {

  const t = useTranslations();



  return (

    <>

      <div className="mb-8 lg:hidden flex flex-col items-center gap-3">

        <BrandLockup size="md" />

        <p className="text-sm text-muted-foreground text-center">

          {t("login.signInToView")}

        </p>

      </div>



      <div className="hidden lg:block mb-10 space-y-2">

        <p className="section-eyebrow">{t("login.welcomeBack")}</p>

        <h2 className="editorial-heading text-3xl font-semibold tracking-tight">

          {t("login.welcome")}

        </h2>

        <p className="text-muted-foreground">{t("login.signInDesc")}</p>

      </div>



      <p className="mb-6 text-center text-xs text-muted-foreground lg:text-left">

        {t("login.demo")}

      </p>

    </>

  );

}


