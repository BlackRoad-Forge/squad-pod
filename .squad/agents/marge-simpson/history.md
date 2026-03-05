# Marge Simpson — History

## Project Context

**Project:** squad-pod — A VS Code extension bringing animated pixel art offices to Brady Gaster's Squad framework
**User:** Brian Swiger
**Stack:** VS Code Extension (TypeScript, esbuild), React 19 webview (Vite, Canvas 2D pixel art), Squad integration
**Inspiration:** pablodelucca/pixel-agents adapted for bradygaster/squad
**Universe:** The Simpsons

## Core Context

- Tester owning all testing: unit, integration, E2E for the VS Code extension
- Key test boundaries: extension activation, .squad/ file parsing, webview messaging, Canvas rendering
- Test tools: Vitest for unit tests, @vscode/test-electron for extension integration tests
- Critical edge cases: malformed .squad/ state, missing files, concurrent file changes, large repos

## Learnings

(New learnings will be appended here as work progresses)
