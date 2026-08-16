# Mega Merch Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Mega Merch Tools, a free browser-only toolkit for print-on-demand sellers, with 7 client-side tools on a dark modern Next.js app, and push it to `https://github.com/6washim9/Mega-Merch-Tools`.

**Architecture:** Multi-route Next.js (App Router) + TypeScript app. Each tool lives at `app/tools/<tool>/page.tsx` and is a `"use client"` page sharing a common UI shell, uploader, and download components. All image processing happens in the browser via the Canvas API; pure algorithms live in `lib/` for unit testing.

**Tech Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS v4, Canvas API, Vitest + jsdom.

## Global Constraints

- Next.js App Router + TypeScript; no `src/` directory; import alias `@/*`
- All image processing runs client-side; no file uploads to any server
- Dark modern theme (near-black background, indigo/violet accent)
- Exactly 7 tools in v1: idea generator, resize for Amazon Merch, resize for Etsy & POD, halftone, distress texture, PNG to 300 DPI
- `npm run lint` and `npm run build` must pass with zero errors
- Vitest tests for `lib/` pure functions must pass
- Dev server `allowedDevOrigins` must include `.monkeycode-ai.live`
- `origin` remote = `https://github.com/6washim9/Mega-Merch-Tools.git`, final branch `main`
- No emojis anywhere in UI or code
- Each task ends with a commit (conventional format: `feat:` / `chore:` / `test:` / `docs:`)

---

### Task 1: Scaffold Next.js App and Set Up Vitest

**Files:**
- Create: `/workspace` app scaffold (via create-next-app)
- Modify: `next.config.ts`
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces: working Next.js dev/build pipeline, `npm test` script, `vitest.config.ts` test runner.

- [ ] **Step 1: Scaffold the app**

Run from `/workspace`:

```bash
CI=1 npx --yes create-next-app@latest . --typescript --eslint --tailwind --app --no-src-dir --import-alias "@/*" --turbopack --use-npm --yes
```

Expected: creates `app/`, `components/` (empty), `public/`, `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`. The existing `.git` repo and `docs/` folder are preserved. If the flag set is rejected, drop `--yes` and retry.

- [ ] **Step 2: Add dev-host allowlist to next.config.ts**

Read `next.config.ts`, then replace its contents with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [".monkeycode-ai.live"],
};

export default nextConfig;
```

- [ ] **Step 3: Install test dependencies**

Run:

```bash
npm install -D vitest jsdom
```

Expected: `vitest` and `jsdom` appear under `devDependencies` in `package.json`.

- [ ] **Step 4: Add test script**

Edit `package.json` `scripts` to add:

```json
"test": "vitest run"
```

- [ ] **Step 5: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Create smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("runs the test runner", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
npm test
```

Expected: 1 test passes.

Run:

```bash
npm run build
```

Expected: build succeeds with zero errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with vitest"
```

---

### Task 2: Canvas Utilities and Resize Library

**Files:**
- Create: `lib/canvas.ts`
- Create: `lib/resize.ts`
- Create: `tests/resize.test.ts`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces:
  - `fileToCanvas(file: File, maxSize?: number): Promise<LoadedImage>` where `LoadedImage = { canvas: HTMLCanvasElement; originalWidth: number; originalHeight: number; downscaled: boolean }`
  - `canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob>`
  - `computeFit(sourceW: number, sourceH: number, targetW: number, targetH: number, mode: FitMode): FitResult` where `FitResult = { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number }`
  - `resizeImage(source: HTMLCanvasElement, targetW: number, targetH: number, mode: FitMode, upscale?: boolean): Promise<HTMLCanvasElement>`
  - `makeSeoFilename(base: string, width: number, height: number): string`
  - `type FitMode = "contain" | "cover" | "stretch"`

- [ ] **Step 1: Write the failing tests**

Create `tests/resize.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeFit, makeSeoFilename } from "../lib/resize";

describe("computeFit", () => {
  it("contain centers the image inside the target preserving aspect", () => {
    const fit = computeFit(1000, 500, 100, 100, "contain");
    expect(fit).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 500, dx: 0, dy: 25, dw: 100, dh: 50 });
  });

  it("cover crops the source to fill the target", () => {
    const fit = computeFit(1000, 500, 100, 100, "cover");
    expect(fit.dw).toBe(100);
    expect(fit.dh).toBe(100);
    expect(fit.sx).toBe(250);
    expect(fit.sy).toBe(0);
    expect(fit.sw).toBe(500);
    expect(fit.sh).toBe(500);
  });

  it("stretch maps the full source to the full target", () => {
    const fit = computeFit(1000, 500, 100, 200, "stretch");
    expect(fit).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 500, dx: 0, dy: 0, dw: 100, dh: 200 });
  });
});

describe("makeSeoFilename", () => {
  it("strips extension, sanitizes, and appends target size", () => {
    expect(makeSeoFilename("My  Design!.PNG", 4500, 5400)).toBe("my-design-4500x5400.png");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/resize.test.ts`
Expected: FAIL — `Cannot find module '../lib/resize'`.

- [ ] **Step 3: Write the canvas utilities**

Create `lib/canvas.ts`:

```ts
export const SAFE_WORKING_SIZE = 2000;
export const OVERSIZED_THRESHOLD = 4000;

export interface LoadedImage {
  canvas: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
  downscaled: boolean;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image file"));
    };
    img.src = url;
  });
}

export async function fileToCanvas(file: File, maxSize: number = SAFE_WORKING_SIZE): Promise<LoadedImage> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight, downscaled: scale < 1 };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode image"));
      },
      type,
      quality
    );
  });
}
```

- [ ] **Step 4: Write the resize library**

Create `lib/resize.ts`:

```ts
export type FitMode = "contain" | "cover" | "stretch";

