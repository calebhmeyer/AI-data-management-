/* Core tests — every expected value comes from the real 2026-07-06 count. */
'use strict';
const C = require('./core.js');

let pass = 0, fail = 0;
function eq(actual, expected, name) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; }
  else { fail++; console.error(`FAIL ${name}\n  expected ${e}\n  got      ${a}`); }
}

// --- amp checks (real catches) ---
// The outcast catch: 8x385W on ONE 20A Edison circuit = 25.7A -> over
eq(C.ampCheck({ name: 'Outcast x8 one feed', qty: 8, watts: 385, voltage: 120, perCircuit: 8 }).status, 'over', 'outcast over-amp catch');
eq(C.ampCheck({ name: 'Outcast x8 one feed', qty: 8, watts: 385, voltage: 120, perCircuit: 8 }).amps, 25.7, 'outcast amps value');
// Fixed: 4 per circuit = 12.8A ok
eq(C.ampCheck({ name: 'Outcast fixed', qty: 8, watts: 385, voltage: 120, perCircuit: 4 }).status, 'ok', 'outcast fixed ok');
// Jolt bars: 430W x4 = 14.3A ok, 4 circuits for 14
const jolt = C.ampCheck({ name: 'Jolt Bar', qty: 14, watts: 430, voltage: 120, perCircuit: 4 });
eq(jolt.status, 'ok', 'jolt amp ok');
eq(jolt.circuits, 4, 'jolt circuits 4');
// 80% rule: 17A on 20A = warn
eq(C.ampCheck({ name: 'warm', qty: 1, watts: 2040, voltage: 120, perCircuit: 1 }).status, 'warn', '80% rule warn');

// --- universe checks ---
// Jolt Bar FX 127ch: 4 per universe, 14 bars -> 4 universes
const ju = C.universeCheck({ name: 'Jolt Bar', qty: 14, channels: 127 });
eq(ju.perUniverse, 4, 'jolt 4 per universe');
eq(ju.universes, 4, 'jolt 4 universes');
// Outcast 64ch x8 = 512/512 exactly -> zero headroom
const ou = C.universeCheck({ name: 'Outcast', qty: 8, channels: 64 });
eq(ou.universes, 1, 'outcast 1 universe');
eq(ou.status, 'full', 'outcast zero headroom');
// Downstage total: 130+408+124 = 662 -> verified via groups
eq(C.universeCheck({ name: 'Leko', qty: 10, channels: 13 }).totalChannels, 130, 'leko 130ch');
eq(C.universeCheck({ name: 'JoltPanel', qty: 8, channels: 51 }).totalChannels, 408, 'panel 408ch');
eq(C.universeCheck({ name: 'ForceS', qty: 4, channels: 31 }).totalChannels, 124, 'force 124ch');

// --- jumper math (the missing-outcast-jumpers catch) ---
const catalog = [
  C.makeType('dmx100', "DMX 100'", 'data', 100),
  C.makeType('dmx25', "DMX 25'", 'data', 25),
  C.makeType('soco100', "Soco 100'", 'power', 100),
  C.makeType('tru1_25', "Tru1 25'", 'power', 25)
];
// 8 outcasts, 1 home run, 0 jumpers -> need 7, short
let sec = {
  fixtures: [{ name: 'Outcast', qty: 8, channels: 64, watts: 385, voltage: 120, perCircuit: 4 }],
  cables: [
    { typeId: 'dmx100', qty: 1, role: 'home_run' },
    { typeId: 'soco100', qty: 1, role: 'home_run' }
  ]
};
let v = C.validateSection(sec, catalog);
eq(v.jumpers.needed, 7, 'outcast needs 7 jumpers');
eq(v.jumpers.status, 'short', 'jumper shortage flagged');
// add 8 jumpers -> surplus of 1 (the on-truss spare)
sec.cables.push({ typeId: 'dmx25', qty: 8, role: 'jumper' });
v = C.validateSection(sec, catalog);
eq(v.jumpers.status, 'surplus', '8 jumpers = 1 spare');

// joined home runs: towers had 100+50 joined = ONE entry point
const towerSec = {
  fixtures: [{ name: 'JoltPanelFX', qty: 4, channels: 51, watts: 330, voltage: 120, perCircuit: 2, }],
  cables: [
    { typeId: 'dmx100', qty: 2, role: 'home_run' },   // one is the joined continuation
    { typeId: 'dmx25', qty: 2, role: 'jumper' }
  ],
  dataEntryPoints: 1
};
v = C.validateSection(towerSec, catalog);
eq(v.jumpers.needed, 3, 'towers need 3 links');
// note: tower cross-jump counted as jumper in real show; 2 supplied here -> short
eq(v.jumpers.status, 'short', 'towers short without cross jump');

// --- feeds ---
eq(C.feedCheck({ fixtures: [{ name: 'x', qty: 2, wireless: true }], cables: [{ kindResolved: 'power', qty: 1 }] }).data, 'wireless', 'wireless satisfies data');
eq(C.feedCheck({ fixtures: [{ name: 'x', qty: 2, channels: 10 }], cables: [] }).power, 'missing', 'missing power flagged');

// --- pool math ---
const inv = { dmx100: 10, dmx25: 24, soco100: 10, tru1_25: 25 };
const sections = [
  { cables: [{ typeId: 'dmx100', qty: 9 }, { typeId: 'dmx25', qty: 22 }, { typeId: 'soco100', qty: 8 }] },
  { cables: [{ typeId: 'dmx100', qty: 2 }] } // pushes dmx100 to -1
];
const pool = C.computePool(catalog, inv, sections);
const row = id => pool.find(r => r.typeId === id);
eq(row('dmx100').remaining, -1, 'negative pool');
eq(row('dmx100').status, 'short', 'shortage status');
eq(row('dmx25').remaining, 2, 'dmx25 remaining 2');
eq(row('dmx25').status, 'low', 'low stock status');
eq(C.shortages(pool).length, 1, 'one shortage');
// untracked (package whips) never deduct
const pool2 = C.computePool(catalog, inv, [{ cables: [{ typeId: 'dmx100', qty: 4, untracked: true }] }]);
eq(pool2.find(r => r.typeId === 'dmx100').used, 0, 'untracked not deducted');

// --- path length + suggestion ---
eq(C.pathLength([{ x: 0, y: 0, z: 0 }, { x: 30, y: 40, z: 0 }]), 50, '3-4-5 path length');
eq(Math.round(C.pathLength([{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 24 }])), 24, 'vertical drop counts');
const freshPool = C.computePool(catalog, inv, []);
const sug = C.suggestCables(180, 'data', freshPool, catalog);
eq(sug.ok, true, 'suggestion covers 180');
eq(sug.cables.map(c => c.lengthFt), [100, 25, 25, 25, 25], 'greedy 180 = 100+4x25');
const sugP = C.suggestCables(200, 'power', freshPool, catalog);
eq(sugP.cables.map(c => c.lengthFt), [100, 100], 'power 200 = 2x100 soco');

// --- show totals ---
const t = C.showTotals([sec], catalog);
eq(t.circuits, 2, 'outcast 2 circuits');
eq(t.universes, 1, 'outcast 1 universe');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
