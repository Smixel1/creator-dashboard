import { NextResponse } from "next/server";
import { validatePasswordResetToken } from "@/services/auth/password-reset-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const valid = await validatePasswordResetToken(token);

  return NextResponse.json({ valid });
}
