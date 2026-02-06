import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/ui/user-menu";
import { MobileNav } from "@/components/ui/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-8">
            <MobileNav />
            <Link href="/dashboard" className="text-xl font-bold text-[var(--color-fg-default)]">
              BillScribe
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
              >
                Invoices
              </Link>
              <Link
                href="/clients"
                className="text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
              >
                Clients
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu email={user.email || ""} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
