import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClients } from "@/lib/db/queries/clients";
import { getNextInvoiceNumber } from "@/lib/db/queries/invoices";
import { getProfile } from "@/lib/db/queries/profiles";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [clients, nextInvoiceNumber, profile] = await Promise.all([
    getActiveClients(user.id),
    getNextInvoiceNumber(user.id),
    getProfile(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Create New Invoice
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Fill in the details below to create a new invoice
        </p>
      </div>

      <InvoiceForm
        clients={clients}
        nextInvoiceNumber={nextInvoiceNumber}
        profile={profile}
      />
    </div>
  );
}
