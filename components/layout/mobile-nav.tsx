"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Clapperboard,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";

const primaryNav = [
  { href: "/dashboard", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/reels", labelKey: "nav.reels" as const, icon: Clapperboard },
  { href: "/analytics", labelKey: "nav.analytics" as const, icon: BarChart3 },
];

const accountNav = [
  { href: "/profile", labelKey: "nav.profile" as const, icon: User },
  { href: "/settings", labelKey: "nav.settings" as const, icon: Settings },
];

function MobileNavLink({
  href,
  labelKey,
  icon: Icon,
  active,
}: {
  href: string;
  labelKey: "nav.dashboard" | "nav.reels" | "nav.analytics" | "nav.profile" | "nav.settings";
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  const t = useTranslations();

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors duration-200",
        active
          ? "nav-active-pill"
          : "font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-brand-rose" />
      )}
      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-brand-rose" : "text-muted-foreground/75"
        )}
      />
      {t(labelKey)}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="lg:hidden sticky top-0 z-30 flex h-12 items-center justify-between gap-3 px-4 bg-card/95 backdrop-blur-sm border-b border-border/30">
      <Link href="/dashboard" className="inline-flex shrink-0 overflow-visible">
        <BrandLockup size="sm" />
      </Link>

      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={t("nav.menu")} className="shrink-0">
              <Menu className="h-4 w-4" />
            </Button>
          }
        />
        <SheetContent side="right" className="w-72 p-0 flex flex-col bg-sidebar">
          <nav className="flex-1 p-3 overflow-y-auto pt-5">
            <div className="space-y-0.5">
              {primaryNav.map((item) => (
                <MobileNavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
            <div className="my-4 mx-3 border-t border-border/40" />
            <div className="space-y-0.5">
              {accountNav.map((item) => (
                <MobileNavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
