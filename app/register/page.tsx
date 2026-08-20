import { AuthPageShell } from "@/components/login/auth-page-shell";
import { AuthFormCard } from "@/components/login/auth-form-card";
import { RegisterForm } from "@/components/login/register-form";
import { RegisterHeader } from "@/components/login/register-header";

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterHeader />
      <AuthFormCard>
        <RegisterForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
