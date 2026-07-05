# Cable Count Ledger — Show (name TBD), 2026-07-06

**STATUS: FINAL — all 4 sections counted. No shortages. See Final Summary at bottom.**

## MASTER INVENTORY (starting totals)

| Cable | Start |
|---|---|
| Cat5 50' | 2 |
| Cat5 100' | 2 |
| Sneak snake break-in | 2 |
| Sneak snake break-out | 2 |
| DMX 100' | 10 |
| DMX 50' | 8 |
| DMX 25' | 24 |
| DMX 10' | 12 |
| DMX 5' | 20 |
| Soco 50' | 5 |
| Soco 100' | 10 |
| Tru1 breakout | 7 |
| Edison breakout | 4 |
| Tru1 100' | 4 |
| Tru1 50' | 15 |
| Tru1 25' | 25 |
| Tru1 10/15' jumper | 16 |
| PowerCon 5' jumper | 16 |
| PowerCon 25' jumper | 6 |
| PowerCon 15' jumper | 4 |
| Edison 100' | 4 |
| Edison 50' | 10 |
| Edison 25' | 10 |
| Edison 10' | 10 |

Whips/adapters (Edison→PowerCon, Edison→Tru1, etc.): NOT counted — come with the fixture package per operator. Ignore in tallies.

---

## SECTION 1 — UPSTAGE TRUSS

Fixtures:
- 14× Jolt Bar FX, 127ch each, PowerCon, 430W @ 120V
- 8× Outcast Beam Wash, 64ch mode, Tru1, 385W @ 120V

### Data
- 1× Cat5 100' (sneak snake run)
- 1× Sneak snake break-in (console end)
- 1× Sneak snake break-out (truss end) → 4 universes
- HOME RUNS (⭐ highlight): 2× DMX 50', 2× DMX 25' (4 universes to jolt bar chains)
- Jumpers: 10× DMX 5' (jolt bar daisy chains: 4+4+4+2, 14−4=10 ✓)
- Outcast home run: 1× DMX 100' (universe 5, direct — not via sneak)
- Outcast jumpers: 8× DMX 25' (chain of 8 needs 7; 1 spare in the run) [ADDED after flag]

### Power
- 1× Soco 100' (no break-in)
- 1× Edison breakout (6 circuits)
- 4× Edison→PowerCon F (untracked adapter) — 4 jolt bar circuits @ 4/3.58A ea = 14.3A ✓
- 10× PowerCon 5' jumper (chains 4+4+4+2 → 3+3+3+1 = 10 ✓)
- 1× Edison 50' (outcast power home run, circuit 1)
- 1× Edison 10' (outcast power home run, circuit 2) [ADDED after flag]
- 2× Edison→Tru1 whip (untracked, comes with package) — 2 circuits of 4 outcasts
- 6× Tru1 25' jumper (2 chains of 4 → 3+3 = 6 ✓)

### Section flags — RESOLVED
1. ✅ Outcast DMX jumpers added: 8× 25' DMX
2. ✅ 2nd outcast Edison home run added: 1× 10' Edison (feeds circuit 2 off spare breakout circuit)
3. Note: Jolt bars run 120V; do NOT run 208V over Edison connectors
4. DMX universes: U1–U3 = 4 jolt bars each (508/512), U4 = 2 jolt bars (254/512),
   U5 = 8 outcasts (512/512 — exactly full, zero headroom)

### Deductions
| Cable | Used | Remaining |
|---|---|---|
| Cat5 100' | 1 | 1 |
| Sneak break-in | 1 | 1 |
| Sneak break-out | 1 | 1 |
| DMX 100' | 1 | 9 |
| DMX 50' | 2 | 6 |
| DMX 25' | 10 | 14 |
| DMX 5' | 10 | 10 |
| Soco 100' | 1 | 9 |
| Edison breakout | 1 | 3 |
| PowerCon 5' jumper | 10 | 6 |
| Edison 50' | 1 | 9 |
| Edison 10' | 1 | 9 |
| Tru1 25' | 6 | 19 |

---

## SECTION 2 — DOWNSTAGE TRUSS

Fixtures:
- 10× LED Leko, 13ch mode, Tru1 power — 1 per circuit (soco 1 & 2, circuits 1–5 each)
- 8× ADJ Jolt Panel, 51ch mode, PowerCon, 330W @ 120V — 4 per circuit
- 4× Maverick Force S Profile, 31ch mode, Tru1 power — 2 per circuit

