/* Scene 7 — Waking before dawn. He wakes suddenly; the room is cold blue-gray; he sits on the edge of the bed. */
(function () {
  'use strict';
  const { U, D, W, H } = FILM;
  const S = FILM.sets;

  FILM.scene({
    order: 7, num: 7, name: 'Waking before dawn', dur: 22,
    post: { grain: 0.1, vignette: 0.55 },
    draw(ctx, t) {
      if (t < 3.5) {
        const eye = U.ss(0.08, 0.22, t) * (1 - U.win(t, 2.2, 2.6, 0.12, 0.2) * 0.9);
        const [sx, sy] = D.shake(t, 10 * (1 - U.inv(0, 1.5, t)), 12, 4);
        ctx.save();
        ctx.translate(sx, sy);
        S.lyingFace(ctx, t, { warm: 0, eye, zoom: 1.12, gaze: [0.2 + 0.4 * Math.sin(t * 3), -0.2], tired: 1, worry: 0.8, cam: [930, 402] });
        ctx.restore();
        return;
      }
      const lt = t - 3.5;
      const k = U.easeInOut(lt / 18.5);
      // breathing slows as the fear wears off
      const bt = lt < 6 ? lt * 3.2 : 19.2 + (lt - 6) * 1.2;
      S.bedroom(ctx, bt, {
        warm: 0, man: 'sitting', clock: '04:52', sway: 0.4, breathAmt: U.lerp(2.6, 0.7, U.inv(0, 10, lt)),
        cam: { x: U.lerp(960, 1080, k), y: U.lerp(402, 420, k), z: U.lerp(1.0, 1.16, k) },
      });
      // the first grey of dawn creeping in
      D.screen(ctx, 'rgb(150,170,200)', 0.05 * U.inv(0, 18, lt), 'screen');
    },
    audio(h, fx) {
      h.verb('room', 0.3);
      // a sharp breath in, as if surfacing
      h.at(0.08, (w) => { fx.breath(h, w, { dur: 0.45, inhale: true, gain: 0.2, f: 1300 }); fx.whoosh(h, w - 0.05, { dur: 0.35, f1: 80, f2: 900, gain: 0.2, color: 'brown' }); });
      // panting that slowly settles
      let T = 0.7;
      while (T < 20) {
        const gap = U.lerp(0.75, 3.2, U.inv(0.7, 14, T));
        const g = U.lerp(0.12, 0.04, U.inv(0.7, 16, T));
        const tt = T;
        h.at(tt, (w) => fx.breath(h, w, { dur: gap * 0.42, inhale: true, gain: g, f: 1100 }));
        h.at(tt + gap * 0.45, (w) => fx.breath(h, w, { dur: gap * 0.5, inhale: false, gain: g * 1.1, f: 900 }));
        T += gap;
      }
      // the heart, racing then slowing
      T = 0.3;
      while (T < 14) { const tt = T; h.at(tt, (w) => fx.heartbeat(h, w, { gain: U.lerp(0.3, 0.08, U.inv(0, 14, tt)) })); T += U.lerp(0.5, 0.95, U.inv(0, 12, T)); }
      // the room again: fridge, a far car, wind; the first birds
      fx.hum(h, { f: 50, gain: 0.02, harm: [0.6, 1, 0.5, 0.3, 0.15], lp: 380 });
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 220, gain: 0.06 });
      fx.wind(h, { from: 0, to: 24, gain: 0.03, f: 600, seed: 7, pan: 0.5 });
      h.at(7, (w) => fx.carPass(h, w, { dur: 8, gain: 0.03, p1: 0.6, p2: -0.3, far: 1 }));
      fx.scatter(h, 14, 22, 0.5, 71, (w, k) => fx.bird(h, w, { gain: 0.02, pan: 0.7, base: 3200 + k * 800 }));
      // bed springs as he sits
      h.at(3.6, (w) => { for (let i = 0; i < 3; i++) fx.ring(h, w + i * 0.09, { f: 700 + i * 90, partials: [1, 1.7], decay: [0.25, 0.15], gain: 0.03 }); });
    },
  });
})();
