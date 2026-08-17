export const DPI_300_PPM = Math.round(300 / 0.0254);

const PNG_SIGNATURE_LENGTH = 8;
const IHDR_CHUNK_LENGTH = 25;

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function injectPhyS(pngBytes: Uint8Array, xPpm: number, yPpm: number): Uint8Array<ArrayBuffer> {
  const chunkType = new TextEncoder().encode("pHYs");
  const chunkData = new Uint8Array(9);
  const dataView = new DataView(chunkData.buffer);
  dataView.setUint32(0, xPpm, false);
  dataView.setUint32(4, yPpm, false);
  chunkData[8] = 1;

  const crcInput = new Uint8Array(4 + 9);
  crcInput.set(chunkType, 0);
  crcInput.set(chunkData, 4);
  const crc = crc32(crcInput);

  const chunk = new Uint8Array(4 + 4 + 9 + 4);
  new DataView(chunk.buffer).setUint32(0, 9, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);
  new DataView(chunk.buffer).setUint32(17, crc, false);

  const insertAt = PNG_SIGNATURE_LENGTH + IHDR_CHUNK_LENGTH;
  const result = new Uint8Array(pngBytes.length + chunk.length);
  result.set(pngBytes.subarray(0, insertAt), 0);
  result.set(chunk, insertAt);
  result.set(pngBytes.subarray(insertAt), insertAt + chunk.length);
  return result;
}
