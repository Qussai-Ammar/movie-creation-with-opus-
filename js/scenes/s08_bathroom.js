/* Scene 8 — Morning routine. The mirror; a tired, pale face; a paracetamol with water. Painfully ordinary. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;

  const TILE = [206, 214, 210], GROUT = [170, 178, 176], LIGHT = [255, 248, 230];
  const PALE = U.mix(C.pal.manSkin, [196, 186, 176], 0.3);

  const tiles = () => FILM.cached('bath-tiles', 2400, 1200, (x, w, h) => {
    x.fillStyle = U.rgb(GROUT);
    x.fillRect(0, 0, w, h);
    const s = 100, r = U.rng(81);
    for (let i = 0; i < w / s; i++) for (let j = 0; j < h / s; j++) {
      const v = 0.96 + r() * 0.06;
      x.fillStyle = U.rgb(U.mul(TILE, v));
      x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
      x.fillStyle = 'rgba(255,255,255,0.18)';
      x.fillRect(i * s + 6, j * s + 6, s - 40, 6);
    }
  });

  function glass(ctx, x, y, w, h, level, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // water
    if (level > 0) {
      ctx.fillStyle = 'rgba(170,205,215,0.45)';
      ctx.beginPath();
      ctx.moveTo(-w * 0.47, h * 0.5 - level * h * 0.92);
      ctx.lineTo(w * 0.47, h * 0.5 - level * h * 0.92);
      ctx.lineTo(w * 0.42, h * 0.5);
      ctx.lineTo(-w * 0.42, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w * 0.47, h * 0.5 - level * h * 0.92); ctx.lineTo(w * 0.47, h * 0.5 - level * h * 0.92); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(230,240,245,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(-w * 0.42, h / 2); ctx.lineTo(w * 0.42, h / 2); ctx.lineTo(w / 2, -h / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-w * 0.38, -h * 0.4, w * 0.08, h * 0.75);
    ctx.restore();
  }

  function mirrorShot(ctx, t) {
    D.img(ctx, tiles(), -200, -200);
    // light from the small window, upper right
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 1750, 60, 900, LIGHT, 0.35);
    ctx.restore();
    // the mirror and what's in it
    const mx = 560, my = 40, mw = 800, mh = 590;
    ctx.save();
    ctx.beginPath(); ctx.rect(mx, my, mw, mh); ctx.clip();
    ctx.save();
    ctx.globalAlpha = 0.75;
    D.img(ctx, tiles(), mx - 300, my - 100, 2400 * 0.8, 1200 * 0.8);
    ctx.restore();
    ctx.fillStyle = 'rgba(40,46,50,0.25)';
    ctx.fillRect(mx, my, mw, mh);
    // reflected door behind him
    ctx.fillStyle = 'rgb(120,110,100)';
    ctx.fillRect(mx + 40, my + 40, 200, 520);
    ctx.fillStyle = 'rgb(210,200,186)';
    ctx.fillRect(mx + 250, my + 180, 60, 180); // towel
    const br = Math.sin(t * 1.3) * 2.5;
    const blink = 1 - U.win(t, 3.2, 3.55, 0.12, 0.2) - U.win(t, 7.4, 7.9, 0.15, 0.3);
    C.head(ctx, {
      x: 960 + Math.sin(t * 0.3) * 6, y: 280 + br, s: 350, beard: 1.4, yaw: 0.05 + Math.sin(t * 0.25) * 0.04, pitch: -0.02, roll: Math.sin(t * 0.2) * 0.02,
      eye: 0.8 * blink, tired: 1, worry: 0.35, gaze: [0, 0.05], skin: PALE, shirt: [96, 100, 104],
      light: { dx: 0.8, dy: -0.5, col: LIGHT, amt: 0.22 }, shadow: 0.4, shade: [60, 66, 70], wet: 0.6,
    });
    // fog at the mirror's edges, a streak across it
    const g = ctx.createRadialGradient(960, 330, 260, 960, 330, 560);
    g.addColorStop(0, 'rgba(235,240,240,0)');
    g.addColorStop(1, 'rgba(235,240,240,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    D.poly(ctx, [[mx + 520, my], [mx + 600, my], [mx + 300, my + mh], [mx + 220, my + mh]]);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgb(160,164,168)';
    ctx.lineWidth = 10;
    ctx.strokeRect(mx, my, mw, mh);
    // shelf, cup with a toothbrush, soap; the top of the sink
    ctx.fillStyle = 'rgb(236,238,236)';
    ctx.fillRect(560, 630, 800, 16);
    ctx.fillStyle = 'rgba(170,200,220,0.8)';
    ctx.fillRect(640, 560, 46, 70);
    ctx.strokeStyle = 'rgb(60,120,170)';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(660, 575); ctx.lineTo(645, 500); ctx.stroke();
    ctx.fillStyle = 'rgb(226,210,170)';
    D.rrect(ctx, 1210, 600, 90, 30, 12);
    ctx.fill();
    D.vgrad(ctx, 420, 700, 1080, 120, [[0, [244, 246, 246]], [1, [200, 206, 208]]]);
    ctx.fillStyle = 'rgb(150,156,160)';
    ctx.fillRect(935, 660, 50, 60);
  }

  function pillShot(ctx, t) {
    const lt = t - 10;
    D.img(ctx, tiles(), -300, -500, 2400 * 1.3, 1200 * 1.3);
    D.vgrad(ctx, -100, 560, W + 200, 400, [[0, [238, 240, 240]], [1, [196, 202, 204]]]);
    ctx.fillStyle = 'rgba(120,130,134,0.5)';
    ctx.beginPath(); ctx.ellipse(960, 760, 520, 90, 0, 0, 7); ctx.fill();
    const skin = PALE;
    // left hand under the blister strip
    C.hand(ctx, { x: 700, y: 520, s: 190, rot: 1.25, curl: 0.35, thumb: -0.2, skin: U.mul(skin, 0.92), sleeve: [96, 100, 104] });
    ctx.save();
    ctx.translate(820, 380);
    ctx.rotate(-0.12);
    ctx.fillStyle = 'rgb(200,204,210)';
    ctx.fillRect(-160, -90, 340, 170);
    ctx.strokeStyle = 'rgba(120,124,130,0.6)';
    ctx.strokeRect(-160, -90, 340, 170);
    const pop = U.ss(2.1, 2.35, lt);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
      const bx = -120 + i * 70, by = -45 + j * 85;
      const empty = (i < 2 && j === 0) || (i === 2 && j === 0 && pop > 0.5);
      ctx.fillStyle = empty ? 'rgba(160,164,170,0.8)' : 'rgb(236,238,240)';
      ctx.beginPath(); ctx.ellipse(bx, by, 26, 18, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(140,144,150,0.7)';
      ctx.stroke();
    }
    ctx.restore();
    // right hand, thumb pressing the tablet through the foil
    const press = U.ss(0.4, 2.2, lt) * (1 - U.ss(2.4, 3, lt));
    C.hand(ctx, { x: 1130, y: U.lerp(150, 200, press), s: 180, rot: 2.6, curl: 0.75, thumb: 2.3, thumbLen: 1.25, skin, sleeve: [96, 100, 104] });
    // the tablet falls into the palm
    if (lt > 2.3) {
      const f = U.easeIn(U.inv(2.3, 2.8, lt));
      ctx.fillStyle = 'rgb(248,248,244)';
      ctx.beginPath(); ctx.ellipse(U.lerp(960, 900, f), U.lerp(420, 560, f), 20, 13, 0.3, 0, 7); ctx.fill();
    }
  }

  function tapShot(ctx, t) {
    const lt = t - 13.2;
    D.img(ctx, tiles(), -400, -300, 2400 * 1.5, 1200 * 1.5);
    D.vgrad(ctx, -100, 620, W + 200, 300, [[0, [240, 242, 242]], [1, [190, 196, 198]]]);
    // chrome tap
    const g = ctx.createLinearGradient(0, 120, 0, 240);
    g.addColorStop(0, 'rgb(236,240,244)');
    g.addColorStop(1, 'rgb(120,126,132)');
    ctx.fillStyle = g;
    D.rrect(ctx, 640, 120, 380, 70, 30);
    ctx.fill();
    D.rrect(ctx, 930, 150, 80, 110, 20);
    ctx.fill();
    const flow = U.win(lt, 0.3, 4.0, 0.15, 0.2);
    const level = U.ss(0.6, 3.9, lt) * 0.82;
    if (flow > 0.01) {
      ctx.strokeStyle = `rgba(210,232,240,${0.8 * flow})`;
      ctx.lineWidth = 20 * flow;
      ctx.beginPath();
      for (let y = 260; y < 640 - level * 300; y += 10) {
        const x = 970 + Math.sin(y * 0.1 + t * 30) * 2;
        y === 260 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.6 * flow})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(966, 262); ctx.lineTo(966, 620 - level * 300); ctx.stroke();
    }
    // his hand around the glass
    glass(ctx, 970, 500, 190, 300, level);
    C.hand(ctx, { x: 1060, y: 560, s: 170, rot: -1.62, curl: 0.55, thumb: -0.4, skin: U.mul(PALE, 0.95), sleeve: [96, 100, 104] });
  }

  function drinkShot(ctx, t) {
    const lt = t - 18;
    D.img(ctx, tiles(), -300, -200, 2400 * 1.2, 1200 * 1.2);
    // the small window's light
    ctx.fillStyle = 'rgb(255,250,236)';
    ctx.fillRect(1480, 60, 260, 200);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 1610, 160, 700, LIGHT, 0.4);
    D.rays(ctx, t, { x: 1610, y: 160, ang: Math.PI * 0.8, spread: 0.3, len: 1300, n: 4, col: LIGHT, alpha: 0.08, width: 0.06 });
    ctx.restore();
    const drink = U.win(lt, 0.5, 5.2, 0.8, 0.9);
    const pitch = 0.28 * drink - 0.18 * U.ss(5.8, 7.2, lt);
    C.head(ctx, {
      x: 820, y: 360, s: 420, yaw: 1.3, pitch, eye: 0.75 - 0.3 * drink, tired: 1, skin: PALE, shirt: [96, 100, 104],
      light: { dx: 1, dy: -0.4, col: LIGHT, amt: 0.3 }, shadow: 0.5, shade: [60, 66, 70],
    });
    // the glass rises to his lips, tips, and is set down again
    const down = U.ss(5.0, 6.0, lt);
    const rot = -1.05 * drink;
    // rim touching the mouth while drinking
    const lip = [985, 482 - pitch * 120];
    const gx = U.lerp(U.lerp(1180, lip[0] + 55, drink), 1300, down), gy = U.lerp(U.lerp(760, lip[1] + 95, drink), 950, down);
    const level = U.lerp(0.82, 0.12, U.ss(0.8, 4.8, lt));
    glass(ctx, gx, gy, 130, 210, level, rot);
    C.hand(ctx, { x: gx + 45 + drink * 10, y: gy + 40, s: 150, rot: U.lerp(-1.62, -0.85, drink), curl: 0.6, thumb: -0.5, skin: U.mul(PALE, 0.95), sleeve: [96, 100, 104] });
  }

  FILM.scene({
    order: 8, num: 8, name: 'Morning routine', dur: 26,
    dissolve: 2,
    post: { grain: 0.07, vignette: 0.4 },
    draw(ctx, t) {
      if (t < 10) mirrorShot(ctx, t);
      else if (t < 13.2) pillShot(ctx, t);
      else if (t < 18) tapShot(ctx, t);
      else drinkShot(ctx, t);
      // flat, cold, ordinary
      D.screen(ctx, 'rgb(170,190,196)', 0.08, 'multiply');
    },
    audio(h, fx) {
      h.verb('room', 0.45);
      fx.bed(h, { color: 'pink', type: 'lowpass', f: 900, gain: 0.02 });
      fx.bed(h, { color: 'brown', type: 'bandpass', f: 300, Q: 0.6, gain: 0.03 });
      fx.scatter(h, 0.5, 26, 0.4, 88, (w, k) => fx.bird(h, w, { gain: 0.018, pan: 0.8, base: 3000 + k * 1200 }));
      // a slow drip from the tap
      for (const T of [1.8, 4.9, 8.1]) h.at(T, (w) => fx.drip(h, w, { gain: 0.05, f: 900, pan: 0.1 }));
      // blister pack
      fx.scatter(h, 10.5, 12.2, 8, 89, (w, k) => fx.burst(h, w, { type: 'highpass', f: 3000 + k * 3000, d: 0.02, gain: 0.03 }));
      h.at(12.3, (w) => { fx.click(h, w, { gain: 0.25, f: 2600 }); fx.burst(h, w, { type: 'highpass', f: 4000, d: 0.05, gain: 0.1 }); });
      h.at(12.8, (w) => fx.tick(h, w, { gain: 0.05, pitch: 0.6 }));
      // tap: squeak, rush, a glass filling (its note rising), squeak
      h.at(13.4, (w) => fx.tone(h, w, { type: 'triangle', f: 900, f2: 1300, d: 0.15, gain: 0.03 }));
      const water = fx.bed(h, { color: 'white', type: 'bandpass', f: 1800, Q: 0.5, gain: 0 });
      h.param(water.g.gain, [[0, 0], [13.45, 0], [13.6, 0.09], [17.0, 0.09], [17.2, 0]]);
      const fill = fx.bed(h, { color: 'pink', type: 'bandpass', f: 420, Q: 6, gain: 0 });
      h.param(fill.g.gain, [[0, 0], [13.7, 0], [14, 0.08], [17, 0.08], [17.2, 0]]);
      h.param(fill.f.frequency, [[0, 420], [13.7, 420], [17.1, 1400]], true);
      h.at(17.1, (w) => fx.tone(h, w, { type: 'triangle', f: 1300, f2: 850, d: 0.12, gain: 0.03 }));
      // drinking, swallowing
      for (const T of [19.3, 20.2, 21.1]) h.at(T, (w) => fx.swallow(h, w, { gain: 0.22 }));
      h.at(23.6, (w) => { fx.glass(h, w, { gain: 0.1 }); fx.thud(h, w, { gain: 0.1, f: 180, d: 0.08 }); });
      h.at(24.5, (w) => fx.breath(h, w, { dur: 1.8, inhale: false, gain: 0.06, f: 700 }));
    },
  });
})();
