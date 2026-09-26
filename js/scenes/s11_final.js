/* Scene 12 — Final moment. He looks at the balloon and smiles for the first time. He opens his hand and
   lets it go: in the memory it slipped away; now he chooses. Home. The door closes softly.
   The same bedroom as the first shot — golden now — and the red balloon passing the window. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const S = FILM.sets;
  const GOLD = [255, 196, 120];
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };
  const balloon = (...a) => S.balloon(...a);

  function goldBg(ctx) {
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
  }

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
      for (let i = 0; i < 6; i++) {
        const y = H - i * 150;
        const x0 = edge(y), sc = U.lerp(1, 0.4, i / 6);
        ctx.fillStyle = 'rgba(40,30,30,0.8)';
        ctx.fillRect(s < 0 ? x0 - 180 * sc : x0 + 40 * sc, y - 90 * sc, 120 * sc, 80 * sc);
        ctx.fillStyle = U.rgb(U.mul(col, 0.75));
        ctx.fillRect(s < 0 ? x0 - 30 * sc : x0, y, 30 * sc * s, 14 * sc);
      }
      const tx = edge(40);
      ctx.fillStyle = 'rgb(30,26,26)';
      ctx.fillRect(tx - (s < 0 ? 60 : 0), 20, 60, 40);
    }
    ctx.strokeStyle = 'rgba(30,26,26,0.7)';
    ctx.lineWidth = 2;
    for (const y of [520, 560]) { ctx.beginPath(); ctx.moveTo(200, y); ctx.quadraticCurveTo(960, y + 40, 1720, y - 20); ctx.stroke(); }
  }

  function door(ctx, lt, open) {
    D.vgrad(ctx, -100, -100, W + 200, H + 200, [[0, [58, 48, 42]], [1, [36, 30, 28]]]);
    ctx.fillStyle = 'rgb(46,38,34)';
    ctx.fillRect(-100, 640, W + 200, 300);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,190,120,${0.12 * (1 - U.ss(4, 7, lt))})`;
    D.poly(ctx, [[180, 180], [360, 150], [420, 640], [230, 660]]);
    ctx.fill();
    ctx.restore();
    const f = { fx0: 760, fx1: 1160, fy0: 110, fy1: 650 };
    ctx.fillStyle = 'rgb(30,24,22)';
    ctx.fillRect(f.fx0 - 26, f.fy0 - 26, f.fx1 - f.fx0 + 52, f.fy1 - f.fy0 + 26);
    ctx.fillStyle = 'rgb(210,176,130)';
    ctx.fillRect(f.fx0, f.fy0, f.fx1 - f.fx0, f.fy1 - f.fy0);
    if (open > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,200,140,${0.18 * open})`;
      D.poly(ctx, [[f.fx0, f.fy1], [f.fx0 + (f.fx1 - f.fx0) * open, f.fy1], [f.fx0 + (f.fx1 - f.fx0) * open + 300 * open, H], [f.fx0 - 120, H]]);
      ctx.fill();
      ctx.restore();
    }
    return f;
  }

  function doorLeaf(ctx, f, open) {
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
    order: 11, num: 12, name: 'Final moment', dur: 40,
    fadeOut: 4,
    post: (t) => ({ grain: 0.07, vignette: t > 24 && t < 31 ? 0.6 : 0.4 }),
    draw(ctx, t) {
      if (t < 7) {
        // he looks at the balloon in his hand — and, for the first time, smiles
        const lt = t;
        goldBg(ctx);
        balloon(ctx, 1360 + Math.sin(lt * 1.1) * 14, 150 + Math.sin(lt * 1.6) * 10, 95, t, [1260, 900]);
        const smile = U.ss(2.4, 5.2, lt);
        C.head(ctx, {
          x: 820, y: 470, s: 450, yaw: 0.5, pitch: 0.33, gaze: [0.55, -0.7],
          eye: 0.9 - 0.2 * U.ss(2.8, 5.2, lt), smile, tired: 0.5, glisten: 0.5 * U.ss(3, 6, lt), skin: C.pal.manSkin, shirt: OUT.shirt,
          light: { dx: 0.9, dy: -0.6, col: GOLD, amt: 0.45 }, shadow: 0.45, shade: [70, 40, 30],
        });
        return;
      }
      if (t < 11) {
        // he opens his hand
        const lt = t - 7;
        goldBg(ctx);
        const open = U.ss(1.0, 1.8, lt);
        const rise = U.easeIn(U.inv(1.6, 4, lt)) * 900;
        ctx.strokeStyle = 'rgba(250,240,220,0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(955, 470 - rise);
        ctx.bezierCurveTo(965, 300 - rise, 935, 140 - rise, 960, -60 - rise);
        ctx.stroke();
        C.hand(ctx, { x: 960, y: 600, s: 230, rot: 0, curl: U.lerp(0.85, 0.05, open), spread: open * 0.8, thumb: U.lerp(0.2, -0.9, open), skin: C.pal.manSkin, sleeve: OUT.shirt });
        return;
      }
      if (t < 19) {
        // it rises between the buildings
        const lt = t - 11;
        const b = FILM.buffer('s11');
        lookUp(b.x, t);
        ctx.save();
        D.cam(ctx, 960, 402, 1.05, lt * 0.012);
        D.buf(ctx, b);
        ctx.restore();
        const k = U.easeOut(lt / 8);
        const bx = U.lerp(930, 1000, k) + Math.sin(lt * 0.8) * 16, by = U.lerp(620, 230, k);
        balloon(ctx, bx, by, U.lerp(60, 15, k), t, [bx + 10, by + U.lerp(240, 70, k)]);
        S.birds(ctx, t, 5, 111);
        return;
      }
      if (t < 24) {
        // watching it go
        const lt = t - 19;
        goldBg(ctx);
        const down = U.ss(3.2, 4.6, lt);
        C.head(ctx, {
          x: 900 + lt * 4, y: 440, s: 470, yaw: 0.42, pitch: 0.36 - 0.24 * down, gaze: [0.25, -0.8 + 0.6 * down],
          eye: 0.78, smile: 0.9, tired: 0.45, skin: C.pal.manSkin, shirt: OUT.shirt,
          light: { dx: 0.9, dy: -0.6, col: GOLD, amt: 0.45 }, shadow: 0.45, shade: [70, 40, 30],
        });
        return;
      }
      if (t < 31) {
        // home: in, the door closed softly
        const lt = t - 24;
        const open = U.ss(0.3, 1.4, lt) * (1 - U.ss(3.4, 4.5, lt));
        const f = door(ctx, lt, open);
        if (lt > 0.9 && lt < 4.4) {
          const z = U.ss(0.9, 3.2, lt);
          C.figure(ctx, {
            x: U.lerp(960, 1300, z), y: U.lerp(410, 470, z), h: U.lerp(520, 760, z), view: 'front', pose: { liftL: Math.max(0, Math.sin(lt * 6)), liftR: Math.max(0, -Math.sin(lt * 6)) },
            col: OUT, shoe: [30, 26, 24], tint: [[40, 30, 26], 0.25], rim: { col: GOLD, dx: 0, dy: -2, a: 0.5 }, alpha: 1 - U.ss(3.4, 4.3, lt),
          });
        }
        doorLeaf(ctx, f, open);
        return;
      }
      // the room where the night began — golden now. He rests. The balloon passes the window.
      const lt = t - 31;
      const k = U.easeInOut(lt / 9);
      S.bedroom(ctx, t, {
        warm: 1, golden: 1, man: 'lying', eye: U.lerp(0.5, 0.05, U.ss(1, 5, lt)), clock: '17:40', sway: 0.6,
        cam: { x: U.lerp(1000, 1180, k), y: U.lerp(402, 380, k), z: U.lerp(1.0, 1.12, k) },
        windowBalloon: { u: U.lerp(0.1, 0.95, U.ss(1.5, 8, lt)), v: U.lerp(1.1, -0.25, U.ss(1.5, 8, lt)), r: 20 },
      });
    },
    audio(h, fx) {
      h.verb('street', 0.3);
      const street = fx.bed(h, { color: 'brown', type: 'bandpass', f: 380, Q: 0.5, gain: 0.05 });
      h.param(street.g.gain, [[0, 0.05], [24, 0.05], [24.5, 0.03], [28.6, 0.012], [31, 0.015], [40, 0.01]]);
      const wd = fx.wind(h, { from: 0, to: 42, gain: 0.06, f: 800, seed: 11 });
      h.param(wd.g.gain, [[0, 0.05], [24, 0.05], [28.6, 0.01], [31, 0.03], [40, 0.02]]);
      fx.scatter(h, 0.3, 24, 1.2, 112, (w, k) => fx.bird(h, w, { gain: 0.035, pan: k * 1.6 - 0.8, base: 3600 + k * 1400 }));
      fx.scatter(h, 31, 40, 0.6, 113, (w, k) => fx.bird(h, w, { gain: 0.02, pan: 0.6, base: 3200 + k * 1400 }));
      // a breath out, almost a laugh
      h.at(3.6, (w) => fx.breath(h, w, { dur: 1.3, inhale: false, gain: 0.06, f: 750 }));
      // the string leaving his fingers
      h.at(8.7, (w) => { fx.tone(h, w, { type: 'triangle', f: 600, f2: 900, a: 0.02, d: 0.35, gain: 0.018 }); fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2400, Q: 2, d: 0.25, gain: 0.035 }); });
      // keys, the door, his steps, the soft close
      h.at(24.0, (w) => { for (let i = 0; i < 5; i++) fx.ring(h, w + i * 0.05, { f: 4200 + Math.random() * 1500, partials: [1, 1.6], decay: [0.12, 0.06], gain: 0.02 }); });
      h.at(24.4, (w) => fx.tone(h, w, { type: 'sawtooth', f: 160, f2: 120, d: 0.8, gain: 0.012, lp: 800 }));
      for (const T of [25.2, 25.8, 26.4, 27.0]) h.at(T, (w) => fx.footstep(h, w, { gain: 0.12, hard: 0.5 }));
      h.at(28.6, (w) => fx.doorClose(h, w, { gain: 0.25, soft: true }));
      // the bedroom: a long, easy breath
      h.at(33, (w) => fx.breath(h, w, { dur: 2.6, inhale: true, gain: 0.035, f: 800 }));
      h.at(35.8, (w) => fx.breath(h, w, { dur: 3.2, inhale: false, gain: 0.04, f: 700 }));
    },
  });

  // ending: the title, a dedication, and a note on how the film was made
  const AR = 'Amiri, "Noto Naskh Arabic", "Geeza Pro", "Arial", serif';
  FILM.scene({
    order: 12, name: 'End', dur: 25,
    post: { grain: 0.05, vignette: 0 },
    draw(ctx, t) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // حنين
      const a = U.win(t, 0.8, 7.6, 1.8, 1.4);
      if (a > 0) {
        ctx.fillStyle = `rgba(232,222,206,${a})`;
        ctx.font = `400 130px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('حنين', W / 2, H / 2 - 20);
        ctx.fillStyle = `rgba(214,204,190,${a * 0.6})`;
        ctx.font = '300 18px Georgia, "Times New Roman", serif';
        ctx.direction = 'ltr';
        ctx.fillText('N O S T A L G I A', W / 2, H / 2 + 88);
        S.balloon(ctx, W / 2 + 170, U.lerp(H / 2 - 40, H / 2 - 110, t / 8), 9, t, [W / 2 + 172, U.lerp(H / 2 + 5, H / 2 - 65, t / 8)], a * 0.9);
      }
      // the dedication
      const b = U.win(t, 8.2, 16.4, 1.6, 1.4);
      if (b > 0) {
        ctx.fillStyle = `rgba(232,222,206,${b * 0.95})`;
        ctx.font = `400 46px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('إلى الأجيال التي لا زالت', W / 2, H / 2 - 34);
        ctx.direction = 'rtl';
        ctx.fillText('تبحث عن بالونها.', W / 2, H / 2 + 38);
      }
      // a short note, last
      const c = U.win(t, 17.0, 24.8, 1.2, 1.6);
      if (c > 0) {
        ctx.fillStyle = `rgba(200,192,180,${c * 0.8})`;
        ctx.font = `400 30px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('صُنع بالكامل بالذكاء الاصطناعي · Claude', W / 2, H / 2 - 14);
        ctx.fillStyle = `rgba(200,192,180,${c * 0.55})`;
        ctx.font = '300 20px Georgia, "Times New Roman", serif';
        ctx.direction = 'ltr';
        ctx.fillText('Made entirely with AI · Claude', W / 2, H / 2 + 34);
      }
    },
  });
})();
