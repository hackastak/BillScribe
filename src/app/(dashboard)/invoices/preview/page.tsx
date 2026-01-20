import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/queries/profiles";
import { InvoicePreview } from "@/components/invoice/invoice-preview";

export default async function InvoicePreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Invoice Preview</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Review your invoice before creating it
        </p>
      </div>

      <InvoicePreview profile={profile} />
    </div>
  );
}
