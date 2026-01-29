import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { redirectTo, error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg-default)]">
          Welcome back
        </h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Sign in to your account to continue
        </p>
      </div>

      {error === "auth_callback_error" && (
        <div className="rounded-lg bg-[var(--color-status-error-bg)] px-4 py-3 text-sm text-[var(--color-status-error-fg)] border border-[var(--color-status-error-border)]">
          There was an error confirming your account. Please try again.
        </div>
      )}

      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
