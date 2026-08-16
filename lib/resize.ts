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
