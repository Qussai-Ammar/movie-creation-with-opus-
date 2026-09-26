/* One Night — shared sets: the bedroom (wide, ceiling, close-up on the pillow) and the street. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;
  const S = (FILM.sets = {});

  /* ======================================================== the red balloon */
  // the only saturated red in the film. end = [x, y] where the string is held (or trails to)
  S.balloon = function (ctx, x, y, r, t, end, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
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
    ctx.strokeStyle = 'rgba(255,210,140,0.5)';
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.97, r * 1.13, 0, -2.6, -1.0); ctx.stroke();
    ctx.restore();
  };

  /* =============================================================== bedroom */
  const NIGHT = {
    wall: [30, 32, 45], ceil: [22, 24, 34], floor: [15, 16, 21], side: [24, 26, 37],
    light: [255, 150, 64], out: [18, 22, 38], lamp: [255, 168, 86],
    sheet: [64, 66, 82], blanket: [56, 50, 64], wood: [34, 27, 25], shirt: [58, 60, 68],
  };
  const DAWN = {
    wall: [60, 68, 84], ceil: [50, 56, 70], floor: [34, 38, 48], side: [48, 55, 70],
    light: [150, 170, 205], out: [96, 116, 146], lamp: [120, 130, 150],
    sheet: [92, 100, 118], blanket: [74, 76, 94], wood: [44, 40, 42], shirt: [70, 76, 88],
  };
  const GOLDEN = {
    wall: [150, 112, 82], ceil: [120, 88, 66], floor: [86, 62, 46], side: [128, 94, 70],
    light: [255, 196, 120], out: [255, 212, 150], lamp: [255, 214, 150],
    sheet: [206, 180, 150], blanket: [128, 108, 120], wood: [88, 60, 44], shirt: [70, 72, 80],
  };
  S.bedPal = (warm, golden = 0) => {
    const r = {};
    for (const k in NIGHT) r[k] = U.mix(U.mix(DAWN[k], NIGHT[k], warm), GOLDEN[k], golden);
    return r;
  };

  // bilinear point inside a quad [tl, tr, br, bl]
  const quadPt = (q, u, v) => {
    const a = [U.lerp(q[0][0], q[1][0], u), U.lerp(q[0][1], q[1][1], u)];
    const b = [U.lerp(q[3][0], q[2][0], u), U.lerp(q[3][1], q[2][1], u)];
    return [U.lerp(a[0], b[0], v), U.lerp(a[1], b[1], v)];
  };
  S.quadPt = quadPt;
  // four window panes (mullion cross) inside a quad
  S.panes = (ctx, q, gap = 0.035, split = 0.42) => {
    ctx.beginPath();
    const cells = [[0, 0.5 - gap / 2, 0, split - gap / 2], [0.5 + gap / 2, 1, 0, split - gap / 2], [0, 0.5 - gap / 2, split + gap / 2, 1], [0.5 + gap / 2, 1, split + gap / 2, 1]];
    for (const [u0, u1, v0, v1] of cells) {
      const p = [quadPt(q, u0, v0), quadPt(q, u1, v0), quadPt(q, u1, v1), quadPt(q, u0, v1)];
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.closePath();
    }
  };

  // soft four-pane window light, pre-blurred once per colour, mapped onto a quad
  const lightSprite = (col, gap, soft) => {
    const c = col.map((v) => Math.round(v / 16) * 16);
    return FILM.cached(`panes-${c.join(',')}-${gap}-${soft}`, 400, 300, (x) => {
      x.filter = `blur(${soft * FILM.q}px)`;
      x.fillStyle = U.rgb(c);
      S.panes(x, [[40, 40], [360, 40], [360, 260], [40, 260]], gap);
      x.fill();
    });
  };
  S.lightQuad = (ctx, q, col, alpha, gap = 0.035, soft = 8) => {
    if (alpha <= 0.002) return;
    const img = lightSprite(col, gap, soft);
    const [tl, tr, , bl] = q;
    const a = (tr[0] - tl[0]) / 320, b = (tr[1] - tl[1]) / 320, c = (bl[0] - tl[0]) / 220, d = (bl[1] - tl[1]) / 220;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= alpha;
    ctx.transform(a, b, c, d, tl[0] - a * 40 - c * 40, tl[1] - b * 40 - d * 40);
    ctx.drawImage(img, 0, 0, 400, 300);
    ctx.restore();
  };

  // room geometry (one-point perspective, looking at the back wall)
  const BW = { x0: 300, x1: 1500, y0: 110, y1: 600 };
  const rwTop = (x) => U.lerp(BW.y0, -60, (x - BW.x1) / 420);
  const rwBot = (x) => U.lerp(BW.y1, 780, (x - BW.x1) / 420);
  const rw = (x, f) => [x, U.lerp(rwTop(x), rwBot(x), f)];
  const lwTop = (x) => U.lerp(BW.y0, -60, (BW.x0 - x) / 300);
  const lwBot = (x) => U.lerp(BW.y1, 780, (BW.x0 - x) / 300);
  const WIN = [rw(1590, 0.2), rw(1800, 0.2), rw(1800, 0.66), rw(1590, 0.66)];

  /* o: warm 0..1, sway, man 'lying'|'sitting'|'none', eye, breath, clock, sweeps [t0...], cam {x,y,z}, blanket 'on'|'thrown' */
  S.bedroom = function (ctx, t, o = {}) {
    const warm = o.warm ?? 1;
    const P = S.bedPal(warm, o.golden || 0);
    const lit = (o.lightAmt ?? 1) * (0.35 + 0.65 * warm);
    const sway = U.fbm(t * 0.33, 4) * (o.sway ?? 1);
    ctx.save();
    if (o.cam) D.cam(ctx, o.cam.x, o.cam.y, o.cam.z || 1);

    // ceiling, walls, floor
    ctx.fillStyle = U.rgb(P.ceil);
    D.poly(ctx, [[-300, -300], [W + 300, -300], [BW.x1 + 420 * 1.7, -60 - 170 * 0.7], [BW.x1, BW.y0], [BW.x0, BW.y0], [BW.x0 - 300 * 1.7, -60 - 170 * 0.7]]);
    ctx.fill();
    ctx.fillStyle = D.lgrad(ctx, 0, BW.y0, 0, BW.y1, [[0, U.mul(P.wall, 0.82)], [1, P.wall]]);
    ctx.fillRect(BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0);
    ctx.fillStyle = D.lgrad(ctx, BW.x1, 0, W + 200, 0, [[0, U.mul(P.side, 0.9)], [1, U.mul(P.side, 0.7)]]);
    D.poly(ctx, [[BW.x1, BW.y0], [W + 300, -60 - 170 * 1.2], [W + 300, 780 + 180 * 1.2], [BW.x1, BW.y1]]);
    ctx.fill();
    ctx.fillStyle = D.lgrad(ctx, BW.x0, 0, -200, 0, [[0, U.mul(P.side, 0.85)], [1, U.mul(P.side, 0.55)]]);
    D.poly(ctx, [[BW.x0, BW.y0], [-300, -60 - 170 * 1.4], [-300, 780 + 180 * 1.4], [BW.x0, BW.y1]]);
    ctx.fill();
    ctx.fillStyle = D.lgrad(ctx, 0, BW.y1, 0, H + 100, [[0, P.floor], [1, U.mul(P.floor, 0.55)]]);
    D.poly(ctx, [[BW.x0, BW.y1], [BW.x1, BW.y1], [W + 400, 1000], [-400, 1000]]);
    ctx.fill();
    // floor boards
    ctx.strokeStyle = U.rgb(U.mul(P.floor, 0.7), 0.6);
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(900 + i * 60, BW.y1);
      ctx.lineTo(900 + i * 260, 1000);
      ctx.stroke();
    }
    // skirting + cornice
    ctx.fillStyle = U.rgb(U.mul(P.wall, 0.55));
    ctx.fillRect(BW.x0, BW.y1 - 12, BW.x1 - BW.x0, 12);
    ctx.fillStyle = U.rgb(U.mul(P.wall, 0.7));
    ctx.fillRect(BW.x0, BW.y0, BW.x1 - BW.x0, 5);

    // door on the left wall
    const dq = [[60, lwTop(60) + (lwBot(60) - lwTop(60)) * 0.2], [230, lwTop(230) + (lwBot(230) - lwTop(230)) * 0.2], [230, lwBot(230) - 2], [60, lwBot(60) - 2]];
    ctx.fillStyle = U.rgb(U.mul(P.wood, 0.9));
    D.poly(ctx, dq);
    ctx.fill();
    ctx.strokeStyle = U.rgb(U.mul(P.wood, 0.6));
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = U.rgb([140, 120, 90], 0.5 * (0.4 + warm * 0.6));
    ctx.beginPath(); ctx.arc(205, U.lerp(dq[1][1], dq[2][1], 0.55), 5, 0, 7); ctx.fill();

    // framed photograph on the back wall (a mother and child, barely legible)
    ctx.fillStyle = U.rgb(U.mul(P.wood, 0.8));
    ctx.fillRect(520, 215, 92, 116);
    ctx.fillStyle = U.rgb(U.mix(P.wall, [150, 120, 80], 0.35));
    ctx.fillRect(530, 225, 72, 96);
    ctx.fillStyle = U.rgb(U.mul(P.wall, 0.5));
    ctx.beginPath(); ctx.arc(556, 262, 11, 0, 7); ctx.fill();
    ctx.fillRect(545, 272, 22, 49);
    ctx.beginPath(); ctx.arc(583, 285, 7, 0, 7); ctx.fill();
    ctx.fillRect(577, 292, 13, 29);
    ctx.strokeStyle = U.rgb(U.mul(P.wall, 0.6));
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(589, 296); ctx.lineTo(595, 248); ctx.stroke();
    ctx.fillStyle = U.rgb(U.mix([170, 40, 40], P.wall, 0.45 + 0.2 * (1 - warm)));
    ctx.beginPath(); ctx.ellipse(595, 242, 6, 7, 0, 0, 7); ctx.fill();

    // window on the right wall
    const wq = WIN;
    ctx.fillStyle = D.lgrad(ctx, 0, wq[0][1], 0, wq[2][1], [[0, P.out], [1, U.mix(P.out, P.light, 0.3 * warm)]]);
    D.poly(ctx, wq);
    ctx.fill();
    ctx.save();
    D.poly(ctx, wq);
    ctx.clip();
    // buildings across the street, a few lit windows
    ctx.fillStyle = U.rgb(U.mul(P.out, 0.55));
    ctx.fillRect(1560, 300, 120, 400);
    ctx.fillRect(1700, 250, 140, 450);
    for (let i = 0; i < 9; i++) {
      const on = U.hash(i * 3.3) > 0.55 && warm > 0.4;
      ctx.fillStyle = on ? U.rgb([255, 190, 120], 0.55) : U.rgb(U.mul(P.out, 0.8));
      ctx.fillRect(1575 + (i % 3) * 32, 330 + Math.floor(i / 3) * 50, 14, 20);
      ctx.fillRect(1718 + (i % 3) * 38, 285 + Math.floor(i / 3) * 55, 16, 22);
    }
    D.glow(ctx, 1760, 250, 170, P.lamp, 0.9 * warm + 0.05);
    // something drifting past outside
    if (o.windowBalloon) {
      const wb = o.windowBalloon;
      const p = quadPt(wq, wb.u, wb.v);
      S.balloon(ctx, p[0], p[1], wb.r || 22, t, [p[0] + 6, p[1] + (wb.r || 22) * 5]);
    }
    ctx.restore();
    ctx.strokeStyle = U.rgb(U.mul(P.side, 0.5));
    ctx.lineWidth = 12;
    D.poly(ctx, wq);
    ctx.stroke();
    ctx.lineWidth = 7;
    const m1 = quadPt(wq, 0.5, 0), m2 = quadPt(wq, 0.5, 1), m3 = quadPt(wq, 0, 0.42), m4 = quadPt(wq, 1, 0.42);
    ctx.beginPath(); ctx.moveTo(m1[0], m1[1]); ctx.lineTo(m2[0], m2[1]); ctx.moveTo(m3[0], m3[1]); ctx.lineTo(m4[0], m4[1]); ctx.stroke();
    // sheer curtain
    ctx.save();
    const cq = [rw(1570, 0.16), rw(1820, 0.16), rw(1820, 0.72), rw(1570, 0.72)];
    ctx.beginPath();
    ctx.moveTo(cq[0][0], cq[0][1]);
    ctx.lineTo(cq[1][0], cq[1][1]);
    for (let i = 0; i <= 10; i++) {
      const f = 1 - i / 10;
      const p = quadPt(cq, f, 1);
      ctx.lineTo(p[0] + sway * 26 * (1 - f * 0.5) + Math.sin(i * 1.7 + t) * 3, p[1] + Math.sin(i * 2.1) * 6);
    }
    ctx.closePath();
    ctx.fillStyle = U.rgb(U.mix([200, 190, 180], P.light, 0.4), 0.16 + 0.05 * warm);
    ctx.fill();
    ctx.strokeStyle = U.rgb([230, 220, 210], 0.06);
    ctx.lineWidth = 5;
    for (let i = 1; i < 9; i++) {
      const a = quadPt(cq, i / 9, 0), b = quadPt(cq, i / 9, 1);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0] + sway * 20 * (i / 9), b[1]); ctx.stroke();
    }
    ctx.restore();
    // heavy curtain panels
    for (const [x0, x1, s] of [[1535, 1610, 0.4], [1790, 1880, 1]]) {
      const q = [rw(x0, 0.13), rw(x1, 0.13), rw(x1, 0.8), rw(x0, 0.8)];
      ctx.fillStyle = U.rgb(U.mul(P.blanket, 0.75));
      ctx.beginPath();
      ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]);
      ctx.lineTo(q[2][0] + sway * 14 * s, q[2][1]);
      ctx.quadraticCurveTo((q[2][0] + q[3][0]) / 2, q[2][1] + 12, q[3][0] + sway * 10 * s, q[3][1]);
      ctx.closePath();
      ctx.fill();
    }
    // curtain rod
    ctx.strokeStyle = U.rgb(U.mul(P.wood, 0.8));
    ctx.lineWidth = 6;
    const r1 = rw(1520, 0.13), r2 = rw(1900, 0.13);
    ctx.beginPath(); ctx.moveTo(r1[0], r1[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke();

    // streetlight projected on the back wall (with the window cross)
    const pq = [[770 + sway * 16, 150], [1050 + sway * 22, 128], [1085 + sway * 26, 430], [800 + sway * 18, 468]];
    S.lightQuad(ctx, pq, P.light, 0.13 * lit);
    // light on the floor under the window
    S.lightQuad(ctx, [[1200, 640], [1480, 625], [1560, 770], [1230, 800]], P.light, 0.07 * lit, 0.035, 12);

    // chair with a jacket
    ctx.fillStyle = U.rgb(U.mul(P.wood, 0.85));
    ctx.fillRect(1330, 430, 12, 200);
    ctx.fillRect(1440, 430, 12, 200);
    ctx.fillRect(1330, 520, 122, 14);
    ctx.fillStyle = U.rgb(U.mul(P.shirt, 0.7));
    D.curve(ctx, [[1325, 425], [1400, 415], [1460, 430], [1470, 560], [1440, 610], [1400, 540], [1340, 600], [1318, 520]]);
    ctx.fill();

    // nightstand + clock + glass
    ctx.fillStyle = U.rgb(P.wood);
    ctx.fillRect(312, 470, 78, 130);
    ctx.fillStyle = U.rgb(U.mul(P.wood, 1.3));
    ctx.fillRect(308, 464, 86, 8);
    ctx.fillStyle = '#060606';
    ctx.fillRect(322, 440, 44, 24);
    ctx.fillStyle = `rgba(255,40,30,${0.85})`;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(o.clock || '03:17', 344, 457);
    D.glow(ctx, 344, 452, 40, [255, 40, 30], 0.12);
    ctx.fillStyle = U.rgb(U.mix(P.out, [200, 210, 230], 0.3), 0.35);
    ctx.fillRect(373, 440, 12, 24);

    // bed
    const bx0 = 395, bx1 = 1220;
    ctx.fillStyle = U.rgb(U.mul(P.wood, 1.1));
    ctx.fillRect(bx0 - 16, 360, 18, 240); // headboard
    ctx.fillStyle = U.rgb(P.wood);
    ctx.fillRect(bx0, 540, bx1 - bx0, 36);
    ctx.fillRect(bx0 + 6, 570, 14, 34);
    ctx.fillRect(bx1 - 22, 570, 14, 34);
    ctx.fillStyle = U.rgb(P.sheet);
    ctx.fillRect(bx0, 486, bx1 - bx0, 56);
    ctx.fillStyle = U.rgb(U.mul(P.sheet, 1.15));
    ctx.fillRect(bx0, 480, bx1 - bx0, 10);
    // shadow on floor
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(bx0 - 10, 600, bx1 - bx0 + 40, 14);

    const breath = Math.sin(t * (o.breathRate || 1.3)) * 3.2;
    if (o.man === 'lying' || o.man == null) {
      // pillow
      ctx.fillStyle = U.rgb(U.mul(P.sheet, 1.3));
      D.curve(ctx, [[400, 470], [480, 452], [585, 462], [590, 492], [480, 500], [405, 496]]);
      ctx.fill();
      C.head(ctx, {
        x: 485, y: 448, s: 74, roll: -Math.PI / 2, yaw: 1.3, eye: o.eye ?? 1, bust: false, tired: 0.6,
        skin: U.mix(C.pal.manSkin, P.wall, 0.45), hair: C.pal.hair,
        light: { dx: 0.8, dy: -0.4, col: P.light, amt: 0.25 * lit }, shade: [8, 8, 14],
      });
      // blanket over the body
      ctx.fillStyle = U.rgb(P.blanket);
      D.curve(ctx, [
        [540, 492], [560, 452], [640, 432 - breath], [760, 440 - breath * 0.6], [870, 452], [960, 438], [1060, 446], [1150, 452], [1225, 470],
        [1228, 560], [900, 575], [540, 560],
      ]);
      ctx.fill();
      ctx.strokeStyle = U.rgb(U.mul(P.blanket, 0.65), 0.8);
      ctx.lineWidth = 3;
      for (const [a, b] of [[[690, 470], [760, 540]], [[900, 470], [860, 540]], [[1010, 460], [1080, 530]], [[1150, 470], [1180, 540]]]) {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] + 30, (a[1] + b[1]) / 2, b[0], b[1]); ctx.stroke();
      }
      // light across the blanket
      S.lightQuad(ctx, [[820 + sway * 10, 440], [1110 + sway * 14, 436], [1140, 560], [850, 566]], P.light, 0.08 * lit);
    } else if (o.man === 'custom') {
      ctx.fillStyle = U.rgb(U.mul(P.sheet, 1.3));
      D.curve(ctx, [[400, 470], [480, 452], [585, 462], [590, 492], [480, 500], [405, 496]]);
      ctx.fill();
      o.drawMan(ctx, P);
      // blanket over his legs
      ctx.fillStyle = U.rgb(P.blanket);
      D.curve(ctx, [[600, 500], [640, 462], [760, 452], [880, 460], [980, 446], [1100, 452], [1200, 468], [1228, 560], [900, 575], [600, 560]]);
      ctx.fill();
      ctx.strokeStyle = U.rgb(U.mul(P.blanket, 0.65), 0.8);
      ctx.lineWidth = 3;
      for (const [a, b] of [[[720, 470], [780, 540]], [[900, 470], [860, 540]], [[1040, 462], [1090, 530]]]) {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] + 30, (a[1] + b[1]) / 2, b[0], b[1]); ctx.stroke();
      }
    } else if (o.man === 'sitting') {
      // pillow pushed aside, blanket thrown back
      ctx.fillStyle = U.rgb(U.mul(P.sheet, 1.25));
      D.curve(ctx, [[400, 470], [470, 450], [570, 466], [565, 494], [470, 500], [404, 496]]);
      ctx.fill();
      ctx.fillStyle = U.rgb(P.blanket);
      D.curve(ctx, [[560, 486], [620, 456], [720, 470], [780, 450], [880, 474], [960, 468], [1000, 500], [990, 560], [700, 575], [570, 560]]);
      ctx.fill();
      ctx.strokeStyle = U.rgb(U.mul(P.blanket, 0.6), 0.8);
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(600 + i * 80, 470 + (i % 2) * 10); ctx.quadraticCurveTo(640 + i * 80, 520, 610 + i * 85, 560); ctx.stroke();
      }
      C.figure(ctx, {
        x: 1150, y: 494, h: 560, facing: 1, view: 'side', pose: C.poses.sitHunched(t, o.breathAmt ?? 1),
        col: { skin: U.mix(C.pal.manSkin, P.wall, 0.5), shirt: P.shirt, pants: U.mul(P.shirt, 0.7), hair: C.pal.hair }, sleeves: 'short',
        rim: { col: U.mix(P.light, [255, 255, 255], 0.2), dx: 3, dy: -1 },
      });
    }

    // passing headlights sweeping across the room
    for (const s0 of o.sweeps || []) {
      const k = (t - s0) / 3.6;
      if (k < 0 || k > 1) continue;
      const cx = U.lerp(1700, 150, U.easeInOut(k));
      const a = Math.sin(k * Math.PI) * 0.1 * (0.4 + warm * 0.6);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = D.lgrad(ctx, cx - 200, 0, cx + 160, 0, [[0, [210, 215, 255], 0], [0.5, [210, 215, 255], a], [1, [210, 215, 255], 0]]);
      D.poly(ctx, [[cx - 120, -60], [cx + 180, -60], [cx + 100, 640], [cx - 210, 640]]);
      ctx.fill();
      ctx.restore();
    }

    // overall darkness (sleepier as the night goes on)
    if (o.dim) { ctx.fillStyle = `rgba(0,0,0,${o.dim})`; ctx.fillRect(-400, -400, W + 800, H + 800); }
    ctx.restore();
  };

  /* ---------------------------------------------------------- the ceiling */
  const plaster = () => FILM.cached('plaster', 2400, 1400, (x, w, h) => {
    const r = U.rng(21);
    x.fillStyle = '#808080';
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const v = r() > 0.5 ? 255 : 0;
      x.fillStyle = `rgba(${v},${v},${v},${0.018 + r() * 0.03})`;
      x.beginPath();
      x.arc(r() * w, r() * h, 10 + r() * 90, 0, 7);
      x.fill();
    }
    // water stain
    for (let i = 0; i < 30; i++) {
      x.fillStyle = `rgba(90,70,40,${0.02})`;
      x.beginPath(); x.arc(1600 + r() * 120, 500 + r() * 90, 60 + r() * 60, 0, 7); x.fill();
    }
    // crack
    x.strokeStyle = 'rgba(0,0,0,0.45)';
    x.lineWidth = 2;
    x.beginPath();
    let px = 400, py = 200;
    x.moveTo(px, py);
    for (let i = 0; i < 40; i++) { px += 18 + r() * 14; py += (r() - 0.35) * 22; x.lineTo(px, py); }
    x.stroke();
  });

  /* o: warm, rot, zoom, stretch 0..1 (shadows lengthen), breathe, dark, sweeps, lampSwing */
  S.ceiling = function (ctx, t, o = {}) {
    const warm = o.warm ?? 1;
    const P = S.bedPal(warm);
    const base = U.mul(U.mix(P.ceil, P.wall, 0.5), 1.25);
    ctx.save();
    D.cam(ctx, 960, 402, (o.zoom || 1) * (1 + (o.breathe || 0) * 0.015 * Math.sin(t * 0.9)), o.rot || 0);
    ctx.fillStyle = U.rgb(base);
    ctx.fillRect(-400, -500, W + 800, H + 1000);
    ctx.globalCompositeOperation = 'overlay';
    D.img(ctx, plaster(), -240, -300);
    ctx.globalCompositeOperation = 'source-over';
    // edge of the wall (ceiling corner) at the bottom of frame
    ctx.fillStyle = U.rgb(U.mul(base, 0.6));
    D.poly(ctx, [[-400, 760], [W + 400, 700], [W + 400, 1300], [-400, 1300]]);
    ctx.fill();

    const st = o.stretch || 0;
    const sw = U.fbm(t * 0.33, 4) * (o.sway ?? 1);
    // window light on the ceiling, stretching toward the corners as sleep comes
    const q = [[1080, 140], [1500, 190], [1440, 560], [1030, 500]].map(([x, y]) => [
      x - st * (1700 - x) * 0.9 + sw * 20 + Math.sin(t * 0.7 + y * 0.01) * st * 30,
      y + st * (y - 350) * 0.6,
    ]);
    S.lightQuad(ctx, q, P.light, (0.2 - st * 0.08) * (0.35 + 0.65 * warm) * (o.lightAmt ?? 1), st > 0.5 ? 0.12 : 0.05, st > 0.5 ? 22 : 10);

    // lamp fixture (seen from below)
    const lx = 900 + Math.sin(t * 0.8) * (o.lampSwing || 0) * 40, ly = 400;
    ctx.save();
    ctx.filter = `blur(${12 * FILM.q}px)`;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(lx - 50 - st * 160, ly + 10, 150 + st * 200, 120 + st * 30, 0.2, 0, 7); ctx.fill();
    ctx.restore();
    const lg = ctx.createRadialGradient(lx - 30, ly - 30, 10, lx, ly, 120);
    lg.addColorStop(0, U.rgb(U.mul(base, 1.5)));
    lg.addColorStop(1, U.rgb(U.mul(base, 0.7)));
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx, ly, 115, 0, 7); ctx.fill();
    ctx.strokeStyle = U.rgb(U.mul(base, 0.5));
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(lx, ly, 115, 0, 7); ctx.stroke();
    ctx.strokeStyle = U.rgb(U.mul(base, 0.8));
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(lx, ly, 78, 0, 7); ctx.stroke();
    ctx.fillStyle = U.rgb(U.mul(base, 1.2));
    ctx.beginPath(); ctx.arc(lx, ly, 14, 0, 7); ctx.fill();

    for (const s0 of o.sweeps || []) {
      const k = (t - s0) / 3.6;
      if (k < 0 || k > 1) continue;
      const cx = U.lerp(1900, -100, U.easeInOut(k));
      const a = Math.sin(k * Math.PI) * 0.12 * (0.4 + warm * 0.6);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = D.lgrad(ctx, cx - 260, 0, cx + 200, 0, [[0, [200, 210, 255], 0], [0.5, [200, 210, 255], a], [1, [200, 210, 255], 0]]);
      D.poly(ctx, [[cx - 140, -300], [cx + 200, -300], [cx + 80, 1100], [cx - 260, 1100]]);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    if (o.dark) D.screen(ctx, `rgba(0,0,0,${o.dark})`);
  };

  /* ------------------------------------------- close-up: face on the pillow */
  // o: warm, eye, zoom, gaze, tired, cam [x, y], dim
  S.lyingFace = function (ctx, t, o = {}) {
    const warm = o.warm ?? 1;
    const P = S.bedPal(warm);
    const z = o.zoom || 1;
    ctx.save();
    const cx = o.cam ? o.cam[0] : 960, cy = o.cam ? o.cam[1] : 402;
    D.cam(ctx, cx, cy, z);
    // dark room behind (out of focus)
    D.vgrad(ctx, -400, -400, W + 800, 900, [[0, U.mul(P.wall, 0.5)], [1, U.mul(P.wall, 0.9)]]);
    D.glow(ctx, 1650, 60, 260, P.lamp, 0.12 * warm + 0.03); // soft bokeh of the window
    D.glow(ctx, 1480, 120, 90, P.lamp, 0.08 * warm);
    // pillow
    const pg = ctx.createLinearGradient(0, 380, 0, 900);
    pg.addColorStop(0, U.rgb(U.mul(P.sheet, 1.35)));
    pg.addColorStop(1, U.rgb(U.mul(P.sheet, 0.7)));
    ctx.fillStyle = pg;
    D.curve(ctx, [[-300, 520], [300, 440], [900, 470], [1500, 520], [1900, 640], [1900, 1200], [-300, 1200]]);
    ctx.fill();
    // pillow creases
    ctx.strokeStyle = U.rgb(U.mul(P.sheet, 0.8), 0.6);
    ctx.lineWidth = 4;
    for (const [a, b, c] of [[[200, 560], [320, 640], [260, 760]], [[1300, 600], [1380, 690], [1500, 740]], [[520, 700], [640, 720], [700, 800]]]) {
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.stroke();
    }
    // head: lying on its back, top of the head to the left
    C.head(ctx, {
      x: 820, y: 520, s: 560, roll: -Math.PI / 2, yaw: o.yaw ?? 1.22, pitch: 0.05, bust: false,
      eye: o.eye ?? 1, tired: o.tired ?? 0.7, gaze: o.gaze || [0.6, 0], worry: o.worry || 0,
      skin: U.mix(C.pal.manSkin, P.wall, 0.3 - warm * 0.1), shirt: P.shirt,
      light: { dx: 0.75, dy: -0.65, col: P.light, amt: 0.3 + 0.25 * warm }, shadow: 0.6, shade: U.mul(P.wall, 0.3),
    });
    // blanket over the shoulder
    ctx.fillStyle = U.rgb(P.blanket);
    D.curve(ctx, [[1060, 1200], [1040, 700], [1075, 540], [1160, 470], [1400, 430], [1700, 450], [2100, 500], [2100, 1200]]);
    ctx.fill();
    ctx.strokeStyle = U.rgb(U.mul(P.blanket, 0.6), 0.7);
    ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(1180 + i * 170, 490 + i * 6); ctx.quadraticCurveTo(1230 + i * 170, 650, 1170 + i * 180, 820); ctx.stroke();
    }
    // stripe of streetlight falling across
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sw = U.fbm(t * 0.33, 4) * 30;
    const la = 0.05 * (0.3 + 0.7 * warm);
    ctx.fillStyle = D.lgrad(ctx, 800 + sw, 0, 1400 + sw, 300, [[0, P.light, 0], [0.5, P.light, la], [1, P.light, 0]]);
    D.poly(ctx, [[600 + sw, -200], [1350 + sw, -200], [1650 + sw, 1200], [900 + sw, 1200]]);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    if (o.dim) D.screen(ctx, `rgba(0,0,0,${o.dim})`);
  };

  /* ================================================================ street */
  // One-point perspective down a Palestinian street. World: X lateral (m), Y down from eye level (m), Z depth (m).
  const VP = { x: 960, y: 372 }, F = 640, EYE = 1.6;
  const proj = (X, Y, Z, cam) => {
    const z = Math.max(0.2, Z - (cam.z || 0));
    const f = F * (cam.f || 1);
    return [VP.x + ((X - (cam.x || 0)) / z) * f, (cam.vy ?? VP.y) + ((Y - (cam.y || 0)) / z) * f];
  };
  S.street = {};
  S.street.proj = proj;
  S.street.EYE = EYE;
  const HALF = 5.2, CURB = 3.4;

  // deterministic layout of buildings on both sides
  const LAYOUT = (() => {
    const r = U.rng(314);
    const out = [];
    for (const side of [-1, 1]) {
      let z = 2;
      while (z < 95) {
        const w = 6 + r() * 7;
        const floors = 3 + Math.floor(r() * 3);
        const stone = [[214, 196, 164], [200, 184, 156], [226, 210, 178], [188, 170, 140], [205, 192, 170]][Math.floor(r() * 5)];
        const gap = r() > 0.8 ? 1.5 + r() * 2 : 0;
        out.push({
          side, z0: z, z1: z + w, floors, stone, set: r() * 0.6, shop: r() > 0.35, tank: r() > 0.3, solar: r() > 0.55,
          shutterCol: [[70, 90, 96], [98, 88, 72], [82, 84, 88], [60, 80, 70]][Math.floor(r() * 4)],
          sign: ['مخبز', 'بقالة', 'صيدلية', 'حلويات', 'خضار', 'مقهى', 'حلاق'][Math.floor(r() * 7)],
          seed: r() * 1000, balcony: r() > 0.4,
        });
        z += w + gap;
      }
    }
    return out;
  })();
  S.street.layout = LAYOUT;
  // the man's building: right side, near
  S.street.door = { X: HALF, z0: 6.2, z1: 7.4 };

  const PAL = {
    morning: { sky0: [150, 176, 204], sky1: [226, 222, 212], haze: [214, 214, 210], sunTint: [255, 236, 206], lit: 1.0, shade: 0.72, road: [88, 88, 92], walk: [150, 144, 136], hill: [170, 176, 178] },
    golden: { sky0: [226, 170, 110], sky1: [255, 214, 150], haze: [255, 200, 140], sunTint: [255, 190, 120], lit: 1.05, shade: 0.55, road: [92, 76, 66], walk: [168, 140, 112], hill: [196, 150, 112] },
  };
  S.street.pal = (mode) => PAL[mode];

  /* o: mode 'morning'|'golden', cam {x,y,z,f,vy}, shutters 0..1 (how far shop shutters are up), t,
        people: [{X, Z, draw(ctx, x, y, h)}] depth-sorted by the caller-provided list */
  S.street.draw = function (ctx, t, o = {}) {
    const mode = o.mode || 'morning';
    const P = PAL[mode];
    const cam = Object.assign({ x: 0, y: 0, z: 0, f: 1 }, o.cam);
    const pr = (X, Y, Z) => proj(X, Y, Z, cam);
    const golden = mode === 'golden';

    // sky
    const top = pr(0, -40, 60)[1];
    ctx.fillStyle = D.lgrad(ctx, 0, top - 300, 0, VP.y + 40, [[0, P.sky0], [1, P.sky1]]);
    ctx.fillRect(-100, -100, W + 200, H + 200);
    if (golden) {
      const s = pr(1, -6, 140);
      D.glow(ctx, s[0], s[1], 520, [255, 210, 140], 0.9);
      D.glow(ctx, s[0], s[1], 90, [255, 245, 220], 1);
    } else {
      D.glow(ctx, 1500, 40, 600, [255, 244, 225], 0.35);
    }
    // distant hill with houses
    ctx.fillStyle = U.rgb(P.hill);
    const hy = pr(0, EYE, 400)[1];
    ctx.beginPath();
    ctx.moveTo(-100, hy + 20);
    for (let x = -100; x <= W + 100; x += 40) ctx.lineTo(x, hy - 60 - 70 * Math.exp(-(((x - 1100) / 500) ** 2)) + U.noise(x * 0.01, 2) * 8);
    ctx.lineTo(W + 100, hy + 40);
    ctx.closePath();
    ctx.fill();
    const hr = U.rng(8);
    for (let i = 0; i < 90; i++) {
      const x = hr() * W;
      const yb = hy - 60 - 70 * Math.exp(-(((x - 1100) / 500) ** 2)) + 8;
      const w = 6 + hr() * 12, h = 5 + hr() * 9;
      ctx.fillStyle = U.rgb(U.mix(P.hill, [255, 255, 255], 0.12 + hr() * 0.15));
      ctx.fillRect(x, yb - h + hr() * 50, w, h);
    }
    // road + sidewalks
    const road = [pr(-CURB, EYE, 0.5), pr(CURB, EYE, 0.5), pr(CURB, EYE, 300), pr(-CURB, EYE, 300)];
    ctx.fillStyle = D.lgrad(ctx, 0, VP.y, 0, H, [[0, U.mix(P.road, P.haze, 0.5)], [1, U.mul(P.road, 0.8)]]);
    D.poly(ctx, road);
    ctx.fill();
    for (const sd of [-1, 1]) {
      ctx.fillStyle = D.lgrad(ctx, 0, VP.y, 0, H, [[0, U.mix(P.walk, P.haze, 0.5)], [1, U.mul(P.walk, sd > 0 ? 0.8 : 0.95)]]);
      D.poly(ctx, [pr(sd * CURB, EYE, 0.5), pr(sd * HALF, EYE, 0.5), pr(sd * HALF, EYE, 300), pr(sd * CURB, EYE, 300)]);
      ctx.fill();
      // curb stones: alternating paint, a Palestinian street staple
      for (let z = 1; z < 60; z += 1.2) {
        const a = pr(sd * CURB, EYE, z), b = pr(sd * CURB, EYE, z + 1.2), c = pr(sd * CURB, EYE - 0.15, z + 1.2), d = pr(sd * CURB, EYE - 0.15, z);
        ctx.fillStyle = U.rgb(U.mix(Math.round(z / 1.2) % 2 ? [40, 40, 40] : [210, 206, 196], P.haze, U.clamp(z / 70)));
        D.poly(ctx, [a, b, c, d]);
        ctx.fill();
      }
    }
    // lane dashes
    ctx.fillStyle = U.rgb(U.mix([220, 214, 190], P.haze, 0.3), 0.6);
    for (let z = 1.5; z < 80; z += 4) {
      D.poly(ctx, [pr(-0.07, EYE, z), pr(0.07, EYE, z), pr(0.07, EYE, z + 1.8), pr(-0.07, EYE, z + 1.8)]);
      ctx.fill();
    }
    // long golden shadows across the road
    if (golden) {
      ctx.fillStyle = 'rgba(40,20,20,0.18)';
      for (let z = 4; z < 60; z += 9) {
        D.poly(ctx, [pr(-CURB, EYE, z), pr(CURB * 0.6, EYE, z + 1.5), pr(CURB * 0.6, EYE, z + 4), pr(-CURB, EYE, z + 3)]);
        ctx.fill();
      }
    }

    // buildings, far to near
    const blds = LAYOUT.filter((b) => b.z1 > cam.z + 0.3).sort((a, b) => b.z0 - a.z0);
    for (const b of blds) drawBuilding(ctx, t, b, pr, P, o, cam);

    // overhead wires
    ctx.strokeStyle = 'rgba(20,20,24,0.55)';
    ctx.lineWidth = 1.2;
    for (let z = 5; z < 70; z += 11) {
      for (const k of [0, 0.4]) {
        const a = pr(-HALF, -6.5 - k, z), b = pr(HALF, -6.2 - k, z + 3);
        const m = pr(0, -5 - k, z + 1.5);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(m[0], m[1] + 30 / (z * 0.2), b[0], b[1]); ctx.stroke();
      }
    }

    // atmosphere: haze toward the vanishing point
    const hz = ctx.createRadialGradient(VP.x, VP.y, 10, VP.x, VP.y, 900);
    hz.addColorStop(0, U.rgb(P.haze, golden ? 0.55 : 0.4));
    hz.addColorStop(1, U.rgb(P.haze, 0));
    ctx.fillStyle = hz;
    ctx.fillRect(-100, -100, W + 200, H + 200);

    // people / objects supplied by the scene, far to near
    const ppl = (o.people || []).slice().sort((a, b) => b.Z - a.Z);
    for (const p of ppl) {
      const z = p.Z - cam.z;
      if (z < 0.4) continue;
      const foot = pr(p.X, EYE, p.Z);
      const scale = (F * cam.f) / z; // px per metre
      // contact shadow
      ctx.fillStyle = golden ? 'rgba(40,20,10,0.35)' : 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(foot[0] + (golden ? 0 : 0.2 * scale), foot[1], 0.35 * scale, 0.06 * scale, 0, 0, 7);
      ctx.fill();
      if (golden) {
        // long shadow toward camera
        ctx.fillStyle = 'rgba(40,20,10,0.22)';
        const e = pr(p.X - 0.3, EYE, p.Z - 4);
        D.poly(ctx, [[foot[0] - 0.15 * scale, foot[1]], [foot[0] + 0.15 * scale, foot[1]], [e[0] + 0.25 * scale, e[1]], [e[0] - 0.25 * scale, e[1]]]);
        ctx.fill();
      }
      p.draw(ctx, foot[0], foot[1], scale, U.clamp(z / 80));
    }
  };

  function drawBuilding(ctx, t, b, pr, P, o, cam) {
    const s = b.side, X = s * HALF;
    const fh = 3.1;
    const h = b.floors * fh + 0.6;
    const z0 = Math.max(b.z0, cam.z + 0.3), z1 = b.z1;
    const Y0 = EYE, Y1 = EYE - h;
    const haze = U.clamp(((z0 + z1) / 2 - cam.z) / 90);
    const lit = s < 0 ? P.lit : P.shade; // sun from the right: left facades lit
    const stone = U.mix(U.mul(b.stone, lit), P.haze, haze * 0.85);
    const q = [pr(X, Y1, z0), pr(X, Y1, z1), pr(X, Y0, z1), pr(X, Y0, z0)];
    ctx.fillStyle = U.rgb(stone);
    D.poly(ctx, q);
    ctx.fill();
    // front face (the side toward the street end) visible at gaps
    const fq = [pr(X, Y1, z0), pr(X + s * 3, Y1, z0), pr(X + s * 3, Y0, z0), pr(X, Y0, z0)];
    ctx.fillStyle = U.rgb(U.mul(stone, 0.85));
    D.poly(ctx, fq);
    ctx.fill();
    // stone courses
    ctx.strokeStyle = U.rgb(U.mul(stone, 0.86), 0.5);
    ctx.lineWidth = 1;
    for (let y = Y0 - 0.5; y > Y1; y -= 0.5) {
      const a = pr(X, y, z0), c = pr(X, y, z1);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
    }
    // roof parapet
    const pp = [pr(X, Y1, z0), pr(X, Y1, z1), pr(X, Y1 + 0.3, z1), pr(X, Y1 + 0.3, z0)];
    ctx.fillStyle = U.rgb(U.mul(stone, 1.08));
    D.poly(ctx, pp);
    ctx.fill();
    // rooftop water tanks + solar heaters (silhouettes above the parapet)
    if (b.tank) {
      const zc = U.lerp(z0, z1, 0.3 + (b.seed % 0.4));
      const tk = [pr(X - s * 0.9, Y1 - 1.1, zc), pr(X - s * 0.9, Y1, zc + 1.1)];
      ctx.fillStyle = U.rgb(U.mix([26, 26, 28], P.haze, haze * 0.8));
      ctx.fillRect(Math.min(tk[0][0], tk[1][0]), tk[0][1], Math.abs(tk[1][0] - tk[0][0]) + 2, tk[1][1] - tk[0][1]);
      const ec = pr(X - s * 0.9, Y1 - 1.1, zc + 0.55);
      ctx.beginPath(); ctx.ellipse(ec[0], tk[0][1], Math.abs(tk[1][0] - tk[0][0]) / 2 + 1, 2 + 40 / (zc - cam.z + 1), 0, 0, 7); ctx.fill();
    }
    if (b.solar) {
      const zc = U.lerp(z0, z1, 0.7);
      const a = pr(X - s * 0.6, Y1, zc), bb = pr(X - s * 0.6, Y1 - 1.3, zc + 1.4), c = pr(X - s * 0.6, Y1, zc + 1.4);
      ctx.fillStyle = U.rgb(U.mix([44, 58, 80], P.haze, haze * 0.8));
      D.poly(ctx, [a, bb, c]);
      ctx.fill();
    }
    // windows per floor
    const nW = Math.max(2, Math.round((z1 - z0) / 2.6));
    for (let f = 0; f < b.floors; f++) {
      const yb = EYE - 0.6 - f * fh;
      if (f === 0 && b.shop) {
        // shop with a roller shutter
        const zs0 = z0 + 0.5, zs1 = z1 - 0.6;
        const up = U.clamp(o.shutters ?? 0);
        const open = up * (0.5 + 0.5 * U.hash(b.seed)) * (U.hash(b.seed + 1) > 0.2 ? 1 : 0);
        const topY = EYE - 2.7;
        const sq = [pr(X, topY, zs0), pr(X, topY, zs1), pr(X, EYE, zs1), pr(X, EYE, zs0)];
        ctx.fillStyle = U.rgb(U.mix([30, 26, 24], P.haze, haze * 0.7));
        D.poly(ctx, sq);
        ctx.fill();
        // interior glow when open
        if (open > 0.05) {
          ctx.fillStyle = U.rgb(U.mix([255, 214, 150], P.haze, haze), 0.35 * open);
          D.poly(ctx, sq);
          ctx.fill();
        }
        const sy = U.lerp(EYE, topY, 1 - open);
        const shq = [pr(X, topY, zs0), pr(X, topY, zs1), pr(X, sy, zs1), pr(X, sy, zs0)];
        const sc = U.mix(U.mul(b.shutterCol, lit), P.haze, haze * 0.8);
        ctx.fillStyle = U.rgb(sc);
        D.poly(ctx, shq);
        ctx.fill();
        ctx.strokeStyle = U.rgb(U.mul(sc, 0.7), 0.7);
        for (let y = topY + 0.12; y < sy; y += 0.12) {
          const a = pr(X, y, zs0), c = pr(X, y, zs1);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
        }
        // sign board
        const sg = [pr(X, topY - 0.8, zs0), pr(X, topY - 0.8, zs1), pr(X, topY - 0.1, zs1), pr(X, topY - 0.1, zs0)];
        ctx.fillStyle = U.rgb(U.mix([40, 90, 70], P.haze, haze * 0.8));
        D.poly(ctx, sg);
        ctx.fill();
        const zc = z0 - cam.z;
        if (zc < 30) {
          const c = pr(X, topY - 0.45, (zs0 + zs1) / 2);
          const boardH = Math.abs(pr(X, topY - 0.1, (zs0 + zs1) / 2)[1] - pr(X, topY - 0.8, (zs0 + zs1) / 2)[1]);
          const size = Math.max(6, boardH * 0.7);
          ctx.save();
          ctx.translate(c[0], c[1]);
          ctx.scale(U.clamp(Math.abs(sg[1][0] - sg[0][0]) / (size * 3.2), 0.1, 1), 1);
          ctx.fillStyle = U.rgb(U.mix([240, 236, 220], P.haze, haze));
          ctx.font = `${size}px 'Noto Naskh Arabic', 'Geeza Pro', 'Arial', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.sign, 0, 0);
          ctx.restore();
        }
        continue;
      }
      for (let i = 0; i < nW; i++) {
        const zc = U.lerp(z0, z1, (i + 0.5) / nW);
        const wz0 = zc - 0.55, wz1 = zc + 0.55;
        const yt = yb - 1.6;
        const wq = [pr(X, yt, wz0), pr(X, yt, wz1), pr(X, yb, wz1), pr(X, yb, wz0)];
        const dark = U.mix([36, 38, 44], P.haze, haze * 0.8);
        ctx.fillStyle = U.rgb(dark);
        D.poly(ctx, wq);
        ctx.fill();
        // arched top on some buildings
        if (b.seed % 3 < 1) {
          const a = pr(X, yt, zc);
          ctx.beginPath();
          ctx.ellipse(a[0], a[1], Math.abs(wq[1][0] - wq[0][0]) / 2, Math.abs(wq[1][0] - wq[0][0]) * 0.35, 0, Math.PI, 0);
          ctx.fill();
        }
        // shutters / reflection
        ctx.fillStyle = U.rgb(U.mix([140, 150, 160], P.sky1, 0.5), 0.18);
        D.poly(ctx, [wq[0], wq[1], pr(X, yt + 0.5, wz1), pr(X, yt + 0.5, wz0)]);
        ctx.fill();
        // balcony railing on upper floors
        if (b.balcony && f > 0 && i % 2 === 0) {
          const bz0 = zc - 0.9, bz1 = zc + 0.9, by = yb + 0.05;
          const out = X - s * 0.9;
          const slab = [pr(X, by, bz0), pr(X, by, bz1), pr(out, by, bz1), pr(out, by, bz0)];
          ctx.fillStyle = U.rgb(U.mul(stone, 0.75));
          D.poly(ctx, slab);
          ctx.fill();
          ctx.strokeStyle = U.rgb(U.mix([30, 30, 32], P.haze, haze * 0.8), 0.9);
          ctx.lineWidth = Math.max(0.6, 12 / (zc - cam.z + 1));
          const r1 = pr(out, by - 1, bz0), r2 = pr(out, by - 1, bz1), r3 = pr(out, by, bz1), r4 = pr(out, by, bz0);
          ctx.beginPath(); ctx.moveTo(r1[0], r1[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke();
          for (let k = 0; k <= 6; k++) {
            const a = pr(out, by - 1, U.lerp(bz0, bz1, k / 6)), c = pr(out, by, U.lerp(bz0, bz1, k / 6));
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
          }
          // laundry / plant
          if (U.hash(b.seed + f + i) > 0.6) {
            ctx.fillStyle = U.rgb(U.mix([[180, 60, 50], [60, 90, 140], [230, 226, 210]][(f + i) % 3], P.haze, haze * 0.7));
            const lp = pr(out, by - 1.0, zc - 0.3);
            const lp2 = pr(out, by - 0.4, zc + 0.3);
            ctx.fillRect(Math.min(lp[0], lp2[0]), lp[1], Math.abs(lp2[0] - lp[0]) + 1, lp2[1] - lp[1]);
          }
        }
      }
    }
    // the man's building entrance (right side, near)
    if (s > 0 && b.z0 <= S.street.door.z0 && b.z1 >= S.street.door.z1) {
      const d = S.street.door;
      const dq = [pr(X, EYE - 2.5, d.z0), pr(X, EYE - 2.5, d.z1), pr(X, EYE, d.z1), pr(X, EYE, d.z0)];
      ctx.fillStyle = U.rgb(U.mul(stone, 0.8));
      D.poly(ctx, [pr(X, EYE - 2.9, d.z0 - 0.3), pr(X, EYE - 2.9, d.z1 + 0.3), pr(X, EYE, d.z1 + 0.3), pr(X, EYE, d.z0 - 0.3)]);
      ctx.fill();
      ctx.fillStyle = U.rgb(U.mix([58, 44, 34], P.haze, 0.1));
      D.poly(ctx, dq);
      ctx.fill();
      const ac = pr(X, EYE - 2.5, (d.z0 + d.z1) / 2);
      ctx.beginPath();
      ctx.ellipse(ac[0], ac[1], Math.abs(dq[1][0] - dq[0][0]) / 2, Math.abs(dq[1][0] - dq[0][0]) * 0.3, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = U.rgb([20, 16, 12], 0.8);
      ctx.lineWidth = 2;
      const m1 = pr(X, EYE - 2.5, (d.z0 + d.z1) / 2), m2 = pr(X, EYE, (d.z0 + d.z1) / 2);
      ctx.beginPath(); ctx.moveTo(m1[0], m1[1]); ctx.lineTo(m2[0], m2[1]); ctx.stroke();
      // step
      ctx.fillStyle = U.rgb(U.mul(stone, 0.9));
      D.poly(ctx, [pr(X, EYE - 0.18, d.z0 - 0.4), pr(X, EYE - 0.18, d.z1 + 0.4), pr(X - 0.5, EYE - 0.18, d.z1 + 0.4), pr(X - 0.5, EYE - 0.18, d.z0 - 0.4)]);
      ctx.fill();
    }
    // golden rim / shade gradient on the facade
    if (P === PAL.golden) {
      ctx.save();
      D.poly(ctx, q);
      ctx.clip();
      const a = pr(X, 0, z1), c = pr(X, 0, z0);
      ctx.fillStyle = D.lgrad(ctx, a[0], 0, c[0], 0, [[0, [255, 190, 120], 0.25], [1, [60, 30, 30], 0.2]]);
      ctx.fillRect(-100, -100, W + 200, H + 200);
      ctx.restore();
    }
  }
})();
