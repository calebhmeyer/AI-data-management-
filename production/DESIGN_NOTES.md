# Cable Count App — Design Notes (pre-Phase 2)

Captured 2026-07-05 from a design discussion between the operator (production PM) and
Claude (coder). Status: thinking phase — deliberately not coding yet. The operator's
stated goal: avoid the vibecoding trap of rushing to code before the structure is settled.

## Operator's proposed structure (as articulated)

- **Persistent layer**: the room (drawn as a basic outline, or imported 3D model), plus
  all shared infrastructure — truss, pipes, rigging, power distribution, data
  distribution, console.
- **Section layers**: named areas of lights (upstage truss, uplights, ...). Each section
  operates within the same 3D viewport on top of the persistent layer.
- **3D engine**: intentionally primitive. Technical and easily usable beats beautiful.
- **3D cursor scheme**: cursor is always projected onto the ground (or a chosen elevation
  plane). Holding a button/key locks XY and moves the cursor on Z instead. User can orbit
  freely while keeping full control of the cursor's world position.
- **Home runs**: every section requires a power home run and a data home run (data can be
  flagged wireless).
- **Cable paths**: definable in a section or in the persistent layer. Assigning a home run
  to a path occupies the full path by default. Clicking *within* the path retracts the run
  to that point (removing cable); clicking *outside* the path adds a waypoint beyond it.
- **Per-fixture status**: "is receiving power" and "is receiving data" — guarantees no
  fixture is left missing either critical service.

## Claude's assessment and refinements

### Core reframe: the app is a connectivity graph; 3D is a view of it
Console → universe → home run → break-out → jumper chain → fixture; distro → soco →
breakout → circuit → whip → chain → fixture. Every Phase 1 validation (power/data
reachability, amp totals, universe fill, jumper math, run-length arithmetic) is a graph
traversal requiring zero geometry — proven by doing the whole 2026-07-06 count with no 3D.

### Layer cake and build order (de-risking strategy)
1. **Domain core** — inventory, sections, connectivity graph, validation engine.
   Pure logic, no UI, fully testable. Phase 1 codified.
2. **Persistence** — project files as JSON (human-readable, diffable).
3. **Geometry layer** — paths, distances, elevations. Engine-agnostic math.
4. **3D viewport + per-platform UI** — built last.

Rationale: if 3D proves hard, a shippable counting app still exists. Reverse order yields
a tech demo and no product.

### 3D cursor: endorsed, with additions
- **Working elevation presets** — floor (0), stage deck, truss trims. Cursor rides the
  chosen plane; hold-to-elevate becomes the exception.
- **Snapping is the feature** — grid, endpoint, and object snap (truss/pipe/breakout tail).
- **Touch dialect required** — no hover/modifiers on Android/iOS. e.g., tap sets XY, then
  a Z drag-handle appears. Must be designed alongside desktop, not ported after.

### Cable paths: separate PATH (geometry) from RUN (cable assignment)
Many cables ride one pick line. If runs reference paths:
- **Bundle counts per path segment** → weight on rig points (real rigger need).
- **Auto length suggestion** — path length + slack % (service loops, vertical drops)
  → suggest cables from actual inventory, incl. joined cables (100'+100' = 200' run),
  deducting from the pool.
- Operator's retract/extend click model still works — it edits the run's span/waypoints
  while the path stays shared.

### Per-fixture power/data status: computed, not maintained
Reachability over the graph, not a manual checkbox. Catches the "two lekos with no power
path" class of error from Phase 1 automatically. Wireless = flag satisfying the data trace.
Package whips = graph edges that never deduct inventory.

### Deliberate scope brakes
- **3D model import deferred** — units/scale/orientation/bad-mesh rabbit hole. v1: draw
  footprint + height. Middle step with high value: **PDF floor plan underlay tracing**
  (venues hand out PDFs, not glTFs). Real 3D import in v2.
- **Rendering**: flat-shaded, line-drawn, orthographic top view as default; perspective
  as secondary. Technical > beautiful (operator's own requirement).
- **Tech stack**: undecided, deliberately. Constraint set: 4 platforms (Android/iOS/
  Mac/PC) + basic 3D + touch. Candidates flagged: Godot (strong fit for shape of
  problem), Unity (heavier incumbent), Flutter/RN (3D is the painful part). Decision
  deferred to Phase 2 kickoff.

## Open design questions for Phase 2 kickoff
1. Multi-device story — does a show file sync across phone (on site) and desktop (prep)?
2. Where does inventory live — per show, per shop, or both (shop stock vs. show pull)?
3. Unit system — feet-first with metric toggle, or unit-agnostic core?
4. How do sections interact with shared universes/circuits when edited concurrently
   (two sections drawing from the same breakout)?
5. Validation UX — inline-live (as you place) vs. check-on-demand (a "run checks" button)?
