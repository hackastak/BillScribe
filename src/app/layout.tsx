import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { StripeProvider } from "@/components/providers/stripe-provider";

export const metadata: Metadata = {
  title: "BillScribe",
  description:
    "A full-stack invoice creation and management tool built with Next.js and Supabase",
};

// Inline script to prevent flash of wrong theme - runs before React hydrates
const themeScript = `
  (function() {
    const stored = localStorage.getItem('billscribe-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || 'system';
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <StripeProvider>{children}</StripeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
