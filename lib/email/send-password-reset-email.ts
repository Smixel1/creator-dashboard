import type { Locale } from "@/lib/i18n";
import { createTranslator } from "@/lib/i18n";

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  locale: Locale;
}

/**
 * Sends password reset email when SMTP is configured.
 * In development, logs the link to the server console (token visible only in dev).
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  locale,
}: SendPasswordResetEmailParams): Promise<void> {
  const t = createTranslator(locale);
  const subject = t("passwordRecovery.emailSubject");
  const body = t("passwordRecovery.emailBody", { url: resetUrl });

  const smtpHost = process.env.SMTP_HOST?.trim();

  if (smtpHost) {
    await sendViaSmtp({ to, subject, body });
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[password-reset] Dev email to ${to}\nSubject: ${subject}\n${body}`
    );
    return;
  }

  console.warn(
    "[password-reset] SMTP not configured — reset email was not sent. Set SMTP_HOST to enable outbound mail."
  );
}

async function sendViaSmtp({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from =
    process.env.SMTP_FROM?.trim() ?? "CreatorPulse <noreply@creatorpulse.app>";

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transport.sendMail({
    from,
    to,
    subject,
    text: body,
  });
}
