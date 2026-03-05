# Squad Decisions

## Active Decisions

### 1. Squad Pod: Project Structure & Build Pipeline

**Decision Date:** 2026-03-05  
**Author:** Lisa Simpson  
**Status:** Implemented  

#### Context

Squad Pod is a VS Code extension that embeds a React webview with Canvas-based pixel art animations. This requires two completely separate build targets:
1. Extension Host (Node.js environment, VS Code Extension API)
2. Webview (Browser environment, React)

#### Decision

Implement a dual build pipeline with clear separation of concerns:

**Extension Host Build (esbuild):**
- Bundler: esbuild (fast, Node-native, CJS output)
- Entry: src/extension.ts → dist/extension.js
- Config: esbuild.js with watch mode, problem matcher integration
- Why esbuild: Instant rebuilds, native Node.js support

**Webview Build (Vite):**
- Bundler: Vite (modern, React-optimized, ESM output)
- Entry: webview-ui/src/main.tsx → dist/webview/assets/
- Config: webview-ui/vite.config.ts with fixed asset names
- Why Vite: Best-in-class React DX, HMR, modern ESM output

**Asset Handling:**
- Static assets (spritesheets, layouts) live in webview-ui/public/assets/
- esbuild plugin copies them to dist/assets/ post-build
- Extension serves assets from dist/ via webview.asWebviewUri()

**Development Workflow:**
```bash
npm run watch          # Parallel: watch:esbuild + watch:tsc
npm run check-types    # Type check without bundling
npm run build          # Production build (minified, no sourcesContent)
npm run build:webview  # Vite build (called separately when needed)
```

#### Consequences

**Positive:**
- Clear separation: Node.js code vs browser code never mix
- Fast rebuilds: esbuild for extension (~50ms), Vite HMR for webview
- Type safety: Separate tsconfigs catch environment-specific errors early
- Standard tooling: esbuild/Vite are industry standard for their respective domains

**Negative:**
- Two build systems to maintain (but each is trivial)
- Webview must be built separately (acceptable tradeoff)
- Assets must be copied by plugin (no magic resolution)

#### Team Impact

- **Bart (Canvas Dev):** Works entirely in webview-ui/src/, uses npm run dev for Vite HMR
- **Lisa (Project Lead):** Scaffold and build infrastructure complete
- **Marge (Tests):** Extension tests use dist/extension.js, webview tests use Vite test mode

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
