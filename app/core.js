/*
 * PullSheet core — pure domain logic. No DOM, no rendering.
 * Everything here is Phase 1 (the 2026-07-06 cable count) codified:
 * pool deduction, shortage alerts, amp checks, universe fill, jumper math,
 * power/data reachability, and cable-length suggestion for measured paths.
 */
(function (global) {
  'use strict';

  var DMX_UNIVERSE_SIZE = 512;

  // ---------- catalog ----------
  // kind: 'power' | 'data' | 'infra' (breakouts, break-ins/outs)
  function makeType(id, label, kind, lengthFt) {
    return { id: id, label: label, kind: kind, lengthFt: lengthFt == null ? null : lengthFt };
  }

  // ---------- pool ----------
  // inventory: { typeId: startQty }
  // sections: [{ cables: [{typeId, qty, role}] }]
  // returns rows keyed by typeId with start/used/remaining/status
  function computePool(catalog, inventory, sections) {
    var used = {};
    sections.forEach(function (s) {
      (s.cables || []).forEach(function (c) {
        if (c.untracked) return; // package whips: confirm, never deduct
        used[c.typeId] = (used[c.typeId] || 0) + (c.qty || 0);
      });
    });
    return catalog.map(function (t) {
      var start = inventory[t.id] || 0;
      var u = used[t.id] || 0;
      var rem = start - u;
      var status = 'ok';
      if (rem < 0) status = 'short';
      else if (rem === 0 && (u > 0 || start === 0)) status = 'zero';
      else if (rem <= Math.max(2, Math.ceil(start * 0.15))) status = 'low';
      return { typeId: t.id, label: t.label, kind: t.kind, start: start, used: u, remaining: rem, status: status };
    });
  }

  function shortages(poolRows) {
    return poolRows.filter(function (r) { return r.status === 'short'; });
  }

  // ---------- per-section validation ----------
  // fixture group: { name, qty, watts, voltage, channels, perCircuit, wireless }
  function ampCheck(group, breakerAmps) {
    var breaker = breakerAmps || 20;
    if (!group.watts || !group.voltage || !group.perCircuit) {
      return { group: group.name, status: 'unknown', reason: 'missing watts/voltage/per-circuit' };
    }
    var amps = (group.watts * group.perCircuit) / group.voltage;
    var circuits = Math.ceil(group.qty / group.perCircuit);
    var status = 'ok';
    if (amps > breaker) status = 'over';
    else if (amps > breaker * 0.8) status = 'warn'; // 80% continuous-load rule
    return {
      group: group.name, amps: Math.round(amps * 10) / 10, circuits: circuits,
      breaker: breaker, status: status
    };
  }

  function universeCheck(group) {
    if (group.wireless || !group.channels) {
      return { group: group.name, universes: 0, status: group.wireless ? 'wireless' : 'unknown' };
    }
    var perU = Math.floor(DMX_UNIVERSE_SIZE / group.channels);
    if (perU < 1) return { group: group.name, universes: NaN, status: 'invalid' };
    var universes = Math.ceil(group.qty / perU);
    var fills = [];
    var left = group.qty;
    while (left > 0) {
      var n = Math.min(perU, left);
      fills.push(n * group.channels);
      left -= n;
    }
    var zeroHeadroom = fills.some(function (f) { return f === DMX_UNIVERSE_SIZE; });
    return {
      group: group.name, perUniverse: perU, universes: universes, fills: fills,
      totalChannels: group.qty * group.channels,
      zeroHeadroom: zeroHeadroom, status: zeroHeadroom ? 'full' : 'ok'
    };
  }

  // jumpers needed = wired fixtures - data entry points
  function jumperCheck(section) {
    var fixtures = (section.fixtures || []).reduce(function (n, g) {
      return n + ((g.wireless || !g.channels) ? 0 : g.qty);
    }, 0);
    var dataCables = (section.cables || []).filter(function (c) { return c.kindResolved === 'data'; });
    var homeRunQty = dataCables.filter(function (c) { return c.role === 'home_run'; })
      .reduce(function (n, c) { return n + c.qty; }, 0);
    var joinedQty = dataCables.filter(function (c) { return c.role === 'home_run' && c.joined; })
      .reduce(function (n, c) { return n + c.qty; }, 0);
    // a joined cable continues another home run: it is length, not an entry point
    var entries = section.dataEntryPoints != null ? section.dataEntryPoints : (homeRunQty - joinedQty);
    var supplied = dataCables.filter(function (c) { return c.role === 'jumper'; })
      .reduce(function (n, c) { return n + c.qty; }, 0);
    var needed = Math.max(0, fixtures - entries);
    var status = 'ok';
    if (fixtures === 0) status = 'n/a';
    else if (supplied < needed) status = 'short';
    else if (supplied > needed) status = 'surplus';
    return { fixtures: fixtures, entries: entries, needed: needed, supplied: supplied, status: status };
  }

  function feedCheck(section) {
    var cables = section.cables || [];
    var hasPower = cables.some(function (c) { return c.kindResolved === 'power' && c.qty > 0; });
    var allWireless = (section.fixtures || []).length > 0 &&
      (section.fixtures || []).every(function (g) { return g.wireless; });
    var hasData = allWireless || cables.some(function (c) { return c.kindResolved === 'data' && c.qty > 0; });
    return {
      power: hasPower ? 'ok' : 'missing',
      data: hasData ? (allWireless ? 'wireless' : 'ok') : 'missing'
    };
  }

  // resolve cable kinds from catalog before validation
  function resolveKinds(section, catalog) {
    var byId = {};
    catalog.forEach(function (t) { byId[t.id] = t; });
    (section.cables || []).forEach(function (c) {
      c.kindResolved = byId[c.typeId] ? byId[c.typeId].kind : 'infra';
    });
    return section;
  }

  function validateSection(section, catalog, opts) {
    resolveKinds(section, catalog);
    var groups = section.fixtures || [];
    var amps = groups.map(function (g) { return ampCheck(g, opts && opts.breakerAmps); });
    var universes = groups.map(universeCheck);
    var jumpers = jumperCheck(section);
    var feeds = feedCheck(section);
    var counted = (section.cables || []).length > 0;
    var hasFixtureData = groups.length > 0 &&
      groups.every(function (g) { return (g.wireless || g.channels) && (g.watts || g.wireless); });
    var problems = [];
    amps.forEach(function (a) { if (a.status === 'over') problems.push('OVER-AMP: ' + a.group + ' at ' + a.amps + 'A on ' + a.breaker + 'A circuit'); });
    universes.forEach(function (u) { if (u.status === 'full') problems.push('UNIVERSE FULL: ' + u.group + ' fills a universe to 512/512 (zero headroom)'); });
    if (jumpers.status === 'short') problems.push('JUMPERS SHORT: need ' + jumpers.needed + ' data jumpers, have ' + jumpers.supplied);
    if (feeds.power === 'missing') problems.push('NO POWER FEED: section has no power cable');
    if (feeds.data === 'missing') problems.push('NO DATA FEED: section has no data cable and is not wireless');
    return {
      amps: amps, universes: universes, jumpers: jumpers, feeds: feeds,
      state: !counted ? 'empty' : (hasFixtureData ? 'verified' : 'counted-only'),
      problems: problems
    };
  }

  // ---------- show-level totals ----------
  function showTotals(sections, catalog, opts) {
    var totalUniverses = 0, totalCircuits = 0, problems = 0, totalCables = 0;
    sections.forEach(function (s) {
      var v = validateSection(s, catalog, opts);
      v.universes.forEach(function (u) { totalUniverses += (u.universes || 0); });
      v.amps.forEach(function (a) { totalCircuits += (a.circuits || 0); });
      problems += v.problems.length;
      (s.cables || []).forEach(function (c) { if (!c.untracked) totalCables += c.qty; });
    });
    return { universes: totalUniverses, circuits: totalCircuits, problems: problems, cables: totalCables };
  }

  // ---------- path length -> cable suggestion ----------
  function pathLength(points) {
    var L = 0;
    for (var i = 1; i < points.length; i++) {
      var dx = points[i].x - points[i - 1].x;
      var dy = points[i].y - points[i - 1].y;
      var dz = (points[i].z || 0) - (points[i - 1].z || 0);
      L += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    return L;
  }

  // Greedy longest-first from what's actually left in the pool.
  // Returns {cables:[{typeId,label,lengthFt}], covered, target, ok}
  function suggestCables(targetFt, kind, poolRows, catalog) {
    var byId = {};
    catalog.forEach(function (t) { byId[t.id] = t; });
    var avail = poolRows
      .filter(function (r) {
        var t = byId[r.typeId];
        return t && t.kind === kind && t.lengthFt && r.remaining > 0;
      })
      .map(function (r) { return { typeId: r.typeId, label: r.label, lengthFt: byId[r.typeId].lengthFt, left: r.remaining }; })
      .sort(function (a, b) { return b.lengthFt - a.lengthFt; });
    var pick = [], covered = 0, guard = 0;
    while (covered < targetFt && guard++ < 200) {
      var need = targetFt - covered;
      // largest length <= need, else smallest available (single overshoot ends it)
      var choice = null;
      for (var i = 0; i < avail.length; i++) {
        if (avail[i].left > 0 && avail[i].lengthFt <= need) { choice = avail[i]; break; }
      }
      if (!choice) {
        for (var j = avail.length - 1; j >= 0; j--) {
          if (avail[j].left > 0) { choice = avail[j]; break; }
        }
        if (!choice) break; // pool empty for this kind
        choice.left--; pick.push(choice); covered += choice.lengthFt;
        break;
      }
      choice.left--; pick.push(choice); covered += choice.lengthFt;
    }
    return {
      cables: pick.map(function (p) { return { typeId: p.typeId, label: p.label, lengthFt: p.lengthFt }; }),
      covered: covered, target: targetFt, ok: covered >= targetFt
    };
  }

  var api = {
    DMX_UNIVERSE_SIZE: DMX_UNIVERSE_SIZE,
    makeType: makeType,
    computePool: computePool,
    shortages: shortages,
    ampCheck: ampCheck,
    universeCheck: universeCheck,
    jumperCheck: jumperCheck,
    feedCheck: feedCheck,
    validateSection: validateSection,
    showTotals: showTotals,
    pathLength: pathLength,
    suggestCables: suggestCables
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CableCore = api;
})(typeof window !== 'undefined' ? window : this);
