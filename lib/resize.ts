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

export function computePlacement(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  mode: FitMode,
  upscale = true
): FitResult {
  const fit = computeFit(sourceW, sourceH, targetW, targetH, mode);
  if (!upscale && mode !== "stretch" && (fit.dw > sourceW || fit.dh > sourceH)) {
    return {
      sx: 0,
      sy: 0,
      sw: sourceW,
      sh: sourceH,
      dx: Math.round((targetW - sourceW) / 2),
      dy: Math.round((targetH - sourceH) / 2),
      dw: sourceW,
      dh: sourceH,
    };
  }
  return fit;
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

  const { sx, sy, sw, sh, dx, dy, dw, dh } = computePlacement(
    source.width,
    source.height,
    targetW,
    targetH,
    mode,
    upscale
  );

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