### Power
- 3 soco home runs @ 200' each = 6× Soco 100' [CORRECTED from 4 after flag]
- 2× Tru1 breakout (soco 1 & 2 → lekos)
- 1× Edison breakout (soco 3 → Force S + Jolt Panels, 4 of 6 circuits used)
- Lekos: 4× Tru1 25', 4× Tru1 10' (from 10/15' jumper stock), 2 plug directly into fanout
  (fanout falls above them) = 10/10 ✓ [CORRECTED from 2× 10' after flag]
- Force S: 2× Edison 25' home run, 2× Edison→Tru1 whip (untracked), 2× Tru1 25' jumper
  (2 circuits × 2 fixtures → 1 jumper each ✓)
- Jolt Panels: 2× Edison 10' home run, 2× Edison→PowerCon whip (untracked),
  6× PowerCon 25' jumper (2 chains of 4 → 3+3 ✓). 330W×4 = 11A/circuit ✓

### Data
- HOME RUNS (⭐): 4× DMX 100' = 2 runs of 200' (two 100-footers coupled per universe)
- Jumpers: 12× DMX 10', 4× DMX 25', 6× DMX 5'
- Channel total: 10×13 + 8×51 + 4×31 = 130+408+124 = 662ch → 2 universes ✓ (U6, U7)
- Jumper math: 22 fixtures − 2 home-run entry points = 20 needed; 22 supplied (2 spare)

### Section flags
1. ✅ RESOLVED — SOCO LENGTH: corrected to 6× 100' soco (3 runs × 200').
2. ✅ RESOLVED — LEKO POWER: 4× 25' + 4× 10' + 2 fanout-direct = 10/10.
3. ✅ Amp checks all pass. Universe fill 662/1024 across U6+U7 — headroom fine.

### Deductions
| Cable | Used | Remaining |
|---|---|---|
| Soco 100' | 6 | 3 |
| Tru1 breakout | 2 | 5 |
| Edison breakout | 1 | 2 |
| Tru1 25' | 6 | 13 |
| Tru1 10/15' jumper | 4 | 12 |
| Edison 25' | 2 | 8 |
| Edison 10' | 2 | 7 |
| PowerCon 25' jumper | 6 | 0 ⚠️ |
| DMX 100' | 4 | 5 |
| DMX 10' | 12 | 0 ⚠️ |
| DMX 25' | 4 | 10 |
| DMX 5' | 6 | 4 |

---

## SECTION 3 — TOWERS (front of house)

Fixtures: 2 towers × 2 ADJ Jolt Panel FX = 4 fixtures, 51ch mode, PowerCon
(tower count inferred from jumper math: 2× 15' PowerCon + 2× 5' DMX = 1 intra-tower
jumper each per tower)

### Power
- 3× Edison 100'
- 2× Edison 25'
- 1× Edison 50'
- 2× PowerCon 15' jumper

### Data
- HOME RUN (⭐): 1× DMX 100' + 1× DMX 50' joined = one 150' run
- 1× DMX 100' jump
- 1× DMX 50' jump (SPARE — labeled spare in count)
- 2× DMX 5' jumpers

### Checks (verified after fixture data received)
- DMX chain: 150' home run → tower 1 panel A → 5' → panel B → 100' jump →
  tower 2 panel A → 5' → panel B. Jumpers needed 4−1 = 3 ✓ (100' + 2× 5')
- Power: 1 Edison feed per tower, 15' PowerCon jumper links the pair. ~5.5A per
  tower circuit (2× ~330W @ 120V) ✓ trivial load
- Universe: 4 × 51ch = 204ch — own home run, assumed U8 (204/512, 40% full) ✓

### Section flags
1. ✅ RESOLVED — fixture data received; all checks pass.
2. DMX 5' stock now critical: 2 left.

### Deductions
| Cable | Used | Remaining |
|---|---|---|
| Edison 100' | 3 | 1 |
| Edison 50' | 1 | 8 |
| Edison 25' | 2 | 6 |
| PowerCon 15' jumper | 2 | 2 |
| DMX 100' | 2 | 3 |
| DMX 50' | 2 | 4 |
| DMX 5' | 2 | 2 |

---

## SECTION 4 — UPLIGHTS

Fixtures: 12× ADJ 32 Hex Panel IP, running 208V, Tru1 power. Channel mode NOT specified.

### Power
- 1× Soco 100' home run
- 1× Tru1 breakout (208V over Tru1 — correct practice, consistent with "no 208V on Edison")
- 4× Tru1 50', 4× Tru1 25', 4× Tru1 10' (from 10/15' stock)
- 12 power cables / 12 fixtures — reads as 6 circuits × 2 fixtures (home run + jumper each)
- Load trivial at 208V (~0.5A per fixture)

