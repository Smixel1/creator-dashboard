import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "Forgot password — CreatorPulse",
  description: "Reset your CreatorPulse account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
