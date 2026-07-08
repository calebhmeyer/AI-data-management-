/*
 * PullSheet 3D viewport — deliberately primitive, technical-first.
 * Canvas 2D wireframe renderer. Z-up, units are feet.
 *
 * The signature interaction (operator-designed):
 *   the 3D cursor always rides the working elevation plane;
 *   hold Shift to freeze XY and move the cursor on Z instead.
 */
(function (global) {
  'use strict';

  function Engine(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cam = { yaw: -0.6, pitch: 1.05, dist: 160, target: { x: 0, y: 0, z: 6 } };
    this.ortho = false;
    this.zoom = 6;              // px per foot in ortho
    this.fov = 900;             // perspective focal length in px
    this.workingZ = 0;          // current elevation plane (ft)
    this.gridStep = 5;
    this.snap = 1;              // snap grid (ft), 0 = off
    this.cursor = { x: 0, y: 0, z: 0, live: false };
    this.zLock = false;         // Shift held: XY frozen, mouse dy drives Z
    this._zLockBase = null;
    this.mode = 'orbit';        // orbit | room | path
    this.pending = [];          // points being drawn
    this.scene = { room: null, paths: [] };
    this.hooks = opts || {};    // onCursor, onCommit, onFinish, onModeHint
    this._bind();
  }

  // ---- math ----
  Engine.prototype._rot = function (p) {
    var t = this.cam.target;
    var x = p.x - t.x, y = p.y - t.y, z = (p.z || 0) - t.z;
    var cy = Math.cos(this.cam.yaw), sy = Math.sin(this.cam.yaw);
    var x1 = x * cy - y * sy, y1 = x * sy + y * cy, z1 = z;
    var cp = Math.cos(this.cam.pitch), sp = Math.sin(this.cam.pitch);
    var y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
    return { x: x1, y: y2, z: z2 };
  };
  Engine.prototype._unrot = function (v) {
    var cp = Math.cos(this.cam.pitch), sp = Math.sin(this.cam.pitch);
    var y1 = v.y * cp + v.z * sp, z1 = -v.y * sp + v.z * cp;
    var cy = Math.cos(this.cam.yaw), sy = Math.sin(this.cam.yaw);
    var x = v.x * cy + y1 * sy, y = -v.x * sy + y1 * cy;
    return { x: x, y: y, z: z1 };
  };
  Engine.prototype.project = function (p) {
    var v = this._rot(p);
    var w = this.canvas.width / (global.devicePixelRatio || 1);
    var h = this.canvas.height / (global.devicePixelRatio || 1);
    if (this.ortho) return { x: w / 2 + v.x * this.zoom, y: h / 2 - v.z * this.zoom, d: v.y + this.cam.dist };
    var depth = v.y + this.cam.dist;
    if (depth < 1) return null;
    var k = this.fov / depth;
    return { x: w / 2 + v.x * k, y: h / 2 - v.z * k, d: depth };
  };
  // screen -> world on plane z = planeZ
  Engine.prototype.unprojectToPlane = function (mx, my, planeZ) {
    var w = this.canvas.width / (global.devicePixelRatio || 1);
    var h = this.canvas.height / (global.devicePixelRatio || 1);
    var t = this.cam.target, o, dir;
    if (this.ortho) {
      o = this._unrot({ x: (mx - w / 2) / this.zoom, y: -this.cam.dist, z: -(my - h / 2) / this.zoom });
      o = { x: o.x + t.x, y: o.y + t.y, z: o.z + t.z };
      dir = this._unrot({ x: 0, y: 1, z: 0 });
    } else {
      o = this._unrot({ x: 0, y: -this.cam.dist, z: 0 });
      o = { x: o.x + t.x, y: o.y + t.y, z: o.z + t.z };
      dir = this._unrot({ x: (mx - w / 2) / this.fov, y: 1, z: -(my - h / 2) / this.fov });
    }
    if (Math.abs(dir.z) < 1e-9) return null;
    var s = (planeZ - o.z) / dir.z;
    if (s < 0 && !this.ortho) return null;
    return { x: o.x + dir.x * s, y: o.y + dir.y * s, z: planeZ };
  };
  Engine.prototype._snap = function (p) {
    if (!this.snap) return p;
    var g = this.snap;
    return { x: Math.round(p.x / g) * g, y: Math.round(p.y / g) * g, z: Math.round(p.z / g * 2) / 2 * g };
  };

  // ---- input ----
  Engine.prototype._bind = function () {
    var self = this, c = this.canvas;
    var dragging = false, panning = false, lx = 0, ly = 0, moved = 0;

    c.addEventListener('mousedown', function (e) {
      lx = e.offsetX; ly = e.offsetY; moved = 0;
      if (e.button === 1 || e.button === 2 || (e.button === 0 && self.mode === 'orbit' && !e.altKey)) {
        dragging = true; panning = (e.button === 2 || e.shiftKey && self.mode === 'orbit');
      }
      e.preventDefault();
    });
    c.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    global.addEventListener('mousemove', function (e) {
      if (dragging) {
        var r = c.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var dx = x - lx, dy = y - ly; moved += Math.abs(dx) + Math.abs(dy);
        if (panning) {
          var s = self.ortho ? self.zoom : self.fov / self.cam.dist;
          var right = self._unrot({ x: 1, y: 0, z: 0 });
          var up = self._unrot({ x: 0, y: 0, z: 1 });
          self.cam.target.x -= (right.x * dx - up.x * dy) / s;
          self.cam.target.y -= (right.y * dx - up.y * dy) / s;
          self.cam.target.z -= (right.z * dx - up.z * dy) / s;
        } else {
          self.cam.yaw += dx * 0.008;
          self.cam.pitch = Math.max(-1.55, Math.min(1.55, self.cam.pitch + dy * 0.008));
        }
        lx = x; ly = y; self.draw();
      }
    });
    global.addEventListener('mouseup', function () { dragging = false; });

    c.addEventListener('mousemove', function (e) {
      if (self.mode === 'orbit') { self.cursor.live = false; self.draw(); return; }
      if (self.zLock && self._zLockBase) {
        // operator's scheme: XY frozen, vertical mouse motion drives Z
        var dz = (self._zLockBase.my - e.offsetY) * 0.1;
        var z = self._zLockBase.z + dz;
        if (self.snap) z = Math.round(z * 2) / 2;
        self.cursor = { x: self._zLockBase.x, y: self._zLockBase.y, z: Math.max(0, z), live: true };
      } else {
        var p = self.unprojectToPlane(e.offsetX, e.offsetY, self.workingZ);
        if (p) self.cursor = Object.assign(self._snap(p), { live: true });
      }
      if (self.hooks.onCursor) self.hooks.onCursor(self.cursor);
      self.draw();
    });

    c.addEventListener('click', function (e) {
      if (self.mode === 'orbit' || moved > 4 || !self.cursor.live) return;
      self.pending.push({ x: self.cursor.x, y: self.cursor.y, z: self.cursor.z });
      if (self.hooks.onCommit) self.hooks.onCommit(self.pending);
      self.draw();
    });
    c.addEventListener('dblclick', function (e) { e.preventDefault(); self.finishDraw(); });

    global.addEventListener('keydown', function (e) {
      if (e.key === 'Shift' && !self.zLock && self.cursor.live && self.mode !== 'orbit') {
        self.zLock = true;
        var r = c.getBoundingClientRect();
        self._zLockBase = { x: self.cursor.x, y: self.cursor.y, z: self.cursor.z, my: self._lastMy || 0 };
      }
      if (e.key === 'Enter') self.finishDraw();
      if (e.key === 'Escape') { self.pending = []; if (self.hooks.onCommit) self.hooks.onCommit(self.pending); self.draw(); }
    });
    global.addEventListener('keyup', function (e) {
      if (e.key === 'Shift') { self.zLock = false; self._zLockBase = null; }
    });
    c.addEventListener('mousemove', function (e) { self._lastMy = e.offsetY; });

    c.addEventListener('wheel', function (e) {
      e.preventDefault();
      var f = e.deltaY > 0 ? 1.1 : 0.9;
      if (self.ortho) self.zoom = Math.max(0.5, Math.min(60, self.zoom / f));
      else self.cam.dist = Math.max(15, Math.min(1500, self.cam.dist * f));
      self.draw();
    }, { passive: false });
  };

  Engine.prototype.finishDraw = function () {
    if (this.mode === 'room' && this.pending.length >= 3) {
      this.scene.room = { points: this.pending.map(function (p) { return { x: p.x, y: p.y }; }), height: this.scene.room && this.scene.room.height || 20 };
      if (this.hooks.onFinish) this.hooks.onFinish('room', this.scene.room);
    } else if (this.mode === 'path' && this.pending.length >= 2) {
      var path = { points: this.pending.slice() };
      if (this.hooks.onFinish) this.hooks.onFinish('path', path);
    }
    this.pending = [];
    if (this.hooks.onCommit) this.hooks.onCommit(this.pending);
    this.draw();
  };

  Engine.prototype.setMode = function (m) {
    this.mode = m; this.pending = []; this.cursor.live = false; this.draw();
  };
  Engine.prototype.topView = function () {
    this.snapView('top');
  };
  Engine.prototype.perspView = function () {
    this.ortho = false;
    this.cam.pitch = Math.max(0.3, Math.min(this.cam.pitch, 1.1));
    this.draw();
  };
  // snap to a face view (always orthographic — these are plan/elevation views)
  var FACE_VIEWS = {
    top: [0, 1.5507], bottom: [0, -1.5507],
    front: [0, 0], back: [Math.PI, 0],
    left: [Math.PI / 2, 0], right: [-Math.PI / 2, 0]
  };
  Engine.prototype.snapView = function (face) {
    var t = FACE_VIEWS[face];
    if (!t) return;
    this.ortho = true;
    var self = this;
    var y0 = this.cam.yaw, p0 = this.cam.pitch;
    // shortest spin: wrap yaw delta into [-pi, pi]
    var dy = t[0] - y0;
    dy = ((dy + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    var dp = t[1] - p0;
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || (Math.abs(dy) < 0.001 && Math.abs(dp) < 0.001)) {
      this.cam.yaw = t[0]; this.cam.pitch = t[1]; this.draw(); return;
    }
    var start = null;
    function step(ts) {
      if (start == null) start = ts;
      var k = Math.min(1, (ts - start) / 180);
      var e = k * (2 - k); // ease-out
      self.cam.yaw = y0 + dy * e;
      self.cam.pitch = p0 + dp * e;
      self.draw();
      if (k < 1) requestAnimationFrame(step);
      else { self.cam.yaw = t[0]; self.cam.pitch = t[1]; self.draw(); }
    }
    requestAnimationFrame(step);
  };

  // ---- render ----
  function line(ctx, a, b) {
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  Engine.prototype.draw = function () {
    var ctx = this.ctx, self = this;
    var dpr = global.devicePixelRatio || 1;
    var w = this.canvas.width / dpr, h = this.canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var css = getComputedStyle(this.canvas);
    var col = {
      grid: css.getPropertyValue('--v-grid').trim() || '#1D242A',
      gridMajor: css.getPropertyValue('--v-grid-major').trim() || '#28313A',
      room: css.getPropertyValue('--v-room').trim() || '#5C6B77',
      path: css.getPropertyValue('--v-path').trim() || '#5BB9E8',
      pathPower: css.getPropertyValue('--v-path-power').trim() || '#C98A3E',
      cursor: css.getPropertyValue('--v-cursor').trim() || '#FFB347',
      pending: css.getPropertyValue('--v-pending').trim() || '#FFB347',
      text: css.getPropertyValue('--v-text').trim() || '#87939B'
    };

    // grid on z=0
    var ext = 100, g = this.gridStep;
    ctx.lineWidth = 1;
    for (var i = -ext; i <= ext; i += g) {
      ctx.strokeStyle = (i % (g * 5) === 0) ? col.gridMajor : col.grid;
      line(ctx, this.project({ x: i, y: -ext, z: 0 }), this.project({ x: i, y: ext, z: 0 }));
      line(ctx, this.project({ x: -ext, y: i, z: 0 }), this.project({ x: ext, y: i, z: 0 }));
    }
    // origin axes
    ctx.strokeStyle = col.text; ctx.lineWidth = 1.5;
    line(ctx, this.project({ x: 0, y: 0, z: 0 }), this.project({ x: 5, y: 0, z: 0 }));
    line(ctx, this.project({ x: 0, y: 0, z: 0 }), this.project({ x: 0, y: 5, z: 0 }));

    // working plane hint (when elevated)
    if (this.workingZ > 0 && this.mode !== 'orbit') {
      ctx.strokeStyle = col.cursor; ctx.globalAlpha = 0.15; ctx.lineWidth = 1;
      for (var q = -ext; q <= ext; q += g * 5) {
        line(ctx, this.project({ x: q, y: -ext, z: this.workingZ }), this.project({ x: q, y: ext, z: this.workingZ }));
        line(ctx, this.project({ x: -ext, y: q, z: this.workingZ }), this.project({ x: ext, y: q, z: this.workingZ }));
      }
      ctx.globalAlpha = 1;
    }

    // room (extruded wireframe)
    var room = this.scene.room;
    if (room && room.points.length >= 3) {
      ctx.strokeStyle = col.room; ctx.lineWidth = 1.6;
      var pts = room.points, hgt = room.height || 20;
      for (var r = 0; r < pts.length; r++) {
        var a = pts[r], b = pts[(r + 1) % pts.length];
        line(ctx, this.project({ x: a.x, y: a.y, z: 0 }), this.project({ x: b.x, y: b.y, z: 0 }));
        line(ctx, this.project({ x: a.x, y: a.y, z: hgt }), this.project({ x: b.x, y: b.y, z: hgt }));
        line(ctx, this.project({ x: a.x, y: a.y, z: 0 }), this.project({ x: a.x, y: a.y, z: hgt }));
      }
    }

    // paths
    this.scene.paths.forEach(function (path) {
      ctx.strokeStyle = path.kind === 'power' ? col.pathPower : col.path;
      ctx.lineWidth = path.selected ? 3 : 1.8;
      ctx.setLineDash(path.layer === 'persistent' ? [] : [6, 4]);
      for (var i = 1; i < path.points.length; i++) {
        line(ctx, self.project(path.points[i - 1]), self.project(path.points[i]));
      }
      ctx.setLineDash([]);
      // endpoints + drop-to-ground ticks
      path.points.forEach(function (p) {
        var s = self.project(p);
        if (!s) return;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
      });
      // length label at midpoint
      var mid = path.points[Math.floor(path.points.length / 2)];
      var ms = self.project(mid);
      if (ms) {
        ctx.fillStyle = col.text;
        ctx.font = '11px ui-monospace, Menlo, Consolas, monospace';
        var L = global.CableCore ? global.CableCore.pathLength(path.points) : 0;
        ctx.fillText((path.name || 'path') + '  ' + Math.round(L) + "'", ms.x + 6, ms.y - 6);
      }
    });

    // pending polyline
    if (this.pending.length) {
      ctx.strokeStyle = col.pending; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      for (var pI = 1; pI < this.pending.length; pI++) {
        line(ctx, this.project(this.pending[pI - 1]), this.project(this.pending[pI]));
      }
      if (this.cursor.live) line(ctx, this.project(this.pending[this.pending.length - 1]), this.project(this.cursor));
      ctx.setLineDash([]);
      var p0 = this.project(this.pending[0]);
      if (p0) { ctx.fillStyle = col.pending; ctx.fillRect(p0.x - 3, p0.y - 3, 6, 6); }
    }

    // 3D cursor: crosshair + drop line to ground (reads elevation at a glance)
    if (this.cursor.live && this.mode !== 'orbit') {
      var cs = this.project(this.cursor);
      var cg = this.project({ x: this.cursor.x, y: this.cursor.y, z: 0 });
      if (cs) {
        ctx.strokeStyle = col.cursor; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cs.x, cs.y, 6, 0, Math.PI * 2); ctx.stroke();
        line(ctx, { x: cs.x - 12, y: cs.y }, { x: cs.x + 12, y: cs.y });
        line(ctx, { x: cs.x, y: cs.y - 12 }, { x: cs.x, y: cs.y + 12 });
        if (cg && this.cursor.z > 0.01) {
          ctx.setLineDash([2, 3]); line(ctx, cs, cg); ctx.setLineDash([]);
          ctx.fillStyle = col.cursor; ctx.fillRect(cg.x - 2, cg.y - 2, 4, 4);
        }
      }
    }
  };

  Engine.prototype.resize = function () {
    var dpr = global.devicePixelRatio || 1;
    var r = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(50, r.width * dpr);
    this.canvas.height = Math.max(50, r.height * dpr);
    this.canvas.style.width = r.width + 'px';
    this.canvas.style.height = r.height + 'px';
    this.draw();
  };

  global.Engine3D = Engine;
})(typeof window !== 'undefined' ? window : this);
