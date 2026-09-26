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
    if (o.mom !== false) C.figure(ctx, {
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
    // a red balloon tied by the window, waiting for him
    if (o.balloon !== false) FILM.sets.balloon(ctx, 1285 + Math.sin(t * 0.9) * 8, 205 + Math.sin(t * 1.3) * 5, 44, t, [1300, 470]);
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

  // it is a memory: warm light leaks drifting at the edges, the exposure breathing
  function memoryLeak(ctx, t, amt = 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    D.glow(ctx, -80 + Math.sin(t * 0.23) * 140, 200 + Math.cos(t * 0.17) * 160, 620, [255, 140, 70], 0.28 * amt);
    D.glow(ctx, W + 60 + Math.cos(t * 0.19) * 120, 60 + Math.sin(t * 0.29) * 120, 560, [255, 120, 110], 0.2 * amt);
    D.glow(ctx, W * 0.5 + Math.sin(t * 0.11) * 500, H + 120, 520, [255, 200, 120], 0.16 * amt);
    ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.65);
    g.addColorStop(0, 'rgba(255,214,160,0)');
    g.addColorStop(1, `rgba(255,214,160,${0.22 * amt})`);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    D.screen(ctx, 'rgb(255,224,180)', 0.035 * amt * (1 + Math.sin(t * 2.1) * Math.sin(t * 0.7)), 'screen');
  }

  // two-link reach: shoulder angle + elbow bend so the hand lands on target (side view, facing +1)
  function reach(sh, target, L1, L2) {
    const vx = target[0] - sh[0], vy = target[1] - sh[1];
    const dist = Math.min(Math.hypot(vx, vy), (L1 + L2) * 0.98);
    const a = Math.atan2(vx, vy);
    const e = Math.PI - Math.acos(U.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
    const b = Math.asin(U.clamp((L2 * Math.sin(e)) / dist, -1, 1));
    return [a - b, e];
  }

  function blurredKitchen(name, t, cx, cy, z, blur, mom = false) {
    const src = FILM.buffer('s06src');
    return FILM.slowLayer(name, Math.floor(t * 6), (x) => {
      src.x.save();
      D.cam(src.x, cx, cy, z);
      kitchen(src.x, t, { boy: false, mom, balloon: mom });
      src.x.restore();
      x.filter = `blur(${blur * FILM.q}px)`;
      D.buf(x, src);
    });
  }

  function motherFace(ctx, t, lt, o) {
    C.head(ctx, Object.assign({
      x: 960, y: 390, s: 470, kind: 'mother', skin: C.pal.momSkin, scarf: MOM.scarf, shirt: MOM.dress,
      light: { dx: 1, dy: -0.35, col: [255, 214, 150], amt: 0.45 }, shadow: 0.4, shade: [90, 50, 30],
    }, o));
  }

  function darkSilhouette(ctx, bx, by) {
    ctx.fillStyle = 'rgb(10,10,16)';
    ctx.beginPath(); ctx.ellipse(bx, by - 120, 150, 185, 0.05, 0, 7); ctx.fill();
    D.curve(ctx, [[bx - 90, by], [bx + 90, by], [bx + 210, by + 120], [bx + 420, by + 180], [bx + 480, by + 400], [bx - 480, by + 400], [bx - 400, by + 180], [bx - 200, by + 120]]);
    ctx.fill();
    ctx.fillStyle = 'rgb(16,14,20)';
    ctx.beginPath(); ctx.ellipse(bx + 148, by - 110, 22, 42, 0.1, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,130,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(bx, by - 120, 150, 185, 0.05, -1.2, 0.5); ctx.stroke();
  }

  FILM.scene({
    order: 6, num: 6, name: 'Nightmare: memory of mother and childhood', dur: 46,
    dissolve: 3,
    post: (t) => ({ grain: 0.08, vignette: (t > 23 && t < 28) || t > 40 ? 0.3 : 0.5 }),
    draw(ctx, t) {
      if (t < 10) {
        // the kitchen, remembered
        ctx.save();
        const k = t / 10;
        D.cam(ctx, U.lerp(900, 980, k), U.lerp(380, 400, k), U.lerp(1.0, 1.07, k));
        kitchen(ctx, t);
        ctx.restore();
        goldenGrade(ctx);
        memoryLeak(ctx, t);
        return;
      }
      if (t < 16) {
        // the coffee: brass, blue flame, foam rising, her spoon
        const lt = t - 10;
        ctx.save();
        D.cam(ctx, 1060, 402, 1 + lt * 0.012);
        D.vgrad(ctx, -200, -200, W + 400, 900, [[0, [210, 172, 120]], [1, [236, 206, 160]]]);
        ctx.save(); ctx.globalAlpha = 0.8; D.img(ctx, backsplash(), -100, -40, W * 1.7, 560); ctx.restore();
        ctx.fillStyle = U.rgb(U.mul(WOOD, 1.1));
        ctx.fillRect(-200, 600, W + 400, 400);
        ctx.fillStyle = '#34302e';
        ctx.fillRect(760, 560, 620, 60);
        ctx.fillStyle = '#161414';
        ctx.fillRect(900, 548, 330, 16);
        flame(ctx, 1060, 550, 2.6, t);
        const foam = U.ss(2.4, 4.6, lt) * (1 - 0.8 * U.ss(4.8, 5.3, lt)) + U.ss(5.5, 5.9, lt) * 0.5;
        rakweh(ctx, 1060, 440, 2.4, foam);
        const sx = 1060 + Math.sin(t * 3) * 16 * (lt < 4.8 ? 1 : 0), sy = 250 + Math.cos(t * 3) * 6;
        ctx.strokeStyle = '#b9b3aa';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx, sy + 40); ctx.lineTo(sx + 130, sy - 190); ctx.stroke();
        ctx.fillStyle = U.rgb(C.pal.momSkin);
        ctx.beginPath(); ctx.ellipse(sx + 150, sy - 220, 50, 34, -0.9, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgb(MOM.dress);
        ctx.beginPath(); ctx.moveTo(sx + 170, sy - 260); ctx.lineTo(sx + 420, sy - 520); ctx.lineTo(sx + 520, sy - 420); ctx.lineTo(sx + 205, sy - 185); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#8a9a4a';
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(560 + i * 26, 690 + (i % 2) * 10, 11, 6, i, 0, 7); ctx.fill(); }
        ctx.fillStyle = 'rgb(246,240,230)';
        ctx.beginPath(); ctx.moveTo(1500, 560); ctx.lineTo(1600, 560); ctx.lineTo(1585, 660); ctx.lineTo(1515, 660); ctx.closePath(); ctx.fill();
        ctx.fillStyle = U.rgb(C.pal.tatreez);
        ctx.fillRect(1506, 585, 88, 9);
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
        memoryLeak(ctx, t);
        return;
      }
      if (t < 23) {
        // the boy watches her — then turns, and looks straight at us
        const lt = t - 16;
        D.buf(ctx, blurredKitchen('s06boy', t, 700, 360, 1.9, 10, true));
        ctx.fillStyle = U.rgb(U.mul(WALL, 0.55));
        ctx.fillRect(330, -50, 90, H + 100);
        const blink = 1 - U.win(lt, 2.1, 2.4, 0.1, 0.2) - U.win(lt, 5.6, 5.9, 0.1, 0.2);
        const turn = U.easeInOut(U.inv(3.4, 4.6, lt));
        C.head(ctx, {
          x: 820 + lt * 3, y: 400, s: U.lerp(330, 370, lt / 7), yaw: U.lerp(0.85, 0.08, turn), pitch: 0.1 - 0.08 * turn, kind: 'boy', skin: C.pal.boySkin, shirt: BOY.shirt,
          eye: blink * 0.95, gaze: [U.lerp(0.6, 0, turn), U.lerp(-0.2, 0, turn)], smile: 0.25 + 0.2 * U.ss(1, 3, lt) - 0.2 * turn + 0.15 * U.ss(5, 6.5, lt),
          light: { dx: 1, dy: -0.2, col: [255, 214, 150], amt: 0.4 }, shadow: 0.45, shade: [80, 40, 20],
        });
        goldenGrade(ctx);
        memoryLeak(ctx, t, 0.8);
        return;
      }
      if (t < 28) {
        // the man, outside the memory, watching it glow
        const lt = t - 23;
        ctx.fillStyle = 'rgb(4,4,8)';
        ctx.fillRect(0, 0, W, H);
        const b = FILM.buffer('s06mem');
        b.x.save();
        D.cam(b.x, 900, 400, 1.0);
        kitchen(b.x, t);
        b.x.restore();
        const z = U.lerp(0.52, 0.62, lt / 5);
        ctx.save();
        ctx.translate(1080, 360);
        ctx.scale(z, z);
        ctx.translate(-960, -402);
        D.buf(ctx, b, 1);
        ctx.restore();
        const g = ctx.createRadialGradient(1080, 360, 180 * z / 0.52, 1080, 360, 620 * z / 0.52);
        g.addColorStop(0, 'rgba(4,4,8,0)');
        g.addColorStop(1, 'rgba(4,4,8,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        goldenGrade(ctx, 0.6);
        darkSilhouette(ctx, 470, 560);
        return;
      }
      if (t < 34) {
        // she leaves the stove and strokes the boy's hair
        const lt = t - 28;
        D.buf(ctx, blurredKitchen('s06two', t, 1150, 330, 1.35, 12));
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1500, 200, 800, [255, 200, 120], 0.4);
        ctx.restore();
        const take = U.ss(1.6, 2.6, lt);
        const boy = C.figure(ctx, {
          x: 1180, y: 560, h: 600, kind: 'boy', facing: -1, col: BOY, sleeves: 'short', shoe: [60, 60, 70],
          pose: { torso: -0.04, neck: -0.32, head: -0.22, sL: U.lerp(0.25, 2.55, take), eL: U.lerp(0.4, 0.15, take), sR: 0.05, eR: 0.3, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
          rim: { col: [255, 226, 180], dx: 4, dy: -2 },
        });
        const bh = [1180 + boy.hd[0], 560 + boy.hd[1]];
        const mh = 1000, mx = 700, my = 470, tau = 0.3 + 0.06 * Math.sin(lt * 0.8);
        const sh = [mx + Math.sin(tau) * 0.29 * mh, my - Math.cos(tau) * 0.29 * mh];
        const stroke = Math.sin(lt * 2.2) * 22 * U.ss(0.5, 1.5, lt);
        const [sA, eA] = reach(sh, [bh[0] - 10 + stroke, bh[1] - boy.hr * 1.05], 0.165 * mh, 0.18 * mh);
        const give = U.ss(1.2, 2.2, lt), gone = U.ss(2.8, 3.8, lt);
        const mom = C.figure(ctx, {
          x: mx, y: my, h: mh, kind: 'mother', facing: 1, col: MOM, shoe: [70, 50, 40],
          pose: { torso: tau, neck: 0.35, head: 0.2, sL: sA, eL: eA, sR: U.lerp(0.7, 1.15, give) * (1 - gone) + 0.2 * gone, eR: 0.5, hL: 0.03, kL: 0.02, hR: -0.03, kR: 0.02 },
          rim: { col: [255, 236, 190], dx: 5, dy: -2 },
        });
        // the balloon passes from her hand into his
        const mh2 = [mx + mom.hands[1][0], my + mom.hands[1][1]];
        const bh2 = [1180 + boy.hands[0][0], 560 + boy.hands[0][1]];
        const pass = U.ss(2.4, 2.9, lt);
        const end = [U.lerp(mh2[0], bh2[0], pass), U.lerp(mh2[1], bh2[1], pass)];
        FILM.sets.balloon(ctx, end[0] + 40 + Math.sin(lt * 1.4) * 14, end[1] - 170 + Math.sin(lt * 1.9) * 8, 58, t, end);
        D.rays(ctx, t, { x: 1600, y: -100, ang: Math.PI * 0.7, spread: 0.3, len: 1500, n: 5, col: LIGHT, alpha: 0.12, width: 0.05, seed: 8 });
        D.dust(ctx, t, { n: 60, seed: 64, size: 2, col: [255, 240, 210], alpha: 0.55, vx: -3, vy: 2, wob: 12 });
        goldenGrade(ctx);
        memoryLeak(ctx, t);
        return;
      }
      if (t < 40) {
        // she lifts her eyes from the boy to the man — and smiles at him
        const lt = t - 34;
        D.buf(ctx, blurredKitchen('s06mom', t, 1300, 300, 1.6, 14));
        const lift = U.easeInOut(U.inv(0.8, 2.6, lt));
        motherFace(ctx, t, lt, {
          s: U.lerp(470, 540, lt / 6), y: U.lerp(390, 400, lt / 6),
          yaw: U.lerp(0.55, 0.1, lift), pitch: U.lerp(-0.2, 0.02, lift), gaze: [U.lerp(-0.2, 0, lift), U.lerp(0.7, 0, lift)],
          smile: 0.4 + 0.5 * U.ss(2.2, 4.2, lt), eye: U.lerp(0.7, 0.88, lift) - 0.12 * U.ss(3.4, 4.6, lt),
          glisten: U.ss(3, 5, lt), wet: 1.3,
        });
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1500, 250, 700, [255, 200, 120], 0.35 + 0.2 * U.ss(3, 6, lt));
        ctx.restore();
        goldenGrade(ctx);
        memoryLeak(ctx, t, 1 + U.ss(3, 6, lt));
        return;
      }
      // he reaches for her; the memory closes like a door while she is still looking at him
      const lt = t - 40;
      ctx.fillStyle = 'rgb(4,4,8)';
      ctx.fillRect(0, 0, W, H);
      const close = U.easeInOut(U.inv(1.0, 4.2, lt));
      const gw = U.lerp(760, 0, close);
      if (lt < 4.35) {
        const b = FILM.buffer('s06gap');
        const g0 = b.x.createRadialGradient(960, 380, 50, 960, 402, 800);
        g0.addColorStop(0, 'rgb(255,226,170)');
        g0.addColorStop(1, 'rgb(196,140,90)');
        b.x.fillStyle = g0;
        b.x.fillRect(0, 0, W, H);
        motherFace(b.x, t, lt, { x: 1000, y: 400, s: 400, yaw: 0.1, pitch: 0.02, gaze: [-0.05, 0], smile: 0.85, eye: 0.78, glisten: 1, wet: 1.3 });
        // the boy's balloon slips away, up past her
        const up = U.ss(0.2, 3.4, lt);
        const by = U.lerp(820, -260, up), bx = 1130 + Math.sin(lt * 1.2) * 25;
        FILM.sets.balloon(b.x, bx, by, 64, t, [bx + 30, by + 300]);
        ctx.save();
        ctx.beginPath();
        ctx.rect(1000 - gw / 2, 70, Math.max(gw, 2), 640);
        ctx.clip();
        D.buf(ctx, b, 1 - 0.3 * close);
        ctx.restore();
        // light spilling from the closing gap
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        D.glow(ctx, 1000, 390, 260 + gw * 0.6, [255, 200, 130], 0.45 + 0.4 * close);
        ctx.fillStyle = `rgba(255,220,160,${0.8 * (1 - U.ss(4.1, 4.35, lt))})`;
        ctx.fillRect(1000 - gw / 2 - 2, 70, 4, 640);
        ctx.fillRect(1000 + gw / 2 - 2, 70, 4, 640);
        ctx.restore();
      }
      // his hand reaching toward it from the dark
      const r = U.easeOut(U.inv(0, 3.6, lt));
      const hx = U.lerp(250, 800, r), hy = U.lerp(950, 470, r);
      ctx.strokeStyle = 'rgb(12,12,18)';
      ctx.lineCap = 'round';
      ctx.lineWidth = 120;
      ctx.beginPath(); ctx.moveTo(-100, 1100); ctx.lineTo(hx - 60, hy + 60); ctx.stroke();
      ctx.fillStyle = 'rgb(14,13,18)';
      ctx.beginPath(); ctx.ellipse(hx, hy, 70, 55, -0.6, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgb(14,13,18)';
      ctx.lineWidth = 26;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(hx + 20, hy - 20 + i * 18); ctx.lineTo(hx + 120 + r * 20, hy - 70 + i * 26); ctx.stroke(); }
      ctx.strokeStyle = `rgba(255,200,130,${0.5 * (1 - U.ss(4, 4.4, lt))})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(hx, hy, 70, 55, -0.6, -1.2, 0.8); ctx.stroke();
      // then nothing at all
      if (lt > 4.4) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    },
    audio(h, fx) {
      h.verb('room', 0.35);
      // everything of the memory runs through here, so it can be taken away at once
      const mem = h.gain(1);
      mem.connect(h.in);
      h.param(mem.gain, [[0, 1], [44.3, 1], [44.38, 0]]);
      const lp = h.filter('lowpass', 9000, 0.7);
      lp.connect(mem);
      h.param(lp.frequency, [[0, 9000], [41, 9000], [44.2, 350]], true);
      fx.bed(h, { color: 'pink', type: 'lowpass', f: 1500, gain: 0.025, dest: lp });
      const gas = fx.bed(h, { color: 'white', type: 'bandpass', f: 2600, Q: 0.8, gain: 0.02, dest: lp });
      h.param(gas.g.gain, [[0, 0.018], [10, 0.02], [11, 0.045], [16, 0.045], [17, 0.02], [46, 0.015]]);
      // a kitchen clock, the time of the memory
      for (let T = 0.5; T < 44; T += 1) h.at(T, (w) => fx.tick(h, w, { gain: 0.03, pitch: 0.55, dest: lp }));
      fx.scatter(h, 0.5, 43, 0.7, 66, (w, k) => fx.bird(h, w, { gain: 0.035 + k * 0.02, pan: 0.3 + k * 0.6, dest: lp }));
      fx.scatter(h, 10, 16, 14, 67, (w, k) => fx.bubble(h, w, { size: 0.5 + k * 0.6, gain: 0.03 + k * 0.03, dest: lp }));
      h.at(12.4, (w) => fx.whoosh(h, w, { dur: 2.4, f1: 900, f2: 2600, gain: 0.05, color: 'white', dest: lp }));
      for (const T of [10.6, 11.1, 11.6, 12.1, 15.4]) h.at(T, (w) => fx.ring(h, w, { f: 2200, partials: [1, 2.4, 3.9], decay: [0.35, 0.2, 0.1], gain: 0.05, dest: lp }));
      h.at(7.5, (w) => fx.porcelain(h, w, { pitch: 1.1, gain: 0.06, dest: lp }));
      // the boy turns to look at him: a small, clear chime of porcelain in the quiet
      h.at(19.9, (w) => fx.porcelain(h, w, { pitch: 1.3, gain: 0.05, dest: lp }));
      // her slippers on the tiles; her hand in his hair
      for (const T of [28.2, 28.8, 29.4]) h.at(T, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 1200, d: 0.12, gain: 0.04, dest: lp }));
      for (let T = 29.2; T < 33.8; T += 0.72) h.at(T, (w) => fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 3200, Q: 0.6, a: 0.15, d: 0.3, gain: 0.018, dest: lp }));
      // as she looks at him, the room swells warm and low
      const warm = fx.bed(h, { color: 'brown', type: 'lowpass', f: 140, gain: 0, dest: lp });
      h.param(warm.g.gain, [[0, 0], [35, 0], [39, 0.14], [42, 0.2], [44.2, 0.25]]);
      // it is pulled away from him, then shut
      h.at(40.25, (w) => { fx.tone(h, w, { type: 'triangle', f: 700, f2: 980, a: 0.02, d: 0.35, gain: 0.02, dest: lp }); fx.burst(h, w, { color: 'pink', type: 'bandpass', f: 2400, Q: 2, d: 0.25, gain: 0.04, dest: lp }); });
      h.at(41.2, (w) => fx.whoosh(h, w, { dur: 3.1, f1: 180, f2: 3000, gain: 0.22, color: 'pink', dest: lp }));
      h.at(44.36, (w) => { fx.thud(h, w, { gain: 0.5, f: 55, d: 0.9 }); fx.burst(h, w + 0.02, { type: 'bandpass', f: 2600, Q: 3, d: 0.03, gain: 0.08 }); });
    },
  });
})();
