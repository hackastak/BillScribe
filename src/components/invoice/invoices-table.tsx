"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoiceStatusSelect } from "@/components/invoice/invoice-status-select";
import { InvoicePreviewModal } from "@/components/invoice/invoice-preview-modal";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import type { Profile } from "@/lib/db/queries/profiles";

interface InvoicesTableProps {
  invoices: InvoiceWithDetails[];
  profile: Profile | null;
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function InvoicesTable({
  invoices,
  profile,
  metadata,
}: InvoicesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithDetails | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePreview = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  function formatCurrency(amount: string | number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount));
  }

  function formatDate(dateStr: string) {
    const parts = dateStr.split("-").map(Number);
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const currentSort = searchParams.get("sort") || "date-desc";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <select
            className="h-10 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchParams.get("status") || "all"}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sort Controls (could be headers, but simple select for mobile friendliness) */}
        <select
          className="h-10 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-6 py-3">Invoice</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {invoice.client?.name || "No Client"}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusSelect
                        invoiceId={invoice.id}
                        initialStatus={invoice.status}
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-neutral-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePreview(invoice)}
                        >
                          Preview
                        </Button>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Page {metadata.page} of {metadata.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={metadata.page <= 1}
              onClick={() => handlePageChange(metadata.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={metadata.page >= metadata.totalPages}
              onClick={() => handlePageChange(metadata.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={selectedInvoice}
        profile={profile}
      />
    </div>
  );
}
