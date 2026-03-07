# Lisa Simpson — History

## Project Context

**Project:** squad-pod — A VS Code extension bringing animated pixel art offices to Brady Gaster's Squad framework
**User:** Brian Swiger
**Stack:** VS Code Extension (TypeScript, esbuild), React 19 webview (Vite, Canvas 2D pixel art), Squad integration
**Inspiration:** pablodelucca/pixel-agents adapted for bradygaster/squad
**Universe:** The Simpsons

## Core Context

- Core developer owning extension host code, Squad integration, and build pipeline
- Extension reads .squad/ directory: team.md, agents/*/history.md, decisions.md, orchestration-log/
- Must bridge extension host (Node.js) and webview (React) via VS Code webview messaging
- esbuild for extension bundling, Vite for webview bundling — two separate build targets

## Foundation & Architecture (2026-03-05 to 2026-03-06)

Established dual-build infrastructure (esbuild + Vite), TypeScript interfaces for webview/extension protocol, agent detail feature (charter + activity lookup), and interface alignment across engine layers. Key decisions:

- **Build Pipeline:** esbuild (extension host) + Vite (webview), separate type checking and bundling
- **Agent Details:** Synchronous charter/log reads in extension, getAgentDetail handler serves rich AgentDetailInfo
- **Interface Alignment:** Character/Seat/FurnitureInstance/OfficeLayout properties normalized across implementation
- **Type Safety:** Property names, data structures (Map vs Array), optional vs required fields aligned between types.ts and runtime code
- **Test Infrastructure:** Vitest setup with globals, module cleanup patterns, fake timers for deterministic tests, real temp dirs for fs integration
- **Messaging Protocol:** Discriminated union on `type` field ensures exhaustive handler coverage

## Learnings

### No-Workspace Handling (2026-03-07)

**Problem:** When no workspace folder is open in VS Code, Squad Pod webview gets stuck showing "Loading office..." forever because the extension host returns early from `onWebviewReady()` without sending any message, leaving the webview waiting indefinitely for `layoutLoaded`.

**Architecture Decisions:**
- Added `noWorkspace` to `OutboundMessage` discriminated union in `src/types.ts`
- Extension host now explicitly sends `{ type: 'noWorkspace' }` when `getWorkspaceRoot()` returns undefined in `onWebviewReady()`
- Webview hook `useExtensionMessages` handles `noWorkspace` by setting both `noWorkspace: true` and `layoutReady: true` (so loading screen exits)
- `App.tsx` shows a helpful message when `noWorkspace` is true instead of hanging on loading screen

**Key File Changes:**
- `src/types.ts` — Added `{ type: 'noWorkspace' }` to `OutboundMessage` union
- `src/SquadPodViewProvider.ts` — `onWebviewReady()` sends `noWorkspace` message before returning when no workspace is open
- `webview-ui/src/hooks/useExtensionMessages.ts` — Added `noWorkspace` state, handles `noWorkspace` message case
- `webview-ui/src/App.tsx` — Added conditional render for `noWorkspace` state with helpful guidance message

**User Experience:**
- Before: Extension opens, shows "Loading office..." indefinitely when no folder open
- After: Extension opens, shows clear message: "Open a folder to get started. Squad Pod needs a workspace to discover your AI team."

**Pattern:** Discriminated union on message `type` field ensures type-safe exhaustive handling across extension-webview boundary. Always send a message when a condition changes, never silently return early.

**Decision:** See `.squad/decisions.md` § 7 for full architectural rationale and pattern for future no-workspace-like conditions.

### No-Workspace Handling (2026-03-07)

**Problem:** When no workspace folder is open in VS Code, Squad Pod webview gets stuck showing "Loading office..." forever because the extension host returns early from `onWebviewReady()` without sending any message, leaving the webview waiting indefinitely for `layoutLoaded`.

**Architecture Decisions:**
- Added `noWorkspace` to `OutboundMessage` discriminated union in `src/types.ts`
- Extension host now explicitly sends `{ type: 'noWorkspace' }` when `getWorkspaceRoot()` returns undefined in `onWebviewReady()`
- Webview hook `useExtensionMessages` handles `noWorkspace` by setting both `noWorkspace: true` and `layoutReady: true` (so loading screen exits)
- `App.tsx` shows a helpful message when `noWorkspace` is true instead of hanging on loading screen

**Key File Changes:**
- `src/types.ts` — Added `{ type: 'noWorkspace' }` to `OutboundMessage` union
- `src/SquadPodViewProvider.ts` — `onWebviewReady()` sends `noWorkspace` message before returning when no workspace is open
- `webview-ui/src/hooks/useExtensionMessages.ts` — Added `noWorkspace` state, handles `noWorkspace` message case
- `webview-ui/src/App.tsx` — Added conditional render for `noWorkspace` state with helpful guidance message

**User Experience:**
- Before: Extension opens, shows "Loading office..." indefinitely when no folder open
- After: Extension opens, shows clear message: "Open a folder to get started. Squad Pod needs a workspace to discover your AI team."

**Pattern:** Discriminated union on message `type` field ensures type-safe exhaustive handling across extension-webview boundary. Always send a message when a condition changes, never silently return early.

**Decision:** See `.squad/decisions.md` § 7 for full architectural rationale and pattern for future no-workspace-like conditions.