export interface FitResult {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export function computeFit(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  mode: FitMode
): FitResult {
  if (mode === "stretch") {
    return { sx: 0, sy: 0, sw: sourceW, sh: sourceH, dx: 0, dy: 0, dw: targetW, dh: targetH };
  }
  if (mode === "cover") {
    const scale = Math.max(targetW / sourceW, targetH / sourceH);
    const sw = targetW / scale;
    const sh = targetH / scale;
    return { sx: (sourceW - sw) / 2, sy: (sourceH - sh) / 2, sw, sh, dx: 0, dy: 0, dw: targetW, dh: targetH };
  }
  const scale = Math.min(targetW / sourceW, targetH / sourceH);
  const dw = sourceW * scale;
  const dh = sourceH * scale;
  return { sx: 0, sy: 0, sw: sourceW, sh: sourceH, dx: (targetW - dw) / 2, dy: (targetH - dh) / 2, dw, dh };
}

export async function resizeImage(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  mode: FitMode,
  upscale = true
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);

  let { sx, sy, sw, sh, dx, dy, dw, dh } = computeFit(source.width, source.height, targetW, targetH, mode);
  if (!upscale && mode !== "stretch" && source.width < targetW && source.height < targetH) {
    sx = 0;
    sy = 0;
    sw = source.width;
    sh = source.height;
    dx = Math.round((targetW - source.width) / 2);
    dy = Math.round((targetH - source.height) / 2);
    dw = source.width;
    dh = source.height;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  return canvas;
}

export function makeSeoFilename(base: string, width: number, height: number): string {
  const cleaned = base
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${cleaned}-${width}x${height}.png`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- tests/resize.test.ts`
Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/canvas.ts lib/resize.ts tests/resize.test.ts
git commit -m "feat: add canvas and resize utilities"
```

---

### Task 3: Halftone Library

**Files:**
- Create: `lib/halftone.ts`
- Create: `tests/halftone.test.ts`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces:
  - `type PixelGrid = { width: number; height: number; data: Uint8ClampedArray }`
  - `type DotCell = { x: number; y: number; radius: number; shape: "round" | "square" }`
  - `type HalftoneOptions = { dotSize: number; spacing: number; angleDeg: number; shape: "round" | "square"; sensitivity: number }`
  - `luminanceToDots(grid: PixelGrid, options: HalftoneOptions): DotCell[]`
  - Accepts `ImageData` where `PixelGrid` is expected (structural typing: both have `width`, `height`, `data`).

- [ ] **Step 1: Write the failing tests**

Create `tests/halftone.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { luminanceToDots, type PixelGrid } from "../lib/halftone";

function gridOf(width: number, height: number, luminance: number): PixelGrid {
  const data = new Uint8ClampedArray(width * height * 4);
  const v = Math.round(luminance * 255);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

const OPTS = { dotSize: 8, spacing: 8, angleDeg: 0, shape: "round", sensitivity: 0.5 } as const;

describe("luminanceToDots", () => {
  it("produces large dots for dark regions", () => {
    const black = luminanceToDots(gridOf(100, 100, 0), { ...OPTS });
    expect(black.length).toBeGreaterThan(0);
    expect(Math.max(...black.map((d) => d.radius))).toBe(4);
    expect(black.every((d) => d.shape === "round")).toBe(true);
  });

  it("produces no dots for pure white", () => {
    const white = luminanceToDots(gridOf(100, 100, 1), { ...OPTS });
    expect(white.length).toBe(0);
  });

  it("thresholds out light areas with low sensitivity", () => {
    const mid = luminanceToDots(gridOf(100, 100, 0.9), { ...OPTS, sensitivity: 0.2 });
    expect(mid.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/halftone.test.ts`
Expected: FAIL — `Cannot find module '../lib/halftone'`.

- [ ] **Step 3: Write the halftone library**

Create `lib/halftone.ts`:

```ts
export interface PixelGrid {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface DotCell {
  x: number;
  y: number;
  radius: number;
  shape: "round" | "square";
}

export interface HalftoneOptions {
  dotSize: number;
  spacing: number;
  angleDeg: number;
  shape: "round" | "square";
  sensitivity: number;
}

function sampleLuminance(grid: PixelGrid, cx: number, cy: number, cell: number): number {
  const half = cell / 2;
  const x0 = Math.max(0, Math.floor(cx - half));
  const y0 = Math.max(0, Math.floor(cy - half));
  const x1 = Math.min(grid.width, Math.ceil(cx + half));
  const y1 = Math.min(grid.height, Math.ceil(cy + half));
  let sum = 0;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * grid.width + x) * 4;
      sum += 0.2126 * grid.data[i] + 0.7152 * grid.data[i + 1] + 0.0722 * grid.data[i + 2];
      count++;
    }
  }
  return count === 0 ? 0 : sum / (count * 255);
}

export function luminanceToDots(grid: PixelGrid, options: HalftoneOptions): DotCell[] {
  const { dotSize, spacing, angleDeg, shape, sensitivity } = options;
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const step = Math.max(1, Math.round(spacing));
  const maxRadius = Math.max(1, dotSize / 2);
  const centerX = grid.width / 2;
  const centerY = grid.height / 2;
  const threshold = 1 - Math.min(1, Math.max(0, sensitivity));
  const dots: DotCell[] = [];
  for (let gy = 0; gy < grid.height; gy += step) {
    for (let gx = 0; gx < grid.width; gx += step) {
      const dx = gx - centerX;
      const dy = gy - centerY;
      const x = dx * cos - dy * sin + centerX;
      const y = dx * sin + dy * cos + centerY;
      const luminance = sampleLuminance(grid, x, y, step);
      const intensity = 1 - luminance;
      if (intensity < threshold) continue;
      const radius = Math.min(1, Math.max(0, intensity)) * maxRadius;
      dots.push({ x, y, radius, shape });
    }
  }
  return dots;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/halftone.test.ts`
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/halftone.ts tests/halftone.test.ts
git commit -m "feat: add halftone algorithm"
```

---

### Task 4: PNG DPI Library

**Files:**
- Create: `lib/dpi.ts`
- Create: `tests/dpi.test.ts`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces:
  - `DPI_300_PPM: number` (constant, 11811)
  - `injectPhyS(pngBytes: Uint8Array, xPpm: number, yPpm: number): Uint8Array` — returns a new PNG byte array with a `pHYs` chunk inserted directly after the IHDR chunk.

- [ ] **Step 1: Write the failing tests**

Create `tests/dpi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DPI_300_PPM, injectPhyS } from "../lib/dpi";

function minimalPng(): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const ihdr = [0, 0, 0, 13, 73, 72, 68, 82];
  const ihdrData = new Array<number>(13).fill(0);
  const crc = [0, 0, 0, 0];
  return new Uint8Array([...signature, ...ihdr, ...ihdrData, ...crc]);
}

describe("injectPhyS", () => {
  it("inserts a pHYs chunk with 300 DPI right after IHDR", () => {
    const png = minimalPng();
    const out = injectPhyS(png, DPI_300_PPM, DPI_300_PPM);
    expect(out.length).toBe(png.length + 21);
    expect(Array.from(out.slice(33, 37))).toEqual([0, 0, 0, 9]);
    expect(Array.from(out.slice(37, 41))).toEqual([0x70, 0x48, 0x59, 0x73]);
    const dv = new DataView(out.buffer, 41, 8);
    expect(dv.getUint32(0, false)).toBe(DPI_300_PPM);
    expect(dv.getUint32(4, false)).toBe(DPI_300_PPM);
    expect(out[49]).toBe(1);
  });

  it("preserves the original IHDR chunk bytes", () => {
    const png = minimalPng();
    const out = injectPhyS(png, DPI_300_PPM, DPI_300_PPM);
    expect(Array.from(out.slice(0, 33))).toEqual(Array.from(png));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/dpi.test.ts`
Expected: FAIL — `Cannot find module '../lib/dpi'`.

- [ ] **Step 3: Write the DPI library**

Create `lib/dpi.ts`:

```ts
export const DPI_300_PPM = Math.round(300 / 0.0254);

const PNG_SIGNATURE_LENGTH = 8;
const IHDR_CHUNK_LENGTH = 25;

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function injectPhyS(pngBytes: Uint8Array, xPpm: number, yPpm: number): Uint8Array {
  const chunkType = new TextEncoder().encode("pHYs");
  const chunkData = new Uint8Array(9);
  const dataView = new DataView(chunkData.buffer);
  dataView.setUint32(0, xPpm, false);
  dataView.setUint32(4, yPpm, false);
  chunkData[8] = 1;

  const crcInput = new Uint8Array(4 + 9);
  crcInput.set(chunkType, 0);
  crcInput.set(chunkData, 4);
  const crc = crc32(crcInput);

  const chunk = new Uint8Array(4 + 4 + 9 + 4);
  new DataView(chunk.buffer).setUint32(0, 9, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);
  new DataView(chunk.buffer).setUint32(17, crc, false);

  const insertAt = PNG_SIGNATURE_LENGTH + IHDR_CHUNK_LENGTH;
  const result = new Uint8Array(pngBytes.length + chunk.length);
  result.set(pngBytes.subarray(0, insertAt), 0);
  result.set(chunk, insertAt);
  result.set(pngBytes.subarray(insertAt), insertAt + chunk.length);
  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/dpi.test.ts`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/dpi.ts tests/dpi.test.ts
git commit -m "feat: add 300 DPI PNG metadata injection"
```

---

### Task 5: Idea Generator Library

**Files:**
- Create: `lib/ideas.ts`
- Create: `tests/ideas.test.ts`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces:
  - `type IdeaParams = { niches: string[]; styles: string[]; seasons: string[]; themes: string[] }`
  - `type MerchIdea = { title: string; description: string; whyItWorks: string }`
  - `pickRandom<T>(arr: T[], rng?: () => number): T`
  - `shuffle<T>(arr: T[], rng?: () => number): T[]`
  - `generateIdeas(params: IdeaParams, count?: number, rng?: () => number): MerchIdea[]`
  - `formatIdeasAsText(ideas: MerchIdea[]): string`
  - `NICHES`, `STYLES`, `SEASONS`, `THEMES` string array constants

- [ ] **Step 1: Write the failing tests**

Create `tests/ideas.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/ideas.test.ts`
Expected: FAIL — `Cannot find module '../lib/ideas'`.

- [ ] **Step 3: Write the idea generator library**

Create `lib/ideas.ts`:

```ts
export interface IdeaParams {
  niches: string[];
  styles: string[];
  seasons: string[];
  themes: string[];
}

export interface MerchIdea {
  title: string;
  description: string;
  whyItWorks: string;
}

export const NICHES = [
  "Funny Sarcasm",
  "Retro Gamer",
  "Dog Lover",
  "Cat Mom",
  "Dad Jokes",
  "Coffee Addict",
  "Vintage Travel",
  "Bodybuilding",
  "Nurse Life",
  "Teacher Humor",
  "Mountain Hiker",
  "Beach Vibes",
  "Hockey Dad",
  "Golf Dad",
  "Camping",
  "Fishing",
  "Astrology",
  "Anime",
  "Music Fan",
  "Bookworm",
  "Mom Life",
  "Wedding",
  "Birthday",
  "Christmas",
  "Halloween",
  "Punny",
  "Motivational",
  "80s Nostalgia",
  "Biker",
  "Foodie",
];

export const STYLES = [
  "Minimalist",
  "Retro Vintage",
  "Hand-drawn",
  "Bold Typography",
  "Watercolor",
  "Neon",
  "Cartoon",
  "Rustic",
  "Geometric",
  "Line Art",
  "Streetwear",
  "Kawaii",
  "Grunge",
  "Floral",
  "Pop Art",
];

export const SEASONS = [
  "Summer",
  "Fall",
  "Winter",
  "Spring",
  "Year-Round",
  "Holiday",
  "Back to School",
  "Summer Vacation",
];

export const THEMES = [
  "Funny Quote",
  "Pun",
  "Inside Joke",
  "Tribute",
  "Hobby",
  "Family",
  "Occupation",
  "Lifestyle",
  "Celebration",
  "Nature",
  "Food & Drink",
  "Sports",
  "Pop Culture",
  "Animal",
  "Travel",
  "Motivation",
  "Horror",
  "Fantasy",
  "Retro",
  "Abstract",
];

type TitleTemplate = (niche: string, style: string, theme: string, season: string) => string;

const TITLE_TEMPLATES: TitleTemplate[] = [
  (niche, style, theme, season) => `${niche} ${theme} ${style} ${season} T-Shirt`,
  (niche, style, theme, season) => `Funny ${theme} ${niche} ${style} Tee`,
  (niche, style, theme, season) => `${style} ${niche} ${theme} ${season} Design`,
];

export function pickRandom<T>(arr: T[], rng: () => number = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateIdeas(
  params: IdeaParams,
  count = 5,
  rng: () => number = Math.random
): MerchIdea[] {
  const used = new Set<string>();
  const ideas: MerchIdea[] = [];
  let guard = 0;
  while (ideas.length < count && guard < 1000) {
    guard++;
    const niche = params.niches.length > 0 ? pickRandom(params.niches, rng) : pickRandom(NICHES, rng);
    const style = params.styles.length > 0 ? pickRandom(params.styles, rng) : pickRandom(STYLES, rng);
    const season = params.seasons.length > 0 ? pickRandom(params.seasons, rng) : pickRandom(SEASONS, rng);
    const theme = params.themes.length > 0 ? pickRandom(params.themes, rng) : pickRandom(THEMES, rng);
    const key = `${niche}|${style}|${season}|${theme}`;
    if (used.has(key)) continue;
    used.add(key);
    const template = pickRandom(TITLE_TEMPLATES, rng);
    ideas.push({
      title: template(niche, style, theme, season),
      description: `A ${style.toLowerCase()} ${theme.toLowerCase()} design for ${niche.toLowerCase()} fans, made for ${season.toLowerCase()} wear.`,
      whyItWorks: `Combines the proven ${niche.toLowerCase()} niche with ${style.toLowerCase()} styling and a ${theme.toLowerCase()} theme — a mix with strong search demand.`,
    });
  }
  return ideas;
}

export function formatIdeasAsText(ideas: MerchIdea[]): string {
  return ideas
    .map((idea, i) => `${i + 1}. ${idea.title}\n   ${idea.description}\n   Why it works: ${idea.whyItWorks}`)
    .join("\n\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/ideas.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ideas.ts tests/ideas.test.ts
git commit -m "feat: add design idea generator library"
```

---

### Task 6: Theme, Layout, Shared Components, and Landing Page

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `lib/tools.ts`
- Create: `components/ToolShell.tsx`
- Create: `components/Uploader.tsx`
- Create: `components/DownloadButton.tsx`
- Create: `components/Toast.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `ToolShell({ title, description, children })`
  - `Uploader({ onFiles, onReject?, multiple?, accept?, label?, hint? })`
  - `DownloadButton({ filename, getBlob, disabled?, label? })`
  - `Toast({ message, tone? })`
  - `TOOLS: ToolMeta[]` where `ToolMeta = { slug: string; title: string; description: string }`

- [ ] **Step 1: Replace globals.css with the dark theme**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-background: #0b0b12;
  --color-surface: #13131d;
  --color-surface-2: #1b1b29;
  --color-border: #27273a;
  --color-accent: #6366f1;
  --color-accent-2: #8b5cf6;
  --color-text: #e6e6ef;
  --color-dim: #9a9ab0;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  background-color: var(--color-background);
}
```

- [ ] **Step 2: Replace layout.tsx**

Replace the entire contents of `app/layout.tsx` with:

```tsx
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
```

Note: this removes the default Geist Google-font imports so builds work without network font access.

- [ ] **Step 3: Create the tools registry**

Create `lib/tools.ts`:

```ts
export interface ToolMeta {
  slug: string;
  title: string;
  description: string;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "idea-generator",
    title: "Design Idea Generator",
    description: "Generate unique POD design ideas from niches, styles, seasons, and themes.",
  },
  {
    slug: "resize-amazon-merch",
    title: "Resize for Amazon Merch",
    description: "Batch resize to exact 4500x5400 PNG, upscale-to-fill, and compress for upload.",
  },
  {
    slug: "resize-etsy-pod",
    title: "Resize for Etsy & POD",
    description: "Resize to Etsy and common POD dimensions with custom size support.",
  },
  {
    slug: "halftone",
    title: "Halftone Generator",
    description: "Convert a design to a classic halftone dot pattern.",
  },
  {
    slug: "distress-texture",
    title: "Distress Texture Generator",
    description: "Generate random grunge and distress overlay textures.",
  },
  {
    slug: "png-to-300dpi",
    title: "PNG to 300 DPI",
    description: "Set 300 DPI metadata for print-ready PNG exports.",
  },
];
```

- [ ] **Step 4: Create shared components**

Create `components/ToolShell.tsx`:

```tsx
export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-dim">{description}</p>
      </div>
      {children}
    </main>
  );
}
```

Create `components/Uploader.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";

const VALID_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

interface UploaderProps {
  onFiles: (files: File[]) => void;
  onReject?: (names: string[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  hint?: string;
}

export function Uploader({
  onFiles,
  onReject,
  multiple = false,
  accept = "image/png,image/jpeg,image/webp",
  label = "Drop your designs here, or click to choose",
  hint = "PNG, JPG or WebP. Your files are processed on your device.",
}: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      if (VALID_TYPES.has(file.type)) accepted.push(file);
      else rejected.push(file.name);
    }
    if (accepted.length > 0) onFiles(accepted);
    if (rejected.length > 0) onReject?.(rejected);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
        dragActive ? "border-accent bg-surface-2" : "border-border bg-surface hover:border-accent"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-medium">{label}</p>
      {hint && <p className="mt-2 text-sm text-dim">{hint}</p>}
    </div>
  );
}
```

Create `components/DownloadButton.tsx`:

```tsx
"use client";

import { useState } from "react";

interface DownloadButtonProps {
  filename: string;
  getBlob: () => Promise<Blob> | Blob;
  disabled?: boolean;
  label?: string;
}

export function DownloadButton({ filename, getBlob, disabled, label = "Download PNG" }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={disabled || busy}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Preparing..." : label}
      </button>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
```

Create `components/Toast.tsx`:

```tsx
interface ToastProps {
  message: string | null;
  tone?: "error" | "info";
}

export function Toast({ message, tone = "error" }: ToastProps) {
  if (!message) return null;
  const styles =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}
```

- [ ] **Step 5: Replace the landing page**

Replace the entire contents of `app/page.tsx` with:

```tsx
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
```

- [ ] **Step 6: Verify with build**

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add dark theme, layout, shared components, and landing page"
```

---

### Task 7: Design Idea Generator Page

**Files:**
- Create: `app/tools/idea-generator/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `Toast`, `NICHES`, `STYLES`, `SEASONS`, `THEMES`, `generateIdeas`, `formatIdeasAsText`, `pickRandom`, `type MerchIdea` from previous tasks.

- [ ] **Step 1: Write the page**

Create `app/tools/idea-generator/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify with build**

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/tools/idea-generator/page.tsx
git commit -m "feat: add design idea generator tool page"
```

---

### Task 8: Resize for Amazon Merch Page

**Files:**
- Create: `app/tools/resize-amazon-merch/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `Uploader`, `DownloadButton`, `Toast`, `fileToCanvas`, `canvasToBlob`, `resizeImage`, `makeSeoFilename`, `type FitMode` from previous tasks.

- [ ] **Step 1: Write the page**

Create `app/tools/resize-amazon-merch/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob } from "@/lib/canvas";
import { resizeImage, makeSeoFilename, type FitMode } from "@/lib/resize";

const AMZ_W = 4500;
const AMZ_H = 5400;

const FIT_LABELS: Record<FitMode, string> = {
  contain: "Contain (letterbox)",
  cover: "Cover (fill & crop)",
  stretch: "Stretch",
};

interface Result {
  name: string;
  blob: Blob;
}

export default function ResizeAmazonPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [fit, setFit] = useState<FitMode>("cover");
  const [upscale, setUpscale] = useState(true);
  const [quality, setQuality] = useState(0.92);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      const out: Result[] = [];
      for (let i = 0; i < files.length; i++) {
        const loaded = await fileToCanvas(files[i], 2500);
        const resized = await resizeImage(loaded.canvas, AMZ_W, AMZ_H, fit, upscale);
        const blob = await canvasToBlob(resized, "image/png", quality);
        out.push({ name: makeSeoFilename(files[i].name, AMZ_W, AMZ_H), blob });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch {
      setError("Processing failed. Please try different images.");
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  return (
    <ToolShell
      title="Resize for Amazon Merch"
      description="Batch resize your designs to the exact 4500x5400 pixel PNG that Amazon Merch on Demand requires, with white background fill and compression for upload."
    >
      <Uploader
        multiple
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs])}
        onReject={(names) => setRejected(names)}
        label="Drop your designs here, or click to choose"
        hint="PNG, JPG or WebP · add as many as you like"
      />
      {rejected.length > 0 && (
        <Toast message={`Unsupported files ignored: ${rejected.join(", ")}`} />
      )}

      {files.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dim">
              {files.length} image(s) selected · target 4500x5400
            </p>
            <button onClick={clearAll} className="text-sm text-dim hover:text-red-400">
              Clear
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Fit mode</span>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as FitMode)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                {(["contain", "cover", "stretch"] as FitMode[]).map((m) => (
                  <option key={m} value={m}>
                    {FIT_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                checked={upscale}
                onChange={(e) => setUpscale(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-dim">Upscale small images to fill</span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-dim">PNG quality: {Math.round(quality * 100)}%</span>
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </label>
          </div>

          <button
            onClick={process}
            disabled={busy}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? `Processing ${progress}%` : "Resize & export all"}
          </button>
        </div>
      )}

      <Toast message={error} />

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Exports</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="mb-3 truncate text-sm">{r.name}</p>
                <DownloadButton filename={r.name} getBlob={() => r.blob} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
```

- [ ] **Step 2: Verify with build**

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/tools/resize-amazon-merch/page.tsx
git commit -m "feat: add Amazon Merch resize tool"
```

---

### Task 9: Resize for Etsy & POD Page

**Files:**
- Create: `app/tools/resize-etsy-pod/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `Uploader`, `DownloadButton`, `Toast`, `fileToCanvas`, `canvasToBlob`, `resizeImage`, `makeSeoFilename`, `type FitMode` from previous tasks.

- [ ] **Step 1: Write the page**

Create `app/tools/resize-etsy-pod/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob } from "@/lib/canvas";
import { resizeImage, makeSeoFilename, type FitMode } from "@/lib/resize";

const PRESETS = [
  { label: "Etsy 2400x2400", width: 2400, height: 2400 },
  { label: "2000x2000", width: 2000, height: 2000 },
  { label: "3000x3000", width: 3000, height: 3000 },
];

interface Result {
  name: string;
  blob: Blob;
}

export default function ResizeEtsyPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [useCustom, setUseCustom] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);
  const [custom, setCustom] = useState({ width: 1000, height: 1000 });
  const [fit, setFit] = useState<FitMode>("contain");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const target = useCustom ? custom : PRESETS[presetIndex];
  const validTarget = target.width >= 1 && target.height >= 1;

  const process = async () => {
    if (files.length === 0 || !validTarget) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      const out: Result[] = [];
      for (let i = 0; i < files.length; i++) {
        const loaded = await fileToCanvas(files[i], 2500);
        const resized = await resizeImage(loaded.canvas, target.width, target.height, fit, true);
        const blob = await canvasToBlob(resized, "image/png", 0.92);
        out.push({ name: makeSeoFilename(files[i].name, target.width, target.height), blob });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch {
      setError("Processing failed. Please try different images.");
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  return (
    <ToolShell
      title="Resize for Etsy & POD"
      description="Resize your designs to Etsy's recommended size or any common POD dimension, with a white background fill."
    >
      <Uploader
        multiple
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs])}
        label="Drop your designs here, or click to choose"
        hint="PNG, JPG or WebP · add as many as you like"
      />

      {files.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dim">
              {files.length} image(s) selected · target {target.width}x{target.height}
            </p>
            <button onClick={clearAll} className="text-sm text-dim hover:text-red-400">
              Clear
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-dim">Custom size</span>
            </label>

            {useCustom ? (
              <div className="flex gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-dim">Width</span>
                  <input
                    type="number"
                    min={1}
                    value={custom.width}
                    onChange={(e) => setCustom({ ...custom, width: Math.max(1, Number(e.target.value)) })}
                    className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-dim">Height</span>
                  <input
                    type="number"
                    min={1}
                    value={custom.height}
                    onChange={(e) => setCustom({ ...custom, height: Math.max(1, Number(e.target.value)) })}
                    className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-1 block text-sm text-dim">Preset</span>
                <select
                  value={presetIndex}
                  onChange={(e) => setPresetIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  {PRESETS.map((p, i) => (
                    <option key={i} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm text-dim">Fit mode</span>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as FitMode)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <option value="contain">Contain (letterbox)</option>
                <option value="cover">Cover (fill & crop)</option>
                <option value="stretch">Stretch</option>
              </select>
            </label>
          </div>

          {!validTarget && <p className="mt-3 text-sm text-red-400">Enter valid positive dimensions.</p>}

          <button
            onClick={process}
            disabled={busy || !validTarget}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? `Processing ${progress}%` : "Resize & export all"}
          </button>
        </div>
      )}

      <Toast message={error} />

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Exports</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="mb-3 truncate text-sm">{r.name}</p>
                <DownloadButton filename={r.name} getBlob={() => r.blob} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
```

- [ ] **Step 2: Verify with build**

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/tools/resize-etsy-pod/page.tsx
git commit -m "feat: add Etsy & POD resize tool"
```

---

### Task 10: Halftone Generator Page

**Files:**
- Create: `app/tools/halftone/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `Uploader`, `DownloadButton`, `Toast`, `fileToCanvas`, `canvasToBlob`, `luminanceToDots`, `type HalftoneOptions` from previous tasks.

- [ ] **Step 1: Write the page**

Create `app/tools/halftone/page.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob, type LoadedImage } from "@/lib/canvas";
import { luminanceToDots, type HalftoneOptions } from "@/lib/halftone";

const HALFTONE_WORKING_SIZE = 1200;

export default function HalftonePage() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<HalftoneOptions>({
    dotSize: 6,
    spacing: 6,
    angleDeg: 45,
    shape: "round",
    sensitivity: 0.5,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = image.canvas.width;
    canvas.height = image.canvas.height;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const grid = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dots = luminanceToDots(grid, options);
    ctx.fillStyle = "#000000";
    for (const dot of dots) {
      ctx.beginPath();
      if (dot.shape === "square") {
        ctx.rect(dot.x - dot.radius, dot.y - dot.radius, dot.radius * 2, dot.radius * 2);
      } else {
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }, [image, options]);

  const downloadBlob = () => {
    const canvas = canvasRef.current;
    if (!canvas) return Promise.reject(new Error("Nothing to export"));
    return canvasToBlob(canvas, "image/png", 0.92);
  };

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  return (
    <ToolShell
      title="Halftone Generator"
      description="Convert a design into a classic halftone dot pattern for retro and print-effect merch."
    >
      {!image && (
        <Uploader
          onFiles={async (fs) => {
            try {
              const loaded = await fileToCanvas(fs[0], HALFTONE_WORKING_SIZE);
              setImage(loaded);
              setError(null);
            } catch {
              setError("Could not load that image. Please try another file.");
            }
          }}
          label="Drop a design here, or click to choose"
          hint="PNG, JPG or WebP · a dark design on white gives the best result"
        />
      )}

      {image && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Dot size: {options.dotSize}px</span>
              <input
                type="range"
                min={2}
                max={24}
                step={1}
                value={options.dotSize}
                onChange={(e) => setOptions({ ...options, dotSize: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Spacing: {options.spacing}px</span>
              <input
                type="range"
                min={2}
                max={24}
                step={1}
                value={options.spacing}
                onChange={(e) => setOptions({ ...options, spacing: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Angle: {options.angleDeg}°</span>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={options.angleDeg}
                onChange={(e) => setOptions({ ...options, angleDeg: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Sensitivity: {Math.round(options.sensitivity * 100)}%</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={options.sensitivity}
                onChange={(e) => setOptions({ ...options, sensitivity: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Dot shape</span>
              <select
                value={options.shape}
                onChange={(e) => setOptions({ ...options, shape: e.target.value as "round" | "square" })}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <figure>
              <figcaption className="mb-2 text-sm text-dim">Original</figcaption>
              <img src={image.canvas.toDataURL()} alt="Original design" className="w-full rounded-xl border border-border" />
            </figure>
            <figure>
              <figcaption className="mb-2 text-sm text-dim">Halftone preview</figcaption>
              <canvas ref={canvasRef} className="w-full rounded-xl border border-border bg-white" />
            </figure>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DownloadButton
              filename={`${baseName("halftone")}-halftone.png`}
              getBlob={downloadBlob}
              label="Download halftone PNG"
            />
            <button
              onClick={() => {
                setImage(null);
                setError(null);
              }}
              className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
            >
              Choose another image
            </button>
          </div>
        </div>
      )}

      <Toast message={error} />
    </ToolShell>
  );
}
```

- [ ] **Step 2: Verify with build**

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/tools/halftone/page.tsx
git commit -m "feat: add halftone generator tool"
```

---

### Task 11: Distress Texture Generator Page

**Files:**
- Create: `lib/distress.ts`
- Create: `app/tools/distress-texture/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `DownloadButton`, `Toast`, `canvasToBlob` from previous tasks.
- Produces:
  - `mulberry32(seed: number): () => number` — deterministic PRNG
  - `createDistressCanvas(size: number, seed: number, intensity: number): HTMLCanvasElement`

- [ ] **Step 1: Write the distress library**

Create `lib/distress.ts`:

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createDistressCanvas(size: number, seed: number, intensity: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");
  const rand = mulberry32(seed);

  const pixels = ctx.createImageData(size, size);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = rand();
    pixels.data[i] = 0;
    pixels.data[i + 1] = 0;
    pixels.data[i + 2] = 0;
    pixels.data[i + 3] = n < intensity ? Math.round(255 * (1 - n)) : 0;
  }
  ctx.putImageData(pixels, 0, 0);

  const splotches = 3 + Math.floor(rand() * 6);
  for (let i = 0; i < splotches; i++) {
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, size * (0.02 + rand() * 0.12), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${(intensity * rand() * 0.6).toFixed(3)})`;
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(0,0,0,${(0.2 + intensity * 0.5).toFixed(3)})`;
  ctx.lineWidth = Math.max(1, size * 0.002);
  const scratches = 5 + Math.floor(rand() * 10);
  for (let i = 0; i < scratches; i++) {
    ctx.beginPath();
    ctx.moveTo(rand() * size, rand() * size);
    const segments = 2 + Math.floor(rand() * 5);
    for (let s = 0; s < segments; s++) {
      ctx.lineTo(rand() * size, rand() * size);
    }
    ctx.stroke();
  }
  return canvas;
}
```

- [ ] **Step 2: Write the page**

Create `app/tools/distress-texture/page.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { canvasToBlob } from "@/lib/canvas";
import { createDistressCanvas } from "@/lib/distress";

const SIZES = [512, 1024, 2048];

export default function DistressTexturePage() {
  const [size, setSize] = useState(1024);
  const [intensity, setIntensity] = useState(0.4);
  const [seed, setSeed] = useState(42);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const canvas = createDistressCanvas(size, seed, intensity);
      const preview = previewRef.current;
      if (!preview) return;
      preview.width = size;
      preview.height = size;
      const ctx = preview.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(canvas, 0, 0);
    } catch {
      setError("Could not generate the texture on this device.");
    }
  }, [size, seed, intensity]);

  const downloadBlob = () => {
    const preview = previewRef.current;
    if (!preview) return Promise.reject(new Error("Nothing to export"));
    return canvasToBlob(preview, "image/png", 1);
  };

  return (
    <ToolShell
      title="Distress Texture Generator"
      description="Generate random grunge, distressed, and worn overlay textures to give your merch designs a vintage print feel."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm text-dim">Size</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}x{s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-dim">Intensity: {Math.round(intensity * 100)}%</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={() => setSeed(Math.floor(Math.random() * 100000))}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm transition hover:border-accent hover:text-accent"
            >
              Regenerate
            </button>
          </div>
        </div>

        <canvas
          ref={previewRef}
          className="w-full max-w-md rounded-xl border border-border bg-white"
        />

        <div className="flex flex-wrap gap-3">
          <DownloadButton
            filename={`distress-texture-${size}px.png`}
            getBlob={downloadBlob}
            label="Download texture PNG"
          />
        </div>
      </div>

      <Toast message={error} />
    </ToolShell>
  );
}
```

- [ ] **Step 3: Verify with build and tests**

Run: `npm test`
Expected: all existing tests still PASS.

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 4: Commit**

```bash
git add lib/distress.ts app/tools/distress-texture/page.tsx
git commit -m "feat: add distress texture generator tool"
```

---

### Task 12: PNG to 300 DPI Page

**Files:**
- Create: `app/tools/png-to-300dpi/page.tsx`

**Interfaces:**
- Consumes: `ToolShell`, `Uploader`, `DownloadButton`, `Toast`, `fileToCanvas`, `canvasToBlob`, `injectPhyS`, `DPI_300_PPM`, `type LoadedImage` from previous tasks.

- [ ] **Step 1: Write the page**

Create `app/tools/png-to-300dpi/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob, type LoadedImage } from "@/lib/canvas";
import { injectPhyS, DPI_300_PPM } from "@/lib/dpi";

export default function PngTo300DpiPage() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [sourceName, setSourceName] = useState("design");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  const convert = async () => {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await canvasToBlob(image.canvas, "image/png", 1);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const out = injectPhyS(bytes, DPI_300_PPM, DPI_300_PPM);
      setResult(out);
    } catch {
      setError("Conversion failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadBlob = () => {
    if (!result) return Promise.reject(new Error("Nothing to export"));
    return new Blob([result], { type: "image/png" });
  };

  return (
    <ToolShell
      title="PNG to 300 DPI"
      description="Set 300 DPI metadata on your PNG so it is print-ready, without changing any pixels."
    >
      {!image && (
        <Uploader
          onFiles={async (fs) => {
            try {
              const loaded = await fileToCanvas(fs[0], 2000);
              setImage(loaded);
              setSourceName(fs[0].name);
              setResult(null);
              setError(null);
            } catch {
              setError("Could not load that image. Please try another file.");
            }
          }}
          label="Drop a PNG here, or click to choose"
          hint="PNG, JPG or WebP · pixel dimensions are preserved"
        />
      )}

      {image && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-dim">
              Original: {image.originalWidth}x{image.originalHeight}px
            </p>
            <p className="mt-1 text-sm text-dim">
              Pixel dimensions stay the same — only the DPI metadata is set to 300.
            </p>
            <button
              onClick={convert}
              disabled={busy}
              className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Converting..." : "Convert to 300 DPI"}
            </button>
          </div>

          {result && (
            <DownloadButton
              filename={`${baseName(sourceName)}-300dpi.png`}
              getBlob={downloadBlob}
              label="Download 300 DPI PNG"
            />
          )}

          <button
            onClick={() => {
              setImage(null);
              setResult(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            Choose another image
          </button>
        </div>
      )}

      <Toast message={error} />
    </ToolShell>
  );
}
```

- [ ] **Step 2: Verify with build and tests**

Run: `npm test`
Expected: all existing tests PASS.

Run: `npm run build`
Expected: build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/tools/png-to-300dpi/page.tsx
git commit -m "feat: add PNG to 300 DPI tool"
```

---

### Task 13: README, Final Verification, and GitHub Push

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the finished app.

- [ ] **Step 1: Write the README**

Create `README.md`:

```markdown
# Mega Merch Tools

Free, browser-only toolkit for print-on-demand (POD) sellers. Resize, convert, and generate artwork for
Amazon Merch, Etsy, and other POD platforms — all processing happens on your device, so your designs
never leave your browser.

## Tools

- **Design Idea Generator** — generate unique POD ideas from niches, styles, seasons, and themes
- **Resize for Amazon Merch** — batch resize to the exact 4500x5400 PNG Amazon Merch requires
- **Resize for Etsy & POD** — resize to Etsy and common POD dimensions, or any custom size
- **Halftone Generator** — convert designs to classic halftone dot patterns
- **Distress Texture Generator** — generate random grunge and distressed overlay textures
- **PNG to 300 DPI** — set 300 DPI metadata for print-ready exports

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run dev`  | Start the dev server       |
| `npm run build`| Production build           |
| `npm test`     | Run the Vitest test suite  |
| `npm run lint` | Lint with ESLint           |

## Privacy

All image processing runs client-side using the Canvas API. No files are uploaded to any server.

## License

MIT
```

- [ ] **Step 2: Run the full verification suite**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: lint passes, all tests pass, build succeeds — all with zero errors.

- [ ] **Step 3: Commit the README**

```bash
git add README.md
git commit -m "docs: add README"
```

- [ ] **Step 4: Rename branch and add remote**

Run:

```bash
git branch -M main
git remote add origin https://github.com/6washim9/Mega-Merch-Tools.git
git remote -v
```

Expected: `origin` points to the Mega Merch Tools repository.

- [ ] **Step 5: Push to GitHub**

Run:

```bash
git push -u origin main
```

Expected: all commits pushed to `main`. Authentication uses the environment's configured git credential helper. If the push fails with an authentication or permission error, STOP and report to the user — do not attempt workarounds.

- [ ] **Step 6: Verify the remote repository**

Run:

```bash
git ls-remote origin
```

Expected: the remote shows the `main` branch with the latest commit SHA.
