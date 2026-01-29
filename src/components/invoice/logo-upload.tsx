"use client";

import { useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { uploadLogoAction, type LogoUploadState } from "@/actions/invoice";

interface LogoUploadProps {
  currentLogoUrl: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Spinner size="sm" /> : "Upload"}
    </Button>
  );
}

export function LogoUpload({ currentLogoUrl }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState<LogoUploadState, FormData>(
    uploadLogoAction,
    {}
  );

  const displayLogoUrl = state.logoUrl || currentLogoUrl;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-fg-default)] mb-4">
        Company Logo
      </h3>
      <p className="text-sm text-[var(--color-fg-muted)] mb-4">
        Upload your company logo to display on all invoices. Recommended size:
        200x100 pixels.
      </p>

      {state.error && (
        <div className="mb-4 rounded-lg bg-[var(--color-status-error-bg)] px-3 py-2 text-sm text-[var(--color-status-error-fg)] border border-[var(--color-status-error-border)]">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-lg bg-[var(--color-status-success-bg)] px-3 py-2 text-sm text-[var(--color-status-success-fg)] border border-[var(--color-status-success-border)]">
          Logo uploaded successfully!
        </div>
      )}

      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-20 rounded-lg border-2 border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] flex items-center justify-center overflow-hidden">
            {displayLogoUrl ? (
              <Image
                src={displayLogoUrl}
                alt="Company logo"
                width={128}
                height={80}
                className="object-contain"
              />
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-[var(--color-fg-subtle)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">No logo</p>
              </div>
            )}
          </div>
        </div>

        <form action={formAction} className="flex-1">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="flex-1 text-sm text-[var(--color-fg-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-bg-muted)] file:text-[var(--color-fg-default)] hover:file:bg-[var(--color-bg-hover)] file:cursor-pointer"
            />
            <SubmitButton />
          </div>
          <p className="mt-2 text-xs text-[var(--color-fg-subtle)]">
            PNG, JPEG, or WebP. Max 2MB.
          </p>
        </form>
      </div>
    </Card>
  );
}
