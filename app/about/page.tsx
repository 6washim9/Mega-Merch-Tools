import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Mega Merch Tools.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">About</h1>
      <div className="space-y-5 text-dim">
        <p>
          Mega Merch Tools is a free, browser-only toolkit built for print-on-demand (POD) sellers. It covers the
          everyday tasks of designing and prepping merch artwork: resizing to platform requirements, generating
          halftone and distress effects, setting DPI metadata, compressing files, and converting formats.
        </p>
        <h2 className="text-lg font-semibold text-text">Why browser-only?</h2>
        <p>
          Your designs are your work. Everything here runs in your browser using the Canvas API, so your images
          never leave your device. There are no uploads, no accounts, and no watermarks.
        </p>
        <h2 className="text-lg font-semibold text-text">Open source</h2>
        <p>
          This project is open source and free to use. The source code is available on GitHub, where you can also
          report issues or request features.
        </p>
        <p className="pt-4">
          <Link href="/" className="text-accent underline">
            Back to the tools
          </Link>
        </p>
      </div>
    </main>
  );
}
