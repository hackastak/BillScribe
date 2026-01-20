"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { createClientAction, type ClientActionState } from "@/actions/client";
import { useFormStatus } from "react-dom";
import type { Client } from "@/lib/db/queries/clients";

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  onClientCreated: (client: Client) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Spinner size="sm" /> : "Add Client"}
    </Button>
  );
}

export function ClientSelector({
  clients,
  selectedClientId,
  onClientSelect,
  onClientCreated,
}: ClientSelectorProps) {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [state, formAction] = useActionState<ClientActionState, FormData>(
    async (prevState, formData) => {
      const result = await createClientAction(prevState, formData);
      if (result.success && result.client) {
        onClientCreated(result.client);
        setShowNewClientForm(false);
      }
      return result;
    },
    {}
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") {
      setShowNewClientForm(true);
      onClientSelect("");
    } else {
      setShowNewClientForm(false);
      onClientSelect(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientSelect">Client</Label>
        <Select
          id="clientSelect"
          value={showNewClientForm ? "new" : selectedClientId}
          onChange={handleSelectChange}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.company ? ` (${client.company})` : ""}
            </option>
          ))}
          <option value="new">+ Add new client</option>
        </Select>
      </div>

      {showNewClientForm && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-neutral-900">
            New Client
          </h4>

          {state.error && (
            <div className="mb-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700 border border-error-200">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Client name"
                error={!!state.fieldErrors?.name}
              />
              {state.fieldErrors?.name && (
                <p className="text-xs text-error-600">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="client@example.com"
                error={!!state.fieldErrors?.email}
              />
              {state.fieldErrors?.email && (
                <p className="text-xs text-error-600">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="Phone number" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Company name" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Street address, city, state, zip"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewClientForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
