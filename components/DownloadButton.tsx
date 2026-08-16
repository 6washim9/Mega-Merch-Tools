"use client";

import { useState } from "react";

interface DownloadButtonProps {
  filename: string;
  getBlob: () => Promise<Blob> | Blob;
  disabled?: boolean;
  label?: string;
}

export function DownloadButton({ filename, getBlob, disabled, label = "Download PNG" }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={disabled || busy}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Preparing..." : label}
      </button>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
