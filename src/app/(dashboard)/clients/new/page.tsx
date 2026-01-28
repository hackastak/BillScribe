import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/client/client-form";

export default async function NewClientPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/clients"
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          &larr; Back to Clients
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Add New Client
        </h1>
        <p className="mt-1 text-neutral-600">
          Create a new client to use in your invoices.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <ClientForm />
      </div>
    </div>
  );
}
