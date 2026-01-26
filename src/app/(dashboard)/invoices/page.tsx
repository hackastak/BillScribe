import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoices } from "@/lib/db/queries/invoices";
import { getProfile } from "@/lib/db/queries/profiles";
import { InvoicesTable } from "@/components/invoice/invoices-table";
import { Button } from "@/components/ui/button";

export default async function InvoicesPage({
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

  const [invoicesData, profile] = await Promise.all([
    getInvoices(user.id, {
      page,
      pageSize: 10,
      query,
      status,
      sort,
    }),
    getProfile(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invoices</h1>
          <p className="mt-1 text-neutral-600">
            Manage your invoices and payments.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>Create Invoice</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading invoices...</div>}>
        <InvoicesTable
          invoices={invoicesData.data}
          metadata={invoicesData.metadata}
          profile={profile}
        />
      </Suspense>
    </div>
  );
}
