# Cable Count App — Requirements Harvested from Phase 1

Source: live cable-count session for the 2026-07-06 show (see `cable-count-2026-07-06.md`).
Every requirement below was derived from a real moment in that count — including several
where the manual process produced errors the app must catch automatically.

Target platforms: Android, iOS, Mac, PC — shared core logic, per-platform UI.

## Core model

1. **Master inventory pool** — cable types × lengths × quantities. Sections deduct from it.
2. **Sections** — named areas (Upstage Truss, Downstage Truss, Towers, Uplights). Cables are
   assigned to a section; the running total updates on every change.
3. **Negative pool = shortage alert.** Loud, immediate, names the section that broke it and
   by how many. (Prime directive of the whole app.)
4. **Per-section notation** for walk-back verification: operator can stand in a section and
   re-check its cables against the section record.
5. **Cable classes:** home runs (highlighted/starred — they're the long pulls that matter),
   jumpers, breakouts/fanouts, break-ins/break-outs (sneak snake), spares (counted but
   labeled spare), and **package-included whips/adapters** (tracked for confirmation
   checklists but NOT deducted from shop stock).
6. **Joined cables** — two cables coupled = one logical run (e.g., 100' + 50' = one 150'
   home run). The logical run is what the 3D path measures; the physical cables are what
   the pool deducts.

## Validation engine (the "catches" — each of these fired in Phase 1)

7. **Daisy-chain jumper math:** jumpers required = fixtures − entry points. Caught 8
   fixtures with a home run and zero jumpers (missed 7 cables). Also flags surplus (spares
   in the run — informational, not an error).
8. **Per-circuit amperage:** (fixture wattage ÷ voltage) × fixtures-per-circuit vs. breaker
   rating, with 80% continuous-load rule. Caught 8 × 385W fixtures specced onto one Edison
   feed (25.7A on a 20A circuit — needed a second home run).
9. **Home-runs-per-circuit:** N circuits declared requires N feeds. (Same catch as above —
   2 circuits, 1 feed.)
10. **Universe capacity:** fixtures × channel mode vs. 512/universe; computes max
    fixtures-per-universe (e.g., 127ch → 4 per universe). Warn at 100% full ("U5 = 512/512,
    zero headroom") — valid but nothing else may join.
11. **Run-length arithmetic:** declared run length vs. cables allocated. Caught "3 × 200'
    soco runs" listed as 4× 100' (needs 6).
12. **Connector/voltage rules engine:** e.g., "never 208V over Edison connectors."
    User-extensible rules; app confirms compliance (uplights ran 208V over soco/Tru1 ✓).
13. **Breakout circuit budgeting:** 6 circuits per soco breakout; track used vs. spare
    circuits per breakout (spare breakout circuits solved the outcast second-feed problem).
14. **Section verification states:** *counted-only* (cables logged, no fixture data) vs.
    *verified* (amp + universe checks passed). Towers entered counted-only and were
    upgraded to verified when fixture data arrived later.
15. **Layout inference cross-check:** cable counts imply topology (2× intra-tower jumpers +
    1 cross jump ⇒ 2 towers of 2 fixtures). App should reconcile declared layout against
    cable-implied layout and flag mismatches.

## Inventory intelligence

16. **Low-stock watch thresholds** — warn while stock still covers ("5' PowerCon at 6 of 16,
    one more PowerCon-heavy section is trouble").
17. **Zero-stock alerts** distinct from negatives — pool holds, but no substitutes remain.
18. **Substitution suggestions** — e.g., two 25' covering a dead 50', longer-for-shorter.
19. **Spares manifest** — whatever survives the count is the show's spare pool; report it,
    and flag types with zero spares (no margin for a bad cable at load-in).
20. **Restock recommendations from burn rate** — this show burned 91% of DMX stock; app
    proposes purchase quantities per length.

## 3D / spatial (Phase 2 core)

21. Primitive 3D engine: venue volume, cable pick lines (ceiling) and floor paths.
22. Distance measurement along paths → auto-suggest cable lengths per run.
23. Track power sources (distro/soco runs/wall), data sources (console ports, sneak snake
    break-in/break-out, nodes), and every connection point.
24. Universe numbering across the whole show (this show: ~9–10 universes), with per-universe
    fill visualization.

## AI integration (Phase 3, paid tier)

25. Assistant always holds full layout + cable path context.
26. Conversational section entry — operator speaks freeform ("14 jolt bars at 127 channels,
    sneak snake runs up..."), AI structures it, runs all validations, and flags in real time.
    Phase 1 of this project was a live rehearsal of exactly this interaction.
