"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutDashboard, BarChart3, User } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/reels", labelKey: "nav.reels" as const, icon: Clapperboard },
  { href: "/analytics", labelKey: "nav.analytics" as const, icon: BarChart3 },
  { href: "/profile", labelKey: "nav.profile" as const, icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/25 pb-[env(safe-area-inset-bottom)]"
      aria-label={t("nav.mainNav")}
    >
      <div className="flex items-stretch justify-around h-12 max-w-lg mx-auto">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 text-[10px] font-medium transition-colors duration-200",
                active ? "text-brand-rose" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px]", active && "stroke-[2.25px]")}
              />
              <span className="truncate max-w-full px-1">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
