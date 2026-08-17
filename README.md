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
- **Image Compressor** — bulk compress JPG and PNG designs to a target quality or file size
- **Format Converter** — convert designs between PNG, JPG, and WebP

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

## Advertising

To enable AdSense ads, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` to your
publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`). The `AdSlot` component renders nothing when the value is empty.

## License

MIT
