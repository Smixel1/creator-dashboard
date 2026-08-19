import { AuthPageShell } from "@/components/login/auth-page-shell";
import { ForgotPasswordForm } from "@/components/login/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <div className="rounded-2xl bg-card p-6 sm:p-8 border border-border/25">
        <ForgotPasswordForm />
      </div>
    </AuthPageShell>
  );
}
