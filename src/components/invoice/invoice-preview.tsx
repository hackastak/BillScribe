"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  createInvoiceAction,
  updateInvoiceAction,
  type InvoiceActionState,
} from "@/actions/invoice";
import { generateInvoiceHtml } from "@/lib/pdf";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
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

// Convert preview data to InvoiceWithDetails format for PDF template rendering
function convertToInvoiceWithDetails(data: InvoicePreviewData): InvoiceWithDetails {
  return {
    id: "preview",
    invoiceNumber: data.invoiceNumber,
    status: "draft",
    issueDate: data.issueDate,
    dueDate: data.dueDate || null,
    subtotal: data.subtotal,
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
    total: data.total,
    notes: data.notes || null,
    client: data.client,
    items: data.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
  };
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

  // Convert to invoice format and generate HTML using the selected template
  const invoiceData = convertToInvoiceWithDetails(data);
  const selectedTemplate = profile?.invoiceTemplate || "default";
  const invoiceHtml = generateInvoiceHtml(invoiceData, profile, selectedTemplate);

  return (
    <div className="p-4 sm:p-6">
      {state.error && (
        <div className="mb-4 rounded-lg bg-[var(--color-status-error-bg)] px-4 py-3 text-sm text-[var(--color-status-error-fg)] border border-[var(--color-status-error-border)]">
          {state.error}
        </div>
      )}

      {/* PDF Preview */}
      <div className="overflow-auto rounded-lg border border-[var(--color-border-default)] bg-white shadow-lg">
        <div
          className="mx-auto"
          style={{ width: 800, minHeight: 1131 }}
          dangerouslySetInnerHTML={{ __html: invoiceHtml }}
        />
      </div>

      <div className="mt-6 flex justify-between">
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
