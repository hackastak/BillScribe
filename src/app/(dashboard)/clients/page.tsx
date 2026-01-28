import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientsPaginated } from "@/lib/db/queries/clients";
import { ClientsTable } from "@/components/client/clients-table";
import { Button } from "@/components/ui/button";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = typeof params.query === "string" ? params.query : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;

  const clientsData = await getClientsPaginated(user.id, {
    page,
    pageSize: 10,
    query,
    status,
    sort,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
          <p className="mt-1 text-neutral-600">
            Manage your client information.
          </p>
        </div>
        <Link href="/clients/new">
          <Button>Add Client</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading clients...</div>}>
        <ClientsTable
          clients={clientsData.data}
          metadata={clientsData.metadata}
        />
      </Suspense>
    </div>
  );
}
