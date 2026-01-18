import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              BillScribe
            </h1>
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-card">{children}</div>
      </div>
    </div>
  );
}
