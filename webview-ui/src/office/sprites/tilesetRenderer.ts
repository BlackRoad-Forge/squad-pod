/**
 * Tileset Renderer
 *
 * Draws furniture objects from the PNG tileset sprite sheet using
 * `ctx.drawImage()` source-rectangle clipping.  Falls back silently
 * when the tileset isn't loaded yet.
 */

import { getTilesetData } from './assetLoader.js';
import { FurnitureType } from '../types.js';

/**
 * Mapping from the game's FurnitureType values to tileset.json object
 * names.  Only types with a tileset equivalent are listed; others fall
 * back to inline sprite rendering.
 */
const furnitureToTileset: Record<string, string> = {
  [FurnitureType.DESK]: 'work_desk_v1',
  [FurnitureType.BOOKSHELF]: 'bookshelf_full',
  [FurnitureType.PLANT]: 'potted_plant',
  [FurnitureType.COOLER]: 'water_dispenser',
  [FurnitureType.WHITEBOARD]: 'large_whiteboard',
  [FurnitureType.PC]: 'computer_monitor',
};

/**
 * Try to draw a furniture item from the PNG tileset.
 *
 * @returns `true` if the tileset object was drawn, `false` if the
 *          caller should fall back to inline sprite rendering.
 */
export function drawTilesetFurniture(
  ctx: CanvasRenderingContext2D,
  furnitureType: string,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
): boolean {
  const tileset = getTilesetData();
  if (!tileset) return false;

  const objectName = furnitureToTileset[furnitureType];
  if (!objectName) return false;

  const obj = tileset.objects[objectName];
  if (!obj) return false;

  ctx.imageSmoothingEnabled = false;

  // Scale the tileset object to fill the furniture instance's footprint
  // so it matches the existing layout dimensions.
  ctx.drawImage(
    tileset.image,
    obj.x, obj.y, obj.w, obj.h,    // source rect in tileset
    destX, destY, destW, destH,     // dest rect on canvas
  );

  return true;
}

/**
 * Draw a named tileset object at its native pixel size (scaled by zoom).
 * Useful for rendering tileset objects that aren't mapped to FurnitureType.
 */
export function drawTilesetObjectNative(
  ctx: CanvasRenderingContext2D,
  objectName: string,
  destX: number,
  destY: number,
  zoom: number,
): boolean {
  const tileset = getTilesetData();
  if (!tileset) return false;

  const obj = tileset.objects[objectName];
  if (!obj) return false;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tileset.image,
    obj.x, obj.y, obj.w, obj.h,
    destX, destY, obj.w * zoom, obj.h * zoom,
  );

  return true;
}
