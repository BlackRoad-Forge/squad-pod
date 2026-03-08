# Decision: EditorToolbar as Left Side Panel

**Date:** 2026-07-08
**Author:** Bart Simpson (Frontend Dev)
**Status:** Implemented

## Context

The layout editor had all backend plumbing (EditorState, tools, undo/redo, ghost rendering, furniture catalog) but no visible UI. Clicking "Edit Layout" toggled edit mode but showed no toolbar.

## Decision

Implemented EditorToolbar as a **left side panel** (220px wide) rather than a floating overlay or top strip:

1. **Left panel positioning** — sits between left edge and canvas, above the BottomToolbar (bottom: 48px). Doesn't obscure the canvas.
2. **Context-sensitive sections** — floor patterns and color sliders only appear when the relevant tool is active, keeping the panel compact.
3. **Inline styles only** — all styling via React style objects, no external CSS. Required for VS Code webview CSP compliance.
4. **SpritePreview via Canvas** — furniture palette items render their inline sprites using tiny `<canvas>` elements with `imageRendering: pixelated`, avoiding the need to load external preview images.
5. **Grid expansion in useEditorActions** — `handleExpandGrid` manipulates the tile array directly, shifting furniture positions and tileColor keys for left/up expansion. Ghost border clicks in OfficeCanvas trigger this.

## Consequences

- **Positive:** Full editor functionality now accessible via UI. Ghost borders enable visual grid expansion.
- **Consideration:** The 220px side panel reduces canvas viewport width when editing. This is acceptable since editing is a separate mode.
- **Team impact:** Any new EditTool variants added to types.ts should also be added to TOOL_DEFS in EditorToolbar.tsx.
