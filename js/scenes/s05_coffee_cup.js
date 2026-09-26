/* Scene 5 — Nightmare: the coffee cup. A small finjan spins in the dark, grows, and follows him; coffee spills upward like black rain. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;

  const CLOTH = { skin: C.pal.manSkin, shirt: [96, 100, 104], pants: [72, 74, 82], hair: C.pal.hair };

  // a Palestinian finjan: handle-less porcelain cup, gold rim, embroidered-pattern band
  function cup(ctx, x, y, size, spin, tilt = 0.25, glow = 1, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(size, size);
    if (glow > 0) D.glow(ctx, 0, 0, 1.1, [255, 236, 210], 0.18 * glow);
    const ry = 0.08 + 0.12 * tilt;
    // shadowless body
    const g = ctx.createLinearGradient(-0.5, 0, 0.5, 0);
    g.addColorStop(0, 'rgb(250,246,238)');
    g.addColorStop(0.35, 'rgb(236,230,220)');
    g.addColorStop(1, 'rgb(128,122,118)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-0.5, -0.45);
    ctx.bezierCurveTo(-0.5, -0.05, -0.42, 0.3, -0.26, 0.4);
    ctx.ellipse(0, 0.4, 0.26, ry * 0.5, 0, Math.PI, 0, true);
    ctx.bezierCurveTo(0.42, 0.3, 0.5, -0.05, 0.5, -0.45);
    ctx.ellipse(0, -0.45, 0.5, ry, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    // foot ring
    ctx.fillStyle = 'rgb(200,194,186)';
    ctx.beginPath(); ctx.ellipse(0, 0.44, 0.24, ry * 0.45, 0, 0, Math.PI); ctx.fill();
    // embroidered band (tatreez motif) turning with the spin
    const bandY = -0.3;
    for (let k = 0; k < 14; k++) {
      const th = spin + (k / 14) * Math.PI * 2;
      const c = Math.cos(th);
      if (c <= 0.05) continue;
      const r = 0.47;
      const bx = Math.sin(th) * r;
      const w = 0.045 * c;
      const shade = 0.55 + 0.45 * c;
      ctx.fillStyle = k % 2 ? `rgba(${160 * shade | 0},${28 * shade | 0},${34 * shade | 0},0.95)` : `rgba(${30 * shade | 0},${86 * shade | 0},${70 * shade | 0},0.95)`;
      ctx.beginPath();
      ctx.moveTo(bx, bandY - 0.07); ctx.lineTo(bx + w, bandY); ctx.lineTo(bx, bandY + 0.07); ctx.lineTo(bx - w, bandY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(190,150,60,${0.8 * c})`;
      ctx.fillRect(bx - 0.006, bandY - 0.11, 0.012, 0.012);
      ctx.fillRect(bx - 0.006, bandY + 0.1, 0.012, 0.012);
    }
    ctx.strokeStyle = 'rgba(190,150,60,0.8)';
    ctx.lineWidth = 0.008;
    for (const yy of [bandY - 0.13, bandY + 0.13]) {
      ctx.beginPath(); ctx.ellipse(0, yy, 0.49, ry * 0.9, 0, 0, Math.PI); ctx.stroke();
    }
    // rim + coffee
    ctx.fillStyle = 'rgb(246,242,234)';
    ctx.beginPath(); ctx.ellipse(0, -0.45, 0.5, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgb(34,18,10)';
    ctx.beginPath(); ctx.ellipse(0, -0.44, 0.46, ry * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,96,50,0.5)';
    ctx.lineWidth = 0.012;
    ctx.beginPath(); ctx.ellipse(0, -0.44, 0.44, ry * 0.8, 0, 0.2, 2.8); ctx.stroke();
    ctx.strokeStyle = 'rgb(200,160,70)';
    ctx.lineWidth = 0.018;
    ctx.beginPath(); ctx.ellipse(0, -0.45, 0.5, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function voidBg(ctx, t, scroll = 0) {
    const g = ctx.createRadialGradient(960, 380, 50, 960, 402, 1100);
    g.addColorStop(0, 'rgb(26,20,22)');
    g.addColorStop(1, 'rgb(3,2,4)');
    ctx.fillStyle = g;
    ctx.fillRect(-100, -100, W + 200, H + 200);
    D.dust(ctx, t, { n: 70, seed: 51, size: 1.4, col: [200, 180, 160], alpha: 0.25, vx: 3 + scroll, vy: -1, wob: 8 });
    D.dust(ctx, t, { n: 30, seed: 52, size: 2.4, col: [200, 180, 160], alpha: 0.15, vx: 1 + scroll * 1.6, vy: 1, wob: 20 });
  }

  // coffee rising upward like rain
  function blackRain(ctx, t, from, rate, box, emitter) {
    const r = U.rng(505);
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < rate; i++) {
      const t0 = from + r() * 16, life = 1.4 + r() * 1.6;
      const age = t - t0;
      if (age < 0 || age > life) continue;
      let x, y;
      if (emitter && r() < 0.55) {
        const e = emitter(t0);
        x = e[0] + (r() - 0.5) * e[2] + age * (r() - 0.5) * 60;
        y = e[1] - age * (260 + r() * 260) - age * age * 120;
      } else {
        x = box[0] + r() * box[2];
        y = box[1] + box[3] - ((age / life) * (box[3] + 200));
      }
      const len = 14 + r() * 30;
      const a = Math.sin((age / life) * Math.PI) * 0.8;
      ctx.strokeStyle = `rgba(28,14,8,${a})`;
      ctx.lineWidth = 3 + r() * 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
      ctx.fillStyle = `rgba(200,150,110,${a * 0.25})`;
      ctx.fillRect(x - 1, y, 2, 3);
    }
    ctx.restore();
  }

  FILM.scene({
    order: 5, num: 5, name: 'Nightmare: the coffee cup', dur: 30,
    fadeIn: 2,
    post: { grain: 0.12, vignette: 0.75 },
    draw(ctx, t) {
      const spin = t * 1.1;
      if (t < 9) {
        voidBg(ctx, t);
        const drift = Math.sin(t * 0.4) * 10;
        D.glow(ctx, 1060, 330, 380, [255, 230, 200], 0.08);
        C.figure(ctx, {
          x: 640, y: 480 + drift, h: 560, facing: 1, pose: Object.assign(C.poses.float(t), { rot: -0.08 + Math.sin(t * 0.3) * 0.05, neck: 0.0, head: -0.1 }),
          col: CLOTH, sleeves: 'short', tint: [[20, 16, 18], 0.55], rim: { col: [255, 226, 190], dx: 3, dy: -1 },
        });
        cup(ctx, 1060 + Math.sin(t * 0.7) * 12, 330 + Math.sin(t * 0.9) * 10, 74, spin, 0.3, 1, Math.sin(t * 0.5) * 0.1);
        return;
      }
      if (t < 11.5) {
        const lt = t - 9;
        voidBg(ctx, t);
        const z = 1 + lt * 0.03;
        cup(ctx, 960, 430, 430 * z, spin, 0.32, 1.3, Math.sin(t * 0.5) * 0.05);
        // a single drop lifting off the surface, upward
        const dy = U.easeIn(U.inv(0.6, 2.5, lt)) * 420;
        if (lt > 0.6) {
          ctx.fillStyle = 'rgb(30,16,8)';
          ctx.beginPath(); ctx.ellipse(975, 245 - dy, 9, 13 + dy * 0.02, 0, 0, 7); ctx.fill();
        }
        return;
      }
      if (t < 13) {
        const lt = t - 11.5;
        const [sx, sy] = D.shake(t, lt > 0.1 ? 16 * (1 - lt / 1.5) : 0, 10, 7);
        ctx.save();
        ctx.translate(sx, sy);
        voidBg(ctx, t);
        const g = U.easeOut(U.inv(0.1, 0.7, lt));
        const size = U.lerp(74, 640, g) * (1 + Math.sin(U.inv(0.1, 1.2, lt) * Math.PI * 3) * 0.03 * (1 - lt / 1.5));
        C.figure(ctx, {
          x: U.lerp(640, 560, U.easeOut(lt / 1.5)), y: 480, h: 560, facing: 1, pose: Object.assign(C.poses.float(t), { rot: -0.25 * g, sL: 2.3, eL: 0.4, sR: 2.0, eR: 0.6, neck: -0.2 }),
          col: CLOTH, sleeves: 'short', tint: [[20, 16, 18], 0.55], rim: { col: [255, 226, 190], dx: 3, dy: -1 },
        });
        cup(ctx, U.lerp(1060, 1300, g), U.lerp(330, 440, g), size, spin, 0.3, 1 + g, 0);
        ctx.restore();
        return;
      }
      if (t < 27) {
        // the chase
        const lt = t - 13;
        const [sx, sy] = D.shake(t, 5, 2, 3);
        ctx.save();
        ctx.translate(sx, sy);
        voidBg(ctx, t, 40);
        const gain = U.ss(0, 14, lt);
        const cx = U.lerp(1420, 1180, gain) + Math.sin(lt * 0.6) * 30, cyy = 440 + Math.sin(lt * 0.8) * 30;
        const size = 660 + gain * 120;
        const look = U.win(lt, 4.5, 6.2, 0.2, 0.2) > 0.5 || U.win(lt, 10, 11.4, 0.2, 0.2) > 0.5;
        const mx = U.lerp(720, 520, U.smooth(lt / 14)) + Math.sin(lt * 1.3) * 18, my = 460 + Math.sin(lt * 0.9) * 25;
        blackRain(ctx, t, 13, 170, [-100, -50, W + 200, H + 100], (t0) => [cx, cyy - size * 0.45, size * 0.8]);
        cup(ctx, cx, cyy, size, spin * 1.4, 0.3, 1.2, -0.15 - gain * 0.12);
        C.figure(ctx, {
          x: mx, y: my, h: 520, facing: look ? 1 : -1,
          pose: Object.assign(look ? C.poses.float(t) : C.poses.swim(t * 0.8, 0.8), { rot: look ? 0.1 : -1.1 + Math.sin(t) * 0.05 }),
          col: CLOTH, sleeves: 'short', tint: [[20, 16, 18], 0.55], rim: { col: [255, 226, 190], dx: 4, dy: 0 },
        });
        ctx.restore();
        return;
      }
      // into the cup: the black surface — and a warm light at its heart
      const lt = t - 27;
      voidBg(ctx, t);
      const k = U.easeIn(U.inv(0, 3, lt));
      const size = U.lerp(700, 6000, k);
      cup(ctx, 960, 402 + 0.45 * size, size, spin, U.lerp(0.3, 1.6, k), 1, 0);
      D.glow(ctx, 960, 402, 200 + k * 900, [255, 200, 120], U.ss(1.2, 3, lt) * 0.9);
    },
    audio(h, fx) {
      h.verb('dream', 0.6);
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 80, gain: 0.2 });
      const air = fx.bed(h, { color: 'pink', type: 'bandpass', f: 400, Q: 0.4, gain: 0.03 });
      h.param(air.g.gain, [[0, 0.03], [13, 0.03], [14, 0.08], [27, 0.1], [30, 0.02]]);
      // the cup turning: porcelain touching nothing
      for (let T = 0.8; T < 11.5; T += 1.4) h.at(T, (w) => fx.porcelain(h, w, { pitch: 1.15, gain: 0.05, pan: 0.3 }));
      h.at(10.2, (w) => fx.drip(h, w, { rev: true, gain: 0.12, f: 500 }));
      // it grows
      h.at(11.58, (w) => { fx.thud(h, w, { gain: 0.6, f: 42, d: 1.4 }); fx.porcelain(h, w, { pitch: 0.28, gain: 0.25 }); fx.whoosh(h, w - 0.3, { dur: 0.6, f1: 200, f2: 60, gain: 0.3, color: 'brown' }); });
      // chase: rattling giant porcelain, rain falling upward, his breath
      for (let T = 13.4; T < 27; T += 1.7 + Math.random()) h.at(T, (w) => fx.porcelain(h, w, { pitch: 0.4 + Math.random() * 0.15, gain: 0.08, pan: 0.5 }));
      fx.scatter(h, 13, 27, 9, 61, (w, k) => fx.drip(h, w, { rev: true, gain: 0.03 + k * 0.03, f: 250 + k * 500, pan: k * 1.6 - 0.8 }));
      for (let T = 12.2; T < 27; T += 0.9) {
        h.at(T, (w) => fx.breath(h, w, { dur: 0.45, inhale: true, gain: 0.06, f: 1000 }));
        h.at(T + 0.45, (w) => fx.breath(h, w, { dur: 0.4, inhale: false, gain: 0.06, f: 850 }));
      }
      // falling into the coffee; the drone lifts into warmth
      h.at(27, (w) => fx.whoosh(h, w, { dur: 3, f1: 80, f2: 900, gain: 0.25 }));
    },
  });
})();
