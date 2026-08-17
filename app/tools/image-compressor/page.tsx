"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob, type LoadedImage } from "@/lib/canvas";
import { buildZip, findQualityForTarget, formatBytes } from "@/lib/compress";

interface Job {
  name: string;
  base: string;
  originalSize: number;
  loaded: LoadedImage | null;
  blob: Blob | null;
  quality: number;
  busy: boolean;
  error: string | null;
}

const MAX_FILES = 20;

export default function ImageCompressorPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [targetKb, setTargetKb] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  const addFiles = async (files: File[]) => {
    const resolved: Job[] = [];
    for (const file of files.slice(0, MAX_FILES)) {
      try {
        const loaded = await fileToCanvas(file, 2000);
        resolved.push({
          name: file.name,
          base: baseName(file.name),
          originalSize: file.size,
          loaded,
          blob: null,
          quality,
          busy: false,
          error: null,
        });
      } catch {
        resolved.push({
          name: file.name,
          base: baseName(file.name),
          originalSize: file.size,
          loaded: null,
          blob: null,
          quality,
          busy: false,
          error: "Could not load this file.",
        });
      }
    }
    setJobs((prev) => [...prev, ...resolved]);
  };

  const runCompress = async (index: number) => {
    const job = jobs[index];
    if (!job || !job.loaded || job.busy) return;
    setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, busy: true, error: null } : j)));
    try {
      const targetBytes = targetKb > 0 ? targetKb * 1024 : 0;
      const measure = async (q: number) => (await canvasToBlob(job.loaded!.canvas, "image/jpeg", q)).size;
      const chosen =
        targetBytes > 0 ? await findQualityForTarget(measure, targetBytes) : Math.max(0.1, Math.min(1, quality));
      const blob = await canvasToBlob(job.loaded.canvas, "image/jpeg", chosen);
      setJobs((prev) => prev.map((j, i) => (i === index ? { ...j, blob, quality: chosen, busy: false } : j)));
    } catch {
      setJobs((prev) =>
        prev.map((j, i) => (i === index ? { ...j, busy: false, error: "Compression failed. Try again." } : j))
      );
    }
  };

  const downloadAll = async () => {
    const ready = jobs.filter((j) => j.blob);
    if (ready.length === 0) throw new Error("Nothing to export");
    const entries = await Promise.all(
      ready.map(async (j) => ({ name: `${j.base}-compressed.jpg`, data: new Uint8Array(await j.blob!.arrayBuffer()) }))
    );
    return buildZip(entries);
  };

  const totalBefore = jobs.reduce((s, j) => s + j.originalSize, 0);
  const totalAfter = jobs.reduce((s, j) => s + (j.blob?.size ?? 0), 0);
  const done = jobs.filter((j) => j.blob);

  return (
    <ToolShell
      title="Image Compressor"
      description="Compress JPG and PNG designs to a target quality or file size, in bulk, without uploading anything."
    >
      {jobs.length === 0 && (
        <Uploader
          onFiles={addFiles}
          onReject={(names) => setError(`Skipped unsupported files: ${names.join(", ")}`)}
          multiple
          accept="image/png,image/jpeg,image/webp"
          label={`Drop up to ${MAX_FILES} images here, or click to choose`}
          hint="PNG, JPG or WebP · compressed with JPEG encoding on your device"
        />
      )}

      {jobs.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <label className="block">
              <span className="mb-1 block text-sm text-dim">
                Target max size: {targetKb === 0 ? "off" : `${targetKb} KB`}
              </span>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={targetKb}
                onChange={(e) => setTargetKb(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border bg-surface-2 px-4 py-2 text-sm text-dim sm:grid">
              <span>File</span>
              <span>Original</span>
              <span>Compressed</span>
              <span className="w-40" />
            </div>
            {jobs.map((job, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
              >
                <span className="truncate font-medium">{job.name}</span>
                <span className="text-dim">{formatBytes(job.originalSize)}</span>
                <span className={job.blob ? "text-accent" : "text-dim"}>
                  {job.blob ? formatBytes(job.blob.size) : "-"}
                </span>
                <span className="flex items-center gap-2">
                  {job.error && <span className="text-red-400">{job.error}</span>}
                  {job.blob && (
                    <DownloadButton
                      filename={`${job.base}-compressed.jpg`}
                      getBlob={() => job.blob!}
                      label="Save"
                    />
                  )}
                  {!job.blob && !job.error && (
                    <button
                      onClick={() => runCompress(i)}
                      disabled={job.busy}
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {job.busy ? "Compressing..." : "Compress"}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>

          {done.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm text-dim">
                {done.length} of {jobs.length} files ready · {formatBytes(totalBefore)} → {formatBytes(totalAfter)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <DownloadButton filename="compressed-images.zip" getBlob={downloadAll} label="Download all as ZIP" />
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
