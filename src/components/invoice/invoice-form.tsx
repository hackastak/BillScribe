"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ClientSelector } from "./client-selector";
import { LineItems, type LineItem } from "./line-items";
import {
  InvoicePreviewContent,
  type InvoicePreviewData,
} from "./invoice-preview";
import { deleteInvoiceAction } from "@/actions/invoice";
import type { Client } from "@/lib/db/queries/clients";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";

interface InvoiceFormProps {
  clients: Client[];
  nextInvoiceNumber: string;
  profile: Profile | null;
  invoice?: InvoiceWithDetails;
}

export function InvoiceForm({
  clients,
  nextInvoiceNumber,
  profile,
  invoice,
}: InvoiceFormProps) {
  const router = useRouter();
  const [clientList, setClientList] = useState<Client[]>(clients);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    invoice?.client?.id || ""
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    invoice?.invoiceNumber || nextInvoiceNumber
  );
  const [issueDate, setIssueDate] = useState<string>(
    (invoice?.issueDate || new Date().toISOString().split("T")[0]) ?? ""
  );
  const [dueDate, setDueDate] = useState<string>(invoice?.dueDate || "");
  const [taxRate, setTaxRate] = useState<string>(invoice?.taxRate || "");
  const [notes, setNotes] = useState<string>(invoice?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items && invoice.items.length > 0
      ? invoice.items
      : [
          {
            id: crypto.randomUUID(),
            description: "",
            quantity: "1",
            unitPrice: "",
            amount: "0.00",
          },
        ]
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const calculations = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.amount || "0"),
      0
    );
    const taxRateNum = parseFloat(taxRate) || 0;
    const taxAmount = subtotal * (taxRateNum / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  }, [items, taxRate]);

  const isReadOnly = invoice && invoice.status !== "draft";

  const handleClientCreated = (client: Client) => {
    setClientList((prev) => [...prev, client]);
    setSelectedClientId(client.id);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!invoiceNumber.trim()) {
      newErrors.invoiceNumber = ["Invoice number is required"];
    }

    if (!issueDate) {
      newErrors.issueDate = ["Issue date is required"];
    }

    if (dueDate && issueDate && new Date(dueDate) < new Date(issueDate)) {
      newErrors.dueDate = ["Due date must be on or after issue date"];
    }

    const hasValidItems = items.some(
      (item) =>
        item.description.trim() &&
        parseFloat(item.quantity) > 0 &&
        parseFloat(item.unitPrice) >= 0
    );

    if (!hasValidItems) {
      newErrors.items = ["At least one valid line item is required"];
    }

    items.forEach((item, index) => {
      if (item.description.trim() || item.unitPrice) {
        if (!item.description.trim()) {
          newErrors[`items.${index}.description`] = ["Description is required"];
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          newErrors[`items.${index}.quantity`] = [
            "Quantity must be a positive number",
          ];
        }
        if (item.unitPrice && parseFloat(item.unitPrice) < 0) {
          newErrors[`items.${index}.unitPrice`] = [
            "Unit price must be non-negative",
          ];
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const getPreviewData = (): InvoicePreviewData => {
    const selectedClient = clientList.find((c) => c.id === selectedClientId);
    return {
      clientId: selectedClientId,
      client: selectedClient || null,
      invoiceNumber,
      issueDate,
      dueDate,
      taxRate,
      notes,
      items: items.filter(
        (item) => item.description.trim() || parseFloat(item.unitPrice) > 0
      ),
      ...calculations,
    };
  };

  const handleSuccess = () => {
    setShowPreview(false);
  };

  const handleDelete = async () => {
    if (!invoice) return;

    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteInvoiceAction(invoice.id);

    if (result.error) {
      setDeleteError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push("/invoices");
  };

  return (
    <>
      <div className="space-y-6">
        {isReadOnly && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Editing Restricted
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This invoice cannot be edited because it is currently marked
                    as <strong>{invoice.status}</strong>. Only draft invoices
                    can be edited.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <div className="grid gap-6 md:grid-cols-2">
            <ClientSelector
              clients={clientList}
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
              onClientCreated={handleClientCreated}
              disabled={isReadOnly}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-2026-0001"
                  error={!!errors.invoiceNumber}
                  disabled={isReadOnly}
                />
                {errors.invoiceNumber && (
                  <p className="text-sm text-error-600">
                    {errors.invoiceNumber[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    error={!!errors.issueDate}
                    disabled={isReadOnly}
                  />
                  {errors.issueDate && (
                    <p className="text-sm text-error-600">
                      {errors.issueDate[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    error={!!errors.dueDate}
                    disabled={isReadOnly}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-error-600">
                      {errors.dueDate[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <LineItems
            items={items}
            onItemsChange={setItems}
            errors={errors}
            disabled={isReadOnly}
          />
        </Card>

        <Card>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, thank you message, or any additional notes..."
                rows={4}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0.00"
                  disabled={isReadOnly}
                />
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">${calculations.subtotal}</span>
                </div>
                {parseFloat(taxRate) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax ({taxRate}%)</span>
                    <span className="font-medium">
                      ${calculations.taxAmount}
                    </span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="font-medium text-neutral-900">Total</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    ${calculations.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <div>
            {invoice && !isReadOnly && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Invoice
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {isReadOnly ? "Go Back" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="button" onClick={handlePreview}>
                Preview Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
        <InvoicePreviewContent
          invoiceId={invoice?.id}
          profile={profile}
          data={getPreviewData()}
          onClose={() => setShowPreview(false)}
          onSuccess={handleSuccess}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteError(null);
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Delete Invoice
            </h3>
          </div>

          <p className="text-neutral-600 mb-4">
            Are you sure you want to delete invoice{" "}
            <strong>{invoice?.invoiceNumber}</strong>? This action cannot be
            undone.
          </p>

          {deleteError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
