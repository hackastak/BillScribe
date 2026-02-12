"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import { InvoiceStatusSelect } from "@/components/invoice/invoice-status-select";
import { generateInvoiceHtml, downloadInvoicePdf } from "@/lib/pdf";

interface InvoiceViewProps {
  invoice: InvoiceWithDetails;
  profile: Profile | null;
  showBackLink?: boolean;
}

export function InvoiceView({
  invoice,
  profile,
  showBackLink = true,
}: InvoiceViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadInvoicePdf(invoice, profile);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Get the selected template from profile or default to classic
  const selectedTemplate = profile?.invoiceTemplate || "classic";
  const invoiceHtml = generateInvoiceHtml(invoice, profile, selectedTemplate);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {showBackLink && (
            <Link
              href="/dashboard"
              className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg-default)]">
            {invoice.invoiceNumber}
          </h1>
          <InvoiceStatusSelect
            invoiceId={invoice.id}
            initialStatus={invoice.status}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:mr-12">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="secondary" size="sm">
            Send Invoice
          </Button>
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoice Preview using selected template */}
      <div className="overflow-x-auto">
        <div
          className="mx-auto rounded-lg shadow-lg"
          style={{ width: 800, height: 1131 }}
        >
          <div
            ref={invoiceRef}
            className="overflow-hidden rounded-lg"
            style={{ width: 800, height: 1131 }}
            dangerouslySetInnerHTML={{ __html: invoiceHtml }}
          />
        </div>
      </div>
    </div>
  );
}
