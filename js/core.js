/* One Night — engine: math, drawing helpers, timeline, renderer, post-processing, controls. */
(function () {
  'use strict';

  const W = 1920, H = 804; // logical frame, 2.39:1
  const FILM = (window.FILM = window.FILM || {});
  FILM.W = W; FILM.H = H;
  FILM.list = [];

  /* ------------------------------------------------------------------ math */
  const U = (FILM.U = {});
  U.clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.inv = (a, b, x) => U.clamp((x - a) / (b - a));
  U.smooth = (t) => t * t * (3 - 2 * t);
  U.ss = (a, b, x) => U.smooth(U.inv(a, b, x));
  U.easeIn = (t) => t * t * t;
  U.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // rises over [a, a+fi], falls over [b-fo, b]
  U.win = (x, a, b, fi, fo = fi) => Math.min(U.ss(a, a + fi, x), 1 - U.ss(b - fo, b, x));
  U.hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  U.rng = (seed) => {
    let a = seed >>> 0 || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.noise = (x, seed = 0) => {
    const i = Math.floor(x), f = x - i;
    return U.lerp(U.hash(i + seed * 57.31), U.hash(i + 1 + seed * 57.31), U.smooth(f)) * 2 - 1;
  };
  U.fbm = (x, seed = 0) => U.noise(x, seed) * 0.6 + U.noise(x * 2.13, seed + 3) * 0.3 + U.noise(x * 4.71, seed + 7) * 0.1;
  U.mix = (a, b, t) => [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];
  U.mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  U.rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  // piecewise-linear keyframes: [[t, v], ...] (v may be number or colour array)
  U.keys = (k, t, ease = U.smooth) => {
    if (t <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const p = ease((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
        const a = k[i - 1][1], b = k[i][1];
        return Array.isArray(a) ? U.mix(a, b, p) : U.lerp(a, b, p);
      }
    }
    return k[k.length - 1][1];
  };

  /* ---------------------------------------------------------------- params */
  const params = new URLSearchParams(location.search);
  const Q = (FILM.q = U.clamp(parseFloat(params.get('q')) || 0.75, 0.25, 2));
  // film-grain strength (export uses a softer grain so the video compresses well)
  const GRAIN = U.clamp(parseFloat(params.get('grain')) || 1, 0, 2);

  /* --------------------------------------------------------------- drawing */
  const D = (FILM.D = {});
  D.glow = (ctx, x, y, r, c, a = 1) => {
    if (r <= 0 || a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgb(c, a));
    g.addColorStop(0.4, U.rgb(c, a * 0.45));
    g.addColorStop(1, U.rgb(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  // vertical gradient: stops = [[pos, colour, alpha?], ...]
  D.vgrad = (ctx, x, y, w, h, stops) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    for (const s of stops) g.addColorStop(s[0], U.rgb(s[1], s[2] ?? 1));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  };
  D.lgrad = (ctx, x0, y0, x1, y1, stops) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const s of stops) g.addColorStop(s[0], U.rgb(s[1], s[2] ?? 1));
    return g;
  };
  D.poly = (ctx, pts, close = true) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  };
  // smooth closed/open curve through points (quadratic midpoints)
  D.curve = (ctx, pts, close = true) => {
    const n = pts.length;
    ctx.beginPath();
    if (close) {
      const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
      ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) {
        const p = pts[i], q = pts[i + 1];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
  };
  D.ellipse = (ctx, x, y, rx, ry, rot = 0) => {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);
  };
  D.rrect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
  };
  // camera: (cx, cy) lands at screen centre (or at fx, fy)
  D.cam = (ctx, cx, cy, zoom = 1, rot = 0, fx = W / 2, fy = H / 2) => {
    ctx.translate(fx, fy);
    if (rot) ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  };
  D.shake = (t, amp, speed = 1, seed = 0) => [U.fbm(t * speed, seed) * amp, U.fbm(t * speed, seed + 19) * amp];
  // fill the whole frame regardless of current transform
  D.screen = (ctx, style, alpha = 1, op) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= alpha;
    if (op) ctx.globalCompositeOperation = op;
    ctx.fillStyle = style;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  };
  // drifting motes: deterministic, wrapping inside box
  D.dust = (ctx, t, o) => {
    const r = U.rng(o.seed || 1);
    const { x = 0, y = 0, w = W, h = H, n = 60, size = 2, col = [255, 255, 255], alpha = 0.4, vx = 4, vy = -3, wob = 10 } = o;
    ctx.fillStyle = U.rgb(col, 1);
    for (let i = 0; i < n; i++) {
      const px = r() * w, py = r() * h, sp = 0.5 + r(), sz = size * (0.4 + r()), ph = r() * 100;
      let X = (px + t * vx * sp + Math.sin(t * 0.3 + ph) * wob) % w; if (X < 0) X += w;
      let Y = (py + t * vy * sp + Math.cos(t * 0.23 + ph) * wob) % h; if (Y < 0) Y += h;
      const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + r()) + ph);
      ctx.globalAlpha = alpha * tw * (o.mask ? o.mask(x + X, y + Y) : 1);
      ctx.beginPath();
      ctx.arc(x + X, y + Y, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  // soft light beams fanning from (x, y)
  D.rays = (ctx, t, o) => {
    const { x, y, ang = Math.PI / 2, spread = 0.6, len = 900, n = 7, col = [255, 240, 200], alpha = 0.12, width = 0.06, seed = 3 } = o;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const a = ang + (i / (n - 1) - 0.5) * spread + U.noise(t * 0.15 + i * 3.1, seed) * 0.05;
      const wd = width * (0.6 + U.hash(i + seed) * 0.8);
      const k = alpha * (0.5 + 0.5 * U.noise(t * 0.4 + i * 1.7, seed + 1));
      const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.addColorStop(0, U.rgb(col, k));
      g.addColorStop(1, U.rgb(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a - wd) * len, y + Math.sin(a - wd) * len);
      ctx.lineTo(x + Math.cos(a + wd) * len, y + Math.sin(a + wd) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  D.vignette = (ctx, amt, col = [0, 0, 0], inner = 0.35) => {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * inner, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, U.rgb(col, 0));
    g.addColorStop(1, U.rgb(col, amt));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };

  /* ------------------------------------------------------ offscreen canvases */
  const cache = {};
  // static texture drawn once in logical units at render scale
  FILM.cached = (key, w, h, draw) => {
    let c = cache[key];
    if (c) return c;
    c = document.createElement('canvas');
    c.width = Math.ceil(w * Q); c.height = Math.ceil(h * Q);
    const x = c.getContext('2d');
    x.scale(Q, Q);
    draw(x, w, h);
    c.lw = w; c.lh = h;
    cache[key] = c;
    return c;
  };
  D.img = (ctx, c, x = 0, y = 0, w = c.lw, h = c.lh) => ctx.drawImage(c, x, y, w, h);

  const bufs = {};
  // full-frame scratch buffer, cleared, base transform set
  FILM.buffer = (name, clear = true) => {
    let b = bufs[name];
    if (!b || b.c.width !== FILM.canvas.width) {
      const c = document.createElement('canvas');
      c.width = FILM.canvas.width; c.height = FILM.canvas.height;
      b = bufs[name] = { c, x: c.getContext('2d') };
    }
    const x = b.x;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
    if (clear) x.clearRect(0, 0, b.c.width, b.c.height);
    x.setTransform(Q, 0, 0, Q, 0, 0);
    return b;
  };
  // a full-frame layer that is only redrawn when `key` changes (for slow, expensive backgrounds)
  const slow = {};
  FILM.slowLayer = (name, key, draw) => {
    let L = slow[name];
    if (!L || L.b.c.width !== FILM.canvas.width) {
      const b = FILM.buffer('__slow_' + name);
      L = slow[name] = { b, key: null };
    }
    if (L.key !== key) {
      const b = FILM.buffer('__slow_' + name);
      draw(b.x);
      L.key = key;
    }
    return L.b;
  };

  // draw a buffer back at logical full-frame size
  D.buf = (ctx, b, alpha = 1, op) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= alpha;
    if (op) ctx.globalCompositeOperation = op;
    ctx.drawImage(b.c, 0, 0);
    ctx.restore();
  };

  /* ---------------------------------------------------------------- scenes */
  FILM.scene = (def) => FILM.list.push(def);

  function build() {
    FILM.list.sort((a, b) => a.order - b.order);
    let t = 0;
    for (const s of FILM.list) { s.start = t; t += s.dur; }
    FILM.total = t;
  }
  const sceneAt = (t) => {
    const L = FILM.list;
    for (let i = L.length - 1; i >= 0; i--) if (t >= L[i].start) return i;
    return 0;
  };

  /* -------------------------------------------------------------- renderer */
  let canvas, ctx, grains = [];

  function makeGrain() {
    const gw = Math.ceil(canvas.width / 2), gh = Math.ceil(canvas.height / 2);
    const r = U.rng(99);
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas');
      c.width = gw; c.height = gh;
      const x = c.getContext('2d');
      const im = x.createImageData(gw, gh);
      for (let i = 0; i < im.data.length; i += 4) {
        const v = 128 + (r() + r() + r() - 1.5) * 120;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
        im.data[i + 3] = 255;
      }
      x.putImageData(im, 0, 0);
      grains.push(c);
    }
  }

  function drawScene(c, s, lt) {
    c.save();
    c.setTransform(Q, 0, 0, Q, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, W, H);
    try { s.draw(c, lt, s); } catch (e) { console.error(s.name, e); }
    c.restore();
    c.save();
    c.setTransform(Q, 0, 0, Q, 0, 0);
    let fade = 0;
    if (s.fadeIn) fade = Math.max(fade, 1 - U.ss(0, s.fadeIn, lt));
    if (s.fadeOut) fade = Math.max(fade, U.ss(s.dur - s.fadeOut, s.dur, lt));
    if (fade > 0.001) { c.fillStyle = `rgba(0,0,0,${fade})`; c.fillRect(0, 0, W, H); }
    c.restore();
  }

  function post(s, lt, t) {
    const P = Object.assign({ grain: 0.09, vignette: 0.5 }, typeof s.post === 'function' ? s.post(lt) : s.post || {});
    ctx.save();
    ctx.setTransform(Q, 0, 0, Q, 0, 0);
    if (P.vignette > 0) D.vignette(ctx, P.vignette);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (P.grain > 0 && grains.length) {
      const f = Math.floor(t * 24);
      const g = grains[f % grains.length];
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = P.grain * 2.2 * GRAIN;
      const ox = (U.hash(f) * 40) | 0, oy = (U.hash(f + 7) * 40) | 0;
      ctx.drawImage(g, -ox, -oy, canvas.width + 40, canvas.height + 40);
    }
    ctx.restore();
  }

  function render(t) {
    const L = FILM.list;
    const i = sceneAt(t), s = L[i], lt = t - s.start;
    const d = s.dissolve || 0;
    if (d && lt < d && i > 0) {
      const p = L[i - 1];
      drawScene(ctx, p, lt + p.dur);
      const b = FILM.buffer('__dissolve', false);
      drawScene(b.x, s, lt);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = U.smooth(lt / d);
      ctx.drawImage(b.c, 0, 0);
      ctx.restore();
    } else {
      drawScene(ctx, s, lt);
    }
    post(s, lt, t);
    FILM.current = s;
  }
  FILM.renderAt = (t) => render(U.clamp(t, 0, FILM.total - 0.001));

  /* ---------------------------------------------------------------- player */
  let playing = false, T = 0, last = 0, started = false, hudTimer = 0;
  const A = () => FILM.A;

  function setTime(t) {
    T = U.clamp(t, 0, FILM.total - 0.001);
    if (A() && A().on) A().seek(T);
  }
  function play() {
    if (T >= FILM.total - 0.01) setTime(0);
    playing = true;
    if (A() && A().on) A().play(T);
  }
  function pause() {
    playing = false;
    if (A() && A().on) A().pause();
  }
  FILM.seek = setTime;

  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    if (playing) {
      T = A() && A().on ? A().time() : T + dt;
      if (T >= FILM.total) { T = FILM.total - 0.001; pause(); }
      if (A() && A().on) A().update(T);
    }
    render(T);
    updateHud();
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------- HUD */
  let hud, fill, scn, tm;
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function updateHud() {
    if (!hud) return;
    fill.style.width = (T / FILM.total) * 100 + '%';
    const s = FILM.list[sceneAt(T)];
    scn.textContent = (s.num != null ? `Scene ${s.num} — ` : '') + s.name + (playing ? '' : '   (paused)');
    tm.textContent = `${fmt(T)} / ${fmt(FILM.total)}`;
  }
  function poke() {
    if (!hud) return;
    hud.classList.add('show');
    document.body.classList.remove('idle');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => { if (playing) { hud.classList.remove('show'); document.body.classList.add('idle'); } }, 2200);
  }

  function setupUI() {
    hud = document.getElementById('hud');
    fill = hud.querySelector('.fill');
    scn = document.getElementById('scn');
    tm = document.getElementById('tm');
    const bar = document.getElementById('bar');
    for (const s of FILM.list) {
      if (!s.start) continue;
      const k = document.createElement('div');
      k.className = 'tick';
      k.style.left = (s.start / FILM.total) * 100 + '%';
      k.title = s.name;
      bar.appendChild(k);
    }
    bar.addEventListener('click', (e) => {
      const r = bar.getBoundingClientRect();
      setTime(((e.clientX - r.left) / r.width) * FILM.total);
      poke();
    });
    window.addEventListener('mousemove', poke);

    const startEl = document.getElementById('start');
    const begin = () => {
      if (started) return;
      started = true;
      startEl.classList.add('gone');
      try { A().init(); } catch (e) { console.warn('audio unavailable', e); }
      setTime(T);
      play();
      poke();
    };
    startEl.addEventListener('click', begin);

    window.addEventListener('keydown', (e) => {
      if (!started) { if (e.key === ' ' || e.key === 'Enter') begin(); return; }
      const k = e.key;
      if (k === ' ') { playing ? pause() : play(); e.preventDefault(); }
      else if (k === 'ArrowRight') setTime(T + 5);
      else if (k === 'ArrowLeft') setTime(T - 5);
      else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
      } else if (k === 'm' || k === 'M') { if (A() && A().on) A().toggleMute(); }
      else {
        const map = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 0: 10, '-': 11, '=': 12 };
        if (k in map) { const s = FILM.list.find((x) => x.num === map[k]); if (s) setTime(s.start); }
        else if (k === 'Home') setTime(0);
        else return;
      }
      poke();
    });
  }

  /* ------------------------------------------------------------------ boot */
  FILM.boot = () => {
    build();
    canvas = FILM.canvas = document.getElementById('film');
    canvas.width = Math.round(W * Q);
    canvas.height = Math.round(H * Q);
    ctx = FILM.ctx = canvas.getContext('2d');
    makeGrain();
    if (params.has('t')) T = U.clamp(parseFloat(params.get('t')) || 0, 0, FILM.total - 0.001);
    if (params.has('still')) {
      // test mode: render a single frame, no loop, no audio
      for (const id of ['start', 'hud']) { const el = document.getElementById(id); if (el) el.remove(); }
      render(T);
      FILM.ready = true;
      return;
    }
    setupUI();
    render(T);
    last = performance.now();
    requestAnimationFrame(tick);
    FILM.ready = true;
  };
})();
