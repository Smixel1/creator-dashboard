"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/components/providers/locale-provider";

interface ReelsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReelsSearchBar({ value, onChange }: ReelsSearchBarProps) {
  const t = useTranslations();

  return (
    <div className="relative flex-1 min-w-[160px] max-w-xs">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={t("reels.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8 h-9 text-sm rounded-lg border-border/30 bg-transparent"
        aria-label={t("reels.searchPlaceholder")}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={t("reels.clearSearch")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
