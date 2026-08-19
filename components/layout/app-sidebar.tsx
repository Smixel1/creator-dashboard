"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clapperboard,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: "nav.dashboard" | "nav.reels" | "nav.analytics" | "nav.profile" | "nav.settings";
  icon: ComponentType<{ className?: string }>;
};

const primaryNav: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/reels", labelKey: "nav.reels", icon: Clapperboard },
  { href: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
];

const accountNav: NavItem[] = [
  { href: "/profile", labelKey: "nav.profile", icon: User },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

function NavLink({
  href,
  labelKey,
  icon: Icon,
  active,
}: NavItem & { active: boolean }) {
  const t = useTranslations();

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors duration-200",
        active
          ? "bg-muted/50 text-foreground font-semibold"
          : "font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-brand-rose"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active
            ? "text-brand-rose"
            : "text-muted-foreground/75 group-hover:text-brand-rose"
        )}
      />
      {t(labelKey)}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="hidden lg:flex lg:w-[16rem] lg:flex-col lg:fixed lg:inset-y-0 z-30 bg-sidebar border-r border-sidebar-border/60">
      <div className="flex flex-col h-full px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex px-2 pb-6 mb-1 border-b border-border/40"
        >
          <BrandLockup size="lg" />
        </Link>

        <nav className="flex-1 overflow-y-auto pt-4">
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>

          <div className="my-4 mx-3 border-t border-border/40" role="separator" />

          <div className="space-y-0.5">
            {accountNav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
