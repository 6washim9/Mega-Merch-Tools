"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { fileToCanvas, canvasToBlob, type LoadedImage } from "@/lib/canvas";
import { injectPhyS, DPI_300_PPM } from "@/lib/dpi";

export default function PngTo300DpiPage() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [sourceName, setSourceName] = useState("design");
  const [result, setResult] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  const convert = async () => {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await canvasToBlob(image.canvas, "image/png", 1);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const out = injectPhyS(bytes, DPI_300_PPM, DPI_300_PPM);
      setResult(out);
    } catch {
      setError("Conversion failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadBlob = () => {
    if (!result) return Promise.reject(new Error("Nothing to export"));
    return new Blob([result], { type: "image/png" });
  };

  return (
    <ToolShell
      title="PNG to 300 DPI"
      description="Set 300 DPI metadata on your PNG so it is print-ready, without changing any pixels."
    >
      {!image && (
        <Uploader
          onFiles={async (fs) => {
            try {
              const loaded = await fileToCanvas(fs[0], 2000);
              setImage(loaded);
              setSourceName(fs[0].name);
              setResult(null);
              setError(null);
            } catch {
              setError("Could not load that image. Please try another file.");
            }
          }}
          label="Drop a PNG here, or click to choose"
          hint="PNG, JPG or WebP · pixel dimensions are preserved"
        />
      )}

      {image && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-dim">
              Original: {image.originalWidth}x{image.originalHeight}px
            </p>
            <p className="mt-1 text-sm text-dim">
              Pixel dimensions stay the same — only the DPI metadata is set to 300.
            </p>
            <button
              onClick={convert}
              disabled={busy}
              className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Converting..." : "Convert to 300 DPI"}
            </button>
          </div>

          {result && (
            <DownloadButton
              filename={`${baseName(sourceName)}-300dpi.png`}
              getBlob={downloadBlob}
              label="Download 300 DPI PNG"
            />
          )}

          <button
            onClick={() => {
              setImage(null);
              setResult(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            Choose another image
          </button>
        </div>
      )}

      <Toast message={error} />
    </ToolShell>
  );
}
