/* Scene 10 — Work. The day is the night again, in daylight clothes: the coffee comes in the finjan that chased him,
   the office aisle is the corridor, the paper stack grows back however much he clears, and the office fills like
   the sea until he closes his eyes. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };
  const SHOE = [30, 26, 24];
  const PAPER = [236, 232, 222];

  // two-link reach toward a target (side view, facing +1)
  function reach(sh, target, L1, L2) {
    const vx = target[0] - sh[0], vy = target[1] - sh[1];
    const dist = Math.min(Math.hypot(vx, vy), (L1 + L2) * 0.98);
    const a = Math.atan2(vx, vy);
    const e = Math.PI - Math.acos(U.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
    const b = Math.asin(U.clamp((L2 * Math.sin(e)) / dist, -1, 1));
    return [a - b, e];
  }

  /* ------------------------------------------------ A: the coffee kiosk */
  function kiosk(ctx, t, lt) {
    // morning street behind, out of focus
    D.buf(ctx, FILM.slowLayer('work-kiosk', 1, (x) => {
      D.vgrad(x, -100, -100, W + 200, H + 200, [[0, [196, 206, 214]], [1, [170, 160, 146]]]);
      x.filter = `blur(${16 * FILM.q}px)`;
      x.fillStyle = 'rgb(206,190,160)'; x.fillRect(-100, -100, 700, H + 200);
      x.fillStyle = 'rgb(150,140,126)'; x.fillRect(1500, 60, 520, H);
      x.fillStyle = 'rgb(60,96,80)'; x.fillRect(560, 40, 900, 110);
    }));
    // the kiosk counter and its brass coffee urn
    ctx.fillStyle = 'rgb(112,78,50)';
    ctx.fillRect(-100, 560, W + 200, 300);
    ctx.fillStyle = 'rgb(136,98,64)';
    ctx.fillRect(-100, 548, W + 200, 22);
    const g = ctx.createLinearGradient(150, 0, 380, 0);
    g.addColorStop(0, '#f0cc7a'); g.addColorStop(0.5, '#c28a3a'); g.addColorStop(1, '#6d4a1e');
    ctx.fillStyle = g;
    D.curve(ctx, [[180, 548], [150, 420], [200, 300], [265, 250], [330, 300], [380, 420], [350, 548]]);
    ctx.fill();
    ctx.fillRect(250, 210, 30, 50);
    ctx.fillStyle = 'rgba(255,250,240,0.12)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let k = 0; k < 8; k++) { const y = 200 - k * 22, x = 262 + Math.sin(k * 0.7 + t * 1.3 + i) * 12 + i * 8; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,250,240,0.12)'; ctx.stroke();
    }
    // a row of finjans on the counter
    for (let i = 0; i < 5; i++) FILM.sets.finjan(ctx, 470 + i * 70, 520, 46, i * 0.9, 0.35, 0);
    // the seller's hand gives; his hand takes
    const give = U.ss(0.2, 1.6, lt), take = U.ss(1.8, 2.6, lt);
    const cx = U.lerp(700, 1020, give) + take * 60, cy = U.lerp(470, 440, give) - take * 20;
    C.hand(ctx, { x: U.lerp(560, 900, give) - take * 200, y: cy + 60, s: 150, rot: 1.45, curl: U.lerp(0.7, 0.2, take), thumb: 0.5, skin: [150, 104, 76], sleeve: [150, 140, 120] });
    FILM.sets.finjan(ctx, cx, cy, 90, t * 0.2, 0.35, 0.4);
    const mt = U.ss(1.4, 2.4, lt);
    C.hand(ctx, { x: U.lerp(1500, cx + 110, mt), y: cy + 70, s: 170, rot: -1.5, curl: U.lerp(0.2, 0.75, take), thumb: -0.4, skin: OUT.skin, sleeve: OUT.shirt });
  }

  /* ------------------------------------- B: the cup — it is that cup */
  function cupClose(ctx, t, lt) {
    D.vgrad(ctx, -100, -100, W + 200, H + 200, [[0, [70, 62, 58]], [1, [40, 34, 32]]]);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 960, 380, 520, [255, 236, 210], 0.12);
    ctx.restore();
    // just a cup of coffee in his hand; he looks at it a moment too long
    const z = 1 + lt * 0.02;
    ctx.save();
    D.cam(ctx, 960, 402, z);
    FILM.sets.finjan(ctx, 960, 430, 420, 0.6, 0.55, 0.6);
    ctx.strokeStyle = 'rgba(255,250,240,0.16)';
    ctx.lineWidth = 14;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let k = 0; k < 10; k++) { const y = 220 - k * 26, x = 930 + i * 30 + Math.sin(k * 0.6 + t * 1.4 + i) * 16; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    C.hand(ctx, { x: 1225, y: 520, s: 230, rot: -1.5, curl: 0.72, thumb: -0.5, skin: OUT.skin, sleeve: OUT.shirt });
    ctx.restore();
  }

  /* --------------------------------------------- C: the office aisle */
  function aisle(ctx, t, lt) {
    const f = 700 - lt * 18, cx = 960, cy = 380;
    const stretch = 1 + lt * 0.05;
    const pr = (X, Y, Z) => [cx + (X * f) / Z, cy + (Y * f) / Z];
    const quad = (pts, c) => { ctx.fillStyle = c; D.poly(ctx, pts); ctx.fill(); };
    const zN = 0.4, zE = 44 * stretch;
    ctx.fillStyle = '#20242a'; ctx.fillRect(0, 0, W, H);
    quad([pr(-4, -1.3, zN), pr(4, -1.3, zN), pr(4, -1.3, zE), pr(-4, -1.3, zE)], 'rgb(196,200,200)');
    quad([pr(-4, 1.5, zN), pr(4, 1.5, zN), pr(4, 1.5, zE), pr(-4, 1.5, zE)], 'rgb(92,98,104)');
    for (const s of [-1, 1]) {
      quad([pr(s * 4, -1.3, zN), pr(s * 4, -1.3, zE), pr(s * 4, 1.5, zE), pr(s * 4, 1.5, zN)], 'rgb(176,182,184)');
      // windows along the side walls
      for (let z = 3; z < zE; z += 5 * stretch) quad([pr(s * 4, -0.9, z), pr(s * 4, -0.9, z + 3 * stretch), pr(s * 4, 0.6, z + 3 * stretch), pr(s * 4, 0.6, z)], 'rgb(226,234,240)');
    }
    quad([pr(-4, -1.3, zE), pr(4, -1.3, zE), pr(4, 1.5, zE), pr(-4, 1.5, zE)], 'rgb(150,156,160)');
    // carpet tiles scrolling under his steps
    ctx.strokeStyle = 'rgba(40,44,50,0.35)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 60; k++) {
      const z = (k * 1.2 - (lt * 1.1) % 1.2) * stretch;
      if (z < zN) continue;
      const a = pr(-4, 1.5, z), b = pr(4, 1.5, z);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // desks and cubicle walls on both sides of the aisle, far to near
    for (let i = 20; i >= 0; i--) {
      const z0 = (1.5 + i * 2.4) * stretch, z1 = z0 + 2.0 * stretch;
      for (const s of [-1, 1]) {
        quad([pr(s * 1.1, 0.25, z0), pr(s * 1.1, 0.25, z1), pr(s * 1.1, 1.5, z1), pr(s * 1.1, 1.5, z0)], U.rgb(s < 0 ? [120, 128, 136] : [108, 116, 124]));
        quad([pr(s * 1.15, 0.72, z0 + 0.2), pr(s * 3, 0.72, z0 + 0.2), pr(s * 3, 0.72, z1 - 0.2), pr(s * 1.15, 0.72, z1 - 0.2)], 'rgb(210,204,190)');
        quad([pr(s * 2.2, -0.05, z0 + 0.8), pr(s * 2.2, -0.05, z0 + 1.4), pr(s * 2.2, 0.62, z0 + 1.4), pr(s * 2.2, 0.62, z0 + 0.8)], 'rgb(34,38,44)');
        // paper stacks everywhere
        const ps = pr(s * 1.7, 0.72, z0 + 0.6), ph = (0.3 + (i % 3) * 0.12) * f / (z0 + 0.6);
        ctx.fillStyle = U.rgb(PAPER);
        ctx.fillRect(ps[0] - 0.18 * f / (z0 + 0.6), ps[1] - ph, 0.36 * f / (z0 + 0.6), ph);
      }
    }
    // the tubes — one of them stutters
    for (let j = 14; j >= 0; j--) {
      const z = (2 + j * 3) * stretch;
      const on = !(j === 2 && U.noise(t * 9, 3) < -0.2);
      quad([pr(-0.6, -1.28, z - 0.08), pr(0.6, -1.28, z - 0.08), pr(0.6, -1.28, z + 0.08), pr(-0.6, -1.28, z + 0.08)], on ? 'rgb(240,248,244)' : 'rgb(120,126,124)');
    }
    const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700);
    fog.addColorStop(0, 'rgba(40,46,52,0.55)'); fog.addColorStop(1, 'rgba(40,46,52,0)');
    ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);
    // him, walking away down the aisle with his cup
    const Z = 2.6 + lt * 1.05;
    const foot = pr(0, 1.5, Z), sc = f / Z;
    const ph = lt * Math.PI * 2 / 1.05, sw = Math.sin(ph);
    C.figure(ctx, {
      x: foot[0], y: foot[1] - 0.49 * 1.75 * sc, h: 1.75 * sc, view: 'back', col: OUT, shoe: SHOE,
      pose: { liftL: Math.max(0, sw), liftR: Math.max(0, -sw), swingL: sw, swingR: -sw * 0.2 },
    });
  }

  /* --------------------------------------------- D: the desk, all day */
  const CYCLE = 1.5;
  function desk(ctx, t, lt, o = {}) {
    const day = U.inv(0, 14, lt); // 09:00 → 17:00
    // room: wall, window with the day changing, clock
    const wall = U.mix([168, 172, 170], [186, 166, 140], day);
    ctx.fillStyle = U.rgb(wall);
    ctx.fillRect(-100, -100, W + 200, H + 200);
    ctx.fillStyle = U.rgb(U.mix([214, 226, 236], [255, 214, 160], day));
    ctx.fillRect(1250, 80, 420, 340);
    ctx.strokeStyle = 'rgb(120,124,126)';
    ctx.lineWidth = 10;
    ctx.strokeRect(1250, 80, 420, 340);
    ctx.beginPath(); ctx.moveTo(1460, 80); ctx.lineTo(1460, 420); ctx.stroke();
    // the city beyond the window
    ctx.fillStyle = U.rgb(U.mix([176, 184, 190], [214, 170, 120], day));
    ctx.fillRect(1256, 300, 200, 114); ctx.fillRect(1466, 260, 198, 154);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 1460, 250, 700, U.mix([220, 230, 240], [255, 196, 120], day), 0.35);
    ctx.restore();
    // wall clock, racing
    const hrs = 9 + 8 * day;
    const ccx = 1000, ccy = 170;
    ctx.fillStyle = 'rgb(240,238,232)';
    ctx.beginPath(); ctx.arc(ccx, ccy, 62, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgb(50,50,54)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.lineCap = 'round';
    const ha = (hrs / 12) * Math.PI * 2 - Math.PI / 2, ma = ((hrs % 1) * Math.PI * 2) - Math.PI / 2;
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(ha) * 32, ccy + Math.sin(ha) * 32); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(ma) * 50, ccy + Math.sin(ma) * 50); ctx.stroke();
    // floor
    ctx.fillStyle = 'rgb(90,94,100)';
    ctx.fillRect(-100, 700, W + 200, 200);
    // chair
    ctx.fillStyle = 'rgb(36,38,44)';
    ctx.fillRect(420, 350, 26, 210);
    ctx.fillRect(420, 540, 190, 22);
    ctx.fillRect(505, 560, 14, 120);
    ctx.fillRect(450, 680, 120, 10);

    // the paper: what he has done, and what is still waiting (which never gets smaller)
    const cycles = Math.max(0, lt / CYCLE);
    const n = Math.floor(cycles), ph = cycles - n;
    const dumps = [4.2, 7.4, 9.6].filter((d) => lt > d).length;
    const done = Math.min(26, n) * 5 + (lt > 14 ? 0 : 0);
    const waiting = 70 + n * 3 + dumps * 45 + U.ss(0, 0.3, lt % 4) * 0;
    // desk top
    ctx.fillStyle = 'rgb(186,162,128)';
    ctx.fillRect(560, 470, 1000, 18);
    // the monitor
    ctx.fillStyle = 'rgb(30,32,36)';
    ctx.fillRect(1030, 300, 180, 130); ctx.fillRect(1110, 430, 20, 40);
    ctx.fillStyle = U.rgb(U.mix([110, 140, 170], [150, 160, 170], day), 0.9);
    ctx.fillRect(1040, 310, 160, 110);
    // stacks
    const stack = (x, hgt, w = 120, seed = 1) => {
      const r = U.rng(seed);
      for (let y = 0; y < hgt; y += 5) {
        ctx.fillStyle = U.rgb(U.mul(PAPER, 0.92 + r() * 0.08));
        ctx.fillRect(x + (r() - 0.5) * 6, 470 - y - 5, w, 5);
      }
      ctx.strokeStyle = 'rgba(120,110,100,0.35)';
      ctx.lineWidth = 1;
      for (let y = 0; y < hgt; y += 5) { ctx.beginPath(); ctx.moveTo(x, 470 - y); ctx.lineTo(x + w, 470 - y); ctx.stroke(); }
    };
    stack(890, waiting, 120, 7);
    stack(655, done, 110, 9);
    // an arm from outside the frame drops more on the pile
    for (const d of [4.2, 7.4, 9.6]) {
      const k = U.win(lt, d - 0.7, d + 0.6, 0.5, 0.5);
      if (k <= 0.01) continue;
      const topY = 470 - waiting;
      C.hand(ctx, { x: U.lerp(1700, 1060, k), y: topY - 40, s: 150, rot: -1.5, curl: 0.2, thumb: -0.3, skin: [160, 116, 86], sleeve: [110, 116, 130] });
      if (lt < d) { ctx.fillStyle = U.rgb(PAPER); ctx.fillRect(U.lerp(1600, 950, k), topY - 60, 140, 40); }
    }

    // him, at work: take a sheet, stamp it, put it on the done pile — again
    const hipX = 520, hipY = 540, h = 700;
    const tau = o.rest ? U.lerp(0.32, -0.02, o.rest) : 0.32 + (o.freeze ? 0 : 0.03 * Math.sin(lt * 2));
    const shx = hipX + Math.sin(tau) * 0.29 * h, shy = hipY - Math.cos(tau) * 0.29 * h;
    const pIn = [920, 470 - waiting - 6], pMid = [800, 455], pDone = [700, 470 - done - 8];
    let target, carrying = false;
    if (o.freeze) { target = [790, 460]; }
    else if (ph < 0.3) target = [U.lerp(pDone[0], pIn[0], U.smooth(ph / 0.3)), U.lerp(pDone[1], pIn[1], U.smooth(ph / 0.3)) - Math.sin(ph / 0.3 * Math.PI) * 30];
    else if (ph < 0.5) { carrying = true; const k = U.smooth((ph - 0.3) / 0.2); target = [U.lerp(pIn[0], pMid[0], k), U.lerp(pIn[1], pMid[1], k)]; }
    else if (ph < 0.7) { carrying = true; target = [pMid[0], pMid[1] - Math.abs(Math.sin((ph - 0.5) / 0.2 * Math.PI * 2)) * 26]; }
    else { carrying = true; const k = U.smooth((ph - 0.7) / 0.3); target = [U.lerp(pMid[0], pDone[0], k), U.lerp(pMid[1], pDone[1], k)]; }
    const [sA, eA] = reach([shx, shy], target, 0.165 * h, 0.18 * h);
    const up = o.lookUp || 0;
    const rest = o.rest || 0, rub = o.rub || 0;
    const res = C.figure(ctx, {
      x: hipX, y: hipY, h, facing: 1, col: OUT, shoe: SHOE,
      pose: {
        torso: tau - up * 0.25, neck: U.lerp(0.3 - up * 0.9, 0.05 - 0.25 * (1 - rub), rest), head: U.lerp(0.1 - up * 0.4, 0.1, rest),
        sL: U.lerp(sA, 0.55, rest), eL: U.lerp(eA, 2.2 * rub + 0.5 * (1 - rub), rest), sR: U.lerp(0.9, 0.35, rest), eR: U.lerp(0.9, 0.6, rest),
        hL: 1.5, kL: 1.45, hR: 1.45, kR: 1.4,
      },
    });
    if (carrying && !rest) {
      const hx = hipX + res.hands[0][0], hy = hipY + res.hands[0][1];
      ctx.fillStyle = U.rgb(PAPER);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.1); ctx.fillRect(-60, -8, 120, 10); ctx.restore();
    }
    // the desk apron in front of his knees
    ctx.fillStyle = 'rgb(150,128,100)';
    ctx.fillRect(560, 488, 1000, 40);
    ctx.fillStyle = 'rgb(120,100,78)';
    ctx.fillRect(1480, 528, 30, 172);
    // the finjan from the kiosk, empty now, at the edge of the desk
    FILM.sets.finjan(ctx, 1320, 452, 34, 0.7, 0.35, 0);
  }

  FILM.scene({
    order: 9.5, num: 10, name: 'Work', dur: 34,
    dissolve: 1.2, fadeOut: 1.8,
    post: { grain: 0.08, vignette: 0.45 },
    draw(ctx, t) {
      if (t < 4.5) { kiosk(ctx, t, t); return; }
      if (t < 9.5) { cupClose(ctx, t, t - 4.5); return; }
      if (t < 15.5) { aisle(ctx, t, t - 9.5); return; }
      // the day goes; the pile stays. At last he stops, leans back, rubs his eyes, looks at the late light
      const lt = t - 15.5;
      const rest = U.ss(10.4, 11.8, lt), rub = U.win(lt, 11.4, 15.2, 0.8, 1.2);
      desk(ctx, t, Math.min(lt, 10.6), { rest, rub });
      D.screen(ctx, 'rgb(255,190,120)', 0.12 * U.ss(10, 16, lt), 'soft-light');
    },
    audio(h, fx) {
      h.verb('room', 0.3);
      // kiosk: street and coffee
      const street = fx.bed(h, { color: 'brown', type: 'bandpass', f: 420, Q: 0.5, gain: 0 });
      h.param(street.g.gain, [[0, 0.06], [9.3, 0.06], [9.6, 0]]);
      fx.scatter(h, 0, 9, 1, 121, (w, k) => fx.bird(h, w, { gain: 0.03, pan: k - 0.5 }));
      h.at(0.3, (w) => fx.whoosh(h, w, { dur: 1.2, f1: 700, f2: 1400, gain: 0.04, color: 'white' })); // pouring
      h.at(1.7, (w) => fx.porcelain(h, w, { pitch: 1.1, gain: 0.06 }));
      // the cup in his hand: an ordinary sound, held a beat too long
      h.at(5.2, (w) => fx.porcelain(h, w, { pitch: 1.05, gain: 0.05 }));
      // office: the same fluorescent buzz as the corridor, his steps echoing a little too long
      const buzz = fx.hum(h, { f: 100, gain: 0, harm: [1, 0.6, 0.5, 0.4, 0.3], lp: 2400 });
      h.param(buzz.gain, [[0, 0], [9.4, 0], [9.6, 0.016], [29.2, 0.016], [29.3, 0], [29.5, 0.006], [34, 0.006]]);
      const room = fx.bed(h, { color: 'pink', type: 'lowpass', f: 700, gain: 0 });
      h.param(room.g.gain, [[0, 0], [9.4, 0], [9.6, 0.03], [34, 0.03]]);
      for (let T = 9.8; T < 15.4; T += 0.52) h.at(T, (w) => { fx.footstep(h, w, { gain: 0.14, hard: 0.6 }); fx.footstep(h, w + 0.34, { gain: 0.04, hard: 0.6 }); });
      fx.scatter(h, 9.6, 25, 3, 122, (w, k) => fx.click(h, w, { gain: 0.02, f: 3500 + k * 2000, pan: k * 1.4 - 0.7 })); // keyboards far off
      h.at(12, (w) => { for (let i = 0; i < 2; i++) fx.tone(h, w + i * 0.4, { type: 'square', f: 880, d: 0.25, gain: 0.006, lp: 1400 }); }); // a phone, far
      // desk: sheet, stamp, sheet, stamp... and the pile dropped on again
      for (let T = 15.5; T < 25.3; T += CYCLE) {
        h.at(T + 0.4, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 3000, Q: 0.7, a: 0.04, d: 0.18, gain: 0.04 }));
        h.at(T + 0.85, (w) => fx.thud(h, w, { gain: 0.14, f: 140, d: 0.08 }));
        h.at(T + 1.3, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2600, Q: 0.7, a: 0.03, d: 0.15, gain: 0.03 }));
      }
      for (const d of [4.2, 7.4, 9.6]) h.at(15.5 + d, (w) => { fx.thud(h, w, { gain: 0.25, f: 90, d: 0.2 }); fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2000, Q: 0.5, d: 0.4, gain: 0.06 }); });
      // the clock racing
      for (let T = 15.6; T < 25.3; T += 0.25) h.at(T, (w) => fx.tick(h, w, { gain: 0.025, pitch: 0.8 }));
      // he stops: the chair gives, a long breath out
      h.at(26.0, (w) => { fx.ring(h, w, { f: 520, partials: [1, 1.6], decay: [0.3, 0.2], gain: 0.03 }); fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 900, d: 0.3, gain: 0.03 }); });
      h.at(27.2, (w) => fx.breath(h, w, { dur: 2.4, inhale: false, gain: 0.06, f: 700 }));
      fx.scatter(h, 30, 34, 0.8, 124, (w, k) => fx.bird(h, w, { gain: 0.02, pan: 0.7 }));
    },
  });
})();
