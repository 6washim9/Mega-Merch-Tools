export interface OutputFormat {
  mime: string;
  ext: string;
  label: string;
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  { mime: "image/png", ext: "png", label: "PNG" },
  { mime: "image/jpeg", ext: "jpg", label: "JPG" },
  { mime: "image/webp", ext: "webp", label: "WebP" },
];

export function findFormatByMime(mime: string): OutputFormat | undefined {
  return OUTPUT_FORMATS.find((f) => f.mime === mime);
}
