### 2026-03-08T03:21: User directive — Tileset Metadata Integration
**By:** Brian Swiger (via Copilot)
**What:** Integrate tileset-metadata.json as the primary metadata source for office assets. The metadata defines 18 items (floors, walls, furniture, electronics, appliances, decorations) with precise pixel bounds from tileset_office.png. The renderer must use bounds (x, y, width, height) to clip sprites. All dimensions must be multiples of 16. Interactables (vending_machine_soda, coffee_maker_carafe, pc_monitor_on) must map to character states. Type field (furniture, appliance, etc.) generates collision maps. This bypasses the import-tileset pipeline — metadata is manually registered.
**Why:** User request — captured for team memory
