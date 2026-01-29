import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClientById } from "@/lib/db/queries/clients";
import { ClientForm } from "@/components/client/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const client = await getClientById(user.id, id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/clients"
          className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
        >
          &larr; Back to Clients
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--color-fg-default)]">
          Edit Client
        </h1>
        <p className="mt-1 text-[var(--color-fg-muted)]">
          Update client information.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
        <ClientForm client={client} />
      </div>
    </div>
  );
}
