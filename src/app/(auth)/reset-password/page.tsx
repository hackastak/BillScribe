import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg-default)]">
          Reset your password
        </h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Enter your new password below
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
