"use client";

import { BrandLockup } from "@/components/shared/brand-lockup";

interface AuthPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  showMobileBrand?: boolean;
}

export function AuthPageHeader({
  eyebrow,
  title,
  description,
  showMobileBrand = true,
}: AuthPageHeaderProps) {
  return (
    <>
      {showMobileBrand && (
        <div className="mb-8 lg:hidden flex flex-col items-center gap-3">
          <BrandLockup size="md" />
        </div>
      )}

      <div className="mb-8 lg:mb-10 space-y-2 text-center lg:text-left">
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </>
  );
}
