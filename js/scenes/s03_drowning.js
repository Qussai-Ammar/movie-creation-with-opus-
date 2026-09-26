/* Scene 3 — Nightmare: drowning. Fully dressed in a dark endless sea; every time he reaches the light he is pulled back down. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;

  const TEAL = [12, 50, 60];
  const CLOTH = { skin: C.pal.manSkin, shirt: [44, 52, 60], pants: [30, 34, 42], hair: C.pal.hair };
  const RIM = { col: [130, 205, 210], dx: 0, dy: -3 };

  function sea(ctx, t, surfY, o = {}) {
    const g = ctx.createLinearGradient(0, surfY - 200, 0, H + 300);
    g.addColorStop(0, U.rgb([40, 110, 122]));
    g.addColorStop(0.25, U.rgb([12, 52, 64]));
    g.addColorStop(0.7, U.rgb([4, 18, 26]));
    g.addColorStop(1, U.rgb([1, 5, 8]));
    ctx.fillStyle = g;
    ctx.fillRect(-200, -400, W + 400, H + 800);
    if (surfY > -300) {
      // the underside of the surface: a moving silver skin
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-200, -400);
      ctx.lineTo(W + 200, -400);
      for (let x = W + 200; x >= -200; x -= 30) ctx.lineTo(x, surfY + Math.sin(x * 0.012 + t * 1.3) * 10 + Math.sin(x * 0.031 - t * 2.1) * 5);
      ctx.closePath();
      ctx.fillStyle = U.rgb([90, 170, 180], 0.55);
      ctx.fill();
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(200,245,240,0.18)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 24; i++) {
        const y = surfY - 10 - i * 9;
        ctx.beginPath();
        for (let x = -200; x <= W + 200; x += 40) {
          const yy = y + Math.sin(x * 0.02 + t * (1.5 + i * 0.1) + i) * 6;
          x === -200 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
      // far above the water, something red
      if (o.red) {
        ctx.save();
        ctx.globalAlpha = 0.42;
        FILM.sets.balloon(ctx, (o.lightX ?? 960) + 190 + Math.sin(t * 0.7) * 12, surfY - 70 + Math.sin(t * 1.1) * 6, 16, t);
        ctx.restore();
      }
      // the light he swims toward
      D.glow(ctx, o.lightX ?? 960, surfY - 30, 520, [170, 235, 230], 0.55);
      D.glow(ctx, o.lightX ?? 960, surfY - 20, 120, [235, 255, 250], 0.8);
      D.rays(ctx, t, { x: o.lightX ?? 960, y: surfY - 120, ang: Math.PI / 2, spread: 1.0, len: 1100, n: 9, col: [150, 230, 225], alpha: 0.09, width: 0.05 });
    }
    // marine snow
    D.dust(ctx, t, { n: 90, seed: 31, size: 1.6, col: [170, 220, 220], alpha: 0.35, vx: 2, vy: -6, wob: 14 });
  }

  // bubbles released at given times from a (moving) origin
  function bubbles(ctx, t, bursts, scale = 1) {
    ctx.save();
    for (const b of bursts) {
      const r = U.rng(b.seed || Math.floor(b.t0 * 100));
      for (let i = 0; i < b.n; i++) {
        const delay = r() * (b.spread ?? 0.6);
        const age = t - b.t0 - delay;
        const size = (2 + r() * r() * 16) * scale;
        const v = (140 + r() * 220) * scale;
        if (age < 0 || age > 5) continue;
        const x = b.x + (r() - 0.5) * 40 * scale + Math.sin(age * (3 + r() * 4) + i) * 8 * scale;
        const y = b.y - v * age - 30 * age * age * scale;
        if (y < -100) continue;
        const a = U.clamp(1 - age / 5) * 0.8;
        ctx.strokeStyle = `rgba(200,245,245,${a * 0.7})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath(); ctx.arc(x, y, size, 0, 7); ctx.stroke();
        ctx.fillStyle = `rgba(220,255,255,${a * 0.5})`;
        ctx.beginPath(); ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.25, 0, 7); ctx.fill();
      }
    }
    ctx.restore();
  }

  const PULL_POSE = (k) => ({
    torso: -0.05, neck: -0.45, head: -0.2,
    sL: Math.PI - 0.12 + Math.sin(k * 20) * 0.15, eL: 0.1, sR: Math.PI + 0.2 + Math.sin(k * 17) * 0.2, eR: 0.3,
    hL: 0.15, kL: 0.2, hR: -0.1, kR: 0.35, fL: -1.0, fR: -1.0,
  });

  // one rise-and-pull cycle; u in seconds of "cycle time" (0..11)
  function cycle(ctx, u, t, o = {}) {
    const rise = U.ss(0.5, 9, u);
    const pull = U.easeIn(U.inv(9.2, 10.6, u));
    const y = U.lerp(720, 215, rise) + pull * 640;
    const x = U.lerp(880, 990, rise) + Math.sin(u * 0.7) * 20;
    const surf = 110 + (o.camY || 0);
    ctx.save();
    const sh = pull > 0 && pull < 1 ? D.shake(t, 14, 9, 3) : [0, 0];
    ctx.translate(sh[0], sh[1] + (o.camY || 0));
    sea(ctx, t, surf - (o.camY || 0), { red: true });
    const pose = pull > 0 ? PULL_POSE(u) : C.poses.swim(u, 0.7 + rise * 0.6);
    C.figure(ctx, {
      x, y, h: 330, facing: 1, pose, col: CLOTH, shoe: [18, 18, 20], tint: [TEAL, 0.5], rim: RIM,
    });
    // his breath escaping
    bubbles(ctx, u, [
      { t0: 2, n: 5, x: x + 12, y: y - 250 },
      { t0: 5.5, n: 6, x: x + 14, y: y - 250 },
      { t0: 9.25, n: 40, x: x + 10, y: 200, spread: 0.5 },
    ]);
    ctx.restore();
  }

  function hand(ctx, x, y, t, open) {
    const skin = U.mix(C.pal.manSkin, TEAL, 0.45);
    // sleeve + forearm from below the frame
    ctx.strokeStyle = U.rgb(U.mix(CLOTH.shirt, TEAL, 0.4));
    ctx.lineCap = 'round';
    ctx.lineWidth = 110;
    ctx.beginPath(); ctx.moveTo(x + 420, y + 1100); ctx.lineTo(x + 70, y + 230); ctx.stroke();
    ctx.strokeStyle = U.rgb(U.mul(skin, 0.85));
    ctx.lineWidth = 78;
    ctx.beginPath(); ctx.moveTo(x + 80, y + 250); ctx.lineTo(x + 20, y + 90); ctx.stroke();
    // palm
    ctx.fillStyle = U.rgb(skin);
    ctx.beginPath(); ctx.ellipse(x, y + 40, 62, 80, -0.25, 0, 7); ctx.fill();
    // fingers, spread toward the light
    const f = [[-0.95, 70], [-0.45, 105], [-0.1, 118], [0.25, 108], [0.7, 84]];
    f.forEach(([a, l], i) => {
      const ang = -Math.PI / 2 + a * (0.55 + 0.45 * open) + Math.sin(t * 3 + i) * 0.04;
      const bx = x + Math.cos(ang) * 46, by = y + 30 + Math.sin(ang) * 58;
      const ex = bx + Math.cos(ang) * l, ey = by + Math.sin(ang) * l;
      ctx.strokeStyle = U.rgb(skin);
      ctx.lineWidth = i === 0 ? 30 : 25;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
    });
    // rim from the surface light
    ctx.strokeStyle = 'rgba(180,240,235,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x, y + 40, 62, 80, -0.25, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }

  function drawShot(ctx, t) {
    if (t < 11) {
      cycle(ctx, t, t, { camY: -U.ss(0, 9, t) * 60 });
    } else if (t < 19) {
      const lt = t - 11;
      const surf = 90;
      sea(ctx, t, surf, { lightX: 1010, red: true });
      const reach = U.ss(0, 5.5, lt);
      const pull = U.easeIn(U.inv(5.6, 6.3, lt));
      const hx = 900 + Math.sin(lt * 0.8) * 20, hy = U.lerp(700, 185, reach) + pull * 1100;
      const sh = pull > 0 && pull < 1 ? D.shake(t, 20, 12, 5) : [0, 0];
      ctx.save();
      ctx.translate(sh[0], sh[1]);
      if (hy < H + 200) hand(ctx, hx, hy, t, reach);
      bubbles(ctx, lt, [{ t0: 5.65, n: 60, x: 950, y: 820, spread: 0.8 }, { t0: 1, n: 4, x: 1100, y: 850 }], 1.3);
      ctx.restore();
      if (lt > 7.75) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    } else if (t < 26) {
      // the same moment again, in fragments
      const lt = t - 19;
      const map = [[0, 6.2], [1.6, 7.8], [1.6, 7.0], [2.3, 7.7], [2.3, 7.4], [3.4, 8.5], [3.4, 8.0], [4.4, 9.0], [5.1, 9.7], [7, 11]];
      let u = 6.2;
      for (let i = 0; i < map.length - 1; i++) {
        const [a, ua] = map[i], [b, ub] = map[i + 1];
        if (lt >= a && lt < b) { u = U.lerp(ua, ub, (lt - a) / (b - a)); break; }
      }
      if (lt >= 7) u = 11;
      const jump = map.some(([a]) => a > 0 && lt - a >= 0 && lt - a < 0.07);
      cycle(ctx, u, t, { camY: -40 });
      if (jump) { ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H); }
    } else {
      // from above: sinking away into the dark
      const lt = t - 26;
      const k = lt / 8;
      const g = ctx.createRadialGradient(960, 420, 20, 960, 420, 1100);
      g.addColorStop(0, 'rgb(0,3,6)');
      g.addColorStop(0.45, 'rgb(6,30,40)');
      g.addColorStop(1, 'rgb(30,90,100)');
      ctx.fillStyle = g;
      ctx.fillRect(-100, -100, W + 200, H + 200);
      // rays converge into the abyss
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 0.02;
        const al = 0.05 * (0.5 + 0.5 * U.noise(t * 0.5 + i, 4));
        const gg = ctx.createLinearGradient(960 + Math.cos(a) * 1100, 420 + Math.sin(a) * 1100, 960, 420);
        gg.addColorStop(0, `rgba(150,230,225,${al})`);
        gg.addColorStop(1, 'rgba(150,230,225,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.moveTo(960, 420);
        ctx.lineTo(960 + Math.cos(a - 0.06) * 1300, 420 + Math.sin(a - 0.06) * 1300);
        ctx.lineTo(960 + Math.cos(a + 0.06) * 1300, 420 + Math.sin(a + 0.06) * 1300);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      D.dust(ctx, t, { n: 120, seed: 32, size: 2, col: [170, 220, 220], alpha: 0.3, vx: 0, vy: 0, wob: 30 });
      const hgt = U.lerp(420, 50, U.easeOut(k));
      ctx.save();
      ctx.translate(960, 440);
      ctx.rotate(0.3 + lt * 0.08);
      C.figure(ctx, {
        x: 0, y: hgt * 0.1, h: hgt, facing: 1, pose: PULL_POSE(lt * 0.3), col: CLOTH, shoe: [18, 18, 20],
        tint: [[4, 20, 26], U.lerp(0.45, 0.9, k)], alpha: 1 - U.ss(5.5, 8, lt),
      });
      ctx.restore();
      bubbles(ctx, lt, [{ t0: 0.3, n: 30, x: 960, y: 900, spread: 3 }], 1.6);
    }
  }

  FILM.scene({
    order: 3, num: 3, name: 'Nightmare: drowning', dur: 34,
    dissolve: 2.5, fadeOut: 3,
    post: { grain: 0.12, vignette: 0.75 },
    draw(ctx, t) {
      const b = FILM.buffer('s03');
      drawShot(b.x, t);
      // everything wavers, as through water
      const q = FILM.q, src = b.c, strip = 6;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (let y = 0; y < src.height; y += strip) {
        const off = (Math.sin(y * 0.018 / q + t * 1.2) * 5 + Math.sin(y * 0.05 / q - t * 2) * 2) * q;
        ctx.drawImage(src, 0, y, src.width, strip, off, y, src.width, strip);
      }
      ctx.restore();
    },
    audio(h, fx) {
      h.verb('dream', 0.55);
      const lp = h.filter('lowpass', 700, 0.8);
      lp.connect(h.in);
      // the weight of the water
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 260, gain: 0.2, dest: lp });
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 60, gain: 0.2 });
      const hiss = fx.bed(h, { color: 'pink', type: 'bandpass', f: 1800, Q: 0.6, gain: 0 });
      // near the surface the world almost becomes audible again
      h.param(hiss.g.gain, [[0, 0], [7.5, 0.0], [9.1, 0.05], [9.3, 0], [15, 0], [16.5, 0.06], [16.7, 0], [22.5, 0], [24.3, 0.05], [24.5, 0]]);
      // muffled, fast heart
      for (let T = 0.4; T < 33; T += 0.78) h.at(T, (w) => fx.heartbeat(h, w, { gain: 0.22, dest: lp }));
      // distorted breathing while he rises
      for (const T of [1.2, 4.2, 7.0, 12.0, 14.6, 19.6, 21.2]) h.at(T, (w) => fx.breath(h, w, { dur: 1.2, inhale: false, gain: 0.07, f: 520, rough: 0.7, dest: lp }));
      // bubbles
      fx.scatter(h, 0, 33, 1.3, 77, (w, k) => fx.bubble(h, w, { size: 0.6 + k * 1.4, gain: 0.05, pan: k * 1.4 - 0.7, dest: lp }));
      // each pull: a lurch, a burst of air, a deep drop
      for (const T of [9.2, 16.6, 24.1]) {
        h.at(T - 0.05, (w) => fx.whoosh(h, w, { dur: 1.4, f1: 700, f2: 70, gain: 0.35, color: 'brown' }));
        h.at(T, (w) => fx.thud(h, w, { gain: 0.35, f: 48, d: 0.8 }));
        h.at(T, (w) => { for (let i = 0; i < 18; i++) fx.bubble(h, w + i * 0.035, { size: 0.5 + Math.random() * 1.6, gain: 0.08, pan: Math.random() - 0.5, dest: lp }); });
      }
      // stutter: the same breath, cut short, again and again
      for (const T of [20.6, 21.3, 22.4]) h.at(T, (w) => fx.breath(h, w, { dur: 0.5, inhale: true, gain: 0.08, f: 600, rough: 0.9, dest: lp }));
      // the long sink
      h.at(26, (w) => fx.whoosh(h, w, { dur: 7.5, f1: 300, f2: 50, gain: 0.25, color: 'brown' }));
    },
  });
})();
