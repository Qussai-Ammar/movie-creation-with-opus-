/* Scene 9 — Leaving home. A quiet stairwell; the city waking: shutters, cars, birds, footsteps, wind. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const ST = FILM.sets.street;
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };
  const SHOE = [30, 26, 24];

  // stair profile: y of the tread at screen x
  const STEP = 100, RISE = 44, X0 = 180, Y0 = 250;
  const treadY = (x) => Y0 + Math.max(0, Math.floor((x - X0) / STEP)) * RISE;

  function stairwell(ctx, t) {
    D.vgrad(ctx, 0, 0, W, H, [[0, [150, 144, 134]], [1, [120, 114, 106]]]);
    // painted dado
    ctx.fillStyle = 'rgb(110,120,112)';
    D.poly(ctx, [[0, Y0 + 60], [W, Y0 + 60 + (W / STEP) * RISE], [W, H], [0, H]]);
    ctx.fill();
    // electricity meters
    ctx.fillStyle = 'rgb(88,90,92)';
    ctx.fillRect(250, 90, 150, 110);
    ctx.fillStyle = 'rgb(190,196,190)';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(285 + i * 40, 140, 13, 0, 7); ctx.fill(); }
    // narrow window, morning light
    ctx.fillStyle = 'rgb(255,246,226)';
    ctx.fillRect(1580, 70, 70, 420);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 1615, 260, 500, [255, 236, 200], 0.4);
    D.rays(ctx, t, { x: 1615, y: 200, ang: Math.PI * 0.72, spread: 0.2, len: 1400, n: 4, col: [255, 236, 200], alpha: 0.1, width: 0.05 });
    ctx.restore();
    // steps
    ctx.fillStyle = 'rgb(170,166,158)';
    ctx.beginPath();
    ctx.moveTo(0, Y0);
    for (let i = 0; i < 20; i++) {
      const x = X0 + i * STEP;
      ctx.lineTo(x, Y0 + i * RISE);
      ctx.lineTo(x, Y0 + (i + 1) * RISE);
    }
    ctx.lineTo(W + 100, H + 100);
    ctx.lineTo(0, H + 100);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,76,70,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 20; i++) { const x = X0 + i * STEP; ctx.beginPath(); ctx.moveTo(x, Y0 + (i + 1) * RISE); ctx.lineTo(x + STEP, Y0 + (i + 1) * RISE); ctx.stroke(); }
    ctx.fillStyle = 'rgb(128,124,118)';
    D.poly(ctx, [[0, Y0 + 30], [X0, Y0 + 30], [W + 100, Y0 + 30 + ((W + 100 - X0) / STEP) * RISE], [W + 100, H + 100], [0, H + 100]]);
    ctx.fill();
  }

  function railing(ctx) {
    ctx.strokeStyle = 'rgb(40,40,44)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(0, Y0 - 150); ctx.lineTo(W, Y0 - 150 + ((W - X0) / STEP) * RISE + 20); ctx.stroke();
    ctx.lineWidth = 4;
    for (let x = 60; x < W; x += 50) {
      const ty = treadY(x);
      ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x, Y0 - 150 + ((x - X0) / STEP) * RISE + 20 * (x / W)); ctx.stroke();
    }
  }

  function car(ctx, x, y, s, col) {
    ctx.fillStyle = U.rgb(col);
    D.rrect(ctx, x - 0.9 * s, y - 1.3 * s, 1.8 * s, 1.0 * s, 0.15 * s);
    ctx.fill();
    ctx.fillStyle = U.rgb(U.mul(col, 0.7));
    D.rrect(ctx, x - 0.75 * s, y - 1.75 * s, 1.5 * s, 0.55 * s, 0.2 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(30,34,40,0.9)';
    ctx.fillRect(x - 0.62 * s, y - 1.68 * s, 1.24 * s, 0.4 * s);
    ctx.fillStyle = 'rgb(180,30,30)';
    ctx.fillRect(x - 0.85 * s, y - 1.1 * s, 0.25 * s, 0.12 * s);
    ctx.fillRect(x + 0.6 * s, y - 1.1 * s, 0.25 * s, 0.12 * s);
    ctx.fillStyle = 'rgb(20,20,20)';
    ctx.fillRect(x - 0.85 * s, y - 0.32 * s, 0.3 * s, 0.32 * s);
    ctx.fillRect(x + 0.55 * s, y - 0.32 * s, 0.3 * s, 0.32 * s);
  }

  function birds(ctx, t, n, seed) {
    const r = U.rng(seed);
    ctx.strokeStyle = 'rgba(30,30,34,0.8)';
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const sp = 60 + r() * 80, y0 = 40 + r() * 180, ph = r() * 10, off = r() * 2400;
      const x = ((off + t * sp) % 2400) - 240;
      const y = y0 + Math.sin(t * 0.8 + ph) * 12;
      const f = Math.sin(t * 12 + ph) * 5;
      ctx.beginPath(); ctx.moveTo(x - 8, y - f); ctx.lineTo(x, y); ctx.lineTo(x + 8, y - f); ctx.stroke();
    }
  }
  FILM.sets.birds = birds;
  FILM.sets.car = car;

  FILM.scene({
    order: 9, num: 9, name: 'Leaving home', dur: 26,
    fadeIn: 1,
    post: { grain: 0.07, vignette: 0.4 },
    draw(ctx, t) {
      if (t < 9) {
        stairwell(ctx, t);
        const k = t / 9;
        const x = U.lerp(120, 1500, k);
        const ph = t * Math.PI * 2 / 0.95;
        const pose = C.poses.walk(ph, 0.8);
        pose.kL += 0.25; pose.kR += 0.25; pose.torso = 0.02;
        C.figure(ctx, {
          x, y: treadY(x) + RISE * ((x - X0) % STEP) / STEP - 0.47 * 440, h: 440, facing: 1, pose, col: OUT, shoe: SHOE,
          rim: { col: [255, 240, 210], dx: 3, dy: -1 },
        });
        railing(ctx);
        return;
      }
      const lt = t - 9;
      const people = [];
      // him: out of the door, then away down the street
      const out = U.ss(0.4, 2.0, lt);
      const walkK = U.inv(2.0, 17, lt);
      const Z = U.lerp(7.0, 34, walkK);
      const X = U.lerp(5.0, 4.2, out);
      const ph = lt * Math.PI * 2 / 1.0;
      const s = Math.sin(ph);
      if (lt > 0.3) {
        people.push({
          X, Z, draw: (c, x, y, sc, haze) => C.figure(c, {
            x, y: y - 0.49 * 1.75 * sc, h: 1.75 * sc, view: lt < 1.8 ? 'side' : 'back', facing: -1,
            pose: lt < 1.8 ? C.poses.walk(ph, 0.6) : { liftL: Math.max(0, s), liftR: Math.max(0, -s), swingL: s, swingR: -s },
            col: OUT, shoe: SHOE, tint: [[214, 214, 210], haze * 0.8],
          }),
        });
      }
      // a shopkeeper by his opened shutter
      people.push({
        X: -4.4, Z: 16, draw: (c, x, y, sc, haze) => C.figure(c, {
          x, y: y - 0.49 * 1.7 * sc, h: 1.7 * sc, view: 'front', pose: {}, col: { skin: C.pal.manSkin, shirt: [150, 140, 120], pants: [70, 64, 60], hair: [60, 58, 56] },
          shoe: [40, 36, 30], tint: [[214, 214, 210], haze * 0.8],
        }),
      });
      // a car pulling away down the street
      const cz = U.lerp(9, 90, U.easeIn(U.inv(4.5, 15, lt)));
      if (lt > 4.5 && lt < 15) {
        people.push({ X: -1.6, Z: cz, draw: (c, x, y, sc, haze) => car(c, x, y, sc, U.mix([160, 40, 36], [214, 214, 210], haze * 0.8)) });
      }
      ST.draw(ctx, t, { mode: 'morning', cam: { z: -1, y: 0.1 }, shutters: U.lerp(0.15, 0.95, U.inv(0, 16, lt)), people });
      birds(ctx, t, 6, 91);
      // soft morning light
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      D.glow(ctx, 1700, 0, 900, [255, 240, 214], 0.25);
      ctx.restore();
    },
    audio(h, fx) {
      // stairwell: steps echoing on stone
      const sw = h.gain(1);
      sw.connect(h.in);
      h.verb('hall', 0.25);
      for (let T = 0.3; T < 9; T += 0.475) h.at(T, (w) => fx.footstep(h, w, { gain: 0.22, pan: U.lerp(-0.5, 0.5, T / 9) }));
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 250, gain: 0.03, dest: sw });
      // the street door
      h.at(9.2, (w) => { fx.doorClose(h, w + 1.4, { gain: 0.3 }); fx.tone(h, w, { type: 'sawtooth', f: 180, f2: 140, d: 0.6, gain: 0.015, lp: 900 }); });
      // morning city
      const city = fx.bed(h, { color: 'brown', type: 'bandpass', f: 420, Q: 0.5, gain: 0 });
      h.param(city.g.gain, [[0, 0.01], [9, 0.01], [9.8, 0.07], [26, 0.07]]);
      const wd = fx.wind(h, { from: 9, to: 28, gain: 0.05, f: 700, seed: 9, pan: 0.2 });
      fx.scatter(h, 9.5, 26, 1.2, 92, (w, k) => fx.bird(h, w, { gain: 0.04, pan: k * 1.6 - 0.8 }));
      h.at(12.3, (w) => fx.shutter(h, w, { dur: 2.6, gain: 0.1, pan: -0.6 }));
      h.at(19.4, (w) => fx.shutter(h, w, { dur: 2.2, gain: 0.07, pan: 0.5 }));
      h.at(13.3, (w) => fx.carPass(h, w, { dur: 10, gain: 0.1, p1: -0.3, p2: 0, far: 0 }));
      h.at(20, (w) => fx.carPass(h, w, { dur: 7, gain: 0.04, p1: 0.8, p2: -0.8, far: 1 }));
      // his footsteps outside, going away
      for (let T = 10.2; T < 26; T += 0.5) {
        const g = U.lerp(0.2, 0.03, U.inv(10, 26, T));
        h.at(T, (w) => fx.footstep(h, w, { gain: g, pan: 0.35, hard: 0.7 }));
      }
    },
  });
})();
