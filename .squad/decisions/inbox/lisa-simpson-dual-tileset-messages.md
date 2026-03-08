# Decision: Always Send Both Tileset Message Formats

**Author:** Lisa Simpson
**Date:** 2026-03-08
**Status:** Accepted

## Context

The extension host can load two JSON formats for the office tileset:
- `tileset-metadata.json` — rich format with typed items, bounds, and interactables
- `tileset.json` — legacy format with simple name→region object map

Previously the extension sent EITHER `tilesetMetadataLoaded` OR `tilesetAssetsLoaded`, never both. This caused a rendering failure because the renderer's `furnitureToTileset` mapping uses `tileset.json` object names, which differ from `tileset-metadata.json` item IDs.

## Decision

The extension now ALWAYS sends both messages when both JSON files exist:
1. `tilesetMetadataLoaded` — populates metadata indexes (`itemById`, `itemsByType`, `interactables`) for future metadata-driven rendering
2. `tilesetAssetsLoaded` — populates legacy `tilesetData` with correct object names for the current `drawTilesetFurniture()` rendering path

## Rationale

- Sending both is cheap (same PNG URL, browser caches it)
- Separates concerns: metadata for rich features, legacy for current rendering
- No need to maintain a cross-mapping between naming conventions
- Preserves backward compatibility — renderers using either path work correctly

## Implications

- When migrating the renderer to use metadata-driven `drawMetadataItem()` instead of legacy `drawTilesetFurniture()`, the legacy message can eventually be dropped
- The `assetsReady` flag must be set by ALL asset ingestion paths, not just the `loadAssets()` URL-fetch path
