"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "danger";
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  variant = "default",
  className,
}: SettingsSectionProps) {
  return (
    <section className={className}>
      <div className="mb-2.5">
        <h2
          className={cn(
            "section-eyebrow",
            variant === "danger" && "text-destructive/70"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "surface-panel overflow-hidden",
          variant === "danger" &&
            "border-destructive/25 bg-destructive/[0.03] dark:bg-destructive/[0.06]"
        )}
      >
        {children}
      </div>
    </section>
  );
}

interface SettingsControlRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function SettingsControlRow({
  label,
  description,
  children,
  htmlFor,
}: SettingsControlRowProps) {
  return (
    <div className="settings-row flex items-start justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="text-sm font-medium text-foreground/90"
          >
            {label}
          </label>
        ) : (
          <p className="text-sm font-medium text-foreground/90">{label}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
