import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)]">
      {/* NavBar */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--color-fg-default)]"
          >
            BillScribe
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-6xl">
            Invoice Management Made Simple
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-fg-muted)]">
            BillScribe helps you create professional invoices, track payments,
            and manage your clients—all in one place. Spend less time on
            paperwork and more time growing your business.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--color-bg-muted)] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-4xl">
            Everything you need to manage invoices
          </h2>
          <p className="mt-4 text-center text-lg text-[var(--color-fg-muted)]">
            Simple tools to streamline your billing workflow
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Create Invoices */}
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[var(--color-fg-default)]">
                Create Invoices
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                Generate professional invoices in seconds. Customize templates,
                add line items, and send directly to your clients.
              </p>
            </div>

            {/* Feature 2: Track Payments */}
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[var(--color-fg-default)]">
                Track Payments
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                Monitor payment status in real-time. Get notified when invoices
                are viewed, paid, or overdue.
              </p>
            </div>

            {/* Feature 3: Manage Clients */}
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[var(--color-fg-default)]">
                Manage Clients
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                Keep all your client information organized. Store contact
                details, view invoice history, and build stronger relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-4xl">
            Ready to simplify your invoicing?
          </h2>
          <p className="mt-4 text-lg text-[var(--color-fg-muted)]">
            Join thousands of businesses that trust BillScribe to manage their
            billing. Get started for free today.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
