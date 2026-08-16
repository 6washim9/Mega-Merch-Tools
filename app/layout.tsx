import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mega Merch Tools",
  description: "Free browser-based toolkit for print-on-demand sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text antialiased">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Mega Merch Tools
            </Link>
            <nav className="text-sm text-dim">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-border py-6 text-center text-sm text-dim">
          Free POD tools for print-on-demand sellers — everything runs in your browser.
        </footer>
      </body>
    </html>
  );
}
