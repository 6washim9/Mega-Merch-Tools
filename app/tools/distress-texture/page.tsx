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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
