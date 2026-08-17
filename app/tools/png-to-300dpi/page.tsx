"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import { Uploader } from "@/components/Uploader";
import { DownloadButton } from "@/components/DownloadButton";
import { Toast } from "@/components/Toast";
import { injectPhyS, DPI_300_PPM } from "@/lib/dpi";

interface PngFile {
  name: string;
  data: Uint8Array<ArrayBuffer>;
  width: number;
  height: number;
}

function parsePngDimensions(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export default function PngTo300DpiPage() {
  const [image, setImage] = useState<PngFile | null>(null);
  const [result, setResult] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseName = (name: string) => name.replace(/\.[^.]+$/, "").toLowerCase();

  const convert = async () => {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const out = injectPhyS(image.data, DPI_300_PPM, DPI_300_PPM);
      setResult(out);
    } catch {
      setError("Conversion failed. Please try again.");
    } finally {
      setBusy(false);
    }
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
              const file = fs[0];
              const buf = new Uint8Array(await file.arrayBuffer());
              if (!PNG_SIGNATURE.every((b, i) => buf[i] === b)) {
                throw new Error("Not a PNG file");
              }
              const { width, height } = parsePngDimensions(buf);
              setImage({ name: file.name, data: buf, width, height });
              setResult(null);
              setError(null);
            } catch {
              setError("Could not load that image. Please try a PNG file.");
            }
          }}
          label="Drop a PNG here, or click to choose"
          hint="PNG only · pixel dimensions and pixels are preserved exactly"
        />
      )}

      {image && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-dim">
              Original: {image.width}x{image.height}px
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
              filename={`${baseName(image.name)}-300dpi.png`}
              getBlob={() => new Blob([result], { type: "image/png" })}
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
