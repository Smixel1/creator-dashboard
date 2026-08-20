import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthFormCard({ children, className }: AuthFormCardProps) {
  return (
    <div className={cn("auth-form-card animate-enter", className)}>{children}</div>
  );
}
