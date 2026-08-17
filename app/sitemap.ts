import type { MetadataRoute } from "next";

export const BASE_URL = "https://mega-merch-tools.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/privacy", "/terms"];
  const tools = [
    "idea-generator",
    "resize-amazon-merch",
    "resize-etsy-pod",
    "halftone",
    "distress-texture",
    "png-to-300dpi",
    "image-compressor",
    "format-converter",
  ];
  return [...staticRoutes, ...tools.map((slug) => `/tools/${slug}`)].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
