# Decision: Tileset Metadata Items as Placeable Furniture

**Author:** Bart Simpson (Frontend Dev)
**Date:** 2025-07-25

## Context

The EditorToolbar now supports placing items from tileset-metadata.json (Electronics, Appliances, Decorations) in addition to the legacy FURNITURE_CATALOG items.

## Decision

Tileset metadata item IDs (e.g. `vending_machine_soda`, `pc_monitor_on`) are used directly as the furniture `type` string in `PlacedFurniture`. The rendering pipeline tries three fallbacks in order:

1. **Legacy tileset** (`drawTilesetFurniture`) — uses `furnitureToTileset` mapping for old types like `desk`, `pc`
2. **Metadata PNG** (`drawMetadataItemScaled`) — uses tileset-metadata.json bounds for new items
3. **Inline sprite** — falls back to the SpriteData array (placeholder for metadata items)

`layoutToFurnitureInstances()` also handles metadata items by looking up bounds from the asset loader when `getCatalogEntry()` returns null.

## Impact

- New items placed from the metadata catalog will use metadata IDs as types in saved layouts
- Existing layouts with legacy types (`desk`, `chair`, etc.) continue to work unchanged
- Any agent adding new tileset items to tileset-metadata.json will see them automatically appear in the editor toolbar under their category
