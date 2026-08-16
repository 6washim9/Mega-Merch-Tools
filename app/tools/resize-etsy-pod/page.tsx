"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob } from "@/lib/canvas";
import { resizeImage, makeSeoFilename, type FitMode } from "@/lib/resize";

const PRESETS = [
  { label: "Etsy 2400x2400", width: 2400, height: 2400 },
  { label: "2000x2000", width: 2000, height: 2000 },
  { label: "3000x3000", width: 3000, height: 3000 },
];

interface Result {
  name: string;
  blob: Blob;
}

export default function ResizeEtsyPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [useCustom, setUseCustom] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);
  const [custom, setCustom] = useState({ width: 1000, height: 1000 });
  const [fit, setFit] = useState<FitMode>("contain");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const target = useCustom ? custom : PRESETS[presetIndex];
  const validTarget = target.width >= 1 && target.height >= 1;

  const process = async () => {
    if (files.length === 0 || !validTarget) return;
    setBusy(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      const out: Result[] = [];
      for (let i = 0; i < files.length; i++) {
        const loaded = await fileToCanvas(files[i], 2500);
        const resized = await resizeImage(loaded.canvas, target.width, target.height, fit, true);
        const blob = await canvasToBlob(resized, "image/png", 0.92);
        out.push({ name: makeSeoFilename(files[i].name, target.width, target.height), blob });
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
      title="Resize for Etsy & POD"
      description="Resize your designs to Etsy's recommended size or any common POD dimension, with a white background fill."
    >
      <Uploader
        multiple
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs])}
        label="Drop your designs here, or click to choose"
        hint="PNG, JPG or WebP · add as many as you like"
      />

      {files.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dim">
              {files.length} image(s) selected · target {target.width}x{target.height}
            </p>
            <button onClick={clearAll} className="text-sm text-dim hover:text-red-400">
              Clear
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-dim">Custom size</span>
            </label>

            {useCustom ? (
              <div className="flex gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-dim">Width</span>
                  <input
                    type="number"
                    min={1}
                    value={custom.width}
                    onChange={(e) => setCustom({ ...custom, width: Math.max(1, Number(e.target.value)) })}
                    className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-dim">Height</span>
                  <input
                    type="number"
                    min={1}
                    value={custom.height}
                    onChange={(e) => setCustom({ ...custom, height: Math.max(1, Number(e.target.value)) })}
                    className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-1 block text-sm text-dim">Preset</span>
                <select
                  value={presetIndex}
                  onChange={(e) => setPresetIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  {PRESETS.map((p, i) => (
                    <option key={i} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm text-dim">Fit mode</span>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as FitMode)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <option value="contain">Contain (letterbox)</option>
                <option value="cover">Cover (fill & crop)</option>
                <option value="stretch">Stretch</option>
              </select>
            </label>
          </div>

          {!validTarget && <p className="mt-3 text-sm text-red-400">Enter valid positive dimensions.</p>}

          <button
            onClick={process}
            disabled={busy || !validTarget}
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
