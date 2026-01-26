import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/db/queries/clients";
import {
  getNextInvoiceNumber,
  getInvoiceById,
} from "@/lib/db/queries/invoices";
import { getProfile } from "@/lib/db/queries/profiles";
import { InvoiceForm } from "@/components/invoice/invoice-form";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({
  params,
}: EditInvoicePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const [clients, nextInvoiceNumber, profile, invoice] = await Promise.all([
    getClients(user.id),
    getNextInvoiceNumber(user.id),
    getProfile(user.id),
    getInvoiceById(user.id, id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Invoice</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update the invoice details below
        </p>
      </div>

      <InvoiceForm
        clients={clients}
        nextInvoiceNumber={nextInvoiceNumber}
        profile={profile}
        invoice={invoice}
      />
    </div>
  );
}
