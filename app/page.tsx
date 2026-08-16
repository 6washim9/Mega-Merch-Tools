import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Mega Merch Tools</h1>
        <p className="mx-auto mt-3 max-w-2xl text-dim">
          Free browser-only tools to design, resize, and prep print-on-demand artwork. Your images never
          leave your device.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent"
          >
            <h2 className="font-semibold group-hover:text-accent">{tool.title}</h2>
            <p className="mt-2 text-sm text-dim">{tool.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
