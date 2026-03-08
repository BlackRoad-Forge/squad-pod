# Decision: Tileset Metadata Rendering Pipeline

**Date:** 2026-07-25
**Author:** Bart Simpson
**Status:** Implemented

## Context

The tileset-metadata.json introduces a richer format with typed items (floor/wall/furniture/electronics/appliance/decoration), precise pixel bounds, and interactable definitions. This supersedes the legacy tileset.json object map for new items while maintaining backward compat.

## Decision

Three new modules consume the metadata:

1. **tilesetRenderer.ts** — Added `drawMetadataItem()` and `drawMetadataItemScaled()` for metadata-driven rendering. Legacy `drawTilesetFurniture()` untouched. Rendering looks up items via `getItemById()` from assetLoader (Lisa's domain), keeping loading/rendering cleanly separated.

2. **collision.ts** — Stateless functions that classify item types as blocking or walkable. Multi-tile items (e.g., 48×32 desk = 3×2 tiles) correctly occupy all grid cells via `Math.ceil(bounds / TILE_SIZE)`. Integrates with existing `blockedTiles: Set<string>` via `mergeBlockedTiles()`.

3. **interactables.ts** — `InteractableRegistry` class with load/query lifecycle. Maps item_id→action from metadata. Spatial queries find adjacent interaction points and nearby interactables for characters.

## Consequences

- **Forward path clear:** Future items just need a metadata entry — no code changes for rendering/collision
- **Backward compat preserved:** Old furnitureCatalog.ts sprites still render when metadata isn't loaded
- **Team impact:** Lisa's assetLoader provides the data; Bart's modules consume it. Marge can unit-test collision/interactables without Canvas mocks (pure logic).
