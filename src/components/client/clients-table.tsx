"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientDetailModal } from "@/components/client/client-detail-modal";
import { toggleClientStatusAction } from "@/actions/client";
import type { Client } from "@/lib/db/queries/clients";

interface ClientsTableProps {
  clients: Client[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function ClientsTable({ clients, metadata }: ClientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const handleToggleStatus = (clientId: string) => {
    startTransition(async () => {
      await toggleClientStatusAction(clientId);
    });
  };

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const currentSort = searchParams.get("sort") || "name-asc";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search clients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <select
          className="h-10 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-fg-default)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="created-desc">Newest First</option>
          <option value="created-asc">Oldest First</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {clients.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-center text-[var(--color-fg-subtle)]">
            No clients found.{" "}
            <Link
              href="/clients/new"
              className="text-primary-600 hover:underline"
            >
              Add your first client
            </Link>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-fg-default)]">
                    {client.name}
                  </p>
                  {client.company && (
                    <p className="text-sm text-[var(--color-fg-muted)] truncate">
                      {client.company}
                    </p>
                  )}
                  {client.email && (
                    <p className="text-sm text-[var(--color-fg-muted)] truncate">
                      {client.email}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium border ${
                    client.status === "active"
                      ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-[var(--color-status-success-border)]"
                      : "bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)] border-[var(--color-status-neutral-border)]"
                  }`}
                >
                  {client.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewClient(client)}
                >
                  View
                </Button>
                <Link href={`/clients/${client.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[var(--color-fg-subtle)]"
                  >
                    No clients found.{" "}
                    <Link
                      href="/clients/new"
                      className="text-primary-600 hover:underline"
                    >
                      Add your first client
                    </Link>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[var(--color-bg-hover)]">
                    <td className="px-6 py-4 font-medium text-[var(--color-fg-default)]">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                      {client.company || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium border ${
                          client.status === "active"
                            ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-[var(--color-status-success-border)]"
                            : "bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)] border-[var(--color-status-neutral-border)]"
                        }`}
                      >
                        {client.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewClient(client)}
                        >
                          View
                        </Button>
                        <Link href={`/clients/${client.id}/edit`}>
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

      <ClientDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}
