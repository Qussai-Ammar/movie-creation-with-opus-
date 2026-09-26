/* Scene 11 — Final moment. The balloon between the buildings; his first small smile; home; the door closes softly. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const GOLD = [255, 196, 120];
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };

  // looking straight up between two buildings
  function lookUp(ctx, t) {
    const sky = ctx.createRadialGradient(960, 380, 50, 960, 380, 1000);
    sky.addColorStop(0, 'rgb(255,226,170)');
    sky.addColorStop(0.5, 'rgb(236,170,110)');
    sky.addColorStop(1, 'rgb(120,120,160)');
    ctx.fillStyle = sky;
    ctx.fillRect(-100, -100, W + 200, H + 200);
    for (const s of [-1, 1]) {
      const edge = (y) => 960 + s * U.lerp(760, 250, (H + 100 - y) / (H + 300));
      const col = s < 0 ? [176, 128, 90] : [132, 92, 70];
      ctx.fillStyle = U.rgb(col);
      ctx.beginPath();
      ctx.moveTo(s < 0 ? -100 : W + 100, H + 100);
      ctx.lineTo(edge(H + 100), H + 100);
      ctx.lineTo(edge(-200), -200);
      ctx.lineTo(s < 0 ? -100 : W + 100, -200);
      ctx.closePath();
      ctx.fill();
      // windows and balconies converging upward
      for (let i = 0; i < 6; i++) {
        const y = H - i * 150;
        const x0 = edge(y), sc = U.lerp(1, 0.4, i / 6);
        ctx.fillStyle = 'rgba(40,30,30,0.8)';
        ctx.fillRect(s < 0 ? x0 - 180 * sc : x0 + 40 * sc, y - 90 * sc, 120 * sc, 80 * sc);
        ctx.fillStyle = U.rgb(U.mul(col, 0.75));
        ctx.fillRect(s < 0 ? x0 - 30 * sc : x0, y, 30 * sc * s, 14 * sc);
      }
      // roof-top water tank silhouette at the top edge
      const tx = edge(40);
      ctx.fillStyle = 'rgb(30,26,26)';
      ctx.fillRect(tx - (s < 0 ? 60 : 0), 20, 60, 40);
    }
    // wires across the gap
    ctx.strokeStyle = 'rgba(30,26,26,0.7)';
    ctx.lineWidth = 2;
    for (const y of [520, 560]) { ctx.beginPath(); ctx.moveTo(200, y); ctx.quadraticCurveTo(960, y + 40, 1720, y - 20); ctx.stroke(); }
  }

  function door(ctx, t, open) {
    // inside the apartment: a dim hallway, the door to the stairwell
    D.vgrad(ctx, -100, -100, W + 200, H + 200, [[0, [58, 48, 42]], [1, [36, 30, 28]]]);
    ctx.fillStyle = 'rgb(46,38,34)';
    ctx.fillRect(-100, 640, W + 200, 300);
    // a stripe of late sun on the wall from another room
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${10 * FILM.q}px)`;
    ctx.fillStyle = `rgba(255,190,120,${0.12 * (1 - U.ss(4, 9, t - 16))})`;
    D.poly(ctx, [[180, 180], [360, 150], [420, 640], [230, 660]]);
    ctx.fill();
    ctx.restore();
    // frame
    const fx0 = 760, fx1 = 1160, fy0 = 110, fy1 = 650;
    ctx.fillStyle = 'rgb(30,24,22)';
    ctx.fillRect(fx0 - 26, fy0 - 26, fx1 - fx0 + 52, fy1 - fy0 + 26);
    // the stairwell beyond, lit
    ctx.fillStyle = 'rgb(210,176,130)';
    ctx.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    // light spilling on the floor
    if (open > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,200,140,${0.18 * open})`;
      D.poly(ctx, [[fx0, fy1], [fx0 + (fx1 - fx0) * open, fy1], [fx0 + (fx1 - fx0) * open + 300 * open, H], [fx0 - 120, H]]);
      ctx.fill();
      ctx.restore();
    }
    return { fx0, fx1, fy0, fy1 };
  }

  function doorLeaf(ctx, f, open) {
    // hinged on the left, swings toward us
    const w = (f.fx1 - f.fx0) * (1 - open);
    const bulge = 60 * Math.sin(open * Math.PI);
    ctx.fillStyle = 'rgb(84,60,44)';
    D.poly(ctx, [[f.fx0, f.fy0], [f.fx0 + w, f.fy0 - bulge * 0.3], [f.fx0 + w, f.fy1 + bulge * 0.3], [f.fx0, f.fy1]]);
    ctx.fill();
    if (w > 40) {
      ctx.strokeStyle = 'rgba(40,28,20,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeRect(f.fx0 + w * 0.12, f.fy0 + 40, w * 0.76, 190);
      ctx.strokeRect(f.fx0 + w * 0.12, f.fy0 + 280, w * 0.76, 210);
      ctx.fillStyle = 'rgb(190,160,100)';
      ctx.beginPath(); ctx.arc(f.fx0 + w * 0.88, (f.fy0 + f.fy1) / 2 + 20, 9, 0, 7); ctx.fill();
    }
  }

  FILM.scene({
    order: 11, num: 11, name: 'Final moment', dur: 26,
    fadeOut: 3.5,
    post: (t) => ({ grain: 0.07, vignette: t > 16 ? 0.6 : 0.4 }),
    draw(ctx, t) {
      if (t < 8) {
        const b = FILM.buffer('s11');
        lookUp(b.x, t);
        ctx.save();
        const r = t * 0.012;
        D.cam(ctx, 960, 402, 1.05, r);
        D.buf(ctx, b);
        ctx.restore();
        const k = U.easeOut(t / 8);
        FILM.sets.balloon(ctx, U.lerp(930, 1000, k) + Math.sin(t * 0.8) * 16, U.lerp(560, 250, k), U.lerp(52, 16, k), t, [U.lerp(930, 1000, k) + 10, U.lerp(560, 250, k) + U.lerp(200, 70, k)]);
        FILM.sets.birds(ctx, t, 5, 111);
        return;
      }
      if (t < 16) {
        // his face, looking up — and, for the first time, a small smile
        const lt = t - 8;
        D.buf(ctx, FILM.slowLayer('s11bg', 1, (x) => {
          D.vgrad(x, -100, -100, W + 200, H + 200, [[0, [236, 178, 120]], [1, [150, 104, 80]]]);
          x.filter = `blur(${20 * FILM.q}px)`;
          x.fillStyle = 'rgb(170,120,86)';
          x.fillRect(1350, -100, 700, H + 200);
          x.fillStyle = 'rgb(120,90,70)';
          x.fillRect(-100, 200, 420, H);
        }));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1500, 0, 900, GOLD, 0.45);
        ctx.restore();
        const smile = 0.72 * U.ss(3.2, 6.0, lt);
        const down = U.ss(6.5, 8, lt);
        C.head(ctx, {
          x: 900 + lt * 4, y: 440, s: 470, yaw: 0.42, pitch: 0.34 - 0.24 * down, gaze: [0.25, -0.75 + 0.6 * down],
          eye: 0.88 - 0.12 * U.ss(3.5, 6, lt), smile, tired: 0.55, skin: C.pal.manSkin, shirt: OUT.shirt,
          light: { dx: 0.9, dy: -0.6, col: GOLD, amt: 0.45 }, shadow: 0.45, shade: [70, 40, 30],
        });
        return;
      }
      // home: in, the door closed softly
      const lt = t - 16;
      const open = U.ss(0.3, 1.4, lt) * (1 - U.ss(3.4, 4.5, lt));
      const f = door(ctx, t, open);
      if (lt > 0.9 && lt < 4.4) {
        // his silhouette coming in out of the light
        const z = U.ss(0.9, 3.2, lt);
        const hgt = U.lerp(520, 760, z);
        ctx.save();
        ctx.beginPath(); ctx.rect(-100, -100, W + 200, H + 200); ctx.clip();
        C.figure(ctx, {
          x: U.lerp(960, 1300, z), y: U.lerp(410, 470, z), h: hgt, view: 'front', pose: { liftL: Math.max(0, Math.sin(lt * 6)), liftR: Math.max(0, -Math.sin(lt * 6)) },
          col: OUT, shoe: [30, 26, 24], tint: [[20, 16, 16], 0.75], rim: { col: GOLD, dx: 0, dy: -2 }, alpha: 1 - U.ss(3.4, 4.3, lt),
        });
        ctx.restore();
      }
      doorLeaf(ctx, f, open);
    },
    audio(h, fx) {
      h.verb('street', 0.3);
      const street = fx.bed(h, { color: 'brown', type: 'bandpass', f: 380, Q: 0.5, gain: 0.05 });
      h.param(street.g.gain, [[0, 0.05], [16, 0.05], [16.5, 0.03], [20.6, 0.012], [26, 0.006]]);
      const wd = fx.wind(h, { from: 0, to: 28, gain: 0.06, f: 800, seed: 11 });
      h.param(wd.g.gain, [[0, 0.06], [16, 0.05], [20.6, 0.008], [26, 0.004]]);
      fx.scatter(h, 0.3, 16, 1.2, 112, (w, k) => fx.bird(h, w, { gain: 0.035, pan: k * 1.6 - 0.8, base: 3600 + k * 1400 }));
      // a breath out, almost a laugh
      h.at(11.4, (w) => fx.breath(h, w, { dur: 1.3, inhale: false, gain: 0.06, f: 750 }));
      // keys, the door, his steps, the soft close
      h.at(16.0, (w) => { for (let i = 0; i < 5; i++) fx.ring(h, w + i * 0.05, { f: 4200 + Math.random() * 1500, partials: [1, 1.6], decay: [0.12, 0.06], gain: 0.02 }); });
      h.at(16.4, (w) => fx.tone(h, w, { type: 'sawtooth', f: 160, f2: 120, d: 0.8, gain: 0.012, lp: 800 }));
      for (const T of [17.2, 17.8, 18.4, 19.0]) h.at(T, (w) => fx.footstep(h, w, { gain: 0.12, hard: 0.5 }));
      h.at(20.6, (w) => fx.doorClose(h, w, { gain: 0.25, soft: true }));
    },
  });

  // end card
  FILM.scene({
    order: 12, name: 'End', dur: 7,
    post: { grain: 0.05, vignette: 0 },
    draw(ctx, t) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const a = U.win(t, 1, 6.6, 1.5, 1.6);
      ctx.fillStyle = `rgba(214,204,190,${a * 0.85})`;
      ctx.font = '300 34px Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('O N E   N I G H T', W / 2, H / 2);
    },
  });
})();
