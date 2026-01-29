"use client";

import { useTransition, useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  toggleClientStatusAction,
  getClientInvoiceStatsAction,
} from "@/actions/client";
import type { Client } from "@/lib/db/queries/clients";
import type { ClientInvoiceStats } from "@/lib/db/queries/invoices";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientDetailModal({
  isOpen,
  onClose,
  client,
}: ClientDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [invoiceStats, setInvoiceStats] = useState<ClientInvoiceStats | null>(
    null
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setIsLoadingStats(true);
      getClientInvoiceStatsAction(client.id)
        .then((stats) => {
          setInvoiceStats(stats);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    } else {
      setInvoiceStats(null);
    }
  }, [isOpen, client]);

  if (!client) return null;

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  const handleToggleStatus = () => {
    startTransition(async () => {
      await toggleClientStatusAction(client.id);
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--color-fg-default)]">
              {client.name}
            </h2>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium border ${
                client.status === "active"
                  ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-[var(--color-status-success-border)]"
                  : "bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)] border-[var(--color-status-neutral-border)]"
              }`}
            >
              {client.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          {client.company && (
            <p className="mt-1 text-[var(--color-fg-muted)]">{client.company}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-subtle)]">Email</p>
              <p className="mt-1 text-[var(--color-fg-default)]">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {client.email}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-subtle)]">Phone</p>
              <p className="mt-1 text-[var(--color-fg-default)]">
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-primary-600 hover:underline"
                  >
                    {client.phone}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>

          {client.address && (
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-subtle)]">Address</p>
              <p className="mt-1 whitespace-pre-line text-[var(--color-fg-default)]">
                {client.address}
              </p>
            </div>
          )}

          {client.notes && (
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-subtle)]">Notes</p>
              <p className="mt-1 whitespace-pre-line text-[var(--color-fg-default)]">
                {client.notes}
              </p>
            </div>
          )}

          {/* Invoice Statistics */}
          <div className="border-t border-[var(--color-border-default)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--color-fg-default)] mb-3">
              Invoice Statistics
            </h3>
            {isLoadingStats ? (
              <div className="text-sm text-[var(--color-fg-subtle)]">Loading stats...</div>
            ) : invoiceStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-[var(--color-bg-muted)] p-3 border border-[var(--color-border-default)]">
                  <p className="text-xs font-medium text-[var(--color-fg-subtle)]">
                    Total Invoices
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-fg-default)]">
                    {invoiceStats.totalInvoices}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-status-success-bg)] p-3 border border-[var(--color-status-success-border)]">
                  <p className="text-xs font-medium text-[var(--color-status-success-fg)]">
                    Amount Paid
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-status-success-fg)]">
                    {formatCurrency(invoiceStats.paidAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-status-warning-bg)] p-3 border border-[var(--color-status-warning-border)]">
                  <p className="text-xs font-medium text-[var(--color-status-warning-fg)]">
                    Pending Amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-status-warning-fg)]">
                    {formatCurrency(invoiceStats.pendingAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-status-error-bg)] p-3 border border-[var(--color-status-error-border)]">
                  <p className="text-xs font-medium text-[var(--color-status-error-fg)]">
                    Overdue Amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-status-error-fg)]">
                    {formatCurrency(invoiceStats.overdueAmount)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-fg-subtle)]">
                No invoice data available
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border-default)] pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-[var(--color-fg-subtle)]">Created</p>
                <p className="mt-1 text-[var(--color-fg-muted)]">
                  {formatDate(client.createdAt)}
                </p>
              </div>
              <div>
                <p className="font-medium text-[var(--color-fg-subtle)]">Last Updated</p>
                <p className="mt-1 text-[var(--color-fg-muted)]">
                  {formatDate(client.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 border-t border-[var(--color-border-default)] pt-4">
          <Button
            variant="destructive"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {client.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Link href={`/clients/${client.id}/edit`}>
              <Button>Edit Client</Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
