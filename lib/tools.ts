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
