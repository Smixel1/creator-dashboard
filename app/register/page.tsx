import { AuthPageShell } from "@/components/login/auth-page-shell";
import { RegisterForm } from "@/components/login/register-form";
import { RegisterHeader } from "@/components/login/register-header";

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterHeader />
      <div className="rounded-2xl bg-card p-6 sm:p-8 border border-border/25">
        <RegisterForm />
      </div>
    </AuthPageShell>
  );
}
