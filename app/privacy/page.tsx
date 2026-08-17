import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Mega Merch Tools.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="space-y-5 text-dim">
        <p>
          Mega Merch Tools (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the Mega Merch Tools website. This policy explains what
          information we collect and how we use it.
        </p>
        <h2 className="text-lg font-semibold text-text">Client-side processing</h2>
        <p>
          All image processing tools run entirely in your browser using the Canvas API. The images you upload
          are never transmitted to or stored on any server.
        </p>
        <h2 className="text-lg font-semibold text-text">Advertising</h2>
        <p>
          We may display advertisements served by Google AdSense. Google may use cookies to serve ads based on
          your prior visits to this site or other sites. You can learn about Google&apos;s advertising practices and
          opt out of personalised advertising at the{" "}
          <a
            className="text-accent underline"
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads policy page
          </a>
          .
        </p>
        <h2 className="text-lg font-semibold text-text">Cookies</h2>
        <p>
          This site may use cookies for analytics and advertising. You can control or delete cookies through your
          browser settings.
        </p>
        <h2 className="text-lg font-semibold text-text">Contact</h2>
        <p>
          If you have any questions about this policy, please contact us through the GitHub repository for this
          project.
        </p>
        <p className="pt-4 text-sm">Last updated: August 2026.</p>
      </div>
    </main>
  );
}
