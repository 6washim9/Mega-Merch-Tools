import { describe, expect, it } from "vitest";
import { generateIdeas, formatIdeasAsText, shuffle, NICHES, STYLES, SEASONS, THEMES } from "../lib/ideas";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ZERO = () => 0;

describe("generateIdeas", () => {
  it("returns 5 unique ideas by default", () => {
    const ideas = generateIdeas({ niches: [], styles: [], seasons: [], themes: [] }, 5, lcg(42));
    expect(ideas).toHaveLength(5);
    expect(new Set(ideas.map((i) => i.title)).size).toBe(5);
  });

  it("respects selected categories", () => {
    const ideas = generateIdeas({ niches: ["Dog Lover"], styles: ["Minimalist"], seasons: [], themes: [] }, 3, lcg(7));
    expect(ideas.every((i) => i.title.includes("Dog Lover") && i.title.includes("Minimalist"))).toBe(true);
  });

  it("returns an empty array for count 0", () => {
    expect(generateIdeas({ niches: [], styles: [], seasons: [], themes: [] }, 0)).toEqual([]);
  });
});

describe("formatIdeasAsText", () => {
  it("formats ideas as a numbered list", () => {
    const text = formatIdeasAsText([{ title: "T", description: "D", whyItWorks: "W" }]);
    expect(text).toContain("1. T");
    expect(text).toContain("D");
    expect(text).toContain("Why it works: W");
  });
});

describe("datasets", () => {
  it("has non-empty curated datasets", () => {
    expect(NICHES.length).toBeGreaterThan(20);
    expect(STYLES.length).toBeGreaterThan(8);
    expect(SEASONS.length).toBeGreaterThan(4);
    expect(THEMES.length).toBeGreaterThan(10);
  });
});

describe("shuffle", () => {
  it("preserves all elements", () => {
    const out = shuffle([1, 2, 3, 4, 5], ZERO);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
