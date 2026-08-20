import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "Reset password — CreatorPulse",
  description: "Set a new password for your CreatorPulse account.",
  path: "/reset-password",
});

export default function ResetPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
