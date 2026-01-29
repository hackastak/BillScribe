"use client";

import { useOptimistic, useTransition } from "react";
import { updateInvoiceStatusAction } from "@/actions/invoice";
import { cn } from "@/lib/utils";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface InvoiceStatusSelectProps {
  invoiceId: string;
  initialStatus: InvoiceStatus;
  className?: string;
}

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)] border-[var(--color-status-neutral-border)]",
  sent: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)] border-[var(--color-status-info-border)]",
  paid: "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-[var(--color-status-success-border)]",
  overdue: "bg-[var(--color-status-error-bg)] text-[var(--color-status-error-fg)] border-[var(--color-status-error-border)]",
  cancelled: "bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)] border-[var(--color-status-neutral-border)]",
};

export function InvoiceStatusSelect({
  invoiceId,
  initialStatus,
  className,
}: InvoiceStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialStatus,
    (state, newStatus: InvoiceStatus) => newStatus
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as InvoiceStatus;
    startTransition(async () => {
      setOptimisticStatus(newStatus);
      await updateInvoiceStatusAction(invoiceId, newStatus);
    });
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={optimisticStatus}
        onChange={handleChange}
        disabled={isPending}
        className={cn(
          "h-7 rounded-full border px-2.5 py-0 text-xs font-medium capitalize outline-none transition-colors appearance-none cursor-pointer pr-6",
          statusStyles[optimisticStatus],
          "focus:ring-2 focus:ring-offset-1 focus:ring-neutral-300",
          isPending && "opacity-70 cursor-wait"
        )}
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg
          className="h-3 w-3 text-current"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
