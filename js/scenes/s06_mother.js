/* Scene 6 — Nightmare: the memory of his mother. A golden kitchen; coffee; a boy in the doorway; the man outside it, watching. */
(function () {
  'use strict';
  const { U, D, C, W, H } = FILM;

  const WALL = [218, 180, 128], LIGHT = [255, 222, 160], FLOOR = [196, 146, 96], WOOD = [128, 86, 52], TILEB = [56, 96, 128];
  const MOM = { skin: C.pal.momSkin, dress: [44, 40, 52], scarf: [236, 226, 206] };
  const BOY = { skin: C.pal.boySkin, shirt: [196, 70, 58], pants: [60, 70, 92], hair: C.pal.hair };

  const floorTiles = () => FILM.cached('kitchen-floor', 1920, 200, (x, w, h) => {
    // cement tiles: repeating rosette pattern in perspective-less bands
    x.fillStyle = U.rgb(FLOOR);
    x.fillRect(0, 0, w, h);
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const th = 26 + r * 16, y0 = [0, 26, 58, 106][r];
      const tw = th * 1.9;
      for (let c = -1; c < w / tw + 1; c++) {
        const cx = c * tw + (r % 2) * tw * 0.5, cy = y0 + th / 2;
        x.fillStyle = U.rgb(U.mul(FLOOR, 0.82));
        x.beginPath(); x.ellipse(cx, cy, tw * 0.36, th * 0.36, 0, 0, 7); x.fill();
        x.fillStyle = U.rgb([150, 60, 40], 0.55);
        x.beginPath(); x.moveTo(cx, cy - th * 0.3); x.lineTo(cx + tw * 0.2, cy); x.lineTo(cx, cy + th * 0.3); x.lineTo(cx - tw * 0.2, cy); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(90,60,40,0.35)';
        x.strokeRect(c * tw + (r % 2) * tw * 0.5 - tw / 2, y0, tw, th);
      }
    }
  });

  const backsplash = () => FILM.cached('kitchen-tiles', 1240, 170, (x, w, h) => {
    const s = 34;
    for (let i = 0; i < w / s + 1; i++) for (let j = 0; j < h / s + 1; j++) {
      x.fillStyle = 'rgb(236,226,204)';
      x.fillRect(i * s, j * s, s - 2, s - 2);
      x.fillStyle = U.rgb(TILEB, 0.75);
      x.beginPath();
      x.moveTo(i * s + s / 2, j * s + 4); x.lineTo(i * s + s - 6, j * s + s / 2); x.lineTo(i * s + s / 2, j * s + s - 6); x.lineTo(i * s + 4, j * s + s / 2);
      x.closePath(); x.fill();
      x.fillStyle = 'rgb(236,226,204)';
      x.beginPath(); x.arc(i * s + s / 2 - 1, j * s + s / 2 - 1, 5, 0, 7); x.fill();
    }
  });

  function flame(ctx, x, y, s, t) {
    for (let i = -3; i <= 3; i++) {
      const hgt = (18 + Math.sin(t * 20 + i * 2) * 4) * s;
      const g = ctx.createLinearGradient(0, y, 0, y - hgt);
      g.addColorStop(0, 'rgba(80,120,255,0.9)');
      g.addColorStop(1, 'rgba(120,170,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + i * 7 * s - 4 * s, y);
      ctx.quadraticCurveTo(x + i * 7 * s, y - hgt * 1.2, x + i * 7 * s + 4 * s, y);
      ctx.fill();
    }
  }

  // brass coffee pot (rakweh) with a long handle
  function rakweh(ctx, x, y, s, foam) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const g = ctx.createLinearGradient(-40, 0, 40, 0);
    g.addColorStop(0, '#f2cf7e');
    g.addColorStop(0.4, '#c8923e');
    g.addColorStop(1, '#6d4a1e');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-26, -50); ctx.lineTo(26, -50); ctx.lineTo(40, 30); ctx.quadraticCurveTo(0, 42, -40, 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6d4a1e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, -22); ctx.lineTo(150, -60); ctx.stroke();
    ctx.fillStyle = '#e3b566';
    ctx.beginPath(); ctx.ellipse(0, -50, 26, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#2c160a';
    ctx.beginPath(); ctx.ellipse(0, -50, 22, 4.5, 0, 0, 7); ctx.fill();
    if (foam > 0) {
      ctx.fillStyle = '#b68a5c';
      ctx.beginPath();
      ctx.ellipse(0, -50 - foam * 10, 23, 5 + foam * 12, 0, Math.PI, 0);
      ctx.ellipse(0, -50, 23, 4.5, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = 'rgba(230,200,160,0.6)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-14 + i * 6, -52 - foam * (4 + (i % 3) * 3), 1.5, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }

  // the kitchen, wide; returns anchor points
  function kitchen(ctx, t, o = {}) {
    const stir = t * 2.2;
    ctx.fillStyle = D.lgrad(ctx, 0, 0, 0, 640, [[0, U.mul(WALL, 0.8)], [1, WALL]]);
    ctx.fillRect(-300, -300, W + 600, 940);
    // door on the left and the dim hallway behind it
    ctx.fillStyle = U.rgb([70, 58, 52]);
    ctx.fillRect(170, 110, 240, 540);
    ctx.fillStyle = D.lgrad(ctx, 170, 0, 410, 0, [[0, [40, 34, 34]], [1, [96, 78, 62]]]);
    ctx.fillRect(186, 124, 208, 526);
    ctx.fillStyle = U.rgb(U.mul(WALL, 0.7));
    ctx.fillRect(160, 104, 16, 546);
    ctx.fillRect(404, 104, 16, 546);
    ctx.fillRect(160, 100, 260, 16);
    // framed tatreez on the wall
    ctx.fillStyle = U.rgb(WOOD);
    ctx.fillRect(500, 170, 130, 150);
    ctx.fillStyle = 'rgb(232,222,200)';
    ctx.fillRect(510, 180, 110, 130);
    ctx.fillStyle = U.rgb(C.pal.tatreez);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 || (Math.abs(i - 4) + Math.abs(j - 3)) > 4) continue;
      ctx.fillRect(522 + j * 13, 190 + i * 12, 8, 8);
    }
    // window with lace curtain, the sun outside
    ctx.fillStyle = 'rgb(255,246,222)';
    ctx.fillRect(1340, 140, 280, 300);
    ctx.fillStyle = 'rgba(120,140,90,0.55)';
    for (let i = 0; i < 16; i++) {
      const a = i * 0.4, r = 60 + i * 9;
      ctx.beginPath(); ctx.ellipse(1600 - Math.cos(a) * r * 0.5, 170 + Math.sin(a) * 30 + i * 6, 18, 7, a, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(90,70,50,0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(1620, 150); ctx.quadraticCurveTo(1520, 200, 1400, 260); ctx.stroke();
    ctx.strokeStyle = U.rgb(U.mul(WALL, 0.6));
    ctx.lineWidth = 12;
    ctx.strokeRect(1340, 140, 280, 300);
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(1480, 140); ctx.lineTo(1480, 440); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(1340, 140); ctx.lineTo(1450, 140);
    for (let i = 0; i <= 8; i++) ctx.lineTo(1450 - Math.sin(i * 1.3 + t * 0.4) * 8 - i * 4, 140 + i * 37);
    ctx.lineTo(1340, 440);
    ctx.closePath(); ctx.fill();
    // pot of mint on the sill
    ctx.fillStyle = '#9a5a36';
    ctx.fillRect(1380, 400, 50, 40);
    ctx.fillStyle = '#5f7f3a';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(1392 + (i % 4) * 9, 392 - Math.floor(i / 4) * 10, 9, 6, i, 0, 7); ctx.fill(); }
    // backsplash, shelf, counter
    D.img(ctx, backsplash(), 690, 300);
    ctx.fillStyle = U.rgb(WOOD);
    ctx.fillRect(700, 236, 560, 12);
    const jars = [[740, [96, 110, 46]], [790, [150, 46, 40]], [840, [210, 160, 60]], [900, [120, 80, 40]]];
    for (const [x, c] of jars) {
      ctx.fillStyle = 'rgba(220,230,230,0.35)';
      ctx.fillRect(x, 186, 38, 50);
      ctx.fillStyle = U.rgb(c);
      ctx.fillRect(x + 3, 204, 32, 30);
      ctx.fillStyle = U.rgb(WOOD);
      ctx.fillRect(x + 2, 180, 34, 8);
    }
    // stack of finjans
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgb(246,240,230)';
      ctx.beginPath(); ctx.moveTo(1000 + i * 34, 208); ctx.lineTo(1024 + i * 34, 208); ctx.lineTo(1020 + i * 34, 234); ctx.lineTo(1004 + i * 34, 234); ctx.closePath(); ctx.fill();
      ctx.fillStyle = U.rgb(C.pal.tatreez);
      ctx.fillRect(1003 + i * 34, 216, 18, 3);
    }
    ctx.fillStyle = U.rgb(U.mul(WOOD, 1.15));
    ctx.fillRect(690, 468, 1300, 22);
    ctx.fillStyle = U.rgb(U.mul(WOOD, 0.8));
    ctx.fillRect(700, 490, 1300, 160);
    ctx.strokeStyle = U.rgb(U.mul(WOOD, 0.55));
    ctx.lineWidth = 3;
    for (let x = 700; x < 1900; x += 200) ctx.strokeRect(x + 10, 505, 180, 130);
    // stove + rakweh
    ctx.fillStyle = '#3a3634';
    ctx.fillRect(1010, 446, 190, 24);
    ctx.fillStyle = '#1c1a1a';
    ctx.fillRect(1030, 440, 60, 8);
    flame(ctx, 1060, 440, 0.6, t);
    rakweh(ctx, 1060, 414, 0.62, o.foam || 0);
    // floor
    D.img(ctx, floorTiles(), 0, 640, W, 170);
    ctx.fillStyle = 'rgba(80,50,30,0.2)';
    ctx.fillRect(0, 640, W, 12);

    // mother at the stove
    const s = Math.sin(stir);
    C.figure(ctx, {
      x: 950, y: 432, h: 570, facing: 1, kind: 'mother', col: MOM, shoe: [70, 50, 40],
      pose: { torso: 0.08, neck: 0.25, head: 0.1, sL: 1.15 + s * 0.08, eL: 0.55 + Math.cos(stir) * 0.1, sR: 0.35, eR: 0.9, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
      rim: { col: [255, 236, 190], dx: 4, dy: -1 },
    });
    // the boy in the doorway, a hand on the frame
    if (o.boy !== false) {
      C.figure(ctx, {
        x: 300, y: 516, h: 340, facing: 1, kind: 'boy', col: BOY, sleeves: 'short', shoe: [60, 60, 70],
        pose: { torso: -0.02, neck: -0.12, head: -0.08, sL: 1.6, eL: 0.4, sR: 0.1, eR: 0.3, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
        rim: { col: [255, 226, 180], dx: 3, dy: 0 },
      });
    }
    // sunbeam and dust
    D.rays(ctx, t, { x: 1480, y: 180, ang: Math.PI * 0.8, spread: 0.35, len: 1500, n: 6, col: LIGHT, alpha: 0.14, width: 0.05, seed: 6 });
    D.dust(ctx, t, { x: 700, y: 150, w: 800, h: 450, n: 70, seed: 61, size: 1.8, col: [255, 240, 210], alpha: 0.6, vx: -3, vy: 2, wob: 12 });
    // warm bloom
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, 1480, 290, 700, [255, 200, 120], 0.35);
    ctx.restore();
  }

  function goldenGrade(ctx, amt = 1) {
    D.screen(ctx, 'rgb(255,190,110)', 0.12 * amt, 'soft-light');
  }

  FILM.scene({
    order: 6, num: 6, name: 'Nightmare: memory of mother and childhood', dur: 40,
    dissolve: 3,
    post: (t) => ({ grain: 0.08, vignette: t > 25 && t < 31 ? 0.3 : 0.55 }),
    draw(ctx, t) {
      if (t < 11) {
        ctx.save();
        const k = t / 11;
        D.cam(ctx, U.lerp(900, 980, k), U.lerp(380, 400, k), U.lerp(1.0, 1.06, k));
        kitchen(ctx, t);
        ctx.restore();
        goldenGrade(ctx);
        return;
      }
      if (t < 18) {
        // the coffee: brass, blue flame, foam rising, her spoon
        const lt = t - 11;
        ctx.save();
        D.cam(ctx, 1060, 402, 1 + lt * 0.01);
        D.vgrad(ctx, -200, -200, W + 400, 900, [[0, [210, 172, 120]], [1, [236, 206, 160]]]);
        ctx.save(); ctx.globalAlpha = 0.8; D.img(ctx, backsplash(), -100, -40, W * 1.7, 560); ctx.restore();
        ctx.fillStyle = U.rgb(U.mul(WOOD, 1.1));
        ctx.fillRect(-200, 600, W + 400, 400);
        ctx.fillStyle = '#34302e';
        ctx.fillRect(760, 560, 620, 60);
        ctx.fillStyle = '#161414';
        ctx.fillRect(900, 548, 330, 16);
        flame(ctx, 1060, 550, 2.6, t);
        const foam = U.ss(2.8, 5.2, lt) * (1 - 0.8 * U.ss(5.4, 5.9, lt)) + U.ss(6.2, 6.8, lt) * 0.5;
        rakweh(ctx, 1060, 440, 2.4, foam);
        // her hand with a small spoon
        const sx = 1060 + Math.sin(t * 3) * 16 * (lt < 5.4 ? 1 : 0), sy = 250 + Math.cos(t * 3) * 6;
        ctx.strokeStyle = '#b9b3aa';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx, sy + 40); ctx.lineTo(sx + 130, sy - 190); ctx.stroke();
        ctx.fillStyle = U.rgb(C.pal.momSkin);
        ctx.beginPath(); ctx.ellipse(sx + 150, sy - 220, 50, 34, -0.9, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgb(MOM.dress);
        ctx.beginPath(); ctx.moveTo(sx + 170, sy - 260); ctx.lineTo(sx + 420, sy - 520); ctx.lineTo(sx + 520, sy - 420); ctx.lineTo(sx + 205, sy - 185); ctx.closePath(); ctx.fill();
        // cardamom pods and a finjan waiting on the counter
        ctx.fillStyle = '#8a9a4a';
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(560 + i * 26, 690 + (i % 2) * 10, 11, 6, i, 0, 7); ctx.fill(); }
        ctx.fillStyle = 'rgb(246,240,230)';
        ctx.beginPath(); ctx.moveTo(1500, 560); ctx.lineTo(1600, 560); ctx.lineTo(1585, 660); ctx.lineTo(1515, 660); ctx.closePath(); ctx.fill();
        ctx.fillStyle = U.rgb(C.pal.tatreez);
        ctx.fillRect(1506, 585, 88, 9);
        // steam
        ctx.strokeStyle = 'rgba(255,250,240,0.18)';
        ctx.lineWidth = 14;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let k = 0; k < 12; k++) {
            const y = 300 - k * 28, x = 1040 + i * 26 + Math.sin(k * 0.6 + t * 1.5 + i) * 18;
            k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
        D.dust(ctx, t, { n: 40, seed: 62, size: 2, col: [255, 240, 210], alpha: 0.5, vx: -2, vy: -3, wob: 10 });
        ctx.restore();
        goldenGrade(ctx);
        return;
      }
      if (t < 25) {
        // the boy, watching her
        const lt = t - 18;
        const src = FILM.buffer('s06bg');
        const b = FILM.slowLayer('s06boy', Math.floor(t * 6), (x) => {
          src.x.save();
          D.cam(src.x, 700, 360, 1.9);
          kitchen(src.x, t, { boy: false });
          src.x.restore();
          x.filter = `blur(${10 * FILM.q}px)`;
          D.buf(x, src);
        });
        D.buf(ctx, b);
        // the door frame beside him
        ctx.fillStyle = U.rgb(U.mul(WALL, 0.55));
        ctx.fillRect(330, -50, 90, H + 100);
        const blink = 1 - U.win(lt, 3.1, 3.4, 0.1, 0.2);
        C.head(ctx, {
          x: 820 + lt * 3, y: 400, s: 330, yaw: 0.85, pitch: 0.12, kind: 'boy', skin: C.pal.boySkin, shirt: BOY.shirt,
          eye: blink * 0.95, gaze: [0.6, -0.2], smile: 0.25 + 0.25 * U.ss(2, 5, lt),
          light: { dx: 1, dy: -0.2, col: [255, 214, 150], amt: 0.4 }, shadow: 0.45, shade: [80, 40, 20],
        });
        goldenGrade(ctx);
        return;
      }
      if (t < 31) {
        // the man, outside the memory, watching it glow
        const lt = t - 25;
        ctx.fillStyle = 'rgb(4,4,8)';
        ctx.fillRect(0, 0, W, H);
        const b = FILM.buffer('s06mem');
        b.x.save();
        D.cam(b.x, 900, 400, 1.0);
        kitchen(b.x, t);
        b.x.restore();
        const z = U.lerp(0.52, 0.6, lt / 6);
        ctx.save();
        ctx.translate(1080, 360);
        ctx.scale(z, z);
        ctx.translate(-960, -402);
        // feathered memory window
        D.buf(ctx, b, 1);
        ctx.restore();
        const g = ctx.createRadialGradient(1080, 360, 180 * z / 0.52, 1080, 360, 620 * z / 0.52);
        g.addColorStop(0, 'rgba(4,4,8,0)');
        g.addColorStop(1, 'rgba(4,4,8,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        goldenGrade(ctx, 0.6);
        // his head and shoulders in the dark foreground
        const bx = 470, by = 560;
        ctx.fillStyle = 'rgb(10,10,16)';
        ctx.beginPath(); ctx.ellipse(bx, by - 120, 150, 185, 0.05, 0, 7); ctx.fill();
        D.curve(ctx, [[bx - 90, by], [bx + 90, by], [bx + 210, by + 120], [bx + 420, by + 180], [bx + 480, by + 400], [bx - 480, by + 400], [bx - 400, by + 180], [bx - 200, by + 120]]);
        ctx.fill();
        ctx.fillStyle = 'rgb(16,14,20)';
        ctx.beginPath(); ctx.ellipse(bx + 148, by - 110, 22, 42, 0.1, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,200,130,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(bx, by - 120, 150, 185, 0.05, -1.2, 0.5); ctx.stroke();
        return;
      }
      if (t < 36.5) {
        // she turns, and smiles
        const lt = t - 31;
        const src = FILM.buffer('s06bg2');
        const b = FILM.slowLayer('s06mom', Math.floor(t * 6), (x) => {
          src.x.save();
          D.cam(src.x, 1300, 300, 1.6);
          kitchen(src.x, t, { boy: false });
          src.x.restore();
          x.filter = `blur(${14 * FILM.q}px)`;
          D.buf(x, src);
        });
        D.buf(ctx, b);
        const turn = U.easeInOut(U.inv(0.6, 2.4, lt));
        C.head(ctx, {
          x: 960, y: 380, s: 470, yaw: U.lerp(1.25, 0.22, turn), pitch: 0.03, kind: 'mother', skin: C.pal.momSkin, scarf: MOM.scarf, shirt: MOM.dress,
          smile: 0.85 * U.ss(2.0, 3.8, lt), eye: 0.9 - 0.15 * U.ss(2.5, 3.8, lt), gaze: [U.lerp(0.6, 0, turn), 0],
          light: { dx: 1, dy: -0.35, col: [255, 214, 150], amt: 0.45 }, shadow: 0.4, shade: [90, 50, 30],
        });
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1500, 250, 700, [255, 200, 120], 0.35 + 0.15 * U.ss(3, 5, lt));
        ctx.restore();
        goldenGrade(ctx);
        return;
      }
      // he reaches; the gold goes before he gets there
      const lt = t - 36.5;
      const fade = U.ss(0.6, 2.8, lt);
      ctx.fillStyle = 'rgb(4,4,8)';
      ctx.fillRect(0, 0, W, H);
      const b = FILM.buffer('s06mem');
      b.x.save();
      D.cam(b.x, 900, 400, 1.0);
      kitchen(b.x, t);
      b.x.restore();
      ctx.save();
      ctx.translate(1000, 380);
      const z = 0.62 - fade * 0.2;
      ctx.scale(z, z);
      ctx.translate(-960, -402);
      D.buf(ctx, b, 1 - fade);
      ctx.restore();
      const g = ctx.createRadialGradient(1000, 380, 150, 1000, 380, 700);
      g.addColorStop(0, 'rgba(4,4,8,0)');
      g.addColorStop(1, 'rgba(4,4,8,1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // a bloom as it slips away
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      D.glow(ctx, 1000, 380, 500, [255, 214, 150], U.win(lt, 0.3, 2.4, 0.6, 1.2) * 0.6);
      ctx.restore();
      // his hand reaching in from the dark
      const reach = U.easeOut(U.inv(0, 1.8, lt));
      const hx = U.lerp(300, 720, reach), hy = U.lerp(900, 520, reach);
      ctx.strokeStyle = 'rgb(12,12,18)';
      ctx.lineCap = 'round';
      ctx.lineWidth = 120;
      ctx.beginPath(); ctx.moveTo(-100, 1100); ctx.lineTo(hx - 60, hy + 60); ctx.stroke();
      ctx.fillStyle = 'rgb(14,13,18)';
      ctx.beginPath(); ctx.ellipse(hx, hy, 70, 55, -0.6, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgb(14,13,18)';
      ctx.lineWidth = 26;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(hx + 20, hy - 20 + i * 18); ctx.lineTo(hx + 120, hy - 70 + i * 26); ctx.stroke(); }
      ctx.strokeStyle = `rgba(255,200,130,${0.4 * (1 - fade)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(hx, hy, 70, 55, -0.6, -1.2, 0.8); ctx.stroke();
      if (lt > 2.9) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    },
    audio(h, fx) {
      h.verb('room', 0.35);
      const lp = h.filter('lowpass', 9000, 0.7);
      lp.connect(h.in);
      h.param(lp.frequency, [[0, 9000], [36.5, 9000], [39, 400], [39.4, 150]], true);
      fx.bed(h, { color: 'pink', type: 'lowpass', f: 1500, gain: 0.025, dest: lp });
      // gas flame
      const gas = fx.bed(h, { color: 'white', type: 'bandpass', f: 2600, Q: 0.8, gain: 0.022, dest: lp });
      h.param(gas.g.gain, [[0, 0.018], [11, 0.02], [12, 0.045], [18, 0.045], [19, 0.02], [40, 0.015]]);
      // birds in the garden
      fx.scatter(h, 0.5, 38, 0.7, 66, (w, k) => fx.bird(h, w, { gain: 0.035 + k * 0.02, pan: 0.3 + k * 0.6, dest: lp }));
      // the coffee coming to the boil
      fx.scatter(h, 11, 18, 14, 67, (w, k) => fx.bubble(h, w, { size: 0.5 + k * 0.6, gain: 0.03 + k * 0.03, dest: lp }));
      h.at(13.8, (w) => fx.whoosh(h, w, { dur: 2.4, f1: 900, f2: 2600, gain: 0.05, color: 'white', dest: lp }));
      // spoon against brass, a cup set down
      for (const T of [11.6, 12.1, 12.6, 13.1, 16.9]) h.at(T, (w) => fx.ring(h, w, { f: 2200, partials: [1, 2.4, 3.9], decay: [0.35, 0.2, 0.1], gain: 0.05, dest: lp }));
      h.at(7.5, (w) => fx.porcelain(h, w, { pitch: 1.1, gain: 0.06, dest: lp }));
      h.at(29.5, (w) => fx.porcelain(h, w, { pitch: 1.05, gain: 0.04, dest: lp }));
      // her slippers on the tiles
      for (const T of [31.2, 31.8]) h.at(T, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 1200, d: 0.12, gain: 0.04, dest: lp }));
    },
  });
})();
