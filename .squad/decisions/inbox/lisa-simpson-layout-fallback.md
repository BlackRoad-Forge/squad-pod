# Layout Fallback — Always Send layoutLoaded

**Decision Date:** 2026-03-07  
**Author:** Lisa Simpson (Core Dev)  
**Status:** Implemented  
**Related:** `.squad/decisions.md` § 7 (No-Workspace Handling)

## Context

Squad Pod's webview waits for a `layoutLoaded` message to exit the loading screen and render the pixel art office. The extension host's `loadAndSendLayout()` method tries three sources for layout data, in order:

1. Workspace-persisted layout (`.squad-pod/layout.json`)
2. VS Code workspace state (survives VS Code restart)
3. Bundled default layout (`dist/assets/layout.json`)

If all three sources return `null`, the original code had a conditional guard:

```typescript
if (layout) {
  this.postMessage({ type: 'layoutLoaded', layout });
}
```

This meant the `layoutLoaded` message was **never sent** when no layout existed, leaving the webview stuck on "Loading office..." forever.

## Problem

The webview has no way to know the extension host failed to load a layout. It expects a `layoutLoaded` message as part of the initialization contract. Silent early returns break this contract.

This is a variant of the no-workspace handling issue (§ 7), but occurs when a workspace IS open yet no layout assets are available.

## Decision

**Always send the `layoutLoaded` message, even when no layout exists.**

### Implementation

1. Added `createMinimalLayout()` helper function that returns a valid but empty `LayoutData` object:
   - Single 20×15 room with default walls and floor
   - No furniture
   - No seats

2. Modified `loadAndSendLayout()` to unconditionally send the message:
   ```typescript
   if (!layout) {
     layout = createMinimalLayout();
   }
   this.postMessage({ type: 'layoutLoaded', layout });
   ```

3. Removed the conditional guard entirely — the message is now sent in all cases.

## Rationale

- **Contract fulfillment:** The webview expects a response; not sending one is a protocol violation
- **Graceful degradation:** An empty office is better than an infinite loading screen
- **User empowerment:** Users can populate the empty office via the layout editor
- **Consistency:** Aligns with § 7 pattern — always communicate state changes explicitly

## Alternatives Considered

1. **Send an error message instead** — Adds complexity; an empty layout is a valid state
2. **Keep bundled default layout in repo** — Better long-term solution, but doesn't handle missing-asset scenarios
3. **Show error UI in webview** — Overengineered for a recoverable condition

## Consequences

**Positive:**
- Webview never hangs on "Loading office..." when workspace is open
- Users can work in fresh installs without bundled assets
- Testing scenarios (missing assets) no longer cause UI deadlock

**Negative:**
- Users might see an unexpectedly empty office if assets are missing (rare)
- Empty layout structure is duplicated from default layout shape (minimal burden)

## Pattern for Future Work

When an extension host function is expected to send a message as part of a request-response contract:

1. Identify all failure/fallback paths
2. Ensure a message is sent in **every** path
3. Use minimal fallback values (empty arrays, default objects) rather than omitting the message
4. Document the fallback behavior in comments

This pattern ensures the webview can always progress, even in degraded states.

## Team Impact

- **Lisa (Core Dev):** Implemented fix and documented pattern
- **Brian (User):** Extension no longer hangs when layout assets are missing
- **All team members:** Use this pattern for future request-response message handlers
