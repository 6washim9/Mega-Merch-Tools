import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Mega Merch Tools",
  description: "Terms of service for Mega Merch Tools.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <div className="space-y-5 text-dim">
        <p>
          By using Mega Merch Tools (&ldquo;the Service&rdquo;), you agree to these terms. If you do not agree, please do
          not use the Service.
        </p>
        <h2 className="text-lg font-semibold text-text">Use of the Service</h2>
        <p>
          The Service provides free browser-based image tools for personal and commercial use. All tools process
          images locally on your device. You are responsible for the images you process and for ensuring you have
          the rights to use them.
        </p>
        <h2 className="text-lg font-semibold text-text">No warranty</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee
          that the Service will be uninterrupted, error-free, or that output files will meet any particular
          platform&apos;s requirements.
        </p>
        <h2 className="text-lg font-semibold text-text">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any damages arising from your use of
          or inability to use the Service.
        </p>
        <h2 className="text-lg font-semibold text-text">Changes to these terms</h2>
        <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance.</p>
        <p className="pt-4 text-sm">Last updated: August 2026.</p>
      </div>
    </main>
  );
}
