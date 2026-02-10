"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoiceStatusSelect } from "@/components/invoice/invoice-status-select";
import { InvoicePreviewModal } from "@/components/invoice/invoice-preview-modal";
import { downloadInvoicePdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import type { Profile } from "@/lib/db/queries/profiles";

interface ActionMenuProps {
  invoice: InvoiceWithDetails;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPreview: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

function ActionMenu({
  invoice,
  isOpen,
  onToggle,
  onClose,
  onPreview,
  onDownload,
  isDownloading,
}: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const menuContent = isOpen && mounted ? createPortal(
    <div
      className="fixed z-[9999] w-40 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-lg"
      style={{
        top: menuPosition.top,
        right: menuPosition.right,
      }}
      data-action-menu
    >
      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            onPreview();
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)]"
        >
          <svg className="h-4 w-4 text-[var(--color-fg-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <button
          type="button"
          onClick={() => {
            onDownload();
            onClose();
          }}
          disabled={isDownloading}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)] disabled:opacity-50"
        >
          {isDownloading ? (
            <svg className="h-4 w-4 animate-spin text-[var(--color-fg-muted)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-[var(--color-fg-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {isDownloading ? "Downloading..." : "Download"}
        </button>
        <Link
          href={`/invoices/${invoice.id}/edit`}
          onClick={onClose}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)]"
        >
          <svg className="h-4 w-4 text-[var(--color-fg-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Link>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block" data-action-menu>
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={cn(
          "rounded-lg p-2 transition-colors",
          "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]",
          "hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]",
          isOpen && "bg-[var(--color-bg-hover)] text-[var(--color-fg-default)]"
        )}
        aria-label="Invoice actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {menuContent}
    </div>
  );
}

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
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Check if click is inside any action menu
      if (!target.closest('[data-action-menu]')) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

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

  const handleDownload = async (invoice: InvoiceWithDetails) => {
    try {
      setDownloadingInvoiceId(invoice.id);
      await downloadInvoicePdf(invoice, profile);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingInvoiceId(null);
    }
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
            className="h-10 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-fg-default)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          className="h-10 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-fg-default)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-center text-[var(--color-fg-subtle)]">
            No invoices found.
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-fg-default)]">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)] truncate">
                    {invoice.client?.name || "No Client"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-[var(--color-fg-default)]">
                  {formatCurrency(invoice.total)}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-[var(--color-fg-muted)]">
                <span>Due: {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <InvoiceStatusSelect
                  invoiceId={invoice.id}
                  initialStatus={invoice.status}
                />
                <ActionMenu
                  invoice={invoice}
                  isOpen={openMenuId === invoice.id}
                  onToggle={() => setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)}
                  onClose={() => setOpenMenuId(null)}
                  onPreview={() => handlePreview(invoice)}
                  onDownload={() => handleDownload(invoice)}
                  isDownloading={downloadingInvoiceId === invoice.id}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-muted)] text-left text-xs font-medium uppercase tracking-wider text-[var(--color-fg-subtle)]">
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
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-[var(--color-fg-subtle)]"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[var(--color-bg-hover)]">
                    <td className="px-6 py-4 font-medium text-[var(--color-fg-default)]">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                      {invoice.client?.name || "No Client"}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusSelect
                        invoiceId={invoice.id}
                        initialStatus={invoice.status}
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[var(--color-fg-default)]">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        invoice={invoice}
                        isOpen={openMenuId === invoice.id}
                        onToggle={() => setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)}
                        onClose={() => setOpenMenuId(null)}
                        onPreview={() => handlePreview(invoice)}
                        onDownload={() => handleDownload(invoice)}
                        isDownloading={downloadingInvoiceId === invoice.id}
                      />
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
          <p className="text-sm text-[var(--color-fg-muted)]">
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
