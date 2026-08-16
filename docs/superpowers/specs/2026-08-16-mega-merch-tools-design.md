# Mega Merch Tools — Design Document

Date: 2026-08-16

## Overview

Mega Merch Tools is a free, browser-only toolkit for print-on-demand (POD) sellers. It is built on Next.js (App Router) + TypeScript and runs 100% client-side image processing via the Canvas API — no uploads, no server round-trips, no account required. The project is linked to the GitHub repository `https://github.com/6washim9/Mega-Merch-Tools`.

## Approach

Multi-route Next.js application. Each tool lives on its own route under `/tools/<tool>`, sharing a common UI shell, uploader, and download components. This mirrors MerchForge's architecture, keeps tools independently testable, and allows direct linking to any individual tool.

## Architecture

```
app/
  layout.tsx            Root layout, dark theme, global nav
  page.tsx              Landing/dashboard with tool cards
  tools/
    idea-generator/     Design idea generator
    resize-amazon-merch/
    resize-etsy-pod/
    halftone/
    distress-texture/
    png-to-300dpi/
components/
  Uploader.tsx          Drag-and-drop + click-to-browse file input
  DownloadButton.tsx    Canvas/Blob → PNG download with SEO filename hint
  ToolShell.tsx         Shared layout: title, description, controls, preview
  Toast.tsx             Inline error/notice toasts
lib/
  canvas.ts             loadImage, downscale, toBlob utilities
  resize.ts             Fit computation (contain / cover / stretch), batch resize
  halftone.ts           Luminance → dot pattern conversion
  distress.ts           Grunge texture generation (noise, splotches, scratches)
  dpi.ts                300 DPI metadata chunk writer
  ideas.ts              Curated niche/style/season/theme datasets + generator
```

## Tools in v1

### 1. Design Idea Generator — `/tools/idea-generator`
- Inputs: niche, style, season, theme (multi-select chips, each with a "random" option)
- Output: 5 generated ideas, each with title, description, and "why it works"
- Copy individual idea or export the whole list as a `.txt` file
- Refresh button re-rolls

### 2. Resize for Amazon Merch — `/tools/resize-amazon-merch`
- Target 4500x5400 PNG
- Fit modes: contain / cover / stretch; upscale-to-fill toggle
- Batch processing with per-file progress
- Output: compressed PNG via `canvas.toBlob('image/png', quality)`

### 3. Resize for Etsy & POD — `/tools/resize-etsy-pod`
- Presets: 2400x2400 (Etsy), 2000x2000, 3000x3000, custom W x H
- Same fit modes, single and batch processing

### 4. Halftone Generator — `/tools/halftone`
- Controls: dot size, spacing, angle, shape (round/square), grayscale sensitivity
- Classic halftone: reads pixel luminance, draws dots
- Before/after comparison preview

### 5. Distress Texture Generator — `/tools/distress-texture`
- Controls: intensity, grunge seed, blend mode, output size
- Generates random grunge texture (noise + splotches + scratches)
- Overlay preview; export PNG (with optional transparency)

### 6. PNG to 300 DPI — `/tools/png-to-300dpi`
- Upload, "Convert to 300 DPI", sets DPI metadata via canvas re-encode
- Pixel dimensions unchanged; notice displayed to user

### Deferred to v2
- Background removal
- Vectorize image
- AI upscale
- LLM-powered idea generation (requires user-supplied API key)

## UI/UX

- Dark modern theme: near-black background, subtle card surfaces, indigo/violet accent
- Clean typography (system font stack + optional Google Font)
- Tool shell layout: title + description, dropzone/controls, action buttons, before/after preview grid
- Uploader accepts PNG/JPG/WebP, any size (oversized downscaled to safe working canvas ~2000px), multi-file for resize tools

## Error Handling

- Uploader validates MIME type; rejects unsupported types with inline toast
- Decode failures and `toBlob` failures produce visible user messages, never silent crashes
- Oversized images (>4000px) auto-downscale with a notice
- Tools render empty states before any upload
- Object URLs revoked after processing to prevent memory leaks in batch mode

## Testing

- Vitest + jsdom for `lib/` pure functions:
  - resize fit-math (contain / cover / stretch)
  - halftone luminance-to-dot conversion
  - idea-generator pick/format logic
  - DPI metadata chunk bytes
- Manual QA checklist for canvas-heavy tools in `docs/`
- `npm run lint` (ESLint) and `npm run build` must pass

## GitHub Setup

- Set `https://github.com/6washim9/Mega-Merch-Tools` as `origin` remote
- Push initial commit to `main`
- `README.md`: project name, description, feature list, screenshots placeholder

## Deliverables

- Next.js project scaffolded at `/workspace` with all 7 tools functional
- Dark modern UI
- Vitest tests passing; lint + build green
- Code pushed to the linked GitHub repository
