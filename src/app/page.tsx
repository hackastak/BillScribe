import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Test Supabase connection
  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase connection error:", error.message);
  } else {
    console.log("Supabase connected successfully");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          BillScribe
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Invoice creation and management made simple
        </p>
        <div className="mt-8 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
          {error
            ? "Check console for Supabase connection status"
            : "Supabase connection ready"}
        </div>
      </div>
    </main>
  );
}
