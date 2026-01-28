"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  createClientAction,
  updateClientAction,
  type ClientActionState,
} from "@/actions/client";
import type { Client } from "@/lib/db/queries/clients";

interface ClientFormProps {
  client?: Client;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner size="sm" /> : isEdit ? "Save Changes" : "Add Client"}
    </Button>
  );
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const isEdit = !!client;

  const [state, formAction] = useActionState<ClientActionState, FormData>(
    async (prevState, formData) => {
      const action = isEdit ? updateClientAction : createClientAction;
      const result = await action(prevState, formData);
      if (result.success) {
        router.push("/clients");
      }
      return result;
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="clientId" value={client.id} />}

      {state.error && (
        <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 border border-error-200">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Client name"
            defaultValue={client?.name || ""}
            error={!!state.fieldErrors?.name}
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-error-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@example.com"
              defaultValue={client?.email || ""}
              error={!!state.fieldErrors?.email}
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-error-600">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone number"
              defaultValue={client?.phone || ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Company name"
            defaultValue={client?.company || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Street address, city, state, zip"
            rows={3}
            defaultValue={client?.address || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Additional notes about this client"
            rows={3}
            defaultValue={client?.notes || ""}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex">
          <Button
            variant={client.status === "active" ? "destructive" : "secondary"}
            onClick={() => handleToggleStatus(client.id)}
          >
            {client.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <SubmitButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}
