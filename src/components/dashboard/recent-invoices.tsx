import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RecentInvoice } from "@/lib/db/queries/invoices";
import { InvoiceStatusSelect } from "@/components/invoice/invoice-status-select";

type RecentInvoicesProps = {
  invoices: RecentInvoice[];
};

function formatCurrency(amount: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

function formatDate(dateString: string): string {
  // Parse as local date to avoid timezone shifting
  const parts = dateString.split("-").map(Number);
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

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Link
            href="/invoices"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[var(--color-fg-muted)]">No invoices yet</p>
            <Link
              href="/invoices/new"
              className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-lg border border-[var(--color-border-muted)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-[var(--color-fg-default)] hover:text-primary-600"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <p className="text-sm text-[var(--color-fg-muted)] truncate">
                        {invoice.clientName ?? "No client"}
                      </p>
                    </div>
                    <p className="text-base font-semibold text-[var(--color-fg-default)]">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-fg-muted)]">
                      {formatDate(invoice.issueDate)}
                    </span>
                    <InvoiceStatusSelect
                      invoiceId={invoice.id}
                      initialStatus={invoice.status}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border-default)]">
                    <th className="pb-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                      Invoice
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                      Client
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                      Status
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-[var(--color-fg-muted)]">
                      Date
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-[var(--color-fg-muted)]">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-[var(--color-border-muted)] last:border-0"
                    >
                      <td className="py-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-[var(--color-fg-default)] hover:text-primary-600"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-4 text-[var(--color-fg-muted)]">
                        {invoice.clientName ?? "No client"}
                      </td>
                      <td className="py-4">
                        <InvoiceStatusSelect
                          invoiceId={invoice.id}
                          initialStatus={invoice.status}
                        />
                      </td>
                      <td className="py-4 text-[var(--color-fg-muted)]">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="py-4 text-right font-medium text-[var(--color-fg-default)]">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
