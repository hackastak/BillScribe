"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import { InvoiceStatusSelect } from "@/components/invoice/invoice-status-select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceViewProps {
  invoice: InvoiceWithDetails;
  profile: Profile | null;
  showBackLink?: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
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

export function InvoiceView({
  invoice,
  profile,
  showBackLink = true,
}: InvoiceViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Improve quality
        useCORS: true, // Handle cross-origin images
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page invoices if necessary (basic implementation)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackLink && (
            <Link
              href="/dashboard"
              className="text-neutral-500 hover:text-neutral-700"
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
          <h1 className="text-2xl font-bold text-neutral-900">
            {invoice.invoiceNumber}
          </h1>
          <InvoiceStatusSelect
            invoiceId={invoice.id}
            initialStatus={invoice.status}
          />
        </div>
        <div className="flex items-center gap-3 mr-12">
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

      <Card className="p-8" ref={invoiceRef}>
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
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Bill To
              </h3>
              {invoice.client ? (
                <div className="mt-2">
                  <p className="font-medium text-neutral-900">
                    {invoice.client.name}
                  </p>
                  {invoice.client.company && (
                    <p className="text-sm text-neutral-600">
                      {invoice.client.company}
                    </p>
                  )}
                  {invoice.client.address && (
                    <p className="text-sm text-neutral-600 whitespace-pre-line">
                      {invoice.client.address}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-neutral-600">
                      {invoice.client.email}
                    </p>
                  )}
                  {invoice.client.phone && (
                    <p className="text-sm text-neutral-600">
                      {invoice.client.phone}
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
                    {formatDate(invoice.issueDate)}
                  </span>
                </div>
                {invoice.dueDate && (
                  <div>
                    <span className="text-sm text-neutral-500">Due Date: </span>
                    <span className="font-medium">
                      {formatDate(invoice.dueDate)}
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
                {invoice.items.map((item) => (
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
                      ${parseFloat(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {invoice.subtotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">
                    ${parseFloat(invoice.subtotal).toFixed(2)}
                  </span>
                </div>
              )}
              {invoice.taxRate && parseFloat(invoice.taxRate) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span className="font-medium">
                    ${parseFloat(invoice.taxAmount || "0").toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-2 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-neutral-900">
                  ${parseFloat(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Notes
              </h3>
              <p className="mt-2 text-sm text-neutral-600 whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
