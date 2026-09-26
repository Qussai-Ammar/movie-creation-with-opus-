/* Scene 4 — Nightmare: the endless corridor. Barefoot; the corridor stretches with every step; the end door never gets closer. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;

  const HW = 1.1, FLOOR = 1.55, CEIL = -1.05, SPACING = 2.8;
  const WALL_LO = [58, 82, 74], WALL_HI = [138, 148, 136], TILE = [112, 106, 96], TUBE = [226, 244, 236];
  const DOORS = [[88, 58, 40], [56, 76, 68], [104, 84, 58], [70, 58, 52], [60, 64, 76]];
  const NUMS = ['١٢', '١٤', '١٦', '١٨', '٢٠', '٢٢', '٢٤', '٢٦', '٢٨', '٣٠', '٣٢', '٣٤', '٣٦', '٣٨'];

  // corridor state at time t (for the in-corridor shots)
  function state(t) {
    const rush = U.ss(24, 27.5, t);
    const walked = t * 1.05 + U.ss(24, 27.5, t) * 9 + Math.max(0, t - 27.5) * 0.4;
    const stretch = 1 + 0.035 * t + rush * 1.2;
    const end = 24 + 0.45 * t + rush * 40;
    const f = 720 - 330 * rush - 2 * t;
    return { walked, stretch, end, f };
  }

  // is fixture j lit at time t?
  function lit(j, t) {
    const out = [29.4, 30.1, 30.7, 31.2, 31.7, 32.1, 32.4];
    if (t > 29) {
      // lights die from the far end toward him
      const idx = Math.max(0, 6 - j);
      if (t > out[Math.min(idx, 6)]) return 0;
    }
    const n = U.noise(t * (6 + j * 0.7) + j * 13.1, 5);
    const thresh = -0.75 + 0.9 * U.ss(8, 28, t) * (j % 3 === 1 ? 1.2 : 0.6);
    if (n < thresh) return 0.15;
    return 1;
  }

  function corridor(ctx, t, o) {
    const st = state(t);
    const f = st.f, cx = 960 + (o.sway || 0), cy = 402 + (o.bob || 0);
    const pr = (X, Y, Z) => [cx + (X * f) / Z, cy + (Y * f) / Z];
    const zN = 0.35, zE = st.end;
    const quad = (pts, c) => { ctx.fillStyle = c; D.poly(ctx, pts); ctx.fill(); };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    // planes
    quad([pr(-HW, CEIL, zN), pr(HW, CEIL, zN), pr(HW, CEIL, zE), pr(-HW, CEIL, zE)], U.rgb([46, 50, 48]));
    quad([pr(-HW, FLOOR, zN), pr(HW, FLOOR, zN), pr(HW, FLOOR, zE), pr(-HW, FLOOR, zE)], U.rgb(TILE));
    for (const s of [-1, 1]) {
      quad([pr(s * HW, CEIL, zN), pr(s * HW, CEIL, zE), pr(s * HW, 0.35, zE), pr(s * HW, 0.35, zN)], U.rgb(U.mul(WALL_HI, s < 0 ? 0.95 : 0.85)));
      quad([pr(s * HW, 0.35, zN), pr(s * HW, 0.35, zE), pr(s * HW, FLOOR, zE), pr(s * HW, FLOOR, zN)], U.rgb(U.mul(WALL_LO, s < 0 ? 0.95 : 0.85)));
      const a = pr(s * HW, 0.35, zN), b = pr(s * HW, 0.35, zE);
      ctx.strokeStyle = U.rgb([40, 50, 46]);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // floor tiles (checker of worn terrazzo)
    const tile = 0.6;
    const ph = st.walked % (tile * 2);
    for (let k = 0; k < 90; k++) {
      const z0 = (k * tile - ph) * st.stretch;
      const z1 = ((k + 1) * tile - ph) * st.stretch;
      if (z1 < zN) continue;
      if (z0 > zE) break;
      for (let j = 0; j < 4; j++) {
        if ((k + j) % 2) continue;
        const x0 = -HW + j * 0.55, x1 = x0 + 0.55;
        quad([pr(x0, FLOOR, Math.max(zN, z0)), pr(x1, FLOOR, Math.max(zN, z0)), pr(x1, FLOOR, Math.min(zE, z1)), pr(x0, FLOOR, Math.min(zE, z1))], 'rgba(60,54,48,0.35)');
      }
    }
    // doors on both walls
    const dph = st.walked % SPACING;
    const base = Math.floor(st.walked / SPACING);
    for (let i = 14; i >= 0; i--) {
      const zc = ((i + 1) * SPACING - dph) * st.stretch;
      if (zc > zE - 1 || zc < zN + 0.2) continue;
      for (const s of [-1, 1]) {
        const id = base + i + (s > 0 ? 7 : 0);
        const col = DOORS[id % DOORS.length];
        const z0 = zc - 0.48, z1 = zc + 0.48, top = FLOOR - 2.1;
        quad([pr(s * HW, top - 0.08, z0 - 0.08), pr(s * HW, top - 0.08, z1 + 0.08), pr(s * HW, FLOOR, z1 + 0.08), pr(s * HW, FLOOR, z0 - 0.08)], U.rgb([34, 36, 34]));
        quad([pr(s * HW, top, z0), pr(s * HW, top, z1), pr(s * HW, FLOOR, z1), pr(s * HW, FLOOR, z0)], U.rgb(U.mul(col, s < 0 ? 1 : 0.85)));
        // panels
        ctx.strokeStyle = U.rgb(U.mul(col, 0.65));
        ctx.lineWidth = Math.max(1, 30 / zc);
        for (const [ya, yb] of [[top + 0.2, FLOOR - 1.2], [FLOOR - 1.0, FLOOR - 0.2]]) {
          D.poly(ctx, [pr(s * HW, ya, z0 + 0.12), pr(s * HW, ya, z1 - 0.12), pr(s * HW, yb, z1 - 0.12), pr(s * HW, yb, z0 + 0.12)]);
          ctx.stroke();
        }
        // handle, peephole, number
        const hd = pr(s * HW, FLOOR - 1.05, s < 0 ? z1 - 0.12 : z0 + 0.12);
        ctx.fillStyle = 'rgba(190,170,120,0.8)';
        ctx.beginPath(); ctx.arc(hd[0], hd[1], Math.max(1, 28 / zc), 0, 7); ctx.fill();
        const pp = pr(s * HW, top + 0.45, zc);
        ctx.fillStyle = 'rgba(10,10,10,0.8)';
        ctx.beginPath(); ctx.arc(pp[0], pp[1], Math.max(0.6, 14 / zc), 0, 7); ctx.fill();
        if (zc < 16) {
          const np = pr(s * HW, top + 0.25, zc);
          ctx.fillStyle = 'rgba(210,200,170,0.75)';
          ctx.font = `${Math.max(6, 90 / zc)}px serif`;
          ctx.textAlign = 'center';
          ctx.fillText(NUMS[id % NUMS.length], np[0], np[1]);
        }
        // a pair of shoes left outside one door
        if (id % 5 === 2) {
          const sp = pr(s * HW * 0.82, FLOOR, zc);
          ctx.fillStyle = 'rgba(20,20,22,0.9)';
          ctx.fillRect(sp[0] - 60 / zc, sp[1] - 25 / zc, 110 / zc, 25 / zc);
        }
      }
    }
    // the end door — always there, always far
    const eTop = FLOOR - 2.1;
    quad([pr(-HW, CEIL, zE), pr(HW, CEIL, zE), pr(HW, FLOOR, zE), pr(-HW, FLOOR, zE)], U.rgb(U.mul(WALL_HI, 0.7)));
    quad([pr(-0.5, eTop, zE), pr(0.5, eTop, zE), pr(0.5, FLOOR, zE), pr(-0.5, FLOOR, zE)], U.rgb([72, 50, 36]));

    // fluorescent tubes
    const fph = st.walked % 4;
    let sum = 0, cnt = 0;
    const pools = [];
    for (let j = 9; j >= 0; j--) {
      const zc = (1.6 + j * 4 - fph) * st.stretch;
      if (zc > zE || zc < zN + 0.1) continue;
      const on = o.dead ? 0 : lit(j + Math.floor(st.walked / 4), t);
      sum += on; cnt++;
      const a = pr(-0.09, CEIL + 0.02, zc - 0.7), b = pr(0.09, CEIL + 0.02, zc - 0.7), c = pr(0.09, CEIL + 0.02, zc + 0.7), d = pr(-0.09, CEIL + 0.02, zc + 0.7);
      quad([a, b, c, d], on > 0.5 ? U.rgb(TUBE) : U.rgb([70, 76, 74]));
      if (on > 0.5) pools.push([zc, on]);
    }
    const expo = cnt ? sum / cnt : 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [zc] of pools) {
      const c = pr(0, CEIL, zc), fl = pr(0, FLOOR, zc);
      D.glow(ctx, c[0], c[1], 900 / zc + 40, [170, 210, 190], 0.35);
      D.glow(ctx, fl[0], fl[1], 1400 / zc + 30, [140, 180, 160], 0.14);
    }
    ctx.restore();
    // darkness: global exposure + depth
    ctx.fillStyle = `rgba(0,0,0,${U.clamp(0.55 - expo * 0.45 + (o.dead ? 0.5 : 0))})`;
    ctx.fillRect(0, 0, W, H);
    const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700);
    fog.addColorStop(0, 'rgba(0,0,0,0.7)');
    fog.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, W, H);
    // light under the end door
    const u0 = pr(-0.5, FLOOR - 0.02, zE), u1 = pr(0.5, FLOOR, zE);
    const warm = o.doorLight ?? 1;
    ctx.fillStyle = `rgba(255,196,120,${0.9 * warm})`;
    ctx.fillRect(u0[0], u0[1], u1[0] - u0[0], Math.max(1.5, u1[1] - u0[1] + 1));
    D.glow(ctx, (u0[0] + u1[0]) / 2, u1[1], (u1[0] - u0[0]) * 1.2 + 10, [255, 180, 100], 0.3 * warm);
    return { pr, expo };
  }

  // shot A: bare feet on the terrazzo
  function feet(ctx, t) {
    const S = 110, cyc = 1.1, v = (2 * S) / (0.6 * cyc);
    // wall, baseboard, passing door bottoms
    D.vgrad(ctx, 0, 0, W, 430, [[0, U.mul(WALL_LO, 0.55)], [1, U.mul(WALL_LO, 0.8)]]);
    for (let i = -1; i < 4; i++) {
      const x = ((i * 900 - t * v * 0.7) % 3600 + 3600) % 3600 - 600;
      ctx.fillStyle = U.rgb(U.mul(DOORS[(i + 5) % 5], 0.7));
      ctx.fillRect(x, 0, 420, 420);
      ctx.fillStyle = 'rgba(255,220,160,0.15)';
      ctx.fillRect(x, 414, 420, 5);
    }
    ctx.fillStyle = U.rgb([34, 40, 36]);
    ctx.fillRect(0, 400, W, 30);
    // floor
    D.vgrad(ctx, 0, 430, W, H - 430, [[0, U.mul(TILE, 0.6)], [1, U.mul(TILE, 1.0)]]);
    ctx.strokeStyle = 'rgba(40,36,30,0.6)';
    ctx.lineWidth = 2;
    for (let i = -2; i < 14; i++) {
      const x = ((i * 240 - t * v) % 3360 + 3360) % 3360 - 400;
      ctx.beginPath(); ctx.moveTo(x + 60, 430); ctx.lineTo(x - 180, H); ctx.stroke();
    }
    for (const y of [470, 540, 650]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // terrazzo chips
    const r = U.rng(9);
    for (let i = 0; i < 260; i++) {
      const x = ((r() * 3000 - t * v) % 3000 + 3000) % 3000 - 500, y = 435 + r() * 370;
      ctx.fillStyle = `rgba(${r() > 0.5 ? '230,220,200' : '40,36,30'},0.35)`;
      ctx.fillRect(x, y, 3 + r() * 5, 2 + r() * 4);
    }
    // feet
    const skin = U.mix(C.pal.manSkin, [120, 160, 140], 0.25);
    for (const [off, depth] of [[0.5, 0.85], [0, 1]]) {
      const p = ((t / cyc + off) % 1 + 1) % 1;
      let x, lift, ang;
      if (p < 0.6) { x = U.lerp(S, -S, p / 0.6); lift = 0; ang = -0.5 * U.ss(0.4, 0.6, p); }
      else { const q = (p - 0.6) / 0.4; x = U.lerp(-S, S, U.smooth(q)); lift = Math.sin(Math.PI * q) * 60; ang = U.lerp(-0.5, 0.15, q) * (1 - U.ss(0.8, 1, q)); }
      const fx = 1000 + x * 1.6 + (depth < 1 ? -40 : 0), fy = 700 - lift - (depth < 1 ? 30 : 0);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(depth, depth);
      // shadow
      ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - lift / 90)})`;
      ctx.beginPath(); ctx.ellipse(40, 40 + lift / depth, 150, 16, 0, 0, 7); ctx.fill();
      ctx.rotate(ang);
      // trouser leg
      ctx.fillStyle = U.rgb(U.mul([72, 74, 82], depth));
      D.poly(ctx, [[-78, -2600], [68, -2600], [58, -80], [-72, -70]]);
      ctx.fill();
      // ankle + foot (heel at origin, toes to the right)
      ctx.fillStyle = U.rgb(U.mul(skin, depth));
      D.curve(ctx, [[-50, -90], [30, -95], [50, -30], [150, -8], [205, 8], [210, 30], [150, 36], [20, 38], [-58, 30], [-66, -20]]);
      ctx.fill();
      ctx.fillStyle = U.rgb(U.mul(skin, depth * 0.75));
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(196 - k * 20, 28 - k * 2, 11 - k, 9 - k, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = U.rgb(U.mul([72, 74, 82], depth * 0.8));
      ctx.fillRect(-72, -95, 132, 22);
      ctx.restore();
    }
    // flicker from above
    ctx.fillStyle = `rgba(0,0,0,${lit(2, t) > 0.5 ? 0.15 : 0.55})`;
    ctx.fillRect(0, 0, W, H);
  }

  FILM.scene({
    order: 4, num: 4, name: 'Nightmare: the endless corridor', dur: 34,
    fadeIn: 1.6, fadeOut: 1.0,
    post: { grain: 0.13, vignette: 0.7 },
    draw(ctx, t) {
      if (t < 7) { feet(ctx, t); return; }
      const ph = t * Math.PI * 2 / 1.1;
      if (t < 18) {
        corridor(ctx, t, { bob: Math.abs(Math.sin(ph)) * -5, sway: Math.sin(ph / 2) * 4 });
        // his back, walking and getting nowhere
        const s = Math.sin(ph);
        C.figure(ctx, {
          x: 930 + Math.sin(ph / 2) * 6, y: 760 + Math.abs(s) * -8, h: 900, view: 'back', sleeves: 'short',
          pose: { liftL: Math.max(0, s), liftR: Math.max(0, -s), swingL: s, swingR: -s, bob: 0 },
          col: { skin: C.pal.manSkin, shirt: [96, 100, 104], pants: [72, 74, 82], hair: C.pal.hair },
          tint: [[20, 34, 30], 0.55], rim: { col: [170, 210, 190], dx: 0, dy: -4 },
        });
        ctx.fillStyle = `rgba(0,0,0,${lit(1, t) > 0.5 ? 0 : 0.35})`;
        ctx.fillRect(0, 0, W, H);
        return;
      }
      // his eyes: pushing forward, the corridor pulling away
      const rush = U.ss(24, 27.5, t);
      const [sx, sy] = D.shake(t, 3 + rush * 12, 4, 2);
      corridor(ctx, t, { bob: Math.abs(Math.sin(ph * (1 + rush))) * -8 + sy, sway: Math.sin(ph / 2) * 5 + sx, doorLight: t > 33.2 ? 0 : 1 });
    },
    audio(h, fx) {
      h.verb('hall', 0.85);
      // tubes
      const buzz = fx.hum(h, { f: 100, gain: 0.02, harm: [1, 0.6, 0.5, 0.4, 0.3, 0.2], lp: 2400 });
      h.param(buzz.gain, [[0, 0.02], [29, 0.024], [32.4, 0.006], [33.3, 0]]);
      const hiss = fx.bed(h, { color: 'white', type: 'highpass', f: 6000, gain: 0.008 });
      h.param(hiss.g.gain, [[0, 0.008], [32.4, 0.004], [33.3, 0]]);
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 120, gain: 0.12 });
      // flicker ticks
      fx.scatter(h, 8, 29, 2.2, 41, (w, k) => fx.click(h, w, { gain: 0.05 + k * 0.05, f: 2500 + k * 2500, pan: k - 0.5 }));
      // bare footsteps, with an echo that answers a little too late
      for (let T = 0.33; T < 29; T += 0.55) {
        const pan = Math.round(T / 0.55) % 2 ? -0.15 : 0.15;
        const g = T > 24 && T < 27.5 ? 0.45 : 0.28;
        h.at(T, (w) => fx.footstep(h, w, { bare: true, gain: g, pan }));
        h.at(T + 0.37, (w) => fx.footstep(h, w, { bare: true, gain: g * 0.3, pan: -pan * 3 }));
      }
      // breath rising as the door runs away
      for (let T = 18.5; T < 29; T += T > 24 ? 0.7 : 1.6) {
        const tt = T;
        h.at(tt, (w) => fx.breath(h, w, { dur: tt > 24 ? 0.5 : 0.9, inhale: true, gain: 0.05, f: 900 }));
        h.at(tt + (tt > 24 ? 0.32 : 0.8), (w) => fx.breath(h, w, { dur: tt > 24 ? 0.4 : 0.8, inhale: false, gain: 0.05, f: 800 }));
      }
      h.at(24, (w) => fx.whoosh(h, w, { dur: 3.6, f1: 150, f2: 1200, gain: 0.12 }));
      // behind the end door, very far: coffee coming to the boil, a spoon, her clock
      const far = h.filter('lowpass', 900, 0.7);
      far.connect(h.in);
      const farG = h.gain(1);
      farG.connect(far);
      h.param(farG.gain, [[0, 0], [7, 0], [20, 0.8], [29, 1], [33.2, 1], [33.3, 0]]);
      fx.scatter(h, 7, 33.2, 6, 43, (w, k) => fx.bubble(h, w, { size: 0.5 + k * 0.6, gain: 0.02 + k * 0.015, dest: farG }));
      for (let T = 7.5; T < 33; T += 1) h.at(T, (w) => fx.tick(h, w, { gain: 0.012, pitch: 0.55, dest: farG }));
      h.at(26.5, (w) => fx.ring(h, w, { f: 2200, partials: [1, 2.4, 3.9], decay: [0.35, 0.2, 0.1], gain: 0.03, dest: farG }));
      // the lights go, one by one
      for (const T of [29.4, 30.1, 30.7, 31.2, 31.7, 32.1, 32.4, 33.2]) {
        h.at(T, (w) => { fx.thud(h, w, { gain: 0.25, f: 60, d: 0.3 }); fx.click(h, w, { gain: 0.15, f: 1800 }); });
      }
    },
  });
})();
