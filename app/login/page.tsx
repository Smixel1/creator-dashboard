import { AuthPageShell } from "@/components/login/auth-page-shell";
import { AuthFormCard } from "@/components/login/auth-form-card";
import { LoginForm } from "@/components/login/login-form";
import { LoginHeader } from "@/components/login/login-header";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginHeader />
      <AuthFormCard>
        <LoginForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
