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
            <h2 className="text-xl font-semibold text-neutral-900">
              {client.name}
            </h2>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                client.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {client.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          {client.company && (
            <p className="mt-1 text-neutral-600">{client.company}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">Email</p>
              <p className="mt-1 text-neutral-900">
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
              <p className="text-sm font-medium text-neutral-500">Phone</p>
              <p className="mt-1 text-neutral-900">
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
              <p className="text-sm font-medium text-neutral-500">Address</p>
              <p className="mt-1 whitespace-pre-line text-neutral-900">
                {client.address}
              </p>
            </div>
          )}

          {client.notes && (
            <div>
              <p className="text-sm font-medium text-neutral-500">Notes</p>
              <p className="mt-1 whitespace-pre-line text-neutral-900">
                {client.notes}
              </p>
            </div>
          )}

          {/* Invoice Statistics */}
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Invoice Statistics
            </h3>
            {isLoadingStats ? (
              <div className="text-sm text-neutral-500">Loading stats...</div>
            ) : invoiceStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium text-neutral-500">
                    Total Invoices
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">
                    {invoiceStats.totalInvoices}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs font-medium text-green-700">
                    Amount Paid
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-green-900">
                    {formatCurrency(invoiceStats.paidAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3">
                  <p className="text-xs font-medium text-yellow-700">
                    Pending Amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-yellow-900">
                    {formatCurrency(invoiceStats.pendingAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    Overdue Amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-red-900">
                    {formatCurrency(invoiceStats.overdueAmount)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                No invoice data available
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-neutral-500">Created</p>
                <p className="mt-1 text-neutral-700">
                  {formatDate(client.createdAt)}
                </p>
              </div>
              <div>
                <p className="font-medium text-neutral-500">Last Updated</p>
                <p className="mt-1 text-neutral-700">
                  {formatDate(client.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 border-t border-neutral-200 pt-4">
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
