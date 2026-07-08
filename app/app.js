/* PullSheet v0.1 — UI layer. Domain logic lives in core.js; 3D in engine3d.js. */
(function () {
  'use strict';
  var C = window.CableCore;
  var STORAGE_KEY = 'pullsheet_v01';

  // ---------- catalog: the operator's real shop stock types ----------
  function demoCatalog() {
    return [
      C.makeType('cat5_50', "Cat5 50'", 'data', 50),
      C.makeType('cat5_100', "Cat5 100'", 'data', 100),
      C.makeType('sneak_in', 'Sneak break-in', 'infra', null),
      C.makeType('sneak_out', 'Sneak break-out', 'infra', null),
      C.makeType('dmx100', "DMX 100'", 'data', 100),
      C.makeType('dmx50', "DMX 50'", 'data', 50),
      C.makeType('dmx25', "DMX 25'", 'data', 25),
      C.makeType('dmx10', "DMX 10'", 'data', 10),
      C.makeType('dmx5', "DMX 5'", 'data', 5),
      C.makeType('soco50', "Soco 50'", 'power', 50),
      C.makeType('soco100', "Soco 100'", 'power', 100),
      C.makeType('tru1_bo', 'Tru1 breakout', 'infra', null),
      C.makeType('ed_bo', 'Edison breakout', 'infra', null),
      C.makeType('tru1_100', "Tru1 100'", 'power', 100),
      C.makeType('tru1_50', "Tru1 50'", 'power', 50),
      C.makeType('tru1_25', "Tru1 25'", 'power', 25),
      C.makeType('tru1_j', "Tru1 10/15' jmp", 'power', 12),
      C.makeType('pc5', "PowerCon 5'", 'power', 5),
      C.makeType('pc25', "PowerCon 25'", 'power', 25),
      C.makeType('pc15', "PowerCon 15'", 'power', 15),
      C.makeType('ed100', "Edison 100'", 'power', 100),
      C.makeType('ed50', "Edison 50'", 'power', 50),
      C.makeType('ed25', "Edison 25'", 'power', 25),
      C.makeType('ed10', "Edison 10'", 'power', 10)
    ];
  }

  // ---------- demo show: the real 2026-07-06 count ----------
  function demoState() {
    return {
      showName: 'Show 2026-07-06',
      breakerAmps: 20,
      catalog: demoCatalog(),
      inventory: {
        cat5_50: 2, cat5_100: 2, sneak_in: 2, sneak_out: 2,
        dmx100: 10, dmx50: 8, dmx25: 24, dmx10: 12, dmx5: 20,
        soco50: 5, soco100: 10, tru1_bo: 7, ed_bo: 4,
        tru1_100: 4, tru1_50: 15, tru1_25: 25, tru1_j: 16,
        pc5: 16, pc25: 6, pc15: 4,
        ed100: 4, ed50: 10, ed25: 10, ed10: 10
      },
      sections: [
        {
          id: 's1', name: 'Upstage Truss', open: true, dataEntryPoints: 5,
          fixtures: [
            { name: 'Jolt Bar FX', qty: 14, watts: 430, voltage: 120, channels: 127, perCircuit: 4 },
            { name: 'Outcast Beam Wash', qty: 8, watts: 385, voltage: 120, channels: 64, perCircuit: 4 }
          ],
          cables: [
            { typeId: 'cat5_100', qty: 1, role: 'home_run' },
            { typeId: 'sneak_in', qty: 1, role: 'infra' },
            { typeId: 'sneak_out', qty: 1, role: 'infra' },
            { typeId: 'dmx50', qty: 2, role: 'home_run' },
            { typeId: 'dmx25', qty: 2, role: 'home_run' },
            { typeId: 'dmx5', qty: 10, role: 'jumper' },
            { typeId: 'dmx100', qty: 1, role: 'home_run' },
            { typeId: 'dmx25', qty: 8, role: 'jumper' },
            { typeId: 'soco100', qty: 1, role: 'home_run' },
            { typeId: 'ed_bo', qty: 1, role: 'infra' },
            { typeId: 'pc5', qty: 10, role: 'jumper' },
            { typeId: 'ed50', qty: 1, role: 'home_run' },
            { typeId: 'ed10', qty: 1, role: 'home_run' },
            { typeId: 'tru1_25', qty: 6, role: 'jumper' }
          ]
        },
        {
          id: 's2', name: 'Downstage Truss', open: false, dataEntryPoints: 2,
          fixtures: [
            { name: 'LED Leko', qty: 10, watts: 300, voltage: 120, channels: 13, perCircuit: 1 },
            { name: 'ADJ Jolt Panel', qty: 8, watts: 330, voltage: 120, channels: 51, perCircuit: 4 },
            { name: 'Maverick Force S', qty: 4, watts: 350, voltage: 120, channels: 31, perCircuit: 2 }
          ],
          cables: [
            { typeId: 'soco100', qty: 6, role: 'home_run' },
            { typeId: 'tru1_bo', qty: 2, role: 'infra' },
            { typeId: 'ed_bo', qty: 1, role: 'infra' },
            { typeId: 'tru1_25', qty: 6, role: 'jumper' },
            { typeId: 'tru1_j', qty: 4, role: 'jumper' },
            { typeId: 'ed25', qty: 2, role: 'home_run' },
            { typeId: 'ed10', qty: 2, role: 'home_run' },
            { typeId: 'pc25', qty: 6, role: 'jumper' },
            { typeId: 'dmx100', qty: 4, role: 'home_run', joined: true },
            { typeId: 'dmx10', qty: 12, role: 'jumper' },
            { typeId: 'dmx25', qty: 4, role: 'jumper' },
            { typeId: 'dmx5', qty: 6, role: 'jumper' }
          ]
        },
        {
          id: 's3', name: 'Towers (FOH)', open: false, dataEntryPoints: 1,
          fixtures: [
            { name: 'ADJ Jolt Panel FX', qty: 4, watts: 330, voltage: 120, channels: 51, perCircuit: 2 }
          ],
          cables: [
            { typeId: 'ed100', qty: 3, role: 'home_run' },
            { typeId: 'ed50', qty: 1, role: 'home_run' },
            { typeId: 'ed25', qty: 2, role: 'jumper' },
            { typeId: 'pc15', qty: 2, role: 'jumper' },
            { typeId: 'dmx100', qty: 1, role: 'home_run' },
            { typeId: 'dmx50', qty: 1, role: 'home_run', joined: true },
            { typeId: 'dmx100', qty: 1, role: 'jumper' },
            { typeId: 'dmx50', qty: 1, role: 'spare' },
            { typeId: 'dmx5', qty: 2, role: 'jumper' }
          ]
        },
        {
          id: 's4', name: 'Uplights', open: false,
          fixtures: [
            // channel mode TBC on site -> section stays counted-only, honestly
            { name: 'ADJ 32 Hex Panel IP', qty: 12, watts: 110, voltage: 208, channels: null, perCircuit: 2 }
          ],
          cables: [
            { typeId: 'soco100', qty: 1, role: 'home_run' },
            { typeId: 'tru1_bo', qty: 1, role: 'infra' },
            { typeId: 'tru1_50', qty: 4, role: 'jumper' },
            { typeId: 'tru1_25', qty: 4, role: 'jumper' },
            { typeId: 'tru1_j', qty: 4, role: 'jumper' },
            { typeId: 'dmx100', qty: 2, role: 'home_run' },
            { typeId: 'dmx50', qty: 2, role: 'jumper' },
            { typeId: 'dmx25', qty: 8, role: 'jumper' }
          ]
        }
      ],
      geometry: {
        room: { points: [{ x: -40, y: -25 }, { x: 40, y: -25 }, { x: 40, y: 25 }, { x: -40, y: 25 }], height: 24 },
        paths: [
          { id: 'p1', name: 'US PICK', layer: 'persistent', kind: 'data', points: [{ x: -30, y: 20, z: 22 }, { x: 30, y: 20, z: 22 }] },
          { id: 'p2', name: 'DS PICK', layer: 'persistent', kind: 'data', points: [{ x: -30, y: -12, z: 20 }, { x: 30, y: -12, z: 20 }] },
          { id: 'p3', name: 'US SOCO RUN', layer: 's1', kind: 'power', points: [{ x: -38, y: -24, z: 0 }, { x: -38, y: 20, z: 0 }, { x: -30, y: 20, z: 22 }] }
        ]
      }
    };
  }

  // ---------- state ----------
  var state;
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { } }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) { }
    state = demoState();
  }

  var $ = function (sel) { return document.querySelector(sel); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function typeById(id) {
    for (var i = 0; i < state.catalog.length; i++) if (state.catalog[i].id === id) return state.catalog[i];
    return null;
  }
  var uid = function () { return 'x' + Math.random().toString(36).slice(2, 8); };

  // ---------- render: top bar ----------
  function renderTop(pool) {
    var t = C.showTotals(state.sections, state.catalog, { breakerAmps: state.breakerAmps });
    var shorts = C.shortages(pool);
    var totals = $('#totals');
    totals.innerHTML = '';
    function stat(label, value) {
      var s = el('span'); s.append(el('b', null, String(value)), document.createTextNode(' ' + label));
      totals.appendChild(s);
    }
    stat('cables pulled', t.cables);
    stat('universes', t.universes);
    stat('circuits', t.circuits);
    var alerts = shorts.length + t.problems;
    var chip = el('span', 'alert-chip' + (alerts ? '' : ' clean'), alerts ? '⚠ ' + alerts + ' alert' + (alerts > 1 ? 's' : '') : '✓ clear');
    totals.appendChild(chip);

    var banner = $('#alert-banner');
    if (shorts.length) {
      var s0 = shorts[0];
      banner.textContent = '🚨 SHORTAGE: ' + s0.label + ' short ' + Math.abs(s0.remaining) +
        (shorts.length > 1 ? '  (+' + (shorts.length - 1) + ' more)' : '');
      banner.classList.add('show');
    } else banner.classList.remove('show');
  }

  // ---------- render: pool ----------
  var KIND_ORDER = [['data', 'DATA'], ['power', 'POWER'], ['infra', 'INFRA / BREAKOUTS']];
  function renderPool(pool) {
    var tb = $('#pool-body');
    tb.innerHTML = '';
    KIND_ORDER.forEach(function (kv) {
      var rows = pool.filter(function (r) { return r.kind === kv[0]; });
      if (!rows.length) return;
      var gh = el('tr', 'group-head');
      var gtd = el('td', null, kv[1]); gtd.colSpan = 4;
      gh.appendChild(gtd); tb.appendChild(gh);
      rows.forEach(function (r) {
        var tr = el('tr', r.status + ' kind-' + r.kind);
        var name = el('td');
        name.appendChild(el('span', 'kind-tick'));
        name.appendChild(document.createTextNode(r.label));
        tr.appendChild(name);
        var startTd = el('td');
        var inp = el('input', 'qty-edit');
        inp.type = 'number'; inp.min = '0'; inp.value = r.start;
        inp.setAttribute('aria-label', r.label + ' starting quantity');
        inp.addEventListener('change', function () {
          state.inventory[r.typeId] = Math.max(0, parseInt(inp.value || '0', 10));
          update();
        });
        startTd.appendChild(inp); tr.appendChild(startTd);
        tr.appendChild(el('td', r.used ? '' : 'num-muted', String(r.used)));
        var rem = el('td', 'rem', String(r.remaining));
        tr.appendChild(rem);
        tb.appendChild(tr);
      });
    });
  }

  // ---------- render: sections ----------
  function roleMark(role, joined) {
    if (role === 'home_run') return joined ? '★ HR+join' : '★ HR';
    if (role === 'spare') return 'spare';
    if (role === 'untracked') return 'pkg';
    if (role === 'infra') return 'infra';
    return 'jmp';
  }

  function renderSections(pool) {
    var host = $('#sections-host');
    host.innerHTML = '';
    state.sections.forEach(function (sec) {
      var v = C.validateSection(sec, state.catalog, { breakerAmps: state.breakerAmps });
      var card = el('div', 'section-card state-' + v.state + (v.problems.length ? ' has-problems' : ''));

      var title = el('div', 'section-title');
      title.appendChild(el('h3', null, sec.name));
      if (v.problems.length) title.appendChild(el('span', 'state-pill problems', v.problems.length + ' problem' + (v.problems.length > 1 ? 's' : '')));
      title.appendChild(el('span', 'state-pill ' + v.state, v.state.replace('-', ' ')));
      title.addEventListener('click', function () { sec.open = !sec.open; update(); });
      card.appendChild(title);

      if (sec.open) {
        var body = el('div', 'section-body');

        // fixtures
        body.appendChild(el('h4', null, 'Fixtures'));
        (sec.fixtures || []).forEach(function (g, gi) {
          var row = el('div', 'rowline');
          row.appendChild(el('span', 'grow', g.qty + '× ' + g.name +
            (g.channels ? ' · ' + g.channels + 'ch' : ' · mode?') +
            (g.wireless ? ' · wireless' : '') +
            (g.watts ? ' · ' + g.watts + 'W@' + g.voltage + 'V ×' + g.perCircuit + '/cir' : '')));
          var del = el('button', 'del', '×');
          del.title = 'remove fixture group';
          del.addEventListener('click', function () { sec.fixtures.splice(gi, 1); update(); });
          row.appendChild(del);
          body.appendChild(row);
        });
        body.appendChild(fixtureForm(sec));

        // cables
        body.appendChild(el('h4', null, 'Cables'));
        (sec.cables || []).forEach(function (c, ci) {
          var t = typeById(c.typeId);
          var row = el('div', 'rowline');
          var mark = el('span', c.role === 'home_run' ? 'role-hr' : (c.role === 'spare' || c.role === 'untracked' ? 'role-sp' : ''), roleMark(c.role, c.joined));
          mark.style.width = '72px'; mark.style.flexShrink = '0';
          row.appendChild(mark);
          row.appendChild(el('span', 'grow', c.qty + '× ' + (t ? t.label : c.typeId)));
          var del = el('button', 'del', '×');
          del.title = 'remove cable line';
          del.addEventListener('click', function () { sec.cables.splice(ci, 1); update(); });
          row.appendChild(del);
          body.appendChild(row);
        });
        body.appendChild(cableForm(sec));

        // checks
        var checks = el('div', 'checks');
        v.amps.forEach(function (a) {
          if (a.status === 'unknown') { checks.appendChild(el('span', 'badge warn', a.group + ': amps ?')); return; }
          checks.appendChild(el('span', 'badge ' + (a.status === 'over' ? 'crit' : a.status === 'warn' ? 'warn' : 'ok'),
            a.group + ' ' + a.amps + 'A ×' + a.circuits + 'cir'));
        });
        v.universes.forEach(function (u) {
          if (u.status === 'wireless') { checks.appendChild(el('span', 'badge data', u.group + ': wireless')); return; }
          if (u.status === 'unknown') { checks.appendChild(el('span', 'badge warn', u.group + ': mode TBC')); return; }
          checks.appendChild(el('span', 'badge ' + (u.zeroHeadroom ? 'warn' : 'data'),
            u.group + ' ' + u.universes + 'U' + (u.zeroHeadroom ? ' 512/512!' : '')));
        });
        if (v.jumpers.status !== 'n/a') {
          checks.appendChild(el('span', 'badge ' + (v.jumpers.status === 'short' ? 'crit' : 'ok'),
            'jumpers ' + v.jumpers.supplied + '/' + v.jumpers.needed + (v.jumpers.status === 'surplus' ? ' (+spare)' : '')));
        }
        checks.appendChild(el('span', 'badge ' + (v.feeds.power === 'ok' ? 'ok' : 'crit'), 'power feed ' + v.feeds.power));
        checks.appendChild(el('span', 'badge ' + (v.feeds.data === 'missing' ? 'crit' : 'ok'), 'data feed ' + v.feeds.data));
        body.appendChild(checks);

        // entry point override
        var epRow = el('div', 'addform');
        epRow.appendChild(el('label', null, 'data entry points'));
        var ep = el('input'); ep.type = 'number'; ep.min = '0';
        ep.value = sec.dataEntryPoints != null ? sec.dataEntryPoints : '';
        ep.placeholder = 'auto';
        ep.addEventListener('change', function () {
          sec.dataEntryPoints = ep.value === '' ? null : parseInt(ep.value, 10);
          if (sec.dataEntryPoints == null) delete sec.dataEntryPoints;
          update();
        });
        epRow.appendChild(ep);
        body.appendChild(epRow);

        // problems
        if (v.problems.length) {
          var pr = el('div', 'problems');
          v.problems.forEach(function (p) { pr.appendChild(el('div', 'problem', p)); });
          body.appendChild(pr);
        }

        // paths assigned to this section
        var secPaths = state.geometry.paths.filter(function (p) { return p.layer === sec.id; });
        if (secPaths.length) {
          body.appendChild(el('h4', null, 'Cable paths'));
          secPaths.forEach(function (p) { body.appendChild(pathRow(p, pool, sec)); });
        }

        var delSec = el('button', 'ghost', 'delete section');
        delSec.style.marginTop = '10px';
        delSec.addEventListener('click', function () {
          state.sections = state.sections.filter(function (s) { return s !== sec; });
          state.geometry.paths.forEach(function (p) { if (p.layer === sec.id) p.layer = 'persistent'; });
          update();
        });
        body.appendChild(delSec);
        card.appendChild(body);
      }
      host.appendChild(card);
    });

    // persistent paths
    var persistent = state.geometry.paths.filter(function (p) { return p.layer === 'persistent'; });
    if (persistent.length) {
      var pcard = el('div', 'section-card');
      var pt = el('div', 'section-title');
      pt.appendChild(el('h3', null, 'Persistent layer · paths'));
      pcard.appendChild(pt);
      var pbody = el('div', 'section-body');
      persistent.forEach(function (p) { pbody.appendChild(pathRow(p, pool, null)); });
      pcard.appendChild(pbody);
      host.appendChild(pcard);
    }
  }

  function pathRow(p, pool, sec) {
    var wrap = el('div');
    var row = el('div', 'rowline path-row');
    var L = C.pathLength(p.points);
    row.appendChild(el('span', 'grow', p.name + '  · ' + p.kind + ' · ' + Math.round(L) + "'"));
    var sug = el('button', null, 'suggest');
    sug.title = 'suggest cables from pool for this path length + slack';
    var out = el('div', 'path-suggest');
    sug.addEventListener('click', function () {
      var slack = parseFloat($('#slack').value || '10') / 100;
      var target = Math.ceil(L * (1 + slack));
      var s = C.suggestCables(target, p.kind, pool, state.catalog);
      out.innerHTML = '';
      if (!s.cables.length) { out.appendChild(el('span', 'no', 'pool empty for ' + p.kind)); return; }
      var txt = s.cables.map(function (c) { return c.label; }).join(' + ') +
        ' = ' + s.covered + "' for " + target + "' target";
      var b = el('b', null, txt);
      out.appendChild(b);
      if (!s.ok) out.appendChild(el('span', 'no', '  — SHORT: pool cannot cover this run'));
      if (sec && s.ok) {
        var add = el('button', null, 'add to section');
        add.style.marginLeft = '8px';
        add.addEventListener('click', function () {
          s.cables.forEach(function (c, i) {
            sec.cables.push({ typeId: c.typeId, qty: 1, role: 'home_run', joined: i > 0 });
          });
          update();
        });
        out.appendChild(add);
      }
    });
    var del = el('button', 'del', '×');
    del.title = 'delete path';
    del.addEventListener('click', function () {
      state.geometry.paths = state.geometry.paths.filter(function (q) { return q !== p; });
      update();
    });
    row.appendChild(sug); row.appendChild(del);
    wrap.appendChild(row); wrap.appendChild(out);
    return wrap;
  }

  // ---------- forms ----------
  function fixtureForm(sec) {
    var f = el('div', 'addform');
    var name = el('input'); name.type = 'text'; name.placeholder = 'fixture';
    var qty = el('input'); qty.type = 'number'; qty.min = '1'; qty.placeholder = 'qty';
    var watts = el('input'); watts.type = 'number'; watts.min = '0'; watts.placeholder = 'W';
    var volt = el('select');
    [120, 208].forEach(function (v) { var o = el('option', null, v + 'V'); o.value = v; volt.appendChild(o); });
    var ch = el('input'); ch.type = 'number'; ch.min = '0'; ch.placeholder = 'ch';
    var per = el('input'); per.type = 'number'; per.min = '1'; per.placeholder = '/cir';
    var wl = el('label', null, ' wireless');
    var wlc = el('input'); wlc.type = 'checkbox'; wl.prepend(wlc);
    var add = el('button', 'primary', '+ fixture');
    add.addEventListener('click', function () {
      if (!name.value || !qty.value) return;
      (sec.fixtures = sec.fixtures || []).push({
        name: name.value, qty: parseInt(qty.value, 10),
        watts: parseInt(watts.value || '0', 10) || null,
        voltage: parseInt(volt.value, 10),
        channels: parseInt(ch.value || '0', 10) || null,
        perCircuit: parseInt(per.value || '1', 10),
        wireless: wlc.checked
      });
      update();
    });
    f.append(name, qty, watts, volt, ch, per, wl, add);
    return f;
  }

  function cableForm(sec) {
    var f = el('div', 'addform');
    var type = el('select');
    KIND_ORDER.forEach(function (kv) {
      state.catalog.filter(function (t) { return t.kind === kv[0]; }).forEach(function (t) {
        var o = el('option', null, t.label); o.value = t.id; type.appendChild(o);
      });
    });
    var qty = el('input'); qty.type = 'number'; qty.min = '1'; qty.value = '1';
    var role = el('select');
    [['jumper', 'jumper'], ['home_run', '★ home run'], ['spare', 'spare'], ['infra', 'infra'], ['untracked', 'pkg whip']].forEach(function (r) {
      var o = el('option', null, r[1]); o.value = r[0]; role.appendChild(o);
    });
    var add = el('button', 'primary', '+ cable');
    add.addEventListener('click', function () {
      var line = { typeId: type.value, qty: parseInt(qty.value || '1', 10), role: role.value };
      if (role.value === 'untracked') line.untracked = true;
      (sec.cables = sec.cables || []).push(line);
      update();
    });
    f.append(type, qty, role, add);
    return f;
  }

  // ---------- 3D wiring ----------
  var engine;
  function syncScene() {
    engine.scene.room = state.geometry.room;
    engine.scene.paths = state.geometry.paths;
    engine.draw();
  }

  function initEngine() {
    engine = new window.Engine3D($('#viewport'), {
      onCursor: function (cur) {
        $('#hud-pos').textContent = 'X ' + cur.x.toFixed(1) + "'  Y " + cur.y.toFixed(1) + "'  Z " + cur.z.toFixed(1) + "'";
      },
      onFinish: function (kind, obj) {
        if (kind === 'room') {
          state.geometry.room = obj;
          state.geometry.room.height = parseFloat($('#room-h').value || '24');
        } else {
          state.geometry.paths.push({
            id: uid(),
            name: 'PATH-' + (state.geometry.paths.length + 1),
            layer: $('#path-layer').value,
            kind: $('#path-kind').value,
            points: obj.points
          });
        }
        setMode('orbit');
        update();
      },
      onCommit: function (pending) {
        $('#hud-pending').textContent = pending.length ? pending.length + ' pts · Enter/dbl-click to finish · Esc to cancel' : '';
      }
    });
    engine.scene.room = state.geometry.room;
    engine.scene.paths = state.geometry.paths;
    engine.resize();
    window.addEventListener('resize', function () { engine.resize(); });
  }

  function setMode(m) {
    engine.setMode(m);
    ['orbit', 'room', 'path'].forEach(function (x) {
      $('#mode-' + x).classList.toggle('mode-on', x === m);
    });
    $('#hud-mode').textContent = m === 'orbit'
      ? 'NAVIGATE · drag orbit · right-drag pan · wheel zoom'
      : (m === 'room' ? 'DRAW ROOM · click corners on floor · Enter closes'
        : 'DRAW PATH · click points · hold Shift for Z · Enter finishes');
  }

  function wireToolbar() {
    $('#mode-orbit').addEventListener('click', function () { setMode('orbit'); });
    $('#mode-room').addEventListener('click', function () { setMode('room'); });
    $('#mode-path').addEventListener('click', function () { setMode('path'); });
    $('#view-top').addEventListener('click', function () { engine.topView(); });
    $('#view-3d').addEventListener('click', function () { engine.perspView(); });
    var elev = $('#elev');
    elev.addEventListener('change', function () {
      engine.workingZ = Math.max(0, parseFloat(elev.value || '0'));
      $('#hud-elev').textContent = 'plane ' + engine.workingZ + "'";
      engine.draw();
    });
    document.querySelectorAll('[data-elev]').forEach(function (b) {
      b.addEventListener('click', function () {
        elev.value = b.getAttribute('data-elev');
        elev.dispatchEvent(new Event('change'));
      });
    });
    $('#snap').addEventListener('change', function () {
      engine.snap = parseFloat($('#snap').value);
    });
    $('#room-h').addEventListener('change', function () {
      if (state.geometry.room) {
        state.geometry.room.height = parseFloat($('#room-h').value || '24');
        update();
      }
    });
    // populate path-layer select on every update (sections change)
  }

  function renderPathLayerSelect() {
    var sel = $('#path-layer');
    var cur = sel.value;
    sel.innerHTML = '';
    var o0 = el('option', null, 'persistent'); o0.value = 'persistent'; sel.appendChild(o0);
    state.sections.forEach(function (s) {
      var o = el('option', null, s.name); o.value = s.id; sel.appendChild(o);
    });
    if (cur) sel.value = cur;
    if (!sel.value) sel.value = 'persistent';
  }

  // ---------- top actions ----------
  function wireActions() {
    $('#showname').addEventListener('change', function () {
      state.showName = $('#showname').value; save();
    });
    $('#btn-export').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = state.showName.replace(/\s+/g, '-').toLowerCase() + '.pullsheet.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#btn-import').addEventListener('click', function () { $('#import-file').click(); });
    $('#import-file').addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { state = JSON.parse(r.result); update(); syncScene(); }
        catch (err) { alert('Could not read that file: not a PullSheet JSON export.'); }
      };
      r.readAsText(f);
    });
    $('#btn-reset').addEventListener('click', function () {
      if (confirm('Reset to the demo show (2026-07-06)? Current data will be replaced.')) {
        state = demoState(); update(); syncScene();
      }
    });
    $('#btn-add-section').addEventListener('click', function () {
      var name = $('#new-section-name').value.trim();
      if (!name) return;
      state.sections.push({ id: uid(), name: name, open: true, fixtures: [], cables: [] });
      $('#new-section-name').value = '';
      update();
    });
    $('#new-section-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') $('#btn-add-section').click();
    });
  }

  // ---------- update ----------
  function update() {
    var pool = C.computePool(state.catalog, state.inventory, state.sections);
    $('#showname').value = state.showName;
    renderTop(pool);
    renderPool(pool);
    renderSections(pool);
    renderPathLayerSelect();
    if (engine) syncScene();
    save();
  }

  // ---------- boot ----------
  load();
  initEngine();
  wireToolbar();
  wireActions();
  setMode('orbit');
  update();
})();
