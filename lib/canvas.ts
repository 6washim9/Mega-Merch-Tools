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
