# Decision: Synchronous RGBA Loading for Critical Webview Assets

**Author:** Bart Simpson (Frontend Dev)  
**Date:** 2025-01-22  
**Status:** Proposed for §18

## Context

Character sprites failed to render in the VS Code Electron webview across 7+ fix attempts. All async image loading approaches (new Image().onload, createImageBitmap, img.decode()) proved unreliable in the Electron/Chromium environment. Characters rendered as colored rectangle fallbacks instead of PNG sprite art.

## Problem

**Async Image Loading is Fundamentally Unreliable in VS Code Webviews:**
- `new Image().onload` may never fire for data URIs in Electron
- `createImageBitmap` is async and may resolve too late for module init
- `img.decode()` is async and has timing issues
- All three approaches worked in Chrome DevTools but failed in production VS Code environment

**Webview Caching Hid the Problem:**
- Previous fixes (removeBackground skip, code-splitting fix, race condition guard) never took effect
- VS Code Electron webview served cached JS/CSS from old builds
- No cache-busting mechanism existed in `_getHtmlForWebview()`

## Decision

**For critical bootstrap assets in VS Code webviews:**

1. **Pre-decode images to raw RGBA at build time** using server-side tools (Python PIL, Node.js Sharp, etc.)
2. **Embed raw RGBA pixel data** as base64-encoded strings in the bundle (not PNG data URIs)
3. **Use putImageData() at module init time** — this is 100% synchronous with zero dependencies on Image objects, decode(), or onload
4. **Add cache-busting to all script/CSS URIs** — append `?v=${Date.now()}` or similar to force fresh loads

## Implementation

### Build-Time PNG Decode (scripts/gen_embedded_chars.py)

```python
from PIL import Image
import base64

img = Image.open(path).convert("RGBA")
width, height = img.size
rgba_bytes = img.tobytes()  # Raw RGBA pixels
b64 = base64.b64encode(rgba_bytes).decode("ascii")

# Output TypeScript:
# export const CHAR_A_RGBA = "...";
# export const CHAR_A_WIDTH = 224;
# export const CHAR_A_HEIGHT = 128;
```

### Synchronous Bootstrap (assetLoader.ts)

```typescript
if (typeof document !== 'undefined' && typeof atob === 'function') {
  for (const { id, width, height, rgbaBase64 } of EMBEDDED_CHARACTERS) {
    const key = id.replace(/^char_employee/, '');
    
    // Decode base64 → raw RGBA bytes
    const binary = atob(rgbaBase64);
    const rgba = new Uint8ClampedArray(binary.length);
    for (let i = 0; i < binary.length; i++) {
      rgba[i] = binary.charCodeAt(i);
    }
    
    // Create ImageData from raw pixels
    const imageData = new ImageData(rgba, width, height);
    
    // Draw to canvas via putImageData (SYNCHRONOUS!)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    
    // Store immediately — characterSheets Map is now populated
    storeCharacterSheet(key, width, height, canvas);
  }
}
```

### Cache-Busting (SquadPodViewProvider.ts)

```typescript
private getWebviewHtml(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(...);
  const styleUri = webview.asWebviewUri(...);
  const cacheBuster = Date.now();
  
  return `<link href="${styleUri}?v=${cacheBuster}" />
          <script src="${scriptUri}?v=${cacheBuster}"></script>`;
}
```

## Rationale

- **putImageData is 100% synchronous** — no onload, no decode(), no Promises, no race conditions
- **Module init guarantees load order** — characterSheets Map is populated before any other code runs
- **Build-time decode is reliable** — Python PIL/Node.js Sharp are battle-tested, deterministic
- **Cache-busting prevents silent failures** — fixes take effect immediately, no stale JS served
- **Bundle size tradeoff is acceptable** — 611KB vs 375KB for guaranteed rendering

## Consequences

**Positive:**
- **Zero async dependencies for critical assets** — rendering works 100% reliably
- **No more colored rectangle fallbacks** — sprites always render
- **Faster first paint** — no Image load delay, pixels are immediately available
- **Debuggable** — console logs show characterSheets.size at bootstrap time

**Negative:**
- **Larger bundle size** — raw RGBA is 3× bigger than compressed PNG (224×128 = 114KB raw vs ~38KB PNG)
- **Build-time dependency on PIL** — Python Pillow must be installed to run gen script
- **Regenerate on PNG changes** — run `python scripts/gen_embedded_chars.py` after updating source PNGs

## Bundle Size Impact

**Before:** 375KB (PNG data URIs, async loading)  
**After:** 611KB (raw RGBA, sync loading)  
**Increase:** 236KB (~63%)

For two 224×128 sprites, this is acceptable. If scaling to 10+ sprites, consider hybrid approach (critical sprites embedded, others loaded async with fallback).

## Team Impact

- **Bart (Frontend Dev):** Owns gen script and bootstrap code — regenerate embeddedCharacters.ts after PNG updates
- **Lisa (Core Dev):** Cache-busting pattern applies to all webview HTML generation — use `?v=${Date.now()}` for script/CSS
- **All:** If adding new critical bootstrap assets (tileset, icons), use this pattern — raw RGBA + putImageData

## Pattern for Future Assets

**Use synchronous RGBA loading when:**
- Asset must be available at module init time
- Asset is small enough for bundle embedding (<1MB raw)
- Rendering depends on asset before first frame
- Running in Electron/VS Code webview environment

**Use async Image loading when:**
- Asset can load lazily after bootstrap
- Asset is large (>1MB) and rarely used
- Fallback rendering is acceptable during load
- Running in standard browser (not Electron)

## Enforcement

- Add comment to assetLoader.ts bootstrap section: "CRITICAL: Use putImageData for sync load — do not replace with async Image"
- Document in README.md: "Run `python scripts/gen_embedded_chars.py` after updating character PNGs"
- If webview caching issues recur, verify cache-busting is present in `_getHtmlForWebview()`

## Alternatives Considered

1. **Keep async Image loading, increase timeout** — Rejected: onload may never fire, no timeout helps
2. **Use fetch() + Blob URL** — Rejected: CSP blocks fetch() in webview
3. **Preload via <link rel="preload">** — Rejected: doesn't guarantee sync availability at module init
4. **Service Worker caching** — Rejected: service workers unavailable in VS Code webviews

## References

- Commit: 0d474bd "Fix sprite rendering with cache-busting and synchronous RGBA loading"
- Files: src/SquadPodViewProvider.ts, scripts/gen_embedded_chars.py, webview-ui/src/office/sprites/assetLoader.ts
- Tests: All 124 tests pass (46 extension + 78 webview)
