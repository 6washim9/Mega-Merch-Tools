export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb >= 100 ? Math.round(kb) : Math.round(kb * 10) / 10} KB`;
  const mb = kb / 1024;
  return `${Math.round(mb * 100) / 100} MB`;
}

export interface ZipFile {
  name: string;
  data: Uint8Array;
}

function writeU16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

export async function buildZip(files: ZipFile[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const directory: { offset: number; name: Uint8Array; crc: number; size: number }[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const localSize = 30 + nameBytes.length + file.data.length;
    const local = new Uint8Array(localSize);
    const view = new DataView(local.buffer);
    writeU32(view, 0, 0x04034b50);
    writeU16(view, 4, 20);
    writeU16(view, 6, 0);
    writeU16(view, 8, 0);
    writeU16(view, 10, 0);
    writeU16(view, 12, 0);
    writeU32(view, 14, crc);
    writeU32(view, 18, file.data.length);
    writeU32(view, 22, file.data.length);
    writeU16(view, 26, nameBytes.length);
    writeU16(view, 28, 0);
    local.set(nameBytes, 30);
    local.set(file.data, 30 + nameBytes.length);
    parts.push(local);
    directory.push({ offset, name: nameBytes, crc, size: file.data.length });
    offset += localSize;
  }

  const directoryStart = offset;
  const centralParts: Uint8Array[] = [];
  for (const entry of directory) {
    const centralSize = 46 + entry.name.length;
    const central = new Uint8Array(centralSize);
    const view = new DataView(central.buffer);
    writeU32(view, 0, 0x02014b50);
    writeU16(view, 4, 20);
    writeU16(view, 6, 20);
    writeU16(view, 8, 0);
    writeU16(view, 10, 0);
    writeU16(view, 12, 0);
    writeU16(view, 14, 0);
    writeU32(view, 16, entry.crc);
    writeU32(view, 20, entry.size);
    writeU32(view, 24, entry.size);
    writeU16(view, 28, entry.name.length);
    writeU16(view, 30, 0);
    writeU16(view, 32, 0);
    writeU16(view, 34, 0);
    writeU16(view, 36, 0);
    writeU32(view, 38, 0);
    writeU32(view, 42, entry.offset);
    central.set(entry.name, 46);
    centralParts.push(central);
    offset += centralSize;
  }
  const centralBytes = concat(centralParts);
  const directorySize = centralBytes.length;

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  writeU32(eocdView, 0, 0x06054b50);
  writeU16(eocdView, 4, 0);
  writeU16(eocdView, 6, 0);
  writeU16(eocdView, 8, files.length);
  writeU16(eocdView, 10, files.length);
  writeU32(eocdView, 12, directorySize);
  writeU32(eocdView, 16, directoryStart);
  writeU16(eocdView, 20, 0);

  parts.push(centralBytes);
  parts.push(eocd);

  const all = concat(parts);
  return new Blob([all], { type: "application/zip" });
}

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

export const MIN_QUALITY = 0.1;

export async function findQualityForTarget(
  measure: (quality: number) => Promise<number>,
  targetBytes: number
): Promise<number> {
  let lo = MIN_QUALITY;
  let hi = 1;
  let best = MIN_QUALITY;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    const size = await measure(mid);
    if (size <= targetBytes) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.round(best * 100) / 100;
}
