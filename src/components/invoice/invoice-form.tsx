"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ClientSelector } from "./client-selector";
import { LineItems, type LineItem } from "./line-items";
import type { Client } from "@/lib/db/queries/clients";

interface InvoiceFormProps {
  clients: Client[];
  nextInvoiceNumber: string;
}

export function InvoiceForm({ clients, nextInvoiceNumber }: InvoiceFormProps) {
  const router = useRouter();
  const [clientList, setClientList] = useState<Client[]>(clients);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: "1",
      unitPrice: "",
      amount: "0.00",
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

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

    const selectedClient = clientList.find((c) => c.id === selectedClientId);

    const invoiceData = {
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

    sessionStorage.setItem("invoicePreview", JSON.stringify(invoiceData));
    router.push("/invoices/preview");
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 md:grid-cols-2">
          <ClientSelector
            clients={clientList}
            selectedClientId={selectedClientId}
            onClientSelect={setSelectedClientId}
            onClientCreated={handleClientCreated}
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
                />
                {errors.dueDate && (
                  <p className="text-sm text-error-600">{errors.dueDate[0]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <LineItems items={items} onItemsChange={setItems} errors={errors} />
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
                  <span className="font-medium">${calculations.taxAmount}</span>
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" onClick={handlePreview}>
          Preview Invoice
        </Button>
      </div>
    </div>
  );
}
