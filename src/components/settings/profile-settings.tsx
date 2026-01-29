"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/actions/profile";
import type { Profile } from "@/lib/db/queries/profiles";

interface ProfileSettingsProps {
  profile: Profile | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner size="sm" /> : "Save Changes"}
    </Button>
  );
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [state, formAction] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-fg-default)] mb-4">
        Company Information
      </h3>
      <p className="text-sm text-[var(--color-fg-muted)] mb-4">
        This information will appear on your invoices.
      </p>

      {state.error && (
        <div className="mb-4 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700 border border-error-200">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-lg bg-success-50 px-3 py-2 text-sm text-success-700 border border-success-200">
          Profile updated successfully!
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile?.fullName || ""}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={profile?.companyName || ""}
              placeholder="Acme Inc."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone || ""}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={profile?.address || ""}
            placeholder="123 Main St&#10;Suite 100&#10;New York, NY 10001"
            rows={3}
          />
          <p className="text-xs text-[var(--color-fg-subtle)]">
            This address will appear on your invoices
          </p>
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </Card>
  );
}
