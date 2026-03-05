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
