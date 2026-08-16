export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createDistressCanvas(size: number, seed: number, intensity: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");
  const rand = mulberry32(seed);

  const pixels = ctx.createImageData(size, size);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = rand();
    pixels.data[i] = 0;
    pixels.data[i + 1] = 0;
    pixels.data[i + 2] = 0;
    pixels.data[i + 3] = n < intensity ? Math.round(255 * (1 - n)) : 0;
  }
  ctx.putImageData(pixels, 0, 0);

  const splotches = 3 + Math.floor(rand() * 6);
  for (let i = 0; i < splotches; i++) {
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, size * (0.02 + rand() * 0.12), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${(intensity * rand() * 0.6).toFixed(3)})`;
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(0,0,0,${(0.2 + intensity * 0.5).toFixed(3)})`;
  ctx.lineWidth = Math.max(1, size * 0.002);
  const scratches = 5 + Math.floor(rand() * 10);
  for (let i = 0; i < scratches; i++) {
    ctx.beginPath();
    ctx.moveTo(rand() * size, rand() * size);
    const segments = 2 + Math.floor(rand() * 5);
    for (let s = 0; s < segments; s++) {
      ctx.lineTo(rand() * size, rand() * size);
    }
    ctx.stroke();
  }
  return canvas;
}
