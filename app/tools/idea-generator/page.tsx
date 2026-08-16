"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Toast } from "@/components/Toast";
import {
  NICHES,
  STYLES,
  SEASONS,
  THEMES,
  generateIdeas,
  formatIdeasAsText,
  pickRandom,
  type MerchIdea,
} from "@/lib/ideas";

function ChipSelect({
  label,
  options,
  selected,
  onToggle,
  onRandom,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onRandom: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dim">{label}</h3>
        <button
          type="button"
          onClick={onRandom}
          className="rounded-md border border-border px-2 py-1 text-xs text-dim transition hover:border-accent hover:text-accent"
        >
          Random pick
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface-2 text-text hover:border-accent"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function IdeaGeneratorPage() {
  const [niches, setNiches] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<MerchIdea[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], setList: (v: string[]) => void) => (value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const generate = () => {
    setIdeas(generateIdeas({ niches, styles, seasons, themes }, 5));
  };

  const copyIdea = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopied(title);
    } catch {
      setError("Clipboard access failed. Please copy manually.");
    }
  };

  const exportTxt = () => {
    if (!ideas) return;
    const blob = new Blob([formatIdeasAsText(ideas)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mega-merch-ideas.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <ToolShell
      title="Design Idea Generator"
      description="Beat creative block by combining proven niches, styles, seasons, and themes into fresh POD design ideas."
    >
      <div className="space-y-6">
        <ChipSelect label="Niches" options={NICHES} selected={niches} onToggle={toggle(niches, setNiches)} onRandom={() => setNiches([pickRandom(NICHES)])} />
        <ChipSelect label="Styles" options={STYLES} selected={styles} onToggle={toggle(styles, setStyles)} onRandom={() => setStyles([pickRandom(STYLES)])} />
        <ChipSelect label="Seasons" options={SEASONS} selected={seasons} onToggle={toggle(seasons, setSeasons)} onRandom={() => setSeasons([pickRandom(SEASONS)])} />
        <ChipSelect label="Themes" options={THEMES} selected={themes} onToggle={toggle(themes, setThemes)} onRandom={() => setThemes([pickRandom(THEMES)])} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2"
          >
            Generate ideas
          </button>
          {ideas && (
            <button
              onClick={exportTxt}
              className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
            >
              Export as .txt
            </button>
          )}
        </div>

        <Toast message={error} />

        {ideas && (
          <div className="space-y-3">
            {ideas.map((idea, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <button
                    onClick={() => copyIdea(idea.title)}
                    className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-dim transition hover:border-accent hover:text-accent"
                  >
                    {copied === idea.title ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-sm text-text">{idea.description}</p>
                <p className="mt-2 text-sm text-dim">{idea.whyItWorks}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
