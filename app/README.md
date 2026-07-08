# PullSheet v0.1 — first prototype

Cable-count app for live event production. Phase 2 of the plan in
`production/APP_REQUIREMENTS.md`; architecture per `production/DESIGN_NOTES.md`.

Open `index.html` in any browser — no build step, no dependencies. State autosaves to
localStorage; export/import as JSON. Starts as a blank project (standard shop cable
types, zero quantities); the real 2026-07-06 show — the Phase 1 ground truth — loads
via the "load demo" button. "new" clears back to a blank project.

## Structure (the layer cake, as designed)

| File | Layer | Notes |
|---|---|---|
| `core.js` | Domain core | Pure logic, no DOM. Pool deduction, shortage alerts, amp checks (80% rule), universe fill, jumper math, feed reachability, path-length cable suggestion. |
| `core.test.js` | Tests | `node core.test.js` — 33 assertions, every expected value from the real show, incl. the three real catches (25.7A over-amp, missing outcast jumpers, 512/512 universe). |
| `engine3d.js` | Geometry/viewport | Hand-rolled canvas wireframe renderer, Z-up, feet. Orbit/pan/zoom, ortho top + perspective, grid snap, working elevation planes, and the operator's cursor scheme: cursor rides the elevation plane; hold Shift to freeze XY and drive Z. |
| `app.js` | UI | Three-zone cockpit: inventory pool ledger / viewport / sections with live checks. Demo data lives here. |
| `index.html`, `style.css` | Shell | Console-dark, patch-sheet (mono) aesthetic. |

## What works in v0.1

- Master inventory pool with inline-editable start quantities; live start/used/left ledger
- Sections with fixture groups and cable lines (roles: ★ home run, jumper, spare, infra,
  pkg whip — whips never deduct stock)
- Live validation per section: amps per circuit vs breaker (80% rule), universes per
  fixture group with zero-headroom warning, jumper math vs data entry points (joined
  home runs supported), power/data feed presence (wireless counts)
- Shortage banner the moment any pool line goes negative; low/zero stock highlighting
- Show totals: cables pulled, universes, circuits, alert count
- 3D: draw room footprint, draw cable paths on any elevation plane (floor/deck/truss
  presets), per-path length labels, path → section assignment, and "suggest" — greedy
  cable combination from the actual remaining pool for path length + slack %
- Persistence: localStorage autosave, JSON export/import, demo reset

## Known limits (deliberate v0.1 cuts)

- Touch input for the 3D cursor not yet designed (desktop mouse + Shift only)
- Universe count is per-fixture-group (conservative); no cross-group universe packing
- No PDF underlay / 3D model import (per design notes: v2)
- Paths don't yet drive the retract/extend home-run interaction from the design notes
- Single breaker rating per show (20A default)
