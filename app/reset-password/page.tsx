import { AuthPageShell } from "@/components/login/auth-page-shell";
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
      <div className="rounded-2xl bg-card p-6 sm:p-8 border border-border/25">
        <ResetPasswordForm token={token} />
      </div>
    </AuthPageShell>
  );
}
