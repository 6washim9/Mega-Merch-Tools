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
