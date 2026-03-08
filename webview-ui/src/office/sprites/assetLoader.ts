/**
 * PNG Asset Preloader
 *
 * Loads tileset and character sprite sheet PNGs, pre-processes them
 * (background removal for characters), and provides them to renderers.
 * Falls back gracefully if assets can't be loaded — existing inline
 * sprite rendering continues to work.
 *
 * Supports two metadata formats:
 *   - tileset-metadata.json (rich: typed items with bounds + interactables)
 *   - tileset.json (legacy: simple name→region object map)
 */

import { TILE_SIZE } from '../types.js';

// ── Types — legacy tileset.json format ────────────────────────────

export interface TilesetObjectDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TilesetData {
  image: HTMLImageElement;
  objects: Record<string, TilesetObjectDef>;
  tileSize: number;
}

// ── Types — rich tileset-metadata.json format ─────────────────────

export type ItemType = 'floor' | 'wall' | 'furniture' | 'electronics' | 'appliance' | 'decoration';

export interface ItemBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TilesetItem {
  id: string;
  type: ItemType;
  bounds: ItemBounds;
}

export interface TilesetInteractable {
  item_id: string;
  action: string;
}

export interface TilesetMetadata {
  tileset_name: string;
  tile_size: number;
  asset_source: string;
  items: TilesetItem[];
  interactables: TilesetInteractable[];
}

export interface CharacterSheetData {
  /** Pre-processed canvas with background removed (transparent). */
  image: HTMLCanvasElement;
  /** Width of a single frame in source pixels. */
  frameWidth: number;
  /** Height of a single frame in source pixels. */
  frameHeight: number;
  /** Number of animation frames per direction row. */
  framesPerRow: number;
  /** Number of direction rows (always 4). */
  rows: number;
  /** Source pixels per base game pixel (e.g. 20 if 320px row = 16 base). */
  scale: number;
  /** Base frame width in game pixels (frameWidth / scale). */
  baseWidth: number;
  /** Base frame height in game pixels (frameHeight / scale). */
  baseHeight: number;
}

// ── Module state ──────────────────────────────────────────────────

let tilesetData: TilesetData | null = null;
const characterSheets = new Map<string, CharacterSheetData>();
let loadingPromise: Promise<void> | null = null;
let assetsReady = false;
let assetBaseUrl = '';

// ── Rich metadata state ──────────────────────────────────────────

let tilesetMetadata: TilesetMetadata | null = null;
let tilesetMetadataImage: HTMLImageElement | null = null;
const itemById = new Map<string, TilesetItem>();
const itemsByType = new Map<ItemType, TilesetItem[]>();
let interactables: TilesetInteractable[] = [];

// ── Public accessors ──────────────────────────────────────────────

export function areAssetsReady(): boolean {
  return assetsReady;
}

export function getTilesetData(): TilesetData | null {
  return tilesetData;
}

export function getCharacterSheet(key: string): CharacterSheetData | null {
  return characterSheets.get(key) ?? null;
}

/** Set the base URL for assets (e.g. from extension webview URI). */
export function setAssetBaseUrl(url: string): void {
  assetBaseUrl = url.endsWith('/') ? url : url + '/';
}

// ── Rich metadata accessors ──────────────────────────────────────

/** Returns the loaded TilesetMetadata, or null if only legacy data is available. */
export function getTilesetMetadata(): TilesetMetadata | null {
  return tilesetMetadata;
}

/** Returns the tileset PNG image loaded for the rich metadata path. */
export function getTilesetMetadataImage(): HTMLImageElement | null {
  return tilesetMetadataImage;
}

/** Look up a single tileset item by its unique id (e.g. "desk_work_monitor"). */
export function getItemById(id: string): TilesetItem | undefined {
  return itemById.get(id);
}

/** Get all tileset items of a given type category (e.g. "furniture", "appliance"). */
export function getItemsByType(type: ItemType): TilesetItem[] {
  return itemsByType.get(type) ?? [];
}

/** Get the interactables list — items that support player interaction. */
export function getInteractables(): TilesetInteractable[] {
  return interactables;
}

/**
 * Ingest rich tileset metadata sent by the extension host via
 * `tilesetMetadataLoaded`.  Builds the id and type lookup indexes,
 * then loads the tileset PNG image in the browser.
 */
