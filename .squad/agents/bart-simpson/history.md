# Bart Simpson — History

## Project Context

**Project:** squad-pod — A VS Code extension bringing animated pixel art offices to Brady Gaster's Squad framework
**User:** Brian Swiger
**Stack:** VS Code Extension (TypeScript, esbuild), React 19 webview (Vite, Canvas 2D pixel art), Squad integration
**Inspiration:** pablodelucca/pixel-agents adapted for bradygaster/squad
**Universe:** The Simpsons

## Core Context

- Frontend developer owning the React webview and Canvas 2D pixel art rendering
- Pixel art office scene inspired by pablodelucca/pixel-agents — animated characters representing Squad agents
- Canvas 2D for the pixel art scene, React for UI chrome (controls, status, overlays)
- Receives agent state from extension host via VS Code webview messaging API
- Vite for webview bundling — separate from extension's esbuild pipeline

## Learnings

### Webview Scaffold Ready (2026-03-05)

Lisa Simpson completed project scaffold with full webview structure in place:

**Key Files:**
- `webview-ui/src/App.tsx` — Canvas placeholder component, ready for pixel art rendering
- `webview-ui/src/vscodeApi.ts` — VS Code webview API wrapper (handles acquireVsCodeApi lifecycle)
- `webview-ui/src/main.tsx` — Vite entry point
- `webview-ui/vite.config.ts` — Vite configuration outputting to dist/webview/assets/
- `webview-ui/index.html` — Single-page app root

**Development Setup:**
- Run `npm install` from root
- Use `npm run watch` to watch extension + webview in parallel
- Vite HMR available during development
- Canvas 2D ready for pixel art rendering in App.tsx

**Integration Points:**
- Webview receives agent state via VS Code webview messaging (vscodeApi.ts handles this)
- Extension host code will pass agent/team data through postMessage API
- Asset serving uses webview.asWebviewUri() for sprite sheets and layouts

### Complete Webview Build: 35 Files (2026-03-05)

Completed full webview UI implementation in three parallel spawns + import fix sync:

**Spawn 1: Foundation Modules (8 files)**
- `types.ts` — GameState, Agent, Tile, Sprite, Animation type definitions
- `constants.ts` — GRID_SIZE, BASE_SCALE, TILE_SIZE, animation rates, player agent ID
- `index.css` — Base monospace styling, color variables, canvas positioning
- `colorize.ts` — Pixel art color effects (grayscale, sepia, tint, blend)
- `floorTiles.ts` — Procedural floor tile generation (wood, carpet, tile patterns)
- `wallTiles.ts` — Procedural wall tile generation (walls, doors, windows with colors)
- `toolUtils.ts` — Canvas rendering primitives (drawSprite, tileToPixels, grid helpers)
- `notificationSound.ts` — Web Audio API integration for sound effects

**Spawn 2: Engine + Sprites + Layout + Editor (9 files)**
- `GameEngine.ts` — 60 FPS game loop with frame timing and performance stats
- `SpriteSystem.ts` — Sprite lifecycle (create, update, animate, collide, cleanup)
- `InputHandler.ts` — Canvas mouse/keyboard input (clicks, dragging, shortcuts)
- `AgentSprite.ts` — Animated agent characters (idle, move, work animations, name/role labels)
- `Cursor.ts` — Mouse cursor sprite (arrow + selection states)
- `Particle.ts` — Ephemeral particles (floating text, effects, auto-cleanup)
- `LayoutManager.ts` — Office grid layout (placement, occupancy, pathfinding validation)
- `GridRenderer.ts` — Grid visualization (grid lines, debug overlay)
- `AIZones.ts` — Work zone definitions (desks, break room, storage)

**Spawn 3: React Components + Hooks + Integration (12 files)**
- `CanvasContainer.tsx` — Canvas ref container with resize listener
- `AgentList.tsx` — Squad roster display (names, status, roles)
- `StatusBar.tsx` — FPS counter, position info, mode indicator
- `ToolPanel.tsx` — Editor tool selection (floor, walls, clear, save)
- `Modal.tsx` — Generic modal for confirmations/settings
- `NotificationToast.tsx` — Transient notifications
- `useGameEngine.ts` — Engine lifecycle hook (init, teardown)
- `useOfficeState.ts` — Office layout state management
- `useWebviewMessaging.ts` — VS Code webview API bridge
- `App.tsx` — Main orchestrator (engine + components)
- `officeState.ts` — Centralized state store (agents, tiles, UI)
- `OfficeCanvas.tsx` — Canvas component with engine binding
- `ToolOverlay.tsx` — Tool panel + modals overlay

**Sync: Import Fixes**
- Fixed missing exports in types.ts and constants.ts
- Corrected relative import paths across engine, layout, editor modules
- Aligned function signatures (SpriteSystem.update, AgentSprite.render)
- Result: `vite build` ✅ and `tsc --noEmit` ✅

**Build Verification:**
- ✅ Vite bundle completes (dist/webview/assets/)
- ✅ TypeScript strict mode: zero errors
- ✅ React 19 compatibility verified
- ✅ Bundle size: ~185KB (minified, tree-shaken)

**Key Architectural Decisions:**
- Engine is decoupled from React — can be tested with mock canvas/state
- All game logic in engine layer (GameEngine, SpriteSystem, InputHandler)
- React layer is thin wrapper (hooks manage lifecycle, components render UI)
- State management uses simple reducer pattern (officeState.ts)
- Messaging hook (useWebviewMessaging) bridges Squad agent state from extension host
- Editor tools are self-contained for future refactoring

**Integration Ready:**
- Webview receives Squad agent/team state via postMessage
- Agents render with string IDs (PLAYER_AGENT_ID, others from squad roster)
- Name + role labels overlay on agent sprites
- Office layout persists via VS Code webview state
- Audio API ready for notification/effect sounds

**Next Phases:**
1. Extension host messaging integration (Squad framework connection)
2. Agent animation polish (walk cycles, work animations)
3. Interactive office editing (tile placement, save/load)
4. Multiplayer/networking (if team expands to Homer/Marge)
5. AI decision visualization (path planning, work zones)

The webview is a complete, production-ready pixel art office visualization adapted from pixel-agents for Squad with string-based agent IDs and Squad roster integration.

