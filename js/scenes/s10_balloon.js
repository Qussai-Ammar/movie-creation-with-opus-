/* Scene 10 — The red balloon. Golden afternoon; a boy near the entrance lets go; the man watches it rise. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const ST = FILM.sets.street;
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };
  const BOY = { skin: C.pal.boySkin, shirt: [238, 232, 214], pants: [70, 80, 100], hair: C.pal.hair };
  const GOLD = [255, 196, 120];

  // the only saturated red in the film
  function balloon(ctx, x, y, r, t, end) {
    if (end) {
      ctx.strokeStyle = 'rgba(250,240,220,0.7)';
      ctx.lineWidth = Math.max(1, r * 0.03);
      ctx.beginPath();
      ctx.moveTo(x, y + r * 1.15);
      ctx.bezierCurveTo(x + Math.sin(t * 2) * r * 0.4, y + r * 2, end[0] - Math.sin(t * 1.5) * r * 0.3, end[1] - r, end[0], end[1]);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.1);
    g.addColorStop(0, 'rgb(255,120,110)');
    g.addColorStop(0.35, 'rgb(222,24,32)');
    g.addColorStop(1, 'rgb(120,6,14)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.16, Math.sin(t * 1.3) * 0.08, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgb(150,10,18)';
    ctx.beginPath(); ctx.moveTo(x - r * 0.1, y + r * 1.22); ctx.lineTo(x + r * 0.1, y + r * 1.22); ctx.lineTo(x, y + r * 1.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.45, r * 0.16, r * 0.26, -0.5, 0, 7); ctx.fill();
    // golden rim from the low sun
    ctx.strokeStyle = 'rgba(255,210,140,0.5)';
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.97, r * 1.13, 0, -2.6, -1.0); ctx.stroke();
  }
  FILM.sets.balloon = balloon;

  function goldSky(ctx, top = 0) {
    ctx.fillStyle = 'rgb(120,150,190)';
    ctx.fillRect(-100, -100, W + 200, H + 200);
    D.vgrad(ctx, -100, top - 200, W + 200, H + 400, [[0, [120, 150, 190]], [0.45, [236, 180, 120]], [1, [255, 214, 150]]]);
  }

  FILM.scene({
    order: 10, num: 10, name: 'The red balloon', dur: 30,
    fadeIn: 2.5,
    post: { grain: 0.07, vignette: 0.45 },
    draw(ctx, t) {
      if (t < 10) {
        const Z = U.lerp(34, 11.5, t / 10);
        const ph = t * Math.PI * 2 / 1.05;
        const s = Math.sin(ph);
        const bob = Math.sin(t * 1.4) * 0.08;
        const people = [
          {
            X: 3.9, Z, draw: (c, x, y, sc, haze) => C.figure(c, {
              x, y: y - 0.49 * 1.75 * sc, h: 1.75 * sc, view: 'front', pose: { liftL: Math.max(0, s), liftR: Math.max(0, -s), swingL: s, swingR: -s },
              col: OUT, shoe: [30, 26, 24], tint: [[90, 50, 40], 0.45 + haze * 0.3], rim: { col: GOLD, dx: 0, dy: -2 },
            }),
          },
          {
            X: 4.5, Z: 7.9, draw: (c, x, y, sc) => {
              const res = C.figure(c, {
                x, y: y - 0.5 * 1.15 * sc, h: 1.15 * sc, kind: 'boy', facing: -1, sleeves: 'short', col: BOY, shoe: [50, 50, 60],
                pose: { sL: 2.3, eL: 0.2, sR: 0.1, eR: 0.2, neck: -0.2 }, tint: [[90, 50, 40], 0.35], rim: { col: GOLD, dx: -2, dy: -1 },
              });
              const hand = [x + res.hands[0][0], y - 0.5 * 1.15 * sc + res.hands[0][1]];
              balloon(c, hand[0] - 0.1 * sc, hand[1] - (0.9 + bob) * sc, 0.2 * sc, t, hand);
            },
          },
        ];
        ST.draw(ctx, t, { mode: 'golden', cam: { z: -1, y: 0.25 }, shutters: 0.9, people });
        FILM.sets.birds(ctx, t, 5, 101);
        return;
      }
      if (t < 17) {
        // the boy and his balloon by the entrance
        const lt = t - 10;
        goldSky(ctx, -300);
        // building wall + arched door
        ctx.fillStyle = D.lgrad(ctx, 0, 0, W, 0, [[0, [196, 150, 106]], [1, [150, 104, 76]]]);
        ctx.fillRect(560, -50, W, H + 100);
        ctx.strokeStyle = 'rgba(110,80,60,0.35)';
        ctx.lineWidth = 2;
        for (let y = 20; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(560, y); ctx.lineTo(W, y); ctx.stroke(); }
        for (let y = 20, r = 0; y < H; y += 56, r++) for (let x = 560 + (r % 2) * 60; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 56); ctx.stroke(); }
        ctx.fillStyle = 'rgb(70,50,38)';
        ctx.fillRect(1320, 170, 330, 640);
        ctx.beginPath(); ctx.ellipse(1485, 170, 165, 90, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = D.lgrad(ctx, 0, 700, 0, H, [[0, [170, 130, 96]], [1, [140, 100, 76]]]);
        ctx.fillRect(-100, 720, W + 200, 200);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 200, 300, 900, GOLD, 0.5);
        ctx.restore();
        const res = C.figure(ctx, {
          x: 1060, y: 440, h: 560, kind: 'boy', facing: -1, sleeves: 'short', col: BOY, shoe: [50, 50, 60],
          pose: { sL: 2.2 + Math.sin(lt * 1.2) * 0.1, eL: 0.25, sR: 0.2, eR: 0.3, neck: -0.25 - 0.15 * Math.sin(lt * 0.7), head: -0.1, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
          tint: [[110, 60, 40], 0.2], rim: { col: GOLD, dx: -4, dy: -1 },
        });
        const hand = [1060 + res.hands[0][0], 440 + res.hands[0][1]];
        const bx = hand[0] - 40 + Math.sin(lt * 1.1) * 20, by = 110 + Math.sin(lt * 1.6) * 14;
        balloon(ctx, bx, by, 95, t, hand);
        return;
      }
      if (t < 20) {
        // his hand, the string, and the moment it slips
        const lt = t - 17;
        goldSky(ctx, 200);
        ctx.save();
        ctx.filter = `blur(${16 * FILM.q}px)`;
        ctx.fillStyle = 'rgb(170,124,90)';
        ctx.fillRect(1100, -50, 900, H + 100);
        ctx.restore();
        const open = U.ss(1.1, 1.5, lt);
        const rise = U.easeIn(U.inv(1.2, 2.6, lt)) * 900;
        const hx = 820, hy = 520;
        // string
        ctx.strokeStyle = 'rgba(250,240,220,0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hx + 30, hy - 10 - rise);
        ctx.bezierCurveTo(hx + 50, hy - 200 - rise, hx - 10, hy - 400 - rise, hx + 20, -100 - rise);
        ctx.stroke();
        // small fist, opening
        const skin = U.mix(C.pal.boySkin, [255, 190, 130], 0.15);
        ctx.fillStyle = U.rgb(BOY.shirt);
        ctx.beginPath(); ctx.moveTo(hx - 400, H + 50); ctx.lineTo(hx - 60, hy + 60); ctx.lineTo(hx + 10, hy + 130); ctx.lineTo(hx - 250, H + 100); ctx.closePath(); ctx.fill();
        ctx.fillStyle = U.rgb(skin);
        ctx.beginPath(); ctx.ellipse(hx, hy + 30, 78, 64, -0.4, 0, 7); ctx.fill();
        ctx.strokeStyle = U.rgb(skin);
        ctx.lineCap = 'round';
        ctx.lineWidth = 30;
        for (let i = 0; i < 4; i++) {
          const a = -1.2 + i * 0.28 - open * 0.9;
          const bx = hx + 30 + i * 8, by = hy - 10 + i * 16;
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * (60 + open * 25), by + Math.sin(a) * (60 + open * 25)); ctx.stroke();
        }
        ctx.lineWidth = 34;
        ctx.beginPath(); ctx.moveTo(hx - 30, hy); ctx.lineTo(hx + 20 - open * 40, hy - 60 - open * 20); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,214,150,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(hx, hy + 30, 78, 64, -0.4, -2.4, -0.8); ctx.stroke();
        return;
      }
      // he stops and looks up; the balloon lifts into the golden sky
      const lt = t - 20;
      const tilt = U.easeInOut(U.inv(0, 10, lt)) * 260;
      goldSky(ctx, tilt);
      // building edges framing the sky
      ctx.fillStyle = 'rgb(150,104,76)';
      D.poly(ctx, [[-100, -100], [260, -100], [300, H + 300], [-100, H + 300]]);
      ctx.fill();
      ctx.fillStyle = 'rgb(120,82,62)';
      D.poly(ctx, [[1700, -100], [W + 100, -100], [W + 100, H + 300], [1660, H + 300]]);
      ctx.fill();
      ctx.fillStyle = 'rgb(40,34,34)';
      for (let i = 0; i < 4; i++) { ctx.fillRect(60, 60 + i * 190 + tilt, 120, 110); ctx.fillRect(1760, 20 + i * 190 + tilt, 120, 120); }
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      D.glow(ctx, 560, 800 + tilt * 0.5, 1000, GOLD, 0.45);
      ctx.restore();
      const by = U.lerp(430, -40, U.ss(0, 10, lt)) , bx = 1180 + Math.sin(lt * 0.6) * 60;
      balloon(ctx, bx, by, U.lerp(70, 34, lt / 10), t, [bx + 20, by + 260]);
      // low angle on him: he has stopped, his head lifting to follow it
      const up = U.ss(0.2, 4, lt);
      C.head(ctx, {
        x: 600, y: 470 + tilt * 1.2, s: 400, yaw: 0.95, pitch: 0.15 + 0.4 * up, gaze: [0.3, -0.4 - 0.5 * up],
        eye: 0.85, tired: 0.6, skin: C.pal.manSkin, shirt: OUT.shirt,
        light: { dx: 0.9, dy: -0.4, col: GOLD, amt: 0.45 }, shadow: 0.5, shade: [70, 40, 30],
      });
      FILM.sets.birds(ctx, t, 4, 103);
    },
    audio(h, fx) {
      h.verb('street', 0.35);
      fx.bed(h, { color: 'brown', type: 'bandpass', f: 380, Q: 0.5, gain: 0.05 });
      fx.wind(h, { from: 0, to: 32, gain: 0.05, f: 650, seed: 10 });
      // swallows, sparrows
      fx.scatter(h, 0.5, 30, 1.4, 104, (w, k) => fx.bird(h, w, { gain: 0.035 + k * 0.02, pan: k * 1.6 - 0.8, base: 3400 + k * 1600, n: 2 + Math.floor(k * 5) }));
      h.at(3, (w) => fx.carPass(h, w, { dur: 8, gain: 0.04, p1: -0.8, p2: 0.8, far: 1 }));
      // his steps approaching
      for (let T = 0.2; T < 10; T += 0.52) {
        const g = U.lerp(0.04, 0.2, U.inv(0, 10, T));
        h.at(T, (w) => fx.footstep(h, w, { gain: g, pan: 0.4, hard: 0.7 }));
      }
      // the balloon rubbing on its string; the slip
      for (const T of [11.5, 13.8, 15.9]) h.at(T, (w) => fx.tone(h, w, { type: 'triangle', f: 520, f2: 560, a: 0.05, d: 0.25, gain: 0.012 }));
      h.at(18.2, (w) => { fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2400, Q: 2, d: 0.25, gain: 0.05 }); fx.tone(h, w + 0.1, { type: 'triangle', f: 700, f2: 950, a: 0.02, d: 0.3, gain: 0.018 }); });
      h.at(18.4, (w) => fx.whoosh(h, w, { dur: 2.4, f1: 400, f2: 2200, gain: 0.05 }));
      // he stops walking
      h.at(20.1, (w) => fx.footstep(h, w, { gain: 0.18, pan: -0.1, hard: 0.7 }));
      h.at(20.55, (w) => fx.footstep(h, w, { gain: 0.1, pan: 0.1, hard: 0.5 }));
    },
  });
})();
