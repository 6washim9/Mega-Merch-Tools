"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob } from "@/lib/canvas";
import { resizeImage, makeSeoFilename, type FitMode } from "@/lib/resize";

const AMZ_W = 4500;
const AMZ_H = 5400;

const FIT_LABELS: Record<FitMode, string> = {
  contain: "Contain (letterbox)",
  cover: "Cover (fill & crop)",
  stretch: "Stretch",
};

interface Result {
  name: string;
  blob: Blob;
}

export default function ResizeAmazonPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [fit, setFit] = useState<FitMode>("cover");
  const [upscale, setUpscale] = useState(true);
  const [quality, setQuality] = useState(0.92);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      const out: Result[] = [];
      for (let i = 0; i < files.length; i++) {
        const loaded = await fileToCanvas(files[i], 2500);
        const resized = await resizeImage(loaded.canvas, AMZ_W, AMZ_H, fit, upscale);
        const blob = await canvasToBlob(resized, "image/png", quality);
        out.push({ name: makeSeoFilename(files[i].name, AMZ_W, AMZ_H), blob });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch {
      setError("Processing failed. Please try different images.");
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  return (
    <ToolShell
      title="Resize for Amazon Merch"
      description="Batch resize your designs to the exact 4500x5400 pixel PNG that Amazon Merch on Demand requires, with white background fill and compression for upload."
    >
      <Uploader
        multiple
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs])}
        onReject={(names) => setRejected(names)}
        label="Drop your designs here, or click to choose"
        hint="PNG, JPG or WebP · add as many as you like"
      />
      {rejected.length > 0 && (
        <Toast message={`Unsupported files ignored: ${rejected.join(", ")}`} />
      )}

      {files.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dim">
              {files.length} image(s) selected · target 4500x5400
            </p>
            <button onClick={clearAll} className="text-sm text-dim hover:text-red-400">
              Clear
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Fit mode</span>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as FitMode)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                {(["contain", "cover", "stretch"] as FitMode[]).map((m) => (
                  <option key={m} value={m}>
                    {FIT_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                checked={upscale}
                onChange={(e) => setUpscale(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-dim">Upscale small images to fill</span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-dim">PNG quality: {Math.round(quality * 100)}%</span>
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </label>
          </div>

          <button
            onClick={process}
            disabled={busy}
            className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? `Processing ${progress}%` : "Resize & export all"}
          </button>
        </div>
      )}

      <Toast message={error} />

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Exports</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="mb-3 truncate text-sm">{r.name}</p>
                <DownloadButton filename={r.name} getBlob={() => r.blob} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
