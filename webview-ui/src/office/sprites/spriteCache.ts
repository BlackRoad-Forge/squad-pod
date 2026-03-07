import { SpriteData } from '../types.js';

const outlineCache = new WeakMap<SpriteData, SpriteData>();
const spriteCanvasCache = new WeakMap<SpriteData, Map<number, HTMLCanvasElement>>();

export function getOutlineSprite(sprite: SpriteData): SpriteData {
  const cached = outlineCache.get(sprite);
  if (cached) return cached;

  const height = sprite.length;
  const width = sprite[0]?.length ?? 0;
  const outlineHeight = height + 2;
  const outlineWidth = width + 2;

  const outline: SpriteData = [];
  for (let y = 0; y < outlineHeight; y++) {
    const row: string[] = [];
    for (let x = 0; x < outlineWidth; x++) {
      row.push('');
    }
    outline.push(row);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = sprite[y][x];
      if (color && color !== '') {
        const neighbors = [
          { dx: 0, dy: -1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 }
        ];

        for (const n of neighbors) {
          const nx = x + n.dx;
          const ny = y + n.dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighborColor = sprite[ny][nx];
            if (!neighborColor || neighborColor === '') {
              outline[ny + 1][nx + 1] = '#ffffff';
            }
          } else {
            outline[ny + n.dy + 1][nx + n.dx + 1] = '#ffffff';
          }
        }
      }
    }
  }

  outlineCache.set(sprite, outline);
  return outline;
}

let _spriteCreateCount = 0;

export function getCachedSprite(sprite: SpriteData, zoom: number): HTMLCanvasElement {
  let zoomMap = spriteCanvasCache.get(sprite);
  if (!zoomMap) {
    zoomMap = new Map();
    spriteCanvasCache.set(sprite, zoomMap);
  }

  const cached = zoomMap.get(zoom);
  if (cached) return cached;

  const height = sprite.length;
  const width = sprite[0]?.length ?? 0;

  const canvas = document.createElement('canvas');
  canvas.width = width * zoom;
  canvas.height = height * zoom;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  let pixelCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = sprite[y][x];
      if (color && color !== '') {
        ctx.fillStyle = color;
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        pixelCount++;
      }
    }
  }

  // Log first 10 sprite canvas creations to debug
  if (_spriteCreateCount < 10) {
    _spriteCreateCount++;
    console.log(`[getCachedSprite] created ${width}x${height} canvas (${canvas.width}x${canvas.height}px) zoom=${zoom} pixels=${pixelCount}/${width * height}`);
  }

  zoomMap.set(zoom, canvas);
  return canvas;
}
