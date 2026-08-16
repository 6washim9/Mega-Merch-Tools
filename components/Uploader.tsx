"use client";

import { useRef, useState } from "react";

const VALID_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

interface UploaderProps {
  onFiles: (files: File[]) => void;
  onReject?: (names: string[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  hint?: string;
}

export function Uploader({
  onFiles,
  onReject,
  multiple = false,
  accept = "image/png,image/jpeg,image/webp",
  label = "Drop your designs here, or click to choose",
  hint = "PNG, JPG or WebP. Your files are processed on your device.",
}: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      if (VALID_TYPES.has(file.type)) accepted.push(file);
      else rejected.push(file.name);
    }
    if (accepted.length > 0) onFiles(accepted);
    if (rejected.length > 0) onReject?.(rejected);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
        dragActive ? "border-accent bg-surface-2" : "border-border bg-surface hover:border-accent"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-medium">{label}</p>
      {hint && <p className="mt-2 text-sm text-dim">{hint}</p>}
    </div>
  );
}
