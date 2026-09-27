/* Scene 7 — Waking before dawn. A jolt out of the dream; the nightmares flash back; 04:52; a tear;
   the photograph of his mother on the wall; then stillness on the edge of the bed. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const S = FILM.sets;
  const COLD = [150, 172, 205];
  const SKIN = U.mix(C.pal.manSkin, [70, 84, 104], 0.35);

  // split-second returns of the four nightmares: [start, scene number, that scene's local time]
  const FLASHES = [[0.85, 3, 16.3], [1.3, 4, 26.5], [1.75, 5, 14.5], [2.2, 6, 37.2]];
  const flashAt = (t) => FLASHES.find(([a]) => t >= a && t < a + 0.13);

  function eyeCloseUp(ctx, t) {
    ctx.fillStyle = 'rgb(20,26,36)';
    ctx.fillRect(0, 0, W, H);
    const s = 2300, r = -0.22;
    const ex = 0.2 * s, ey = -0.045 * s;
    const dx = ex * Math.cos(r) - ey * Math.sin(r), dy = ex * Math.sin(r) + ey * Math.cos(r);
    const [sx, sy] = D.shake(t, 26 * (1 - U.inv(0, 1.6, t)), 14, 4);
    const dart = t > 0.3 && t < 2.6 ? 1 : 0;
    C.head(ctx, {
      x: 960 - dx + sx, y: 402 - dy + sy, s, roll: r, yaw: 0.3, pitch: 0, bust: false,
      eye: U.ss(0.08, 0.2, t), gaze: [0.2 + dart * Math.sin(t * 11) * 0.6, dart * Math.cos(t * 8) * 0.35],
      tired: 1, worry: 1, glisten: U.ss(1, 3, t), skin: SKIN,
      light: { dx: 0.8, dy: -0.5, col: COLD, amt: 0.25 }, shadow: 0.6, shade: [10, 14, 22],
    });
  }

  // a digital clock, very close: 04:51 turns to 04:52
  function clock(ctx, t, lt) {
    ctx.fillStyle = 'rgb(6,6,8)';
    ctx.fillRect(0, 0, W, H);
    const txt = lt < 1.3 ? '04:51' : '04:52';
    const x0 = 960, y0 = 402;
    ctx.save();
    ctx.translate(x0, y0);
    ctx.scale(1 + lt * 0.02, 1 + lt * 0.02);
    D.glow(ctx, 0, 0, 700, [255, 30, 20], 0.18);
    ctx.font = 'bold 300px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,40,30,0.08)';
    ctx.fillText('88:88', 0, 0);
    ctx.shadowColor = 'rgba(255,40,30,0.8)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgb(255,52,40)';
    ctx.fillText(txt, 0, 0);
    ctx.restore();
    // his silhouette reflected faintly in the clock's plastic
    ctx.fillStyle = 'rgba(120,140,170,0.05)';
    ctx.beginPath(); ctx.ellipse(1500, 420, 160, 220, 0, 0, 7); ctx.fill();
  }

  // the photograph of his mother and the boy he was
  function photo(ctx, t, lt) {
    const z = 1 + lt * 0.035;
    ctx.save();
    D.cam(ctx, 960, 402, z);
    D.vgrad(ctx, -200, -200, W + 400, H + 400, [[0, [38, 44, 58]], [1, [54, 62, 78]]]);
    // frame
    ctx.fillStyle = 'rgb(40,32,28)';
    ctx.fillRect(700, 90, 520, 630);
    ctx.fillStyle = 'rgb(214,204,186)';
    ctx.fillRect(740, 130, 440, 550);
    // the old print: faded, warm, a doorway, the two of them
    const g = ctx.createLinearGradient(0, 160, 0, 650);
    g.addColorStop(0, 'rgb(170,140,104)');
    g.addColorStop(1, 'rgb(120,94,70)');
    ctx.fillStyle = g;
    ctx.fillRect(770, 160, 380, 490);
    ctx.fillStyle = 'rgb(96,74,56)';
    ctx.fillRect(800, 190, 150, 460);
    C.figure(ctx, { x: 1010, y: 452, h: 360, view: 'front', kind: 'mother', col: { skin: [190, 150, 116], dress: [70, 56, 48], scarf: [226, 210, 186] }, tint: [[150, 120, 90], 0.25] });
    C.figure(ctx, { x: 905, y: 530, h: 220, view: 'front', kind: 'boy', sleeves: 'short', col: { skin: [196, 156, 120], shirt: [168, 96, 80], pants: [96, 88, 88], hair: [50, 40, 34] }, shoe: [60, 50, 44], tint: [[150, 120, 90], 0.25], pose: { smile: 1 } });
    // the balloon he held that day, faded red
    ctx.save();
    ctx.globalAlpha = 0.75;
    FILM.sets.balloon(ctx, 948, 330, 30, 0, [925, 468]);
    ctx.restore();
    // a warm echo rises inside the photograph, once
    const echo = U.win(lt, 1.8, 5.0, 1.0, 1.8);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 980, 380, 380, [255, 196, 120], 0.55 * echo);
    ctx.restore();
    // cold glass over it all
    ctx.fillStyle = 'rgba(90,110,150,0.35)';
    ctx.fillRect(740, 130, 440, 550);
    ctx.fillStyle = 'rgba(200,215,240,0.08)';
    D.poly(ctx, [[900, 130], [1000, 130], [860, 680], [760, 680]]);
    ctx.fill();
    ctx.restore();
    // his fingertips come to rest on the glass
    const r = U.easeOut(U.inv(3.0, 4.4, lt));
    if (r > 0) {
      C.hand(ctx, { x: U.lerp(1500, 1180, r), y: U.lerp(1000, 610, r), s: 190, rot: -0.55, curl: 0.15, spread: 0.3, thumb: -1.3, skin: SKIN, sleeve: U.mul(SKIN, 0.82) });
      if (r > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; D.glow(ctx, U.lerp(1500, 1180, r) + 60, U.lerp(1000, 610, r) + 120, 260, [150, 172, 205], 0.12 * r); ctx.restore(); }
    }
  }

  FILM.scene({
    order: 7, num: 7, name: 'Waking before dawn', dur: 32,
    post: (t) => ({ grain: t < 3.4 ? 0.16 : 0.1, vignette: 0.6 }),
    draw(ctx, t) {
      if (t < 3.4) {
        const f = flashAt(t);
        if (f) {
          // the dream breaking back in, bleached and harsh
          const sc = FILM.list.find((s) => s.num === f[1]);
          ctx.save();
          sc.draw(ctx, f[2] + (t - f[0]), sc);
          ctx.restore();
          D.screen(ctx, 'rgb(255,255,255)', 0.3 * (1 - (t - f[0]) / 0.13));
          D.screen(ctx, 'rgb(90,110,140)', 0.25, 'multiply');
        } else {
          eyeCloseUp(ctx, t);
        }
        if (t < 0.14) D.screen(ctx, 'rgb(235,240,255)', 1 - t / 0.14);
        return;
      }
      if (t < 12) {
        // he bolts upright in bed
        const lt = t - 3.4;
        const up = U.easeOut(U.inv(0.05, 0.45, lt));
        const pant = Math.sin(lt * 9) * 0.035 * (1 - U.inv(0, 8.6, lt));
        const toFace = U.ss(3.2, 4.4, lt);
        const [sx, sy] = D.shake(t, 12 * (1 - U.inv(0, 0.8, lt)), 10, 9);
        S.bedroom(ctx, lt, {
          warm: 0, man: 'custom', clock: '04:51', sway: 0.4,
          cam: { x: 760 + sx, y: 420 + sy, z: 1.3 + lt * 0.012 },
          drawMan: (c, P) => C.figure(c, {
            x: 650, y: 492, h: 560, facing: 1, sleeves: 'short',
            pose: {
              torso: U.lerp(-1.42, 0.12 + 0.3 * toFace, up) + pant, neck: U.lerp(0.1, -0.1 + 0.45 * toFace, up), head: 0.1 * toFace,
              sL: U.lerp(0.4, 0.2, up) * (1 - toFace) + 0.5 * toFace, eL: U.lerp(0.2, 0.95, up) * (1 - toFace) + 2.15 * toFace,
              sR: 0.3 * (1 - toFace) + 0.42 * toFace, eR: U.lerp(0.1, 0.8, up) * (1 - toFace) + 2.3 * toFace,
              hL: 1.55, kL: 0.05, hR: 1.5, kR: 0.08, fL: -1.45, fR: -1.4,
            },
            col: { skin: U.mix(C.pal.manSkin, P.wall, 0.5), shirt: P.shirt, pants: U.mul(P.shirt, 0.7), hair: C.pal.hair },
            rim: { col: U.mix(P.light, [255, 255, 255], 0.2), dx: 3, dy: -1, a: 0.5 },
          }),
        });
        return;
      }
      if (t < 14.5) { clock(ctx, t, t - 12); return; }
      if (t < 21) {
        // his face in the cold light; one tear
        const lt = t - 14.5;
        D.vgrad(ctx, -100, -100, W + 200, H + 200, [[0, [36, 42, 56]], [1, [24, 28, 38]]]);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1750, 180, 700, COLD, 0.3);
        ctx.restore();
        const br = Math.sin(lt * 1.6) * 3;
        C.head(ctx, {
          x: 880, y: 380 + br, s: 480, yaw: 1.05, pitch: -0.12 + 0.05 * U.ss(4, 6, lt), roll: 0.03,
          eye: 0.72 - 0.5 * U.win(lt, 2.6, 3.3, 0.2, 0.3), tired: 1, worry: 0.7, gaze: [0.35, 0.25],
          glisten: 1, tear: U.ss(2.8, 5.8, lt), skin: SKIN, shirt: [60, 66, 78],
          light: { dx: 1, dy: -0.3, col: COLD, amt: 0.3 }, shadow: 0.6, shade: [10, 14, 22],
        });
        return;
      }
      if (t < 27) { photo(ctx, t, t - 21); return; }
      // stillness on the edge of the bed as the grey comes in
      const lt = t - 27;
      const k = U.easeInOut(lt / 5);
      S.bedroom(ctx, 20 + lt * 1.1, {
        warm: 0, man: 'sitting', clock: '04:53', sway: 0.4, breathAmt: 0.7,
        cam: { x: U.lerp(960, 1040, k), y: U.lerp(402, 415, k), z: U.lerp(1.0, 1.1, k) },
      });
      D.screen(ctx, 'rgb(150,170,200)', 0.06 * U.inv(0, 5, lt), 'screen');
    },
    audio(h, fx) {
      h.verb('room', 0.3);
      // surfacing: a gasp torn out of the water
      h.at(0.02, (w) => {
        fx.breath(h, w, { dur: 0.5, inhale: true, gain: 0.3, f: 1300, rough: 0.3 });
        fx.whoosh(h, w - 0.02, { dur: 0.3, f1: 60, f2: 1400, gain: 0.3, color: 'brown' });
        fx.thud(h, w, { gain: 0.45, f: 50, d: 0.6 });
        for (let i = 0; i < 10; i++) fx.bubble(h, w + i * 0.03, { size: 0.5 + Math.random(), gain: 0.06 });
      });
      // the nightmares, one sound each
      h.at(0.85, (w) => { for (let i = 0; i < 8; i++) fx.bubble(h, w + i * 0.015, { size: 0.6 + Math.random(), gain: 0.1 }); });
      h.at(1.3, (w) => { fx.click(h, w, { gain: 0.25, f: 2200 }); fx.tone(h, w, { type: 'sawtooth', f: 100, d: 0.12, gain: 0.08, lp: 2000 }); });
      h.at(1.75, (w) => fx.porcelain(h, w, { pitch: 0.4, gain: 0.25 }));
      h.at(2.2, (w) => fx.ring(h, w, { f: 2200, partials: [1, 2.4, 3.9], decay: [0.35, 0.2, 0.1], gain: 0.12 }));
      // panting that slowly settles, heart racing then slowing
      let T = 0.7;
      while (T < 14) {
        const gap = U.lerp(0.62, 2.6, U.inv(0.7, 13, T));
        const g = U.lerp(0.14, 0.05, U.inv(0.7, 13, T));
        const tt = T;
        h.at(tt, (w) => fx.breath(h, w, { dur: gap * 0.42, inhale: true, gain: g, f: 1100 }));
        h.at(tt + gap * 0.45, (w) => fx.breath(h, w, { dur: gap * 0.5, inhale: false, gain: g * 1.1, f: 900 }));
        T += gap;
      }
      T = 0.3;
      while (T < 13) { const tt = T; h.at(tt, (w) => fx.heartbeat(h, w, { gain: U.lerp(0.35, 0.08, U.inv(0, 13, tt)) })); T += U.lerp(0.45, 0.95, U.inv(0, 12, T)); }
      // the blanket thrown as he sits up; bed springs
      h.at(3.45, (w) => {
        fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 1500, Q: 0.5, a: 0.05, d: 0.5, gain: 0.08 });
        for (let i = 0; i < 3; i++) fx.ring(h, w + 0.1 + i * 0.08, { f: 700 + i * 90, partials: [1, 1.7], decay: [0.25, 0.15], gain: 0.04 });
      });
      // the room; at 04:52 the refrigerator shudders off and leaves the silence behind
      const fr = fx.hum(h, { f: 50, gain: 0.024, harm: [0.6, 1, 0.5, 0.3, 0.15], lp: 380 });
      h.param(fr.gain, [[0, 0.024], [13.3, 0.024], [13.55, 0]]);
      h.at(13.3, (w) => { fx.click(h, w, { gain: 0.12, f: 1800 }); fx.thud(h, w + 0.05, { gain: 0.12, f: 70, d: 0.25 }); });
      const room = fx.bed(h, { color: 'brown', type: 'lowpass', f: 220, gain: 0.06 });
      h.param(room.g.gain, [[0, 0.06], [13.3, 0.06], [13.6, 0.025], [32, 0.03]]);
      fx.wind(h, { from: 0, to: 34, gain: 0.03, f: 600, seed: 7, pan: 0.5 });
      // a sniff; a swallow
      h.at(18.2, (w) => fx.breath(h, w, { dur: 0.35, inhale: true, gain: 0.07, f: 1600 }));
      h.at(19.6, (w) => fx.swallow(h, w, { gain: 0.12 }));
      // in the photograph, very far away: her kitchen — a bird, a spoon, the clock
      h.verb('dream', 0.25);
      h.at(23.0, (w) => fx.bird(h, w, { gain: 0.02, pan: 0.2 }));
      h.at(23.6, (w) => fx.ring(h, w, { f: 2200, partials: [1, 2.4, 3.9], decay: [0.5, 0.3, 0.15], gain: 0.025 }));
      for (let T2 = 22.5; T2 < 26; T2 += 1) h.at(T2, (w) => fx.tick(h, w, { gain: 0.012, pitch: 0.55 }));
      h.at(25.4, (w) => fx.tick(h, w, { gain: 0.05, pitch: 1.6 })); // fingertip on the glass
      // dawn
      h.at(24, (w) => fx.carPass(h, w, { dur: 8, gain: 0.03, p1: 0.6, p2: -0.3, far: 1 }));
      fx.scatter(h, 27.5, 32, 0.6, 71, (w, k) => fx.bird(h, w, { gain: 0.025, pan: 0.7, base: 3200 + k * 800 }));
    },
  });
})();
