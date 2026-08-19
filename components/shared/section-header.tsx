import type { ReactNode } from "react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  label,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {label ? <p className="section-eyebrow mb-1">{label}</p> : null}
        <h2 className="editorial-heading text-xl sm:text-2xl font-semibold leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
