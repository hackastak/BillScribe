import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-base)]">
      <MarketingNav />

      {/* Hero Section */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-5xl">
            About BillScribe
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-fg-muted)]">
            We believe invoicing should be effortless. BillScribe was built to
            give freelancers and small businesses a faster way to get paid,
            without the bloat of legacy billing software.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-[var(--color-bg-muted)] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-4xl">
            Our mission
          </h2>
          <p className="mt-6 text-lg leading-8 text-[var(--color-fg-muted)]">
            Independent professionals spend hours every month wrangling invoices,
            chasing payments, and reconciling client information. We&apos;re here
            to give that time back. BillScribe combines clean templates,
            real-time payment tracking, and simple client management into a
            single tool that stays out of your way.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-4xl">
            What we value
          </h2>
          <p className="mt-4 text-center text-lg text-[var(--color-fg-muted)]">
            The principles that guide every feature we ship
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--color-fg-default)]">
                Simplicity first
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                Every workflow is designed to take fewer clicks. If a feature
                doesn&apos;t earn its place, it doesn&apos;t ship.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--color-fg-default)]">
                Built for you
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                We talk to freelancers and small business owners constantly.
                Their feedback drives our roadmap.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--color-fg-default)]">
                Your data, your control
              </h3>
              <p className="mt-2 text-[var(--color-fg-muted)]">
                We never sell your data. Your invoices and client information
                belong to you, full stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--color-bg-muted)] px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-fg-default)] sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-[var(--color-fg-muted)]">
            Join thousands of businesses that trust BillScribe to manage their
            billing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
