"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { forgotPassword, type AuthState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Spinner size="sm" /> : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    forgotPassword,
    {}
  );

  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 border border-success-200">
          {state.message}
        </div>
        <p className="text-center text-sm text-neutral-600">
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 border border-error-200">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          error={!!state.fieldErrors?.email}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-sm text-error-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-neutral-600">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
