import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSelectRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Unified Settings select row — label, optional hint, control. */
export function SettingsSelectRow({
  label,
  description,
  children,
  className,
}: SettingsSelectRowProps) {
  return (
    <div
      className={cn(
        "settings-row flex items-start justify-between gap-4 px-4 py-3.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground/90">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export const settingsSelectTriggerClass =
  "w-[148px] h-8 text-sm font-normal";
