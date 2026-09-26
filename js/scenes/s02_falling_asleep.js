/* Scene 2 — Falling asleep. The eyes close; the room loses its warmth; the ceiling turns to water. */
(function () {
  'use strict';
  const { U, D, W, H } = FILM;
  const S = FILM.sets;

  FILM.scene({
    order: 2, num: 2, name: 'Falling asleep', dur: 20,
    post: (t) => ({ grain: 0.1, vignette: 0.6 + 0.25 * U.inv(8, 20, t) }),
    draw(ctx, t) {
      if (t < 8) {
        const eye = U.keys([[0, 0.8], [1.8, 0.55], [2.6, 0.75], [4.4, 0.25], [5.2, 0.45], [7.2, 0]], t);
        S.lyingFace(ctx, t, {
          warm: U.lerp(1, 0.75, t / 8), eye, zoom: U.lerp(1.07, 1.15, t / 8), gaze: [0.4, 0.2], cam: [930, 402],
          dim: 0.15 * U.inv(4, 8, t),
        });
        return;
      }
      const lt = t - 8;
      const k = lt / 12;
      const b = FILM.buffer('s02');
      S.ceiling(b.x, t, {
        warm: U.lerp(0.75, 0.05, U.smooth(k)), stretch: U.easeIn(k) * 1.1, rot: -0.02 - 0.18 * U.easeIn(k),
        zoom: 1.02 + 0.3 * U.easeIn(k), breathe: 3 * k, lampSwing: k, dark: 0.1 + 0.3 * k,
      });
      // the ceiling begins to ripple like a surface seen from underneath
      const rip = U.ss(4, 12, lt);
      if (rip < 0.01) {
        D.buf(ctx, b);
      } else {
        const strip = 8;
        const src = b.c;
        const q = FILM.q;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let y = 0; y < src.height; y += strip) {
          const off = Math.sin(y * 0.02 / q + t * 1.6) * rip * 26 * q + Math.sin(y * 0.047 / q - t * 2.3) * rip * 10 * q;
          ctx.drawImage(src, 0, y, src.width, strip, off, y, src.width, strip);
        }
        ctx.restore();
        D.screen(ctx, U.rgb([10, 44, 58]), 0.55 * rip, 'multiply');
        D.screen(ctx, U.rgb([0, 30, 40]), 0.35 * rip);
      }
    },
    audio(h, fx) {
      h.verb('room', 0.2);
      h.verb('dream', U.lerp(0, 0.5, 1));
      // the room, closing up and sinking
      const lp = h.filter('lowpass', 3000, 0.7);
      lp.connect(h.in);
      h.param(lp.frequency, [[0, 3000], [8, 1400], [16, 350], [20, 180]], true);
      fx.hum(h, { f: 50, gain: 0.02, harm: [0.6, 1, 0.5, 0.3], lp: 380, dest: lp });
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 220, gain: 0.07, dest: lp });
      fx.wind(h, { from: 0, to: 22, gain: 0.035, f: 520, seed: 4, pan: 0.5, dest: lp });
      h.at(1.5, (w) => fx.carPass(h, w, { dur: 6, gain: 0.04, p1: 0.8, p2: -0.4, far: 1, dest: lp }));
      // slow breaths
      for (let T = 0.2; T < 12; T += 5.2) {
        h.at(T, (w) => fx.breath(h, w, { dur: 2.2, inhale: true, gain: 0.03, f: 850, dest: lp }));
        h.at(T + 2.5, (w) => fx.breath(h, w, { dur: 2.6, inhale: false, gain: 0.034, f: 760, dest: lp }));
      }
      // heartbeat slowing as sleep comes
      let T = 7;
      while (T < 20) { const tt = T; h.at(tt, (w) => fx.heartbeat(h, w, { gain: 0.12 + 0.12 * U.inv(7, 18, tt) })); T += U.lerp(1.0, 1.45, U.inv(7, 20, T)); }
      // pressure rising: deep rumble, the first muffled underwater swell
      const rb = fx.bed(h, { color: 'brown', type: 'lowpass', f: 90, gain: 0 });
      h.param(rb.g.gain, [[0, 0], [9, 0], [18, 0.22], [20, 0.3]]);
      h.at(16.8, (w) => fx.whoosh(h, w, { dur: 3.2, f1: 90, f2: 380, gain: 0.18, color: 'brown' }));
    },
  });
})();
