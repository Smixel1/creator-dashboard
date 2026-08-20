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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

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
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors duration-200",
        active
          ? "nav-active-pill"
          : "font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] rounded-full bg-brand-rose/90"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          active
            ? "text-brand-rose"
            : "text-muted-foreground/75 group-hover:text-brand-rose"
        )}
      />
      {t(labelKey)}
    </Link>
  );
}

interface AppSidebarProps {
  user: SessionUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const firstName = user.name.split(" ")[0];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="hidden lg:flex lg:w-[16rem] lg:flex-col lg:fixed lg:inset-y-0 z-30 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border/60">
      <div className="flex flex-col h-full px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex px-2 pb-6 mb-1 border-b border-border/40"
        >
          <BrandLockup size="lg" />
        </Link>

        <nav className="flex-1 overflow-y-auto pt-4">
          <p className="nav-section-label px-3 mb-2">{t("nav.contentSection")}</p>
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>

          <div className="my-4 mx-3 border-t border-border/40" role="separator" />

          <p className="nav-section-label px-3 mb-2">{t("nav.accountSection")}</p>
          <div className="space-y-0.5">
            {accountNav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        </nav>

        <Link
          href="/profile"
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 border border-border/30 bg-card/50 hover:bg-accent/40 transition-colors duration-200"
        >
          <Avatar className="h-9 w-9 ring-1 ring-border/30">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="text-sm font-semibold bg-muted">
              {firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.instagramUsername
                ? `@${user.instagramUsername}`
                : user.email}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