### Data
- 2× DMX 100' (home runs, ⭐)
- 2× DMX 50', 8× DMX 25' (jumpers — 2 chains of 6: 5 jumpers each = 10 ✓)
- ⚠️ Channel mode unknown — universe fill check incomplete. Assumed U9 (+U10?)

### Section flags
1. ⚠️ Channel mode not specified — cannot verify universe fill. 12 fixtures × mode TBD.
2. DMX pool nearly exhausted after this section (7 DMX cables left across all lengths).

### Deductions
| Cable | Used | Remaining |
|---|---|---|
| Soco 100' | 1 | 2 |
| Tru1 breakout | 1 | 4 |
| Tru1 50' | 4 | 11 |
| Tru1 25' | 4 | 9 |
| Tru1 10/15' jumper | 4 | 8 |
| DMX 100' | 2 | 1 |
| DMX 50' | 2 | 2 |
| DMX 25' | 8 | 2 |

---

## FINAL SUMMARY

**Result: NO SHORTAGES.** Every section covered by stock. Remaining pool = spares manifest below.

### Show overview
- 4 sections: Upstage Truss, Downstage Truss, Towers (FOH), Uplights
- 42 fixtures: 14 Jolt Bar FX, 8 Outcast Beam Wash, 10 LED Leko, 8 ADJ Jolt Panel,
  4 Maverick Force S, 4 ADJ Jolt Panel FX (towers), 12 ADJ 32 Hex Panel IP
- ~9–10 DMX universes: U1–U4 jolt bars (via sneak), U5 outcasts, U6–U7 downstage,
  U8 towers, U9 (+U10?) uplights
- ~28 power circuits, all verified ≤ 80% of 20A where fixture data was given
- 5 soco runs (US ×1, DS ×3, uplights ×1) + Edison tower feeds

### Open items for load-in morning
1. ADJ 32 Hex Panel channel mode — needed to close universe-fill check on uplights
2. U5 (outcasts) is at exactly 512/512 — zero headroom, nothing else can join it
3. Whips (Edison→PowerCon, Edison→Tru1) come with fixture package — CONFIRM they're
   in the case: 4+2 upstage, 2+2 downstage (not counted in shop stock)
4. Zero-stock types: DMX 10' and PowerCon 25' — no substitutes left on truck for these

### Restock recommendation (operator agreed: more 5-pin DMX)
DMX burn this show: 67 of 74 cables used (91%).
| DMX | Start | Used | Suggest adding |
|---|---|---|---|
| 100' | 10 | 9 | +4 |
| 50' | 8 | 6 | +4 |
| 25' | 24 | 22 | +12 |
| 10' | 12 | 12 | +12 |
| 5' | 20 | 18 | +10 |
Also thin: PowerCon 25' (0 left, +6), PowerCon 15' (2 left), Edison 100' (1 left, +3),
Soco 100' (2 left).

---

## SPARES MANIFEST / RUNNING POOL (after Uplights — FINAL)

| Cable | Remaining |
|---|---|
| Cat5 50' | 2 |
| Cat5 100' | 1 |
| Sneak snake break-in | 1 |
| Sneak snake break-out | 1 |
| DMX 100' | 1 ⚠️ |
| DMX 50' | 2 ⚠️ |
| DMX 25' | 2 ⚠️ |
| DMX 10' | 0 ⚠️ |
| DMX 5' | 2 ⚠️ |
| Soco 50' | 5 |
| Soco 100' | 2 |
| Tru1 breakout | 4 |
| Edison breakout | 2 |
| Tru1 100' | 4 |
| Tru1 50' | 11 |
| Tru1 25' | 9 |
| Tru1 10/15' jumper | 8 |
| PowerCon 5' jumper | 6 |
| PowerCon 25' jumper | 0 ⚠️ |
| PowerCon 15' jumper | 2 |
| Edison 100' | 1 ⚠️ |
| Edison 50' | 8 |
| Edison 25' | 6 |
| Edison 10' | 7 |
