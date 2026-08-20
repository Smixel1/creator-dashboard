"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clapperboard,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/reels", labelKey: "nav.reels" as const, icon: Clapperboard },
  { href: "/analytics", labelKey: "nav.analytics" as const, icon: BarChart3 },
  { href: "/profile", labelKey: "nav.profile" as const, icon: User },
  { href: "/settings", labelKey: "nav.settings" as const, icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/25 pb-[env(safe-area-inset-bottom)]"
      aria-label={t("nav.mainNav")}
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto px-1">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 px-0.5 text-[9px] font-medium transition-colors duration-200",
                active ? "text-brand-rose" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  active && "bg-accent/85 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand-rose)_12%,var(--surface-border))]"
                )}
              >
                <Icon
                  className={cn("h-[17px] w-[17px]", active && "stroke-[2.25px]")}
                />
              </span>
              <span className="truncate max-w-full leading-none">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
