"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob, type LoadedImage } from "@/lib/canvas";
import { OUTPUT_FORMATS, type OutputFormat } from "@/lib/convert";

interface ConvertJob {
  name: string;
  base: string;
  loaded: LoadedImage;
  blob: Blob | null;
  error: string | null;
}

export default function FormatConverterPage() {
  const [jobs, setJobs] = useState<ConvertJob[]>([]);
  const [format, setFormat] = useState<OutputFormat>(OUTPUT_FORMATS[0]);
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState<string | null>(null);

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  const addFiles = async (files: File[]) => {
    const resolved: ConvertJob[] = [];
    for (const file of files.slice(0, 20)) {
      try {
        const loaded = await fileToCanvas(file, 4000);
        resolved.push({ name: file.name, base: baseName(file.name), loaded, blob: null, error: null });
      } catch {
        resolved.push({
          name: file.name,
          base: baseName(file.name),
          loaded: null as unknown as LoadedImage,
          blob: null,
          error: "Could not load this file.",
        });
      }
    }
    setJobs((prev) => [...prev, ...resolved]);
  };

  const convertOne = async (index: number) => {
    const job = jobs[index];
    if (!job || !job.loaded || job.blob || job.error) return;
    try {
      const mime = format.mime;
      const blob = await canvasToBlob(job.loaded.canvas, mime, mime === "image/png" ? undefined : quality);
      setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, blob } : j)));
    } catch {
      setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, error: "Conversion failed." } : j)));
    }
  };

  const downloadAll = async () => {
    const ready = jobs.filter((j) => j.blob);
    if (ready.length === 0) throw new Error("Nothing to export");
    const entries = await Promise.all(
      ready.map(async (j) => ({ name: `${j.base}.${format.ext}`, data: new Uint8Array(await j.blob!.arrayBuffer()) }))
    );
    const { buildZip } = await import("@/lib/compress");
    return buildZip(entries);
  };

  const done = jobs.filter((j) => j.blob);

  return (
    <ToolShell
      title="Format Converter"
      description="Convert designs between PNG, JPG, and WebP in bulk, right in your browser."
    >
      {jobs.length === 0 && (
        <Uploader
          onFiles={addFiles}
          onReject={(names) => setError(`Skipped unsupported files: ${names.join(", ")}`)}
          multiple
          accept="image/png,image/jpeg,image/webp"
          label="Drop up to 20 images here, or click to choose"
          hint="PNG, JPG or WebP · converted on your device, nothing is uploaded"
        />
      )}

      {jobs.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-dim">Output format</span>
              <select
                value={format.mime}
                onChange={(e) => {
                  const next = OUTPUT_FORMATS.find((f) => f.mime === e.target.value) ?? OUTPUT_FORMATS[0];
                  setFormat(next);
                  setJobs((prev) => prev.map((j) => ({ ...j, blob: null, error: null })));
                }}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f.mime} value={f.mime}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            {format.mime !== "image/png" && (
              <label className="block">
                <span className="mb-1 block text-sm text-dim">Quality: {Math.round(quality * 100)}%</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(Number(e.target.value) / 100)}
                  className="w-full accent-accent"
                />
              </label>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
              >
                <span className="truncate font-medium">{job.name}</span>
                <span className="flex items-center gap-2">
                  {job.error && <span className="text-red-400">{job.error}</span>}
                  {job.blob && (
                    <DownloadButton filename={`${job.base}.${format.ext}`} getBlob={() => job.blob!} label="Save" />
                  )}
                  {!job.blob && !job.error && (
                    <button
                      onClick={() => convertOne(i)}
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-2"
                    >
                      Convert
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>

          {done.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm text-dim">
                {done.length} of {jobs.length} files converted to {format.label}.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <DownloadButton filename={`converted-${format.ext}.zip`} getBlob={downloadAll} label="Download all as ZIP" />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setJobs([]);
              setError(null);
            }}
            className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            Start over
          </button>
        </div>
      )}

      <Toast message={error} />
    </ToolShell>
  );
}
