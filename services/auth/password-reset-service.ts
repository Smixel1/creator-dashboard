import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth/password-reset/constants";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/auth/password-reset/tokens";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";

function getAppBaseUrl(): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/** Always resolves — never reveals whether the email exists. */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, locale: true },
  });

  if (!user) {
    return;
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
    locale: user.locale === "en" ? "en" : "ru",
  });
}

export async function validatePasswordResetToken(
  token: string
): Promise<boolean> {
  if (!token.trim()) {
    return false;
  }

  const tokenHash = hashPasswordResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt) {
    return false;
  }

  return record.expiresAt.getTime() > Date.now();
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<"success" | "invalid"> {
  const tokenHash = hashPasswordResetToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return "invalid";
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: record.userId,
        id: { not: record.id },
      },
    }),
  ]);

  return "success";
}
