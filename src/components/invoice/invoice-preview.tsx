"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createInvoiceAction, type InvoiceActionState } from "@/actions/invoice";
import type { Profile } from "@/lib/db/queries/profiles";
import type { LineItem } from "./line-items";

type InvoicePreviewData = {
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
  profile: Profile | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner size="sm" /> : "Create Invoice"}
    </Button>
  );
}

export function InvoicePreview({ profile }: InvoicePreviewProps) {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoicePreviewData | null>(
    null
  );

  const [state, formAction] = useActionState<InvoiceActionState, FormData>(
    async (prevState, formData) => {
      const result = await createInvoiceAction(prevState, formData);
      if (result.success && result.invoiceId) {
        sessionStorage.removeItem("invoicePreview");
        router.push("/dashboard");
      }
      return result;
    },
    {}
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("invoicePreview");
    if (stored) {
      try {
        setInvoiceData(JSON.parse(stored));
      } catch {
        router.push("/invoices/new");
      }
    } else {
      router.push("/invoices/new");
    }
  }, [router]);

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 border border-error-200">
          {state.error}
        </div>
      )}

      <Card className="p-8">
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
                {invoiceData.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Bill To
              </h3>
              {invoiceData.client ? (
                <div className="mt-2">
                  <p className="font-medium text-neutral-900">
                    {invoiceData.client.name}
                  </p>
                  {invoiceData.client.company && (
                    <p className="text-sm text-neutral-600">
                      {invoiceData.client.company}
                    </p>
                  )}
                  {invoiceData.client.address && (
                    <p className="text-sm text-neutral-600 whitespace-pre-line">
                      {invoiceData.client.address}
                    </p>
                  )}
                  {invoiceData.client.email && (
                    <p className="text-sm text-neutral-600">
                      {invoiceData.client.email}
                    </p>
                  )}
                  {invoiceData.client.phone && (
                    <p className="text-sm text-neutral-600">
                      {invoiceData.client.phone}
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
                    {formatDate(invoiceData.issueDate)}
                  </span>
                </div>
                {invoiceData.dueDate && (
                  <div>
                    <span className="text-sm text-neutral-500">Due Date: </span>
                    <span className="font-medium">
                      {formatDate(invoiceData.dueDate)}
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
                {invoiceData.items.map((item) => (
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
                <span className="font-medium">${invoiceData.subtotal}</span>
              </div>
              {parseFloat(invoiceData.taxRate) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    Tax ({invoiceData.taxRate}%)
                  </span>
                  <span className="font-medium">${invoiceData.taxAmount}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-2 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-neutral-900">
                  ${invoiceData.total}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Notes
              </h3>
              <p className="mt-2 text-sm text-neutral-600 whitespace-pre-line">
                {invoiceData.notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/invoices/new")}
        >
          Edit Invoice
        </Button>

        <form action={formAction}>
          <input
            type="hidden"
            name="clientId"
            value={invoiceData.clientId || ""}
          />
          <input
            type="hidden"
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
          />
          <input type="hidden" name="issueDate" value={invoiceData.issueDate} />
          <input type="hidden" name="dueDate" value={invoiceData.dueDate} />
          <input type="hidden" name="taxRate" value={invoiceData.taxRate} />
          <input type="hidden" name="notes" value={invoiceData.notes} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(invoiceData.items)}
          />
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
