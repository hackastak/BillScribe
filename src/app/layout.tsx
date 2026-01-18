import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillScribe",
  description:
    "A full-stack invoice creation and management tool built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
