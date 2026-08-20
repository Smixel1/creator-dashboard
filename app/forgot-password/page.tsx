import { AuthPageShell } from "@/components/login/auth-page-shell";
import { AuthFormCard } from "@/components/login/auth-form-card";
import { ForgotPasswordForm } from "@/components/login/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <AuthFormCard>
        <ForgotPasswordForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
