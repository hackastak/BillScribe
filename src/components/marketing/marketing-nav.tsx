import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function MarketingNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold font-serif text-[var(--color-fg-default)]"
        >
          BillScribe
        </Link>
        {!user && (
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg-default)]"
            >
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
