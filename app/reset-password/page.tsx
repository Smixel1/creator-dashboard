import { AuthPageShell } from "@/components/login/auth-page-shell";
import { AuthFormCard } from "@/components/login/auth-form-card";
import { ResetPasswordForm } from "@/components/login/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <AuthPageShell>
      <AuthFormCard>
        <ResetPasswordForm token={token} />
      </AuthFormCard>
    </AuthPageShell>
  );
}