export function setTilesetMetadata(metadata: TilesetMetadata, tilesetPngUri: string): void {
  tilesetMetadata = metadata;
  interactables = metadata.interactables ?? [];

  // Build lookup indexes
  itemById.clear();
  itemsByType.clear();
  for (const item of metadata.items) {
    itemById.set(item.id, item);
    const bucket = itemsByType.get(item.type);
    if (bucket) {
      bucket.push(item);
    } else {
      itemsByType.set(item.type, [item]);
    }
  }

  // Load the tileset PNG image for rendering
  const img = new Image();
  img.onload = () => {
    tilesetMetadataImage = img;

    // Also populate legacy tilesetData for backward compat with renderers
    // that still use getTilesetData()
    const legacyObjects: Record<string, TilesetObjectDef> = {};
    for (const item of metadata.items) {
      legacyObjects[item.id] = {
        x: item.bounds.x,
        y: item.bounds.y,
        w: item.bounds.width,
        h: item.bounds.height,
      };
    }
    tilesetData = {
      image: img,
      objects: legacyObjects,
      tileSize: metadata.tile_size ?? TILE_SIZE,
    };
  };
  img.onerror = () => {
    console.warn('[assetLoader] Failed to load tileset PNG for metadata:', tilesetPngUri);
  };
  img.src = tilesetPngUri;
}

// ── Internals ─────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Remove the near-white background from a sprite sheet by making
 * matching pixels transparent.  Samples the top-left corner for
 * the reference colour.
 */
function removeBackground(img: HTMLImageElement, tolerance: number = 45): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;

  // Reference background from top-left pixel
  const bgR = d[0], bgG = d[1], bgB = d[2];

  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - bgR);
    const dg = Math.abs(d[i + 1] - bgG);
    const db = Math.abs(d[i + 2] - bgB);
    if (dr + dg + db < tolerance) {
      d[i + 3] = 0; // transparent
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function resolveUrl(relativePath: string): string {
  return assetBaseUrl + relativePath;
}

// ── Public loader ─────────────────────────────────────────────────

/**
 * Kick off asset loading.  Safe to call multiple times — returns the
 * same promise if already loading.  On failure, sets `assetsReady` to
 * false so inline sprite rendering continues to work.
 */
export function loadAssets(): Promise<void> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // Load tileset image + JSON in parallel
      const [tilesetImg, tilesetJson] = await Promise.all([
        loadImage(resolveUrl('assets/tileset_office.png')),
        fetch(resolveUrl('assets/tileset.json')).then(r => {
          if (!r.ok) throw new Error(`tileset.json: ${r.status}`);
          return r.json();
        }),
      ]);

      tilesetData = {
        image: tilesetImg,
        objects: tilesetJson.objects ?? {},
        tileSize: tilesetJson.tile_size ?? TILE_SIZE,
      };

      // Load all 4 character sprite sheets in parallel
      const charKeys = ['A', 'B', 'C', 'D'];
      const charImages = await Promise.all(
        charKeys.map(key =>
          loadImage(resolveUrl(`assets/characters/char_employee${key}.png`))
        ),
      );

      for (let i = 0; i < charKeys.length; i++) {
        const img = charImages[i];
        const processed = removeBackground(img);

        const rows = 4;
        const frameHeight = img.height / rows;
        const scale = Math.round(frameHeight / TILE_SIZE);
        const baseHeight = Math.round(frameHeight / scale);
        // Determine frame width: try dividing evenly by 7 first (known layout)
        const framesPerRow = img.width % 7 === 0 ? 7 : Math.round(img.width / (baseHeight * scale * (img.width / img.height)));
        const frameWidth = Math.round(img.width / (framesPerRow || 7));
        const baseWidth = Math.round(frameWidth / scale);

        characterSheets.set(charKeys[i], {
          image: processed,
          frameWidth,
          frameHeight,
          framesPerRow: framesPerRow || 7,
          rows,
          scale,
          baseWidth,
          baseHeight,
        });
      }

      assetsReady = true;
    } catch (e) {
      console.warn('[assetLoader] PNG assets unavailable, using inline sprites:', e);
      assetsReady = false;
    }
  })();

  return loadingPromise;
}
