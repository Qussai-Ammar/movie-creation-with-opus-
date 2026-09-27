/* Haneen — hand-drawn animation look for characters.
 * Replaces C.head with a cel-shaded, ink-outlined anime head (same options as before, so every scene uses it).
 * Features are placed on a turning head in 3D, then drawn flat: ink lines, one hard shadow tone, big eyes.
 */
(function () {
  'use strict';
  const { U, D } = FILM;
  const C = FILM.C;
  const INK = [46, 30, 26];
  C.INK = INK;

  const RX = 0.36, RY = 0.46, RZ = 0.44, CY = -0.08;
  const surfZ = (x, y) => { const a = 1 - (x / RX) ** 2 - ((y - CY) / RY) ** 2; return a > 0 ? RZ * Math.sqrt(a) : 0; };
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }
  function proj(o) {
    const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
    return (x, y, z) => {
      const X = x * cy + z * sy;
      let Z = -x * sy + z * cy;
      const Y = y * cp - Z * sp;
      Z = y * sp + Z * cp;
      return [X, Y, Z];
    };
  }
  // face outline (right half): anime proportions per character
  const FACE = {
    man: [[0, -0.36], [0.14, -0.35], [0.26, -0.3], [0.33, -0.2], [0.355, -0.06], [0.35, 0.06, 0.0], [0.33, 0.18, -0.02], [0.29, 0.3, 0.06], [0.2, 0.41, 0.2], [0.09, 0.47, 0.32], [0, 0.48, 0.35]],
    mother: [[0, -0.36], [0.14, -0.35], [0.26, -0.3], [0.33, -0.2], [0.35, -0.06], [0.34, 0.06, 0.0], [0.31, 0.19, 0.02], [0.25, 0.31, 0.1], [0.16, 0.41, 0.23], [0.07, 0.465, 0.33], [0, 0.475, 0.35]],
    boy: [[0, -0.36], [0.15, -0.35], [0.27, -0.3], [0.34, -0.18], [0.36, -0.04], [0.355, 0.08, 0.0], [0.33, 0.2, 0.04], [0.27, 0.31, 0.12], [0.17, 0.39, 0.24], [0.07, 0.43, 0.32], [0, 0.44, 0.34]],
  };
  FACE.girl = FACE.boy;
  const PROFILE = [[0, -0.3], [0, -0.2], [0, -0.1, 0.45], [0, 0.0, 0.44], [0, 0.08, 0.44], [0, 0.14, 0.46], [0, 0.2, 0.39], [0, 0.26, 0.36], [0, 0.32, 0.34], [0, 0.4, 0.34]];

  function drawHead(x, o) {
    const P = proj(o);
    const kind = o.kind, child = kind === 'boy' || kind === 'girl';
    const F = (px, py, dz = 0, zz) => P(px, py, (zz ?? surfZ(px, py)) + dz);
    const facing = (px, py, pz) => {
      let nx = px / (RX * RX), ny = (py - CY) / (RY * RY), nz = pz / (RZ * RZ);
      const l = Math.hypot(nx, ny, nz) || 1;
      return P(nx / l, ny / l, nz / l);
    };
    const skin = o.skin, hair = o.hair || C.pal.hair;
    const shadowSkin = [skin[0] * 0.9, skin[1] * 0.83, skin[2] * 0.84];
    const ink = U.rgb(INK);
    const LW = 0.013; // ink width in head units
    const cyw = Math.cos(o.yaw), syw = Math.sin(o.yaw), cpt = Math.cos(o.pitch), spt = Math.sin(o.pitch);
    const hw = Math.sqrt((RX * cyw) ** 2 + (RZ * syw) ** 2), hh = Math.sqrt((RY * cpt) ** 2 + (RZ * spt) ** 2);
    const c0 = P(0, CY, 0);
    const inked = (path, fill, lw = LW) => { path(); x.lineJoin = 'round'; x.lineWidth = lw * 2; x.strokeStyle = ink; x.stroke(); x.fillStyle = fill; x.fill(); };
    const poly = (pts, closed = true) => () => { D.curve(x, pts, closed); };
    // light direction in head space (for the shadow side)
    const cr = Math.cos(-o.roll), sr = Math.sin(-o.roll);
    let lx = o.light ? o.light.dx * cr - o.light.dy * sr : -Math.sign(o.yaw || 1);
    let ly = o.light ? o.light.dx * sr + o.light.dy * cr : -0.3;
    const ll = Math.hypot(lx, ly) || 1; lx /= ll; ly /= ll;

    /* long hair / hijab behind */
    if (kind === 'girl') inked(poly([P(-0.42, -0.2, -0.1), P(0.42, -0.2, -0.1), P(0.47, 0.45, -0.15), P(0.44, 0.88, -0.2), P(0, 0.93, -0.3), P(-0.44, 0.88, -0.2), P(-0.47, 0.45, -0.15)]), U.rgb(hair));
    if (kind === 'mother') {
      const sc = o.scarf || C.pal.scarf;
      inked(() => { x.beginPath(); x.ellipse(c0[0], c0[1] - 0.02, hw * 1.2, hh * 1.14, 0, 0, Math.PI * 2); }, U.rgb(sc));
      inked(poly([P(-0.44, 0.02, -0.12), P(0.44, 0.02, -0.12), P(0.58, 0.9, -0.1), P(0, 0.98, 0.25), P(-0.58, 0.9, -0.1)]), U.rgb(sc));
    }

    /* neck + shoulders */
    if (o.bust) {
      const by = child ? 0.84 : 1, bx = child ? 0.8 : 1;
      const sw = (0.62 + 0.18 * Math.abs(cyw)) * bx;
      inked(poly([P(-0.2, 0.7 * by, 0), P(-sw * 0.8, 0.84 * by, -0.05), P(-sw, 1.05 * by, -0.1), P(-sw * 1.05, 1.8, -0.1), P(sw * 1.05, 1.8, -0.1), P(sw, 1.05 * by, -0.1), P(sw * 0.8, 0.84 * by, -0.05), P(0.2, 0.7 * by, 0)]), U.rgb(o.shirt));
      // cloth folds
      x.strokeStyle = U.rgb(INK, 0.35);
      x.lineWidth = LW * 0.8;
      for (const fx of [-0.3, 0.32]) { const a = P(fx, 0.95 * by, 0.1), b = P(fx * 1.3, 1.4, 0.05); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
      const n1 = P(-0.13, 0.2, -0.04), n2 = P(0.13, 0.2, -0.04), n3 = P(0.15, 0.78 * by, 0), n4 = P(-0.15, 0.78 * by, 0);
      inked(() => { x.beginPath(); x.moveTo(n1[0], n1[1]); x.lineTo(n2[0], n2[1]); x.lineTo(n3[0], n3[1]); x.lineTo(n4[0], n4[1]); x.closePath(); }, U.rgb(skin));
      // hard shadow under the jaw
      x.fillStyle = U.rgb(shadowSkin);
      const j1 = P(-0.15, 0.36, 0.05), j2 = P(0.15, 0.36, 0.05), j3 = P(0.15, 0.56, 0.02), j4 = P(-0.15, 0.56, 0.02);
      x.beginPath(); x.moveTo(j1[0], j1[1]); x.lineTo(j2[0], j2[1]); x.quadraticCurveTo((j2[0] + j3[0]) / 2, j3[1], j3[0], j3[1] - 0.04); x.lineTo(j4[0], j4[1] - 0.04); x.closePath(); x.fill();
      if (kind === 'girl') {
        x.fillStyle = 'rgb(248,246,238)';
        for (const sd of [-1, 1]) { const c = P(sd * 0.1, 0.7 * by, 0.12); inked(() => { x.beginPath(); x.ellipse(c[0], c[1], 0.12, 0.055, sd * 0.35, 0, 7); }, 'rgb(248,246,238)', LW * 0.6); }
      }
    }

    /* hair mass: one silhouette with soft volume and a few tufts, turning with the head */
    const hairK = child ? 1.07 : 1.03;
    const hairPath = () => {
      x.beginPath();
      const N = 72;
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2;
        const up = Math.max(0, -Math.sin(th)); // only the top half gets volume
        const ph = th + o.yaw * 0.9;
        const tuft = kind === 'girl' ? 0.015 * Math.sin(ph * 5) : 0.05 * Math.max(0, Math.sin(ph * 7 + 0.6)) ** 3 + 0.025 * Math.sin(ph * 3 + 1.1);
        const vol = 1 + up * ((kind === 'man' ? 0.07 : 0.09) + tuft);
        const px = c0[0] + Math.cos(th) * hw * hairK * vol;
        let py = c0[1] - 0.015 + Math.sin(th) * hh * hairK * vol - up * 0.02;
        // short hair ends at the ears on the side the face turns to, lower at the nape
        const side = Math.cos(th) * Math.sin(o.yaw);
        const lim = kind === 'girl' ? 0.6 : side > 0 ? 0.08 : U.lerp(0.08, 0.4, U.clamp(-side * 2.5));
        if (Math.sin(th) > 0) py = c0[1] - 0.015 + Math.sin(th) * hh * hairK * lim;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.closePath();
    };
    if (kind !== 'mother') inked(hairPath, U.rgb(hair));

    /* ears */
    if (kind !== 'mother') {
      for (const sd of [-1, 1]) {
        const e = F(sd * 0.352, 0.02, 0, -0.03);
        const vis = P(sd, 0, -0.15)[2];
        if (vis < -0.25) continue;
        const ew = 0.05 * U.clamp(0.25 + vis, 0.22, 1);
        inked(() => { x.beginPath(); x.ellipse(e[0], e[1], ew, 0.085, 0, 0, Math.PI * 2); }, U.rgb(skin));
        x.strokeStyle = U.rgb(INK, 0.6); x.lineWidth = LW * 0.7;
        x.beginPath(); x.ellipse(e[0] + 0.005 * sd, e[1], ew * 0.5, 0.05, 0, -1.2, 1.9); x.stroke();
      }
    }

    /* face */
    const base = FACE[kind] || FACE.man;
    const pts = base.concat(base.slice(1, -1).reverse().map(([a, b, z]) => [-a, b, z])).concat(PROFILE.filter(([, py]) => !child || py < 0.42));
    const face = hull(pts.map(([px, py, pz]) => (pz == null ? F(px, py, 0.004) : P(px, py, pz * (child ? 0.97 : 1)))));
    inked(poly(face), U.rgb(skin));
    x.save();
    D.curve(x, face);
    x.clip();
    // one hard shadow tone on the side away from the light (and the side turning away)
    const fc = P(0, 0.04, RZ);
    const sx = -lx * 0.52 - syw * 0.35, sy = -ly * 0.3;
    x.fillStyle = U.rgb(shadowSkin);
    x.beginPath(); x.ellipse(fc[0] + sx, fc[1] + sy + 0.05, 0.36, 0.62, 0, 0, Math.PI * 2); x.fill();
    // blush
    for (const sd of [-1, 1]) {
      const b = F(sd * 0.19, 0.1 + (child ? 0.03 : 0), 0.01);
      if (b[2] < 0.05) continue;
      const g = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], 0.09);
      g.addColorStop(0, `rgba(232,120,110,${(child ? 0.38 : kind === 'mother' ? 0.22 : 0.14) + o.smile * 0.1})`);
      g.addColorStop(1, 'rgba(232,120,110,0)');
      x.fillStyle = g; x.fillRect(b[0] - 0.1, b[1] - 0.1, 0.2, 0.2);
    }
    // his stubble: a cool tone along the jaw
    if (kind === 'man' && (o.beard ?? 1) > 0) {
      const bd = hull([[0.35, 0.05, 0.0], [0.33, 0.18, -0.02], [0.29, 0.3, 0.06], [0.2, 0.41, 0.2], [0.09, 0.47, 0.32], [0, 0.48, 0.35], [-0.09, 0.47, 0.32], [-0.2, 0.41, 0.2], [-0.29, 0.3, 0.06], [-0.33, 0.18, -0.02], [-0.35, 0.05, 0.0], [-0.26, 0.14], [-0.12, 0.225], [0, 0.23], [0.12, 0.225], [0.26, 0.14]]
        .map(([px, py, pz]) => (pz == null ? F(px, py, 0.004) : P(px, py, pz))).filter((q) => q[2] > -0.03));
      x.fillStyle = U.rgb(U.mix(skin, [96, 98, 120], 0.22), 0.22 * (o.beard ?? 1));
      D.curve(x, bd); x.fill();
      const r = U.rng(4);
      x.fillStyle = U.rgb(U.mix(hair, [70, 72, 86], 0.4), 0.3);
      for (let i = 0; i < 0; i++) {
        const px = (r() * 2 - 1) * 0.3, py = 0.2 + r() * 0.26;
        const q = F(px, py, 0.005, py > 0.36 ? 0.3 : undefined);
        if (q[2] < 0.05) continue;
        x.fillRect(q[0], q[1], 0.006, 0.006);
      }
    }
    x.restore();

    /* nose: a short line and a hint of shadow */
    const nt = P(0, 0.14 + (child ? 0.02 : 0), RZ + (child ? 0.02 : 0.045));
    const nb = F(0, 0.04, 0.01);
    x.strokeStyle = U.rgb(INK, 0.7);
    x.lineWidth = LW * 0.9;
    x.lineCap = 'round';
    const nside = Math.sign(-lx || 1);
    x.beginPath();
    x.moveTo(U.lerp(nb[0], nt[0], 0.45) + nside * 0.01, U.lerp(nb[1], nt[1], 0.45));
    x.quadraticCurveTo(nt[0] + nside * 0.02, nt[1] - 0.01, nt[0], nt[1] + 0.012);
    x.stroke();
    x.fillStyle = U.rgb(shadowSkin);
    x.beginPath(); x.ellipse(nt[0] + nside * 0.02, nt[1] + 0.01, 0.022, 0.012, 0, 0, 7); x.fill();

    /* mouth */
    const sm = o.smile, open = o.open || 0;
    const mw = child ? 0.07 : kind === 'mother' ? 0.085 : 0.09;
    const my = 0.29 + (child ? 0.0 : 0);
    const mL = F(-mw - sm * 0.01, my - sm * 0.02, 0.01), mR = F(mw + sm * 0.01, my - sm * 0.02, 0.01);
    const mC = F(0, my + sm * 0.02 + open * 0.02, 0.03);
    if (open > 0.05) {
      inked(() => { x.beginPath(); x.moveTo(mL[0], mL[1]); x.quadraticCurveTo(mC[0], mC[1] - 0.01, mR[0], mR[1]); x.quadraticCurveTo(mC[0], mC[1] + open * 0.06, mL[0], mL[1]); x.closePath(); }, 'rgb(120,46,46)', LW * 0.7);
    } else {
      x.strokeStyle = ink;
      x.lineWidth = LW * 1.1;
      x.beginPath(); x.moveTo(mL[0], mL[1]); x.quadraticCurveTo(mC[0], mC[1], mR[0], mR[1]); x.stroke();
      // lower lip hint
      const ll2 = F(0, my + 0.045, 0.025);
      x.strokeStyle = U.rgb(INK, 0.35);
      x.lineWidth = LW * 0.7;
      x.beginPath(); x.moveTo(ll2[0] - 0.025, ll2[1]); x.lineTo(ll2[0] + 0.025, ll2[1]); x.stroke();
    }

    /* eyes */
    const eyeScale = kind === 'girl' ? 1.35 : child ? 1.25 : kind === 'mother' ? 1.05 : 1;
    const eyesSeen = [];
    const eyeY = -0.045 + (child ? 0.05 : 0);
    for (const sd of [-1, 1]) {
      const ex = sd * 0.13, ey = eyeY, ez = surfZ(ex, ey) - 0.01;
      const c = P(ex, ey, ez);
      const n = facing(ex, ey, ez);
      if (n[2] < 0.12) continue;
      const fx = Math.sqrt(Math.max(0.05, 1 - n[0] * n[0])), fy = Math.sqrt(Math.max(0.1, 1 - n[1] * n[1]));
      const w = 0.078 * fx * eyeScale, h = 0.058 * fy * eyeScale;
      eyesSeen.push({ sd, c, w, h, vis: n[2], ex, ey });
      const openK = U.clamp(o.eye);
      if (openK < 0.12) {
        // closed: a single curved lash line (smiling eyes curve up)
        x.strokeStyle = ink; x.lineWidth = LW * 1.4; x.lineCap = 'round';
        x.beginPath(); x.moveTo(c[0] - w, c[1]); x.quadraticCurveTo(c[0], c[1] + (sm > 0.4 ? -h * 0.9 : h * 0.6), c[0] + w, c[1]); x.stroke();
        continue;
      }
      const shape = () => {
        x.beginPath();
        x.moveTo(c[0] - w, c[1] + h * 0.1);
        x.bezierCurveTo(c[0] - w * 0.6, c[1] - h * 1.15, c[0] + w * 0.6, c[1] - h * 1.1, c[0] + w, c[1] - h * 0.05);
        x.bezierCurveTo(c[0] + w * 0.6, c[1] + h * 0.85, c[0] - w * 0.5, c[1] + h * 0.9, c[0] - w, c[1] + h * 0.1);
        x.closePath();
      };
      x.save();
      shape(); x.clip();
      x.fillStyle = 'rgb(250,246,240)';
      x.fillRect(c[0] - w * 1.2, c[1] - h * 2, w * 2.4, h * 4);
      const gx = c[0] + (o.gaze[0] * 0.42 + Math.sin(o.yaw) * 0.2) * w, gy = c[1] + o.gaze[1] * h * 0.35 + h * 0.05;
      const irx = w * 0.5 * (0.55 + 0.45 * fx), iry = h * 0.92;
      const ig = x.createLinearGradient(0, gy - iry, 0, gy + iry);
      const irisC = o.iris || [96, 58, 34];
      ig.addColorStop(0, U.rgb(U.mul(irisC, 0.45)));
      ig.addColorStop(0.55, U.rgb(irisC));
      ig.addColorStop(1, U.rgb(U.mix(irisC, [220, 170, 110], 0.35)));
      x.fillStyle = ig;
      x.beginPath(); x.ellipse(gx, gy, irx, iry, 0, 0, 7); x.fill();
      x.strokeStyle = U.rgb(INK, 0.8); x.lineWidth = LW * 0.6; x.stroke();
      x.fillStyle = 'rgb(20,12,10)';
      x.beginPath(); x.ellipse(gx, gy + iry * 0.05, irx * 0.45, iry * 0.48, 0, 0, 7); x.fill();
      x.fillStyle = `rgba(255,255,255,${0.95 * (o.wet ?? 1) > 0.95 ? 0.95 : 0.9})`;
      x.beginPath(); x.ellipse(gx - irx * 0.35, gy - iry * 0.42, irx * 0.3, iry * 0.24, -0.3, 0, 7); x.fill();
      x.beginPath(); x.arc(gx + irx * 0.35, gy + iry * 0.4, irx * 0.14, 0, 7); x.fill();
      // shadow of the upper lid on the eye
      x.fillStyle = 'rgba(60,40,50,0.18)';
      x.fillRect(c[0] - w * 1.2, c[1] - h * 1.3, w * 2.4, h * 0.55);
      // the lid coming down
      const lidY = c[1] - h * 1.1 + (1 - openK) * h * 2.1;
      x.fillStyle = U.rgb(skin);
      x.beginPath();
      x.moveTo(c[0] - w * 1.3, c[1] - h * 2.5); x.lineTo(c[0] + w * 1.3, c[1] - h * 2.5); x.lineTo(c[0] + w * 1.3, c[1] - h * 0.05);
      x.quadraticCurveTo(c[0], lidY, c[0] - w * 1.3, c[1] + h * 0.1);
      x.closePath(); x.fill();
      if (o.glisten > 0) {
        x.strokeStyle = `rgba(200,230,255,${0.7 * o.glisten})`; x.lineWidth = LW;
        x.beginPath(); x.moveTo(c[0] - w * 0.8, c[1] + h * 0.55); x.quadraticCurveTo(c[0], c[1] + h * 0.95, c[0] + w * 0.8, c[1] + h * 0.45); x.stroke();
      }
      x.restore();
      // upper lash line, heavy, with a flick at the outer corner
      const lid2 = c[1] - h * 1.1 + (1 - openK) * h * 2.1;
      x.strokeStyle = ink; x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = LW * (kind === 'man' ? 1.5 : 1.9);
      x.beginPath();
      x.moveTo(c[0] - w * 1.02, c[1] + h * 0.12);
      x.quadraticCurveTo(c[0] - w * 0.1, lid2 - h * 0.02, c[0] + w * 1.02, c[1] - h * 0.05);
      x.lineTo(c[0] + w * 1.02 + sd * 0 + w * 0.22 * (sd > 0 ? 1 : -1) * (sd > 0 ? 1 : 1), c[1] - h * 0.3);
      x.stroke();
      // lower lash: short and light at the outer end
      x.lineWidth = LW * 0.7;
      x.strokeStyle = U.rgb(INK, 0.55);
      x.beginPath(); x.moveTo(c[0] + sd * w * 0.1, c[1] + h * 0.82); x.quadraticCurveTo(c[0] + sd * w * 0.6, c[1] + h * 0.75, c[0] + sd * w * 0.95, c[1] + h * 0.15); x.stroke();
      // double-lid crease
      x.strokeStyle = U.rgb(INK, 0.4); x.lineWidth = LW * 0.6;
      x.beginPath(); x.moveTo(c[0] - w * 0.7, c[1] - h * 1.2); x.quadraticCurveTo(c[0], c[1] - h * 1.65, c[0] + w * 0.85, c[1] - h * 0.95); x.stroke();
      if (o.tired > 0.3) {
        x.strokeStyle = U.rgb(INK, 0.22 * o.tired); x.lineWidth = LW * 0.6;
        x.beginPath(); x.moveTo(c[0] - w * 0.6, c[1] + h * 1.25); x.quadraticCurveTo(c[0], c[1] + h * 1.5, c[0] + w * 0.7, c[1] + h * 1.15); x.stroke();
      }
    }

    /* brows */
    const bw = kind === 'man' ? 0.026 : kind === 'boy' ? 0.02 : 0.014;
    for (const sd of [-1, 1]) {
      const by = -0.15 + (child ? 0.04 : 0);
      const bp = [[0.05, by + 0.02 - o.worry * 0.03], [0.13, by - 0.012 - o.worry * 0.008], [0.215, by + 0.01]].map(([px, py]) => { const zz = surfZ(sd * px, py) + 0.015; return [P(sd * px, py, zz), facing(sd * px, py, zz)]; });
      if (bp[1][1][2] < 0.1) continue;
      x.strokeStyle = U.rgb(U.mix(hair, INK, 0.4)); x.lineWidth = bw; x.lineCap = 'round';
      x.beginPath(); x.moveTo(bp[0][0][0], bp[0][0][1]); x.quadraticCurveTo(bp[1][0][0], bp[1][0][1], bp[2][0][0], bp[2][0][1]); x.stroke();
    }

    /* front hair / hijab front */
    if (kind === 'mother') {
      const sc = o.scarf || C.pal.scarf;
      // the band framing her face, and the fold under the chin
      const band = [];
      for (let i = 0; i <= 14; i++) { const a = -Math.PI * 0.95 + (i / 14) * Math.PI * 0.9; band.push(F(Math.cos(a) * 0.34, -0.1 + Math.sin(a) * 0.3, 0.03)); }
      x.lineCap = 'round';
      for (let i = 0; i < band.length - 1; i++) {
        const a = band[i], b = band[i + 1];
        if (a[2] < 0.02 || b[2] < 0.02) continue;
        x.strokeStyle = ink; x.lineWidth = 0.1; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      for (let i = 0; i < band.length - 1; i++) {
        const a = band[i], b = band[i + 1];
        if (a[2] < 0.02 || b[2] < 0.02) continue;
        x.strokeStyle = U.rgb(sc); x.lineWidth = 0.075; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      const ch = [P(-0.34, 0.1, 0.06), P(-0.28, 0.38, 0.14), P(0, 0.54, 0.36), P(0.28, 0.38, 0.14), P(0.34, 0.1, 0.06), P(0.46, 0.72, 0.05), P(-0.46, 0.72, 0.05)];
      inked(() => {
        x.beginPath();
        x.moveTo(ch[0][0], ch[0][1]);
        x.quadraticCurveTo(ch[1][0], ch[1][1] + 0.05, ch[2][0], ch[2][1] + 0.02);
        x.quadraticCurveTo(ch[3][0], ch[3][1] + 0.05, ch[4][0], ch[4][1]);
        x.lineTo(ch[5][0], ch[5][1]); x.lineTo(ch[6][0], ch[6][1]); x.closePath();
      }, U.rgb(sc));
      x.strokeStyle = U.rgb(INK, 0.35); x.lineWidth = LW * 0.8;
      for (let i = 0; i < 4; i++) { const a = P(-0.24 + i * 0.16, 0.58, 0.2), b = P(-0.3 + i * 0.2, 0.84, 0.1); x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(a[0] + 0.03, (a[1] + b[1]) / 2, b[0], b[1]); x.stroke(); }
    } else {
      // bangs: a few broad locks swept to one side, a soft shadow cast on the forehead beneath them
      const sweep = kind === 'girl' ? 0 : 1;
      const locks = kind === 'man'
        ? [[-0.3, 0.12, 0.12], [-0.14, 0.12, 0.2], [0.03, 0.12, 0.15], [0.19, 0.11, 0.1], [0.31, 0.08, 0.06]]
        : kind === 'boy'
          ? [[-0.32, 0.1, 0.2], [-0.17, 0.1, 0.25], [-0.01, 0.1, 0.22], [0.15, 0.1, 0.24], [0.3, 0.09, 0.18]]
          : [[-0.3, 0.1, 0.26], [-0.15, 0.09, 0.22], [0.0, 0.09, 0.24], [0.15, 0.09, 0.21], [0.3, 0.1, 0.26]];
      const hl = -0.37;
      const lockPath = (lx0, w, len, dy) => {
        const top = -0.5, tip = hl + len;
        const a = F(lx0 - w, top, 0.035), b = F(lx0 + w * 1.1, top, 0.035);
        const tp = F(lx0 + sweep * 0.07 - w * 0.2, tip, 0.03);
        const m1 = F(lx0 - w * 0.9 + sweep * 0.02, (top + tip) / 2, 0.04), m2 = F(lx0 + w * 0.8 + sweep * 0.06, (top + tip) / 2 + 0.03, 0.04);
        return { a, b, tp, ok: tp[2] > 0.03 && a[2] > -0.02, path: (closed) => {
          x.beginPath(); x.moveTo(a[0], a[1] + dy);
          x.quadraticCurveTo(m1[0], m1[1] + dy, tp[0], tp[1] + dy);
          x.quadraticCurveTo(m2[0], m2[1] + dy, b[0], b[1] + dy);
          if (closed) x.closePath();
        } };
      };
      // shadow of the fringe on the forehead
      x.save();
      D.curve(x, face); x.clip();
      x.fillStyle = U.rgb(shadowSkin, 0.85);
      for (const [cx, w, len] of locks) { const L = lockPath(cx, w, len, 0.045); if (L.ok) { L.path(true); x.fill(); } }
      x.restore();
      x.save();
      hairPath(); x.clip();
      for (const [cx, w, len] of locks) {
        const L = lockPath(cx, w, len, 0);
        if (!L.ok) continue;
        L.path(false); x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = LW * 1.6; x.strokeStyle = ink; x.stroke();
        L.path(true); x.fillStyle = U.rgb(hair); x.fill();
      }
      x.restore();
      if (kind === 'girl') {
        for (const sd of [-1, 1]) {
          const lk = [F(sd * 0.3, -0.3, 0.03), F(sd * 0.37, 0.05, 0.02), F(sd * 0.38, 0.4, 0.0), F(sd * 0.33, 0.55, 0.0), F(sd * 0.27, 0.3, 0.02), F(sd * 0.26, -0.05, 0.04)];
          if (lk[1][2] < -0.05) continue;
          inked(poly(lk), U.rgb(hair), LW * 0.7);
        }
        // yellow hairband
        const band = [];
        for (let i = 0; i <= 12; i++) { const px = -0.37 + i * 0.0617; const py = -0.47 + (px / 0.37) ** 2 * 0.2; band.push(P(px, py, surfZ(px * 0.97, py) + 0.035)); }
        for (const [col, wd] of [[ink, 0.1], ['rgb(236,188,64)', 0.07]]) {
          x.strokeStyle = col; x.lineWidth = wd; x.lineCap = 'round';
          for (let i = 0; i < band.length - 1; i++) { if (band[i][2] < 0 || band[i + 1][2] < 0) continue; x.beginPath(); x.moveTo(band[i][0], band[i][1]); x.lineTo(band[i + 1][0], band[i + 1][1]); x.stroke(); }
        }
      }
      // the band of shine on the hair: a soft crescent with a zigzag lower edge
      const shine = [];
      for (let i = 0; i <= 16; i++) {
        const k = i / 16, px = -0.3 + k * 0.6;
        const py = -0.52 + Math.abs(px) * 0.25 + (i % 2 ? 0.035 : 0);
        shine.push(P(px, py, surfZ(px * 0.92, Math.max(py, -0.5)) + 0.05));
      }
      for (let i = 16; i >= 0; i--) { const px = -0.3 + (i / 16) * 0.6, py = -0.575 + Math.abs(px) * 0.25; shine.push(P(px, py, surfZ(px * 0.9, -0.52) + 0.05)); }
      if (shine[8][2] > 0.05) {
        x.save(); hairPath(); x.clip();
        x.fillStyle = U.rgb(U.mix(hair, [170, 160, 190], 0.3), 0.7);
        x.beginPath(); shine.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.closePath(); x.fill();
        x.restore();
      }
    }

    /* scene light: a flat wash of its colour and a thin rim on the lit edge */
    if (o.light) {
      x.save();
      x.globalCompositeOperation = 'source-atop';
      const g = x.createLinearGradient(fc[0] - lx * 0.6, fc[1] - ly * 0.6, fc[0] + lx * 0.6, fc[1] + ly * 0.6);
      g.addColorStop(0, U.rgb(o.shade || [10, 8, 12], o.shadow * 0.35));
      g.addColorStop(0.5, U.rgb(o.shade || [10, 8, 12], 0));
      g.addColorStop(0.62, U.rgb(o.light.col, 0));
      g.addColorStop(1, U.rgb(o.light.col, o.light.amt * 0.55));
      x.fillStyle = g;
      x.fillRect(-2, -2, 4, 4);
      x.restore();
    }
    if (o.wash) { x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = U.rgb(o.wash.col, o.wash.a); x.fillRect(-2, -2, 4, 4); x.restore(); }

    /* a tear */
    if (o.tear > 0 && eyesSeen.length) {
      const e = eyesSeen.reduce((a, b) => (b.vis > a.vis ? b : a));
      const len = 0.3 * U.clamp(o.tear);
      const tp = [];
      for (let i = 0; i <= 8; i++) { const k = i / 8; tp.push(F(e.ex * (1.02 + 0.12 * k), e.ey + 0.05 + len * k, 0.012)); }
      x.strokeStyle = 'rgba(210,235,255,0.6)'; x.lineWidth = 0.009; x.lineCap = 'round';
      x.beginPath(); tp.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke();
      const d = tp[tp.length - 1];
      inked(() => { x.beginPath(); x.ellipse(d[0], d[1], 0.012, 0.017, 0, 0, 7); }, 'rgba(220,240,255,0.95)', LW * 0.4);
    }
  }

  C.head = function (ctx, opts) {
    const o = Object.assign({
      x: 0, y: 0, s: 100, yaw: 0, pitch: 0, roll: 0, eye: 1, smile: 0, worry: 0, tired: 0, open: 0, gaze: [0, 0], glisten: 0, tear: 0,
      skin: C.pal.manSkin, hair: C.pal.hair, kind: 'man', light: null, shadow: 0.55, shirt: [62, 64, 70], bust: true, alpha: 1,
    }, opts);
    if (o.kind === 'girl' && !opts.hair) o.hair = C.pal.girlHair;
    const b = FILM.buffer('__head', false);
    const x = b.x;
    const m = ctx.getTransform();
    const cx = m.a * o.x + m.c * o.y + m.e, cy = m.b * o.x + m.d * o.y + m.f;
    const r = o.s * Math.hypot(m.a, m.b) * (o.bust ? 2.0 : 1.1) + 6;
    const bx = Math.max(0, Math.floor(cx - r)), by = Math.max(0, Math.floor(cy - r));
    const bw = Math.min(b.c.width, Math.ceil(cx + r)) - bx, bh = Math.min(b.c.height, Math.ceil(cy + r)) - by;
    if (bw <= 0 || bh <= 0) return;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(bx, by, bw, bh);
    x.save();
    x.beginPath(); x.rect(bx, by, bw, bh); x.clip();
    x.setTransform(m);
    x.translate(o.x, o.y);
    x.rotate(o.roll);
    x.scale(o.s, o.s);
    if (o.kind === 'boy' || o.kind === 'girl') x.scale(1.1, 0.9);
    drawHead(x, o);
    x.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= o.alpha;
    if (o.filter) ctx.filter = o.filter;
    ctx.drawImage(b.c, bx, by, bw, bh, bx, by, bw, bh);
    ctx.restore();
  };
})();
