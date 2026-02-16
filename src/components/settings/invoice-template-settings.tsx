"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { invoiceTemplates, generateInvoiceHtml } from "@/lib/pdf";
import { updateInvoiceTemplateAction } from "@/actions/profile";
import type { InvoiceTemplate } from "@/lib/db/schema/profiles";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";

interface InvoiceTemplateSettingsProps {
  currentTemplate: InvoiceTemplate | null;
  profile: Profile | null;
}

// Sample invoice data for preview
function createSampleInvoice(): InvoiceWithDetails {
  return {
    id: "preview",
    invoiceNumber: "INV-001",
    issueDate: new Date().toISOString().split("T")[0] ?? "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "",
    status: "draft",
    subtotal: "1500.00",
    taxRate: "10",
    taxAmount: "150.00",
    total: "1650.00",
    notes: "Thank you for your business!",
    client: {
      id: "preview",
      name: "Acme Corporation",
      email: "billing@acme.com",
      phone: "(555) 123-4567",
      company: "Acme Corp",
      address: "123 Business Ave\nSuite 100\nNew York, NY 10001",
    },
    items: [
      {
        id: "item-1",
        description: "Website Design & Development",
        quantity: "1",
        unitPrice: "800.00",
        amount: "800.00",
      },
      {
        id: "item-2",
        description: "Logo Design",
        quantity: "1",
        unitPrice: "400.00",
        amount: "400.00",
      },
      {
        id: "item-3",
        description: "SEO Optimization",
        quantity: "3",
        unitPrice: "100.00",
        amount: "300.00",
      },
    ],
  };
}

export function InvoiceTemplateSettings({
  currentTemplate,
  profile,
}: InvoiceTemplateSettingsProps) {
  const [selected, setSelected] = useState<InvoiceTemplate>(
    currentTemplate || "default"
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null);

  const handleSelect = (templateId: InvoiceTemplate) => {
    setSelected(templateId);
    setMessage(null);

    startTransition(async () => {
      const result = await updateInvoiceTemplateAction(templateId);
      if (result.success) {
        setMessage({ type: "success", text: "Template updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update template",
        });
        setSelected(currentTemplate || "default");
      }
    });
  };

  const handlePreview = (templateId: InvoiceTemplate) => {
    setPreviewTemplate(templateId);
  };

  const basicTemplates = invoiceTemplates.filter((t) => t.category === "basic");
  const advancedTemplates = invoiceTemplates.filter(
    (t) => t.category === "advanced"
  );

  const sampleInvoice = createSampleInvoice();
  const previewHtml = previewTemplate
    ? generateInvoiceHtml(sampleInvoice, profile, previewTemplate)
    : "";

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-fg-default)] mb-2">
        Invoice Template
      </h3>
      <p className="text-sm text-[var(--color-fg-muted)] mb-6">
        Choose a template style for your invoice PDFs.
      </p>

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm border ${
            message.type === "success"
              ? "bg-success-50 text-success-700 border-success-200"
              : "bg-error-50 text-error-700 border-error-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Templates */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-3">
          Basic Templates
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {basicTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selected === template.id}
              isLoading={isPending && selected === template.id}
              onSelect={() => handleSelect(template.id)}
              onPreview={() => handlePreview(template.id)}
            />
          ))}
        </div>
      </div>

      {/* Advanced Templates */}
      <div>
        <h4 className="text-sm font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-3">
          Advanced Templates
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advancedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selected === template.id}
              isLoading={isPending && selected === template.id}
              onSelect={() => handleSelect(template.id)}
              onPreview={() => handlePreview(template.id)}
            />
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        className="max-w-[850px]"
      >
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[var(--color-fg-default)]">
                  {invoiceTemplates.find((t) => t.id === previewTemplate)?.name} Template Preview
                </h3>
                {selected === previewTemplate && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-600 text-white">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-fg-muted)]">
                Preview with your company logo and sample invoice data
              </p>
            </div>
            {selected !== previewTemplate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (previewTemplate) {
                    handleSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
                disabled={isPending}
              >
                Use This Template
              </Button>
            )}
          </div>
          <div className="overflow-auto rounded-lg border border-[var(--color-border-default)] bg-white">
            <div
              className="mx-auto"
              style={{ width: 800, minHeight: 600, maxHeight: "70vh" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}

interface TemplateCardProps {
  template: {
    id: InvoiceTemplate;
    name: string;
    description: string;
    category: "basic" | "advanced";
  };
  isSelected: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function TemplateCard({
  template,
  isSelected,
  isLoading,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const previewColors: Record<InvoiceTemplate, { primary: string; secondary: string }> = {
    default: { primary: "#374151", secondary: "#ffffff" },
    classic: { primary: "#1f2937", secondary: "#f9fafb" },
    simple: { primary: "#111111", secondary: "#ffffff" },
    modern: { primary: "#2563eb", secondary: "#f8fafc" },
    professional: { primary: "#111827", secondary: "#fafafa" },
    creative: { primary: "#7c3aed", secondary: "#faf5ff" },
  };

  const colors = previewColors[template.id];

  return (
    <div
      className={`relative text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-[var(--color-border-accent)] bg-[var(--color-bg-accent-subtle)]"
          : "border-[var(--color-border-default)] hover:border-[var(--color-border-accent)] bg-[var(--color-bg-default)]"
      }`}
    >
      {/* Mini Preview - Clickable to select */}
      <button
        type="button"
        onClick={onSelect}
        disabled={isLoading}
        className="w-full h-24 rounded-md mb-3 overflow-hidden border border-[var(--color-border-subtle)] cursor-pointer hover:opacity-90 transition-opacity"
        style={{ background: colors.secondary }}
      >
        {template.id === "creative" ? (
          // Creative template preview with sidebar
          <div className="h-full flex">
            <div
              className="w-1/3 h-full"
              style={{ background: colors.primary }}
            />
            <div className="flex-1 p-2">
              <div
                className="h-2 w-12 rounded mb-2"
                style={{ background: colors.primary }}
              />
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded bg-neutral-200" />
                <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ) : template.id === "modern" ? (
          // Modern template preview with header bar
          <div className="h-full flex flex-col">
            <div
              className="h-6"
              style={{ background: colors.primary }}
            />
            <div className="flex-1 p-2">
              <div className="flex gap-2 mb-2">
                <div className="h-4 w-12 rounded bg-neutral-100" />
                <div className="h-4 w-8 rounded bg-neutral-100" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded bg-neutral-200" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ) : (
          // Standard template preview
          <div className="h-full p-2 flex flex-col">
            <div className="flex justify-between mb-2">
              <div
                className="h-3 w-10 rounded"
                style={{ background: colors.primary, opacity: 0.7 }}
              />
              <div
                className="h-4 w-14 rounded"
                style={{ background: colors.primary }}
              />
            </div>
            <div className="flex-1">
              <div className="space-y-1 mt-2">
                <div className="h-1.5 w-full rounded bg-neutral-200" />
                <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
                <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <div
                className="h-3 w-12 rounded"
                style={{ background: colors.primary }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Template Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-[var(--color-fg-default)]">
              {template.name}
            </h5>
            {isSelected && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-600 text-white">
                Selected
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
            {template.description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading && <Spinner size="sm" />}
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)] rounded transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
