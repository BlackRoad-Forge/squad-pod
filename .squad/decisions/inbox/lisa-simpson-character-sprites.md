# Decision: Reduce Character Sprites to 2 (A and B)

**Author:** Lisa Simpson
**Date:** 2026-03-08
**Status:** Implemented

## Context
Brian provided two new source character images to replace all existing sprite sheets. The project previously had 5 character variants (A-E, all identical 63KB placeholders) with `CHAR_COUNT=6` palette cycling.

## Decision
- Reduce to exactly 2 character sprite sheets: `char_employeeA.png` (dark-haired male) and `char_employeeB.png` (blonde female).
- `CHAR_COUNT` set to 2. Palette index cycles 0→A, 1→B, 2→A, 3→B, etc.
- `PALETTE_TO_SHEET` reduced to `['A', 'B']` with modulo wrapping.
- The `SquadPodViewProvider` auto-discovers sheets via glob — no code change needed there.

## Impact
- All agents now alternate between 2 character appearances instead of 6.
- Sprite sheet file size dropped from 63KB each to ~23-29KB each (real pixel art vs placeholders).
- If more character variety is needed later, add new sheets (C, D, etc.) and bump `CHAR_COUNT` + `PALETTE_TO_SHEET`.

## UP-Facing Sprite Limitation
Image A's UP-facing direction had gray clothing indistinguishable from the gray background. The UP row uses horizontally-flipped DOWN frames as a workaround. If Brian provides a re-rendered source with distinct background color (e.g., magenta/green screen), the true back view can be extracted.
