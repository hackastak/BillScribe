"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  createInvoiceAction,
  updateInvoiceAction,
  type InvoiceActionState,
} from "@/actions/invoice";
import type { Profile } from "@/lib/db/queries/profiles";
import type { LineItem } from "./line-items";

export type InvoicePreviewData = {
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
  } | null;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  taxRate: string;
  notes: string;
  items: LineItem[];
  subtotal: string;
  taxAmount: string;
  total: string;
};

interface InvoicePreviewProps {
  invoiceId?: string;
  profile: Profile | null;
  data: InvoicePreviewData;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Spinner size="sm" />
      ) : isEditing ? (
        "Update Invoice"
      ) : (
        "Create Invoice"
      )}
    </Button>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  // Parse as local date to avoid timezone shifting
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function InvoicePreviewContent({
  invoiceId,
  profile,
  data,
  onClose,
  onSuccess,
}: InvoicePreviewProps) {
  const router = useRouter();

  const [state, formAction] = useActionState<InvoiceActionState, FormData>(
    async (prevState, formData) => {
      const result = invoiceId
        ? await updateInvoiceAction(invoiceId, prevState, formData)
        : await createInvoiceAction(prevState, formData);
      if (result.success && result.invoiceId) {
        onSuccess();
        router.push(`/invoices/${result.invoiceId}`);
      }
      return result;
    },
    {}
  );

  return (
    <div className="p-6">
      {state.error && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 border border-error-200">
          {state.error}
        </div>
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            {profile?.logoUrl && (
              <Image
                src={profile.logoUrl}
                alt="Company logo"
                width={120}
                height={60}
                className="mb-4 object-contain"
              />
            )}
            <h2 className="text-xl font-bold text-neutral-900">
              {profile?.companyName || "Your Company"}
            </h2>
            {profile?.address && (
              <p className="mt-1 text-sm text-neutral-600 whitespace-pre-line">
                {profile.address}
              </p>
            )}
            {profile?.phone && (
              <p className="text-sm text-neutral-600">{profile.phone}</p>
            )}
            {profile?.email && (
              <p className="text-sm text-neutral-600">{profile.email}</p>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-neutral-900">INVOICE</h1>
            <p className="mt-2 text-lg font-medium text-neutral-700">
              {data.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Bill To
            </h3>
            {data.client ? (
              <div className="mt-2">
                <p className="font-medium text-neutral-900">
                  {data.client.name}
                </p>
                {data.client.company && (
                  <p className="text-sm text-neutral-600">
                    {data.client.company}
                  </p>
                )}
                {data.client.address && (
                  <p className="text-sm text-neutral-600 whitespace-pre-line">
                    {data.client.address}
                  </p>
                )}
                {data.client.email && (
                  <p className="text-sm text-neutral-600">
                    {data.client.email}
                  </p>
                )}
                {data.client.phone && (
                  <p className="text-sm text-neutral-600">
                    {data.client.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-400">
                No client selected
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-neutral-500">Issue Date: </span>
                <span className="font-medium">
                  {formatDate(data.issueDate)}
                </span>
              </div>
              {data.dueDate && (
                <div>
                  <span className="text-sm text-neutral-500">Due Date: </span>
                  <span className="font-medium">
                    {formatDate(data.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                  Description
                </th>
                <th className="w-24 px-4 py-3 text-center text-sm font-medium text-neutral-600">
                  Qty
                </th>
                <th className="w-28 px-4 py-3 text-right text-sm font-medium text-neutral-600">
                  Unit Price
                </th>
                <th className="w-28 px-4 py-3 text-right text-sm font-medium text-neutral-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-neutral-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-neutral-600">
                    ${parseFloat(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-neutral-900">
                    ${item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">${data.subtotal}</span>
            </div>
            {parseFloat(data.taxRate) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Tax ({data.taxRate}%)</span>
                <span className="font-medium">${data.taxAmount}</span>
              </div>
            )}
            <div className="border-t border-neutral-200 pt-2 flex justify-between">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="text-xl font-bold text-neutral-900">
                ${data.total}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Notes
            </h3>
            <p className="mt-2 text-sm text-neutral-600 whitespace-pre-line">
              {data.notes}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between border-t border-neutral-200 pt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Continue Editing
        </Button>

        <form action={formAction}>
          <input type="hidden" name="clientId" value={data.clientId || ""} />
          <input
            type="hidden"
            name="invoiceNumber"
            value={data.invoiceNumber}
          />
          <input type="hidden" name="issueDate" value={data.issueDate} />
          <input type="hidden" name="dueDate" value={data.dueDate} />
          <input type="hidden" name="taxRate" value={data.taxRate} />
          <input type="hidden" name="notes" value={data.notes} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(data.items)}
          />
          <SubmitButton isEditing={!!invoiceId} />
        </form>
      </div>
    </div>
  );
}
