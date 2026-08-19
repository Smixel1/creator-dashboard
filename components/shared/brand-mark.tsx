import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: {
    box: "h-8 w-8",
    icon: "h-3.5 w-3.5",
  },
  md: {
    box: "h-10 w-10",
    icon: "h-4 w-4",
  },
  lg: {
    box: "h-11 w-11",
    icon: "h-[18px] w-[18px]",
  },
} as const;

interface BrandMarkProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

/** Gradient circle + spark — matches CreatorPulse brand lockup reference. */
export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const { box, icon } = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-lavender shadow-sm",
        box,
        className
      )}
      aria-hidden
    >
      <Sparkles className={cn(icon, "text-white")} strokeWidth={2} />
    </div>
  );
}
