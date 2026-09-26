/* Scene 1 — Bedroom, late night. He lies awake; streetlight through thin curtains. */
(function () {
  'use strict';
  const { U, D, W, H } = FILM;
  const S = FILM.sets;
  const blink = (t, at, d = 0.28) => 1 - U.win(t, at, at + d, d * 0.4, d * 0.6);

  FILM.scene({
    order: 1, num: 1, name: 'Bedroom, late night', dur: 30,
    fadeIn: 3.5,
    post: { grain: 0.1, vignette: 0.6 },
    draw(ctx, t) {
      if (t < 13) {
        // wide: the room, a slow push toward the bed
        const k = U.easeInOut(U.inv(0, 13, t));
        const eye = Math.min(blink(t, 5.2), blink(t, 10.6, 0.4));
        S.bedroom(ctx, t, {
          warm: 1, man: 'lying', eye, clock: '03:17', sweeps: [5.6],
          cam: { x: U.lerp(960, 820, k), y: U.lerp(402, 440, k), z: U.lerp(1.0, 1.14, k) },
        });
      } else if (t < 23) {
        // close: eyes open, heavy, not sleeping
        const lt = t - 13;
        const eye = Math.min(0.82, blink(lt, 2.4, 0.45), blink(lt, 6.8, 0.6));
        const gx = 0.5 + 0.25 * U.ss(4, 5.5, lt) - 0.35 * U.ss(8, 9, lt);
        S.lyingFace(ctx, t, {
          warm: 1, eye, zoom: U.lerp(1.0, 1.07, lt / 10), gaze: [gx, -0.1 + 0.25 * U.ss(4, 5.5, lt)],
          cam: [U.lerp(960, 930, lt / 10), 402],
        });
      } else {
        // what he sees: the ceiling, the window's light, a car passing below
        const lt = t - 23;
        S.ceiling(ctx, t, { warm: 1, rot: -0.03 + lt * 0.004, zoom: 1.02 + lt * 0.006, sweeps: [24.6] });
      }
    },
    audio(h, fx) {
      h.verb('room', 0.25);
      // refrigerator in the next room
      const fr = fx.hum(h, { f: 50, gain: 0.018, harm: [0.6, 1, 0.5, 0.3, 0.15], lp: 380 });
      h.param(fr.gain, [[0, 0.018], [14, 0.018], [15, 0.022], [30, 0.02]]);
      // room tone + distant traffic
      fx.bed(h, { color: 'brown', type: 'lowpass', f: 220, gain: 0.07 });
      const tr = fx.bed(h, { color: 'brown', type: 'bandpass', f: 380, Q: 0.6, gain: 0.05 });
      const k = [];
      for (let T = 0; T <= 32; T += 1) k.push([T, 0.035 + 0.03 * (0.5 + 0.5 * U.fbm(T * 0.2, 9))]);
      h.param(tr.g.gain, k);
      fx.wind(h, { from: 0, to: 32, gain: 0.035, f: 520, seed: 3, pan: 0.5 });
      // cars passing below the window, in sync with the light sweeping the room
      h.at(3.6, (w) => fx.carPass(h, w, { dur: 5.5, gain: 0.07, p1: 0.9, p2: -0.6 }));
      h.at(22.4, (w) => fx.carPass(h, w, { dur: 5.5, gain: 0.06, p1: 0.9, p2: -0.7 }));
      h.at(15.5, (w) => fx.carPass(h, w, { dur: 7, gain: 0.025, p1: -0.4, p2: 0.3, far: 1 }));
      // his breathing, audible in the close-up
      for (let T = 13.2; T < 23; T += 4.3) {
        h.at(T, (w) => fx.breath(h, w, { dur: 1.8, inhale: true, gain: 0.028, f: 900 }));
        h.at(T + 2, (w) => fx.breath(h, w, { dur: 2.1, inhale: false, gain: 0.032, f: 800 }));
      }
      // blanket shifts
      h.at(11.8, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 1800, Q: 0.5, a: 0.25, d: 0.6, gain: 0.03 }));
      // a dog, very far
      h.at(19.5, (w) => { for (let i = 0; i < 2; i++) fx.burst(h, w + i * 0.35, { color: 'pink', type: 'bandpass', f: 700, Q: 3, a: 0.01, d: 0.12, gain: 0.02, pan: -0.7 }); });
    },
  });
})();
