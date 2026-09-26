/* Scene 10 — The red balloon. Golden afternoon. Near his building a little girl with dark brown hair
   sees his tired face, walks over, and gives him her red balloon. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const ST = FILM.sets.street;
  const OUT = { skin: C.pal.manSkin, shirt: [46, 50, 60], pants: [52, 64, 86], hair: C.pal.hair };
  const GIRL = { skin: C.pal.girlSkin, hair: C.pal.girlHair, dress: [104, 150, 172], shirt: [104, 150, 172], pants: [104, 150, 172] };
  const SANDAL = [214, 200, 176];
  const GOLD = [255, 196, 120];
  const balloon = (...a) => FILM.sets.balloon(...a);

  // two-link reach toward a target (side view, facing +1)
  function reach(sh, target, L1, L2) {
    const vx = target[0] - sh[0], vy = target[1] - sh[1];
    const dist = Math.min(Math.hypot(vx, vy), (L1 + L2) * 0.98);
    const a = Math.atan2(vx, vy);
    const e = Math.PI - Math.acos(U.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
    const b = Math.asin(U.clamp((L2 * Math.sin(e)) / dist, -1, 1));
    return [a - b, e];
  }

  function goldSky(ctx, top = 0) {
    ctx.fillStyle = 'rgb(120,150,190)';
    ctx.fillRect(-100, -100, W + 200, H + 200);
    D.vgrad(ctx, -100, top - 200, W + 200, H + 400, [[0, [120, 150, 190]], [0.45, [236, 180, 120]], [1, [255, 214, 150]]]);
  }

  // the wall of his building by the entrance, in low sun
  function entrance(ctx, t, shift = 0) {
    goldSky(ctx, -300);
    ctx.save();
    ctx.translate(shift, 0);
    ctx.fillStyle = D.lgrad(ctx, 0, 0, W, 0, [[0, [196, 150, 106]], [1, [150, 104, 76]]]);
    ctx.fillRect(560, -50, W + 400, H + 100);
    ctx.strokeStyle = 'rgba(110,80,60,0.35)';
    ctx.lineWidth = 2;
    for (let y = 20; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(560, y); ctx.lineTo(W + 400, y); ctx.stroke(); }
    for (let y = 20, r = 0; y < H; y += 56, r++) for (let x = 560 + (r % 2) * 60; x < W + 400; x += 120) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 56); ctx.stroke(); }
    ctx.fillStyle = 'rgb(70,50,38)';
    ctx.fillRect(1320, 170, 330, 640);
    ctx.beginPath(); ctx.ellipse(1485, 170, 165, 90, 0, Math.PI, 0); ctx.fill();
    // a pot of geraniums by the door (pink, never red)
    ctx.fillStyle = '#9a5a36';
    ctx.fillRect(1180, 640, 90, 80);
    ctx.fillStyle = '#5f7f3a';
    for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(1190 + (i % 5) * 18, 630 - Math.floor(i / 5) * 18, 14, 9, i, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#e59ab0';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(1195 + i * 17, 605 - (i % 2) * 12, 7, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = D.lgrad(ctx, 0, 700, 0, H, [[0, [170, 130, 96]], [1, [140, 100, 76]]]);
    ctx.fillRect(-100, 720, W + 200, 200);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 200, 300, 900, GOLD, 0.5);
    ctx.restore();
    D.dust(ctx, t, { n: 40, seed: 104, size: 1.8, col: [255, 236, 200], alpha: 0.5, vx: 3, vy: -2, wob: 12 });
  }

  function girlWalk(t, k = 1) {
    const p = C.poses.walk(t * Math.PI * 2 / 0.7, 0.9 * k);
    return p;
  }

  FILM.scene({
    order: 10, num: 10, name: 'The red balloon', dur: 33,
    fadeIn: 2.5,
    post: { grain: 0.07, vignette: 0.45 },
    draw(ctx, t) {
      if (t < 8) {
        // he walks home in the late sun; by the entrance, a girl with a red balloon
        const Z = U.lerp(34, 14.5, t / 8);
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
                x, y: y - 0.5 * 1.1 * sc, h: 1.1 * sc, kind: 'girl', facing: -1, sleeves: 'short', col: GIRL, shoe: SANDAL,
                pose: { sL: 2.3, eL: 0.2, sR: 0.1, eR: 0.2, neck: -0.15 }, tint: [[90, 50, 40], 0.3], rim: { col: GOLD, dx: -2, dy: -1 },
              });
              const hand = [x + res.hands[0][0], y - 0.5 * 1.1 * sc + res.hands[0][1]];
              balloon(c, hand[0] - 0.1 * sc, hand[1] - (0.9 + bob) * sc, 0.2 * sc, t, hand);
            },
          },
        ];
        ST.draw(ctx, t, { mode: 'golden', cam: { z: -1, y: 0.25 }, shutters: 0.9, people });
        FILM.sets.birds(ctx, t, 5, 101);
        return;
      }
      if (t < 14) {
        // she notices him: the tired man coming up the street. She sets off toward him.
        const lt = t - 8;
        entrance(ctx, t);
        const go = U.inv(3.0, 6, lt);
        const x = U.lerp(1080, 700, U.smooth(go));
        const walking = lt > 3.0;
        const pose = walking ? girlWalk(lt) : { sL: 2.2 + Math.sin(lt * 1.2) * 0.1, eL: 0.25, sR: 0.15, eR: 0.3, neck: -0.25 + 0.2 * U.ss(1.2, 2.2, lt), head: -0.1, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 };
        if (walking) { pose.sL = 2.1; pose.eL = 0.25; }
        const res = C.figure(ctx, {
          x, y: 450, h: 540, kind: 'girl', facing: -1, sleeves: 'short', col: GIRL, shoe: SANDAL, pose,
          tint: [[110, 60, 40], 0.18], rim: { col: GOLD, dx: -4, dy: -1 },
        });
        const hand = [x + res.hands[0][0], 450 + res.hands[0][1]];
        balloon(ctx, hand[0] - 30 + Math.sin(lt * 1.1) * 18, 110 + Math.sin(lt * 1.6) * 14, 95, t, hand);
        return;
      }
      if (t < 22) {
        // she holds it up to him. He hesitates. Then he takes it.
        const lt = t - 14;
        entrance(ctx, t, 300);
        const arrive = U.smooth(U.inv(0, 1.4, lt));
        const gx = U.lerp(1300, 1030, arrive);
        const offer = U.ss(1.8, 2.8, lt), lower = U.ss(6.8, 7.6, lt);
        const girl = C.figure(ctx, {
          x: gx, y: 560, h: 560, kind: 'girl', facing: -1, sleeves: 'short', col: GIRL, shoe: SANDAL,
          pose: lt < 1.4 ? girlWalk(lt, 1 - arrive) : { sL: U.lerp(1.3, 2.25, offer) * (1 - lower) + 0.15 * lower, eL: 0.25, sR: 0.15, eR: 0.3, neck: -0.35, head: -0.2, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
          tint: [[110, 60, 40], 0.15], rim: { col: GOLD, dx: -4, dy: -1 },
        });
        const gh = [gx + girl.hands[0][0], 560 + girl.hands[0][1]];
        // him: tall, looking down at her, backlit
        const mh = 1060, mx = 520, my = 500, tau = 0.08;
        const sh = [mx + Math.sin(tau) * 0.29 * mh, my - Math.cos(tau) * 0.29 * mh];
        const take = U.smooth(U.inv(4.6, 6.2, lt));
        const [sA, eA] = reach(sh, gh, 0.165 * mh, 0.18 * mh);
        const man = C.figure(ctx, {
          x: mx, y: my, h: mh, facing: 1, col: OUT, shoe: [30, 26, 24],
          pose: { torso: tau + 0.05 * take, neck: 0.4, head: 0.2, sL: U.lerp(0.1, sA, take) - 0.4 * lower, eL: U.lerp(0.15, eA, take) + 0.5 * lower, sR: -0.05, eR: 0.15, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
          tint: [[80, 44, 36], 0.45], rim: { col: GOLD, dx: 5, dy: -2 },
        });
        const hh = [mx + man.hands[0][0], my + man.hands[0][1]];
        const pass = U.ss(6.1, 6.5, lt);
        const end = [U.lerp(gh[0], hh[0], pass), U.lerp(gh[1], hh[1], pass)];
        balloon(ctx, end[0] + 60 - 200 * (1 - offer) * (1 - pass) + 90 * pass + Math.sin(lt * 1.2) * 14, end[1] + U.lerp(U.lerp(-400, -190, offer), -300, pass) + Math.sin(lt * 1.7) * 10, 88, t, end);
        return;
      }
      if (t < 26) {
        // two hands and a string
        const lt = t - 22;
        entrance(ctx, t, 500);
        D.screen(ctx, 'rgb(255,214,160)', 0.3);
        const close = U.ss(1.4, 2.2, lt), open = U.ss(2.4, 3.0, lt), away = U.ss(3.0, 4.0, lt);
        const sx = 930;
        ctx.strokeStyle = 'rgba(250,240,220,0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx + 25, 540); ctx.bezierCurveTo(sx + 35, 380, sx + 5, 200, sx + 40, -40); ctx.stroke();
        C.hand(ctx, { x: sx + 150 + away * 300, y: 560, s: 130, rot: -1.5, curl: U.lerp(0.7, 0.1, open), thumb: -0.4, skin: C.pal.girlSkin, sleeve: [104, 150, 172] });
        C.hand(ctx, { x: U.lerp(sx - 330, sx - 170, U.ss(0, 1.4, lt)), y: 470, s: 200, rot: 1.5, curl: U.lerp(0.1, 0.85, close), thumb: 0.3, skin: C.pal.manSkin, sleeve: [46, 50, 60] });
        return;
      }
      if (t < 31) {
        // her face, looking up at him — shy, pleased
        const lt = t - 26;
        entrance(ctx, t, 200);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 300, 200, 800, GOLD, 0.45);
        ctx.restore();
        const blink = 1 - U.win(lt, 2.0, 2.3, 0.1, 0.2);
        C.head(ctx, {
          x: 1020, y: 420, s: 420, yaw: -0.55, pitch: 0.16, kind: 'girl', skin: C.pal.girlSkin, hair: C.pal.girlHair, shirt: GIRL.dress,
          eye: blink, gaze: [-0.35, -0.3], smile: 0.6 + 0.4 * U.ss(0.8, 2.4, lt),
          light: { dx: -1, dy: -0.4, col: [255, 214, 150], amt: 0.45 }, shadow: 0.4, shade: [90, 50, 30],
        });
        return;
      }
      // she runs back home down the street; he stands holding it
      const lt = t - 31;
      const ph = lt * Math.PI * 2 / 0.5, s = Math.sin(ph);
      const people = [
        {
          X: 3.9, Z: 9.5, draw: (c, x, y, sc) => {
            C.figure(c, { x, y: y - 0.49 * 1.75 * sc, h: 1.75 * sc, view: 'front', pose: { swingL: 0.1 }, col: OUT, shoe: [30, 26, 24], tint: [[90, 50, 40], 0.45], rim: { col: GOLD, dx: 0, dy: -2 } });
            balloon(c, x + 0.35 * sc, y - 2.4 * sc + Math.sin(t * 1.3) * 3, 0.2 * sc, t, [x + 0.25 * sc, y - 0.95 * sc]);
          },
        },
        {
          X: 2.8, Z: U.lerp(10.5, 17, lt / 2), draw: (c, x, y, sc) => C.figure(c, {
            x, y: y - 0.5 * 1.1 * sc, h: 1.1 * sc, kind: 'girl', view: 'back', sleeves: 'short', col: GIRL, shoe: SANDAL,
            pose: { liftL: Math.max(0, s), liftR: Math.max(0, -s), swingL: s, swingR: -s, bob: -Math.abs(s) * 0.02 }, tint: [[90, 50, 40], 0.3],
          }),
        },
      ];
      ST.draw(ctx, t, { mode: 'golden', cam: { z: -1, y: 0.25 }, shutters: 0.9, people });
    },
    audio(h, fx) {
      h.verb('street', 0.35);
      fx.bed(h, { color: 'brown', type: 'bandpass', f: 380, Q: 0.5, gain: 0.05 });
      fx.wind(h, { from: 0, to: 35, gain: 0.05, f: 650, seed: 10 });
      fx.scatter(h, 0.5, 33, 1.4, 104, (w, k) => fx.bird(h, w, { gain: 0.035 + k * 0.02, pan: k * 1.6 - 0.8, base: 3400 + k * 1600, n: 2 + Math.floor(k * 5) }));
      h.at(3, (w) => fx.carPass(h, w, { dur: 8, gain: 0.04, p1: -0.8, p2: 0.8, far: 1 }));
      // his steps approaching, then stopping
      for (let T = 0.2; T < 8; T += 0.52) { const g = U.lerp(0.04, 0.18, U.inv(0, 8, T)); h.at(T, (w) => fx.footstep(h, w, { gain: g, pan: 0.4, hard: 0.7 })); }
      // her sandals, quick and light
      for (let T = 11.0; T < 14; T += 0.35) h.at(T, (w) => fx.footstep(h, w, { gain: 0.07, pan: -0.2, hard: 0.4 }));
      for (let T = 14.0; T < 15.4; T += 0.35) h.at(T, (w) => fx.footstep(h, w, { gain: 0.08, pan: 0.3, hard: 0.4 }));
      // the balloon squeaking on its string as it changes hands
      for (const T of [9.5, 16.8, 20.3, 23.6]) h.at(T, (w) => fx.tone(h, w, { type: 'triangle', f: 540, f2: 600, a: 0.04, d: 0.28, gain: 0.014 }));
      h.at(20.3, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2400, Q: 2, d: 0.2, gain: 0.03 }));
      // she runs off
      for (let T = 31.0; T < 33; T += 0.25) h.at(T, (w) => fx.footstep(h, w, { gain: 0.06, pan: -0.3, hard: 0.4 }));
    },
  });
})();
