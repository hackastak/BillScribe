import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg-default)]">
          Create an account
        </h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Get started with BillScribe today
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
