# Decision: Never use crossOrigin on Image loads in VS Code webviews

**Author:** Lisa Simpson
**Date:** 2026-03-08
**Supersedes:** §18 (CORS-safe image loading)

## Context

Five consecutive fix attempts failed to make PNG tileset and character sprites render in the webview. The root cause was `crossOrigin='anonymous'` on `new Image()` — the vscode-resource server does not reliably send CORS headers, causing the image load to fail entirely (onerror fires). The retry mechanism (load without crossOrigin after CORS failure) was also unreliable due to browser response caching.

## Decision

**Never set `crossOrigin` on Image elements in VS Code webviews.** Load all images as plain `new Image()` without any CORS attribute.

- **Tilesets:** Only need `ctx.drawImage()` which works perfectly on tainted canvases. No downside.
- **Character sheets:** `removeBackground()` may fail to `getImageData()` on a tainted canvas, but its existing catch block handles this gracefully (returns canvas with raw image — character renders with visible background instead of colored circles).

Additionally, always keep strong module-level references to in-flight Image objects to prevent garbage collection before onload/onerror fires.

## Rationale

- `ctx.drawImage()` does not require CORS. Only pixel manipulation (getImageData/toDataURL) requires it.
- The character background removal is a nice-to-have, not critical. The catch block already handles the failure gracefully.
- Reliability of image loading trumps background removal quality.
