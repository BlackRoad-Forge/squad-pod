# Decision: Tileset Metadata Integration — Prefer Rich Format with Legacy Fallback

**Date:** 2026-03-08
**Author:** Lisa Simpson
**Status:** Implemented

## Context

The tileset asset pipeline now produces two JSON files:
- `tileset.json` — 12 objects, flat `{x,y,w,h}` regions, no categorization
- `tileset-metadata.json` — 18 items with type categories, structured bounds, interactables

The webview needs richer data (item types for rendering layers, interactables for player actions) but existing renderers still reference the legacy `getTilesetData()` API.

## Decision

**Prefer tileset-metadata.json; fall back to tileset.json.**

1. Extension host tries `tileset-metadata.json` first → sends `tilesetMetadataLoaded` message
2. If missing or malformed, falls back to `tileset.json` → sends `tilesetAssetsLoaded` (unchanged)
3. Webview's `setTilesetMetadata()` also populates the legacy `tilesetData` object so all existing renderers continue working without changes

## Consequences

**Positive:**
- Renderers can query items by type (`getItemsByType('furniture')`) for layered rendering
- Interactables are first-class data — no hardcoded action mappings needed
- Zero breaking changes: legacy code path untouched, legacy accessors still work

**Negative:**
- Two parallel metadata formats to maintain (until legacy tileset.json is fully retired)
- Webview duplicates type definitions from extension host (no shared package yet)

## Team Impact

- **Bart (HTML Tools):** Can use `getItemById()`, `getItemsByType()`, `getInteractables()` in renderers — no need to look up objects by string key anymore
- **All:** New OutboundMessage variant `tilesetMetadataLoaded` — add a case if you handle messages exhaustively
