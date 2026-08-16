export interface PixelGrid {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface DotCell {
  x: number;
  y: number;
  radius: number;
  shape: "round" | "square";
}

export interface HalftoneOptions {
  dotSize: number;
  spacing: number;
  angleDeg: number;
  shape: "round" | "square";
  sensitivity: number;
}

function sampleLuminance(grid: PixelGrid, cx: number, cy: number, cell: number): number {
  const half = cell / 2;
  const x0 = Math.max(0, Math.floor(cx - half));
  const y0 = Math.max(0, Math.floor(cy - half));
  const x1 = Math.min(grid.width, Math.ceil(cx + half));
  const y1 = Math.min(grid.height, Math.ceil(cy + half));
  let sum = 0;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * grid.width + x) * 4;
      sum += 0.2126 * grid.data[i] + 0.7152 * grid.data[i + 1] + 0.0722 * grid.data[i + 2];
      count++;
    }
  }
  return count === 0 ? 0 : sum / (count * 255);
}

export function luminanceToDots(grid: PixelGrid, options: HalftoneOptions): DotCell[] {
  const { dotSize, spacing, angleDeg, shape, sensitivity } = options;
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const step = Math.max(1, Math.round(spacing));
  const maxRadius = Math.max(1, dotSize / 2);
  const centerX = grid.width / 2;
  const centerY = grid.height / 2;
  const threshold = 1 - Math.min(1, Math.max(0, sensitivity));
  const dots: DotCell[] = [];
  for (let gy = 0; gy < grid.height; gy += step) {
    for (let gx = 0; gx < grid.width; gx += step) {
      const dx = gx - centerX;
      const dy = gy - centerY;
      const x = dx * cos - dy * sin + centerX;
      const y = dx * sin + dy * cos + centerY;
      const luminance = sampleLuminance(grid, x, y, step);
      const intensity = 1 - luminance;
      if (intensity < threshold) continue;
      const radius = Math.min(1, Math.max(0, intensity)) * maxRadius;
      dots.push({ x, y, radius, shape });
    }
  }
  return dots;
}
