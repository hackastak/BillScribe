"use client";

import { Modal } from "@/components/ui/modal";
import { InvoiceView } from "@/components/invoice/invoice-view";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import type { Profile } from "@/lib/db/queries/profiles";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceWithDetails | null;
  profile: Profile | null;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  profile,
}: InvoicePreviewModalProps) {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
      <div className="p-6">
        <InvoiceView invoice={invoice} profile={profile} showBackLink={false} />
      </div>
    </Modal>
  );
}
