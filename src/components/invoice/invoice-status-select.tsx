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
  draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
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
        <option value="draft" className="bg-white text-neutral-900">
          Draft
        </option>
        <option value="sent" className="bg-white text-neutral-900">
          Sent
        </option>
        <option value="paid" className="bg-white text-neutral-900">
          Paid
        </option>
        <option value="overdue" className="bg-white text-neutral-900">
          Overdue
        </option>
        <option value="cancelled" className="bg-white text-neutral-900">
          Cancelled
        </option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
