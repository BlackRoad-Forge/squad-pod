# Decision: Character Sheet URI Handler Must Match Extension Message Protocol

**Date:** 2026-03-08
**Author:** Lisa Simpson
**Status:** Implemented

## Context

The extension host sends `characterAssetsLoaded` messages containing webview-safe URIs for character sprite sheet PNGs (char_employeeA–D.png). The webview had no handler for this message type, causing all characters to render as colored rectangles instead of custom PNG sprites.

## Decision

Every `OutboundMessage` variant defined in `src/types.ts` MUST have a corresponding handler in `webview-ui/src/hooks/useExtensionMessages.ts`. The `default: break` case in the message switch silently drops unhandled messages with no runtime warning.

## Rationale

- The discriminated union in `types.ts` provides compile-time type safety on the extension side, but the webview's switch/case has no exhaustiveness check — unhandled variants are silently ignored
- This bug was invisible: no errors, no warnings, just silent fallback to inline sprites
- The fix follows the existing pattern for asset loading: dynamic import + function call in the message handler

## Recommendation

When adding new message types to `OutboundMessage`, treat the handler in `useExtensionMessages.ts` as a mandatory counterpart. Consider adding a lint rule or code review checklist item to catch missing handlers.
