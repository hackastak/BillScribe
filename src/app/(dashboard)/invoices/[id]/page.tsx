import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import { getProfile } from "@/lib/db/queries/profiles";
import { InvoiceView } from "@/components/invoice/invoice-view";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const [invoice, profile] = await Promise.all([
    getInvoiceById(user.id, id),
    getProfile(user.id),
  ]);

  if (!invoice) {
    notFound();
  }

  return <InvoiceView invoice={invoice} profile={profile} />;
}
