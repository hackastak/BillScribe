"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { invoiceTemplates } from "@/lib/pdf";
import { updateInvoiceTemplateAction } from "@/actions/profile";
import type { InvoiceTemplate } from "@/lib/db/schema/profiles";

interface InvoiceTemplateSettingsProps {
  currentTemplate: InvoiceTemplate | null;
}

export function InvoiceTemplateSettings({
  currentTemplate,
}: InvoiceTemplateSettingsProps) {
  const [selected, setSelected] = useState<InvoiceTemplate>(
    currentTemplate || "default"
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const basicTemplates = invoiceTemplates.filter((t) => t.category === "basic");
  const advancedTemplates = invoiceTemplates.filter(
    (t) => t.category === "advanced"
  );

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
            />
          ))}
        </div>
      </div>
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
}

function TemplateCard({
  template,
  isSelected,
  isLoading,
  onSelect,
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
    <button
      type="button"
      onClick={onSelect}
      disabled={isLoading}
      className={`relative text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-[var(--color-border-accent)] bg-[var(--color-bg-accent-subtle)]"
          : "border-[var(--color-border-default)] hover:border-[var(--color-border-accent)] bg-[var(--color-bg-default)]"
      }`}
    >
      {/* Mini Preview */}
      <div
        className="h-24 rounded-md mb-3 overflow-hidden border border-[var(--color-border-subtle)]"
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
      </div>

      {/* Template Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h5 className="font-medium text-[var(--color-fg-default)]">
            {template.name}
          </h5>
          <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
            {template.description}
          </p>
        </div>
        {isLoading ? (
          <Spinner size="sm" />
        ) : isSelected ? (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-bg-accent)] flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        ) : null}
      </div>
    </button>
  );
}
