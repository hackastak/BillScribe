"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LineItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

interface LineItemsProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  errors?: Record<string, string[]>;
  disabled?: boolean;
}

export function LineItems({
  items,
  onItemsChange,
  errors,
  disabled,
}: LineItemsProps) {
  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: "",
      quantity: "1",
      unitPrice: "",
      amount: "0.00",
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    const updatedItems = items.map((item) => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(updated.quantity) || 0;
        const price = parseFloat(updated.unitPrice) || 0;
        updated.amount = (qty * price).toFixed(2);
      }

      return updated;
    });
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--color-fg-default)]">
          Line Items
        </h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addItem}
          disabled={disabled}
        >
          + Add Item
        </Button>
      </div>

      {errors?.items && (
        <p className="text-sm text-[var(--color-status-error-fg)]">
          {errors.items[0]}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--color-border-default)]">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-muted)]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-fg-muted)]">
                Description
              </th>
              <th className="w-24 px-3 py-2 text-left text-xs font-medium text-[var(--color-fg-muted)]">
                Qty
              </th>
              <th className="w-28 px-3 py-2 text-left text-xs font-medium text-[var(--color-fg-muted)]">
                Unit Price
              </th>
              <th className="w-28 px-3 py-2 text-right text-xs font-medium text-[var(--color-fg-muted)]">
                Amount
              </th>
              <th className="w-12 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-default)]">
            {items.map((item, index) => (
              <tr key={item.id} className="bg-[var(--color-bg-surface)]">
                <td className="px-3 py-2">
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Item description"
                    className="h-8 text-sm"
                    error={!!errors?.[`items.${index}.description`]}
                    disabled={disabled}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                    className="h-8 text-sm"
                    error={!!errors?.[`items.${index}.quantity`]}
                    disabled={disabled}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, "unitPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-8 text-sm"
                    error={!!errors?.[`items.${index}.unitPrice`]}
                    disabled={disabled}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-sm font-medium text-[var(--color-fg-default)]">
                    ${item.amount}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1 || disabled}
                    className="text-[var(--color-fg-subtle)] hover:text-[var(--color-status-error-fg)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove item"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
