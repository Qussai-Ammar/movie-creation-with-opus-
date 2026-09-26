/* One Night — characters.
 *   C.head(ctx, o)    pseudo-3D painted head for close-ups (man / mother / boy)
 *   C.figure(ctx, o)  posable full body for wide shots (side / front / back views)
 *   C.poses.*         pose generators (walk, sit, swim, float ...)
 */
(function () {
  'use strict';
  const { U, D } = FILM;
  const C = (FILM.C = {});

  C.pal = {
    manSkin: [170, 120, 88],
    momSkin: [182, 131, 97],
    boySkin: [186, 136, 101],
    hair: [22, 17, 15],
    lip: [132, 72, 62],
    scarf: [226, 216, 196],
    thobe: [34, 36, 44],
    tatreez: [168, 32, 38],
    girlSkin: [188, 138, 104],
    girlHair: [74, 44, 30],
  };

  /* ------------------------------------------------------------ the head */
  // Head space: unit = head height. x right, y down, z toward viewer. Face looks along +z.
  const RX = 0.36, RY = 0.46, RZ = 0.44, CY = -0.08;
  const surfZ = (x, y) => {
    const a = 1 - (x / RX) ** 2 - ((y - CY) / RY) ** 2;
    return a > 0 ? RZ * Math.sqrt(a) : 0;
  };

  // outline of the visible face (skin), right half, [x, y, z?]
  const MASK_R = [
    [0, -0.365], [0.12, -0.36], [0.23, -0.33], [0.3, -0.26], [0.34, -0.14, 0.02], [0.35, 0.0, -0.03],
    [0.345, 0.08, -0.04], [0.325, 0.19, -0.04], [0.28, 0.3, 0.0], [0.2, 0.4, 0.16], [0.1, 0.465, 0.3], [0, 0.485, 0.36],
  ];
  // profile centre line (only matters for the hull when the head turns)
  const PROFILE = [[0, -0.3], [0, -0.2], [0, -0.1, 0.45], [0, 0.0, 0.44], [0, 0.1, 0.42], [0, 0.2, 0.38], [0, 0.26, 0.33], [0, 0.32, 0.31], [0, 0.4, 0.33]];
  const MASK = MASK_R.concat(MASK_R.slice(1, -1).reverse().map(([x, y, z]) => [-x, y, z])).concat(PROFILE);
  const BEARD_R = [
    [0.35, 0.03, 0.02], [0.345, 0.08, 0.0], [0.325, 0.19, -0.01], [0.28, 0.3, 0.02], [0.2, 0.4, 0.16], [0.1, 0.465, 0.3], [0, 0.485, 0.36],
  ];
  const BEARD_TOP_R = [[0.3, 0.12], [0.2, 0.19], [0.12, 0.235], [0.05, 0.228], [0, 0.232]];
  const BEARD = BEARD_R.concat(BEARD_R.slice(0, -1).reverse().map(([x, y, z]) => [-x, y, z]))
    .concat(BEARD_TOP_R.map(([x, y]) => [-x, y]))
    .concat(BEARD_TOP_R.slice(0, -1).reverse());

  // stubble dots, generated once
  const STUBBLE = (() => {
    const r = U.rng(7), pts = [];
    while (pts.length < 520) {
      const x = (r() * 2 - 1) * 0.34, y = 0.1 + r() * 0.38;
      const half = y < 0.19 ? 0.34 : U.lerp(0.33, 0.08, (y - 0.19) / 0.29);
      if (Math.abs(x) > half) continue;
      if (y < 0.23 - 0.25 * Math.abs(x) && Math.abs(x) < 0.3) continue; // cheeks
      if (Math.abs(x) < 0.11 && y > 0.262 && y < 0.33) continue; // lips
      pts.push([x, y]);
    }
    return pts;
  })();

  // convex hull (monotone chain) — keeps the turned face outline from self-intersecting
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

  function drawHead(x, o) {
    const P = proj(o);
    const F = (px, py, dz = 0, zz) => P(px, py, (zz ?? surfZ(px, py)) + dz);
    const facing = (px, py, pz) => {
      let nx = px / (RX * RX), ny = (py - CY) / (RY * RY), nz = pz / (RZ * RZ);
      const l = Math.hypot(nx, ny, nz) || 1;
      return P(nx / l, ny / l, nz / l);
    };
    const skin = o.skin, dark = U.mul(skin, 0.62), hair = o.hair;
    const kind = o.kind;
    const child = kind === 'boy' || kind === 'girl';
    // children: features sit lower on a rounder face, the nose is small
    const kidY = child ? 0.035 : 0;
    const pathPts = (pts) => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); };

    // skull silhouette (rotated ellipsoid, approximated)
    const cyw = Math.cos(o.yaw), syw = Math.sin(o.yaw), cpt = Math.cos(o.pitch), spt = Math.sin(o.pitch);
    const hw = Math.sqrt((RX * cyw) ** 2 + (RZ * syw) ** 2);
    const hh = Math.sqrt((RY * cpt) ** 2 + (RZ * spt) ** 2);
    const c0 = P(0, CY, 0);

    /* a girl's long hair falls behind her neck and shoulders */
    if (kind === 'girl') {
      x.fillStyle = U.rgb(hair);
      D.curve(x, [P(-0.4, -0.2, -0.1), P(0.4, -0.2, -0.1), P(0.47, 0.45, -0.15), P(0.44, 0.9, -0.2), P(0, 0.95, -0.3), P(-0.44, 0.9, -0.2), P(-0.47, 0.45, -0.15)]);
      x.fill();
    }

    /* neck + shoulders */
    if (o.bust) {
      const by = child ? 0.84 : 1, bx = child ? 0.8 : 1;
      const n1 = P(-0.15, 0.2, -0.06), n2 = P(0.15, 0.2, -0.06), n3 = P(0.17, 0.78 * by, -0.02), n4 = P(-0.17, 0.78 * by, -0.02);
      x.fillStyle = U.rgb(U.mul(skin, 0.8));
      pathPts([n1, n2, n3, n4]);
      x.fill();
      const sw = (0.62 + 0.18 * Math.abs(cyw)) * bx;
      x.fillStyle = U.rgb(o.shirt);
      D.curve(x, [P(-0.2, 0.7 * by, 0), P(-sw * 0.8, 0.84 * by, -0.05), P(-sw, 1.05 * by, -0.1), P(-sw * 1.05, 1.7, -0.1),
        P(sw * 1.05, 1.7, -0.1), P(sw, 1.05 * by, -0.1), P(sw * 0.8, 0.84 * by, -0.05), P(0.2, 0.7 * by, 0)]);
      x.fill();
      // collar shadow
      const cl = P(0, 0.72 * by, 0.08);
      x.fillStyle = U.rgb(U.mul(skin, 0.7));
      x.beginPath();
      x.ellipse(cl[0], cl[1], 0.13, 0.07, 0, 0, Math.PI);
      x.fill();
    }

    /* back of head: hair or headscarf */
    if (kind === 'mother') {
      x.fillStyle = U.rgb(o.scarf || C.pal.scarf);
      x.beginPath();
      x.ellipse(c0[0], c0[1] - 0.02, hw * 1.2, hh * 1.14, 0, 0, Math.PI * 2);
      x.fill();
      const d = [P(-0.44, 0.02, -0.12), P(0.44, 0.02, -0.12), P(0.56, 0.86, -0.1), P(0, 0.95, 0.25), P(-0.56, 0.86, -0.1)];
      D.curve(x, d);
      x.fill();
    } else {
      x.fillStyle = U.rgb(hair);
      x.beginPath();
      const k = child ? 1.07 : 1.03;
      x.ellipse(c0[0], c0[1] - 0.015, hw * k, hh * k, 0, 0, Math.PI * 2);
      x.fill();
      const tp = P(0, -0.5, 0.12);
      const sg = x.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], 0.3);
      sg.addColorStop(0, U.rgb(U.mul(hair, 3.2), 0.5));
      sg.addColorStop(1, U.rgb(hair, 0));
      x.fillStyle = sg;
      x.beginPath();
      x.ellipse(c0[0], c0[1] - 0.015, hw * k, hh * k, 0, 0, Math.PI * 2);
      x.fill();
      // cropped hair texture
      const hr = U.rng(3);
      x.strokeStyle = U.rgb(U.mul(hair, 2.4), 0.35);
      x.lineWidth = 0.006;
      for (let i = 0; i < 70; i++) {
        const u = (hr() * 2 - 1) * 0.3, v = -0.52 + hr() * 0.2, zz = surfZ(u, v);
        const a = P(u, v, zz + 0.01), b = P(u + (hr() - 0.5) * 0.03, v + 0.03, zz + 0.01);
        if (a[2] < 0) continue;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
    }

    /* ears */
    if (kind !== 'mother') {
      for (const sd of [-1, 1]) {
        const e = F(sd * 0.352, 0.02, 0, -0.03);
        const n = P(sd, 0, -0.15);
        const vis = n[2];
        if (vis < -0.25) continue;
        x.fillStyle = U.rgb(U.mul(skin, 0.86));
        x.beginPath();
        x.ellipse(e[0], e[1], 0.05 * U.clamp(0.25 + vis, 0.22, 1), 0.085, 0, 0, Math.PI * 2);
        x.fill();
        x.strokeStyle = U.rgb(U.mul(skin, 0.55), 0.7);
        x.lineWidth = 0.009;
        x.beginPath();
        x.ellipse(e[0] + 0.006 * sd, e[1], 0.026 * U.clamp(0.25 + vis, 0.2, 1), 0.05, 0, -1.2, 1.9);
        x.stroke();
      }
    }

    /* face skin */
    const mask = hull(MASK.map(([px, py, pz]) => (pz == null ? F(px, py, 0.004) : P(px, py, pz))));
    x.fillStyle = U.rgb(skin);
    D.curve(x, mask);
    x.fill();
    // jaw/cheek lower half also blends into skull silhouette at the sides
    x.save();
    D.curve(x, mask);
    x.clip();

    /* stubble shadow */
    if (kind === 'man') {
      const bd = hull(BEARD.map(([px, py, pz]) => (pz == null ? F(px, py, 0.004) : P(px, py, pz))).filter((q) => q[2] > -0.02));
      x.fillStyle = U.rgb(hair, 0.22 * (o.beard ?? 1));
      x.filter = `blur(${Math.max(0.5, o.s * FILM.q * 0.02)}px)`;
      D.curve(x, bd);
      x.fill();
      x.filter = 'none';
      x.fillStyle = U.rgb(hair, 0.35 * (o.beard ?? 1));
      for (const [px, py] of STUBBLE) {
        const zz = py > 0.36 ? U.lerp(0.25, 0.37, (py - 0.36) / 0.12) : surfZ(px, py);
        const p = P(px, py, zz + 0.004);
        if (p[2] < 0) continue;
        x.fillRect(p[0], p[1], 0.006, 0.006);
      }
    }

    /* cheek + jaw modelling */
    for (const sd of [-1, 1]) {
      const ck = F(sd * 0.2, 0.08, 0.0);
      const g = x.createRadialGradient(ck[0], ck[1], 0.02, ck[0], ck[1], 0.2);
      g.addColorStop(0, child ? U.rgb([222, 140, 120], 0.3 + o.smile * 0.15) : U.rgb(U.mul(skin, 1.08), 0.35 + o.smile * 0.2));
      g.addColorStop(1, U.rgb(skin, 0));
      x.fillStyle = g;
      x.fillRect(ck[0] - 0.3, ck[1] - 0.3, 0.6, 0.6);
    }
    x.restore();

    /* nose */
    const nb = F(0, -0.07 + kidY, 0.0), nt = P(0, 0.155 + kidY * 0.6, RZ + (child ? 0.045 : 0.072)), nbs = P(0, 0.195 + kidY * 0.6, RZ + 0.02);
    const wl = F(-0.058, 0.18, 0.025), wr = F(0.058, 0.18, 0.025);
    x.fillStyle = U.rgb(skin);
    pathPts(o.yaw > 0 ? [nb, nt, nbs, wl] : [nb, nt, nbs, wr]);
    x.fill();
    const ls = o.light ? -Math.sign(o.light.dx || 0.001) : o.yaw >= 0 ? -1 : 1;
    x.strokeStyle = U.rgb(dark, 0.28);
    x.lineWidth = 0.026;
    x.lineCap = 'round';
    x.beginPath();
    const s1 = F(ls * 0.03, -0.04, 0.01), s2 = F(ls * 0.045, 0.15, 0.03);
    if (Math.abs(o.yaw) > 0.8) x.strokeStyle = U.rgb(dark, 0.1);
    x.moveTo(s1[0], s1[1]);
    x.lineTo(s2[0], s2[1]);
    x.stroke();
    // nostrils
    const nv = U.clamp(0.4 + o.pitch * 1.5 + 0.3 * Math.cos(o.yaw));
    for (const sd of [-1, 1]) {
      const p = F(sd * 0.032, 0.19, 0.035);
      if (p[2] < 0.1) continue;
      x.fillStyle = U.rgb(U.mul(skin, 0.35), 0.75 * nv);
      x.beginPath();
      x.ellipse(p[0], p[1], 0.018 * Math.abs(cyw) + 0.004, 0.009 + 0.006 * nv, 0, 0, Math.PI * 2);
      x.fill();
    }
    // wing creases
    x.strokeStyle = U.rgb(dark, 0.4);
    x.lineWidth = 0.008;
    for (const sd of [-1, 1]) {
      const a = F(sd * 0.06, 0.15, 0.02), b = F(sd * 0.065, 0.19, 0.02), c = F(sd * 0.04, 0.2, 0.03);
      if (a[2] < 0.05) continue;
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.quadraticCurveTo(b[0], b[1], c[0], c[1]);
      x.stroke();
    }
    // tip highlight
    x.fillStyle = U.rgb(U.mul(skin, 1.25), 0.25);
    x.beginPath();
    x.ellipse(nt[0], nt[1] - 0.01, 0.022, 0.018, 0, 0, Math.PI * 2);
    x.fill();

    /* eyes */
    const eyeScale = child ? 1.2 : kind === 'mother' ? 1.05 : 1;
    const eyesSeen = [];
    for (const sd of [-1, 1]) {
      const ex = sd * 0.125, ey = -0.045 + kidY, ez = surfZ(ex, ey) - 0.012;
      const c = P(ex, ey, ez);
      const n = facing(ex, ey, ez);
      if (n[2] < 0.08) continue;
      const fx = Math.sqrt(Math.max(0.02, 1 - n[0] * n[0])), fy = Math.sqrt(Math.max(0.05, 1 - n[1] * n[1]));
      const w = 0.072 * fx * eyeScale, h = 0.03 * fy * eyeScale;
      const vis = U.clamp(n[2] / 0.3);
      eyesSeen.push({ sd, c, w, h, vis, ex, ey });
      x.save();
      x.globalAlpha = vis;
      // socket
      const sg = x.createRadialGradient(c[0], c[1] - h * 0.3, 0, c[0], c[1] - h * 0.3, w * 1.9);
      sg.addColorStop(0, U.rgb(U.mul(skin, 0.55), (child ? 0.25 : 0.5) + o.tired * 0.25));
      sg.addColorStop(1, U.rgb(skin, 0));
      x.fillStyle = sg;
      x.fillRect(c[0] - w * 2, c[1] - w * 2, w * 4, w * 4);
      // under-eye bags
      if (o.tired > 0) {
        x.strokeStyle = U.rgb(U.mul(skin, 0.5), 0.35 * o.tired);
        x.lineWidth = 0.012;
        x.beginPath();
        x.ellipse(c[0], c[1] + h * 1.1, w * 0.85, h * 1.2, 0, 0.3, Math.PI - 0.3);
        x.stroke();
      }
      const almond = () => {
        x.beginPath();
        x.moveTo(c[0] - w, c[1]);
        x.quadraticCurveTo(c[0] - w * 0.1, c[1] - h * 1.7, c[0] + w, c[1] - h * 0.1);
        x.quadraticCurveTo(c[0] + w * 0.1, c[1] + h * 1.25, c[0] - w, c[1]);
        x.closePath();
      };
      x.save();
      almond();
      x.clip();
      x.fillStyle = U.rgb(o.sclera || [196, 184, 172]);
      x.fillRect(c[0] - w, c[1] - h * 2, w * 2, h * 4);
      const gx = c[0] + (o.gaze[0] * 0.5 + (o.yaw ? Math.sin(o.yaw) * 0.25 : 0)) * w;
      const gy = c[1] + o.gaze[1] * h * 0.6 - h * 0.1;
      const ir = h * 1.25;
      x.fillStyle = U.rgb(o.iris || [52, 32, 20]);
      x.beginPath(); x.ellipse(gx, gy, ir * fx, ir, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(8,5,4,0.95)';
      x.beginPath(); x.ellipse(gx, gy, ir * 0.48 * fx, ir * 0.48, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = `rgba(255,248,235,${0.75 * (o.wet ?? 1)})`;
      x.beginPath(); x.arc(gx - ir * 0.3, gy - ir * 0.35, ir * 0.18, 0, Math.PI * 2); x.fill();
      // upper-lid shadow on the eyeball
      x.fillStyle = `rgba(0,0,0,${child ? 0.15 : 0.3})`;
      x.fillRect(c[0] - w, c[1] - h * 2, w * 2, h * (child ? 0.9 : 1.2));
      x.restore();
      // eyelid
      const open = U.clamp(o.eye);
      const lidY = c[1] - h * 1.7 + (1 - open) * h * 3.0;
      x.fillStyle = U.rgb(U.mul(skin, 0.93));
      x.save();
      almond();
      x.clip();
      x.beginPath();
      x.moveTo(c[0] - w * 1.15, c[1] + 0.002);
      x.lineTo(c[0] - w * 1.15, c[1] - h * 3.2);
      x.lineTo(c[0] + w * 1.15, c[1] - h * 3.2);
      x.lineTo(c[0] + w * 1.15, c[1] - h * 0.1);
      x.quadraticCurveTo(c[0] - w * 0.1, lidY, c[0] - w * 1.15, c[1] + 0.002);
      x.closePath();
      x.fill();
      x.restore();
      // lash line
      x.strokeStyle = U.rgb([18, 12, 10], 0.9);
      x.lineWidth = 0.011 + 0.004 * (kind === 'mother');
      x.beginPath();
      x.moveTo(c[0] - w, c[1]);
      x.quadraticCurveTo(c[0] - w * 0.1, lidY, c[0] + w, c[1] - h * 0.1);
      x.stroke();
      // welling tears: a bright wet line along the lower lid
      if (o.glisten > 0) {
        x.strokeStyle = `rgba(235,245,255,${0.55 * o.glisten})`;
        x.lineWidth = 0.009;
        x.beginPath();
        x.moveTo(c[0] - w * 0.85, c[1] + h * 0.1);
        x.quadraticCurveTo(c[0] + w * 0.1, c[1] + h * 1.35, c[0] + w * 0.9, c[1]);
        x.stroke();
      }
      // crease
      x.strokeStyle = U.rgb(U.mul(skin, 0.5), 0.45);
      x.lineWidth = 0.007;
      x.beginPath();
      x.moveTo(c[0] - w * 0.9, c[1] - h * 1.0);
      x.quadraticCurveTo(c[0], c[1] - h * 2.9, c[0] + w * 1.0, c[1] - h * 1.1);
      x.stroke();
      if (kind === 'mother') {
        // smile lines at the outer corner
        x.strokeStyle = U.rgb(U.mul(skin, 0.6), 0.3 * (0.4 + o.smile));
        for (let i = 0; i < 2; i++) {
          x.beginPath();
          const ox = c[0] + sd * w * 1.15, oy = c[1] + (i - 0.3) * h * 0.9;
          x.moveTo(ox, oy);
          x.lineTo(ox + sd * w * 0.35, oy + (i - 0.5) * h * 0.8);
          x.stroke();
        }
      }
      x.restore();
    }

    /* brows */
    const bw = kind === 'mother' ? 0.016 : kind === 'girl' ? 0.013 : kind === 'boy' ? 0.018 : 0.03;
    for (const sd of [-1, 1]) {
      const pts = [[0.045, -0.118 - o.worry * 0.025 + kidY], [0.12, -0.148 - o.worry * 0.008 + kidY], [0.205, -0.132 + kidY]].map(([px, py]) => {
        const zz = surfZ(sd * px, py) + 0.012;
        return [P(sd * px, py, zz), facing(sd * px, py, zz)];
      });
      if (pts[1][1][2] < 0.08) continue;
      x.strokeStyle = U.rgb(hair, 0.92 * U.clamp(pts[1][1][2] / 0.3));
      x.lineWidth = bw;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(pts[0][0][0], pts[0][0][1]);
      x.quadraticCurveTo(pts[1][0][0], pts[1][0][1], pts[2][0][0], pts[2][0][1]);
      x.stroke();
    }

    /* mouth */
    const sm = o.smile;
    const lw = child ? 0.08 : 0.1;
    const cL = F(-lw - sm * 0.012, 0.292 - sm * 0.02, 0.0);
    const cR = F(lw + sm * 0.012, 0.292 - sm * 0.02, 0.0);
    const upC = F(0, 0.268, 0.028), midC = F(0, 0.294 + sm * 0.01 + o.open * 0.015, 0.03);
    const loC = F(0, 0.33 + o.open * 0.03, 0.02);
    const lip = o.lip || U.mix(skin, C.pal.lip, kind === 'mother' ? 0.55 : kind === 'girl' ? 0.6 : 0.4);
    x.fillStyle = U.rgb(U.mul(lip, 0.85));
    x.beginPath();
    x.moveTo(cL[0], cL[1]);
    x.quadraticCurveTo(upC[0], upC[1] - 0.012, cR[0], cR[1]);
    x.quadraticCurveTo(midC[0], midC[1], cL[0], cL[1]);
    x.fill();
    x.fillStyle = U.rgb(lip);
    x.beginPath();
    x.moveTo(cL[0], cL[1]);
    x.quadraticCurveTo(midC[0], midC[1], cR[0], cR[1]);
    x.quadraticCurveTo(loC[0], loC[1] + 0.012, cL[0], cL[1]);
    x.fill();
    x.strokeStyle = U.rgb(U.mul(skin, 0.3), 0.75);
    x.lineWidth = 0.009;
    x.beginPath();
    x.moveTo(cL[0], cL[1]);
    x.quadraticCurveTo(midC[0], midC[1] + 0.004, cR[0], cR[1]);
    x.stroke();
    // lower lip highlight
    x.fillStyle = U.rgb(U.mul(lip, 1.3), 0.25);
    x.beginPath();
    x.ellipse(loC[0], loC[1] - 0.012, 0.03, 0.008, 0, 0, Math.PI * 2);
    x.fill();
    // nasolabial folds
    x.strokeStyle = U.rgb(U.mul(skin, 0.55), child ? 0 : 0.18 + sm * 0.22 + (kind === 'mother' ? 0.1 : 0));
    x.lineWidth = 0.01;
    for (const sd of [-1, 1]) {
      const a = F(sd * 0.075, 0.175, 0.02), b = F(sd * 0.13, 0.24, 0.01), c = F(sd * (0.125 + sm * 0.02), 0.3 - sm * 0.01, 0.0);
      if (b[2] < 0.05) continue;
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.quadraticCurveTo(b[0], b[1], c[0], c[1]);
      x.stroke();
    }

    /* hairline / fringe / scarf front */
    if (kind === 'mother') {
      x.strokeStyle = U.rgb(U.mul(o.scarf || C.pal.scarf, 0.96));
      x.lineWidth = 0.075;
      x.lineJoin = 'round';
      const band = MASK_R.slice(0, 7).map(([px, py, pz]) => (pz == null ? F(px, py, 0.02) : P(px, py, pz + 0.02)));
      const left = MASK_R.slice(1, 7).map(([px, py, pz]) => (pz == null ? F(-px, py, 0.02) : P(-px, py, pz + 0.02)));
      const loop = left.reverse().concat(band);
      x.lineCap = 'round';
      for (let i = 0; i < loop.length - 1; i++) {
        const a = loop[i], b = loop[i + 1];
        if (a[2] < 0.02 || b[2] < 0.02) continue; // the far side of the band is behind her head
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      // fold under the chin
      const ch = [P(-0.33, 0.12, 0.1), P(-0.3, 0.36, 0.16), P(0, 0.53, 0.37), P(0.3, 0.36, 0.16), P(0.33, 0.12, 0.1), P(0.46, 0.7, 0.05), P(-0.46, 0.7, 0.05)];
      x.fillStyle = U.rgb(o.scarf || C.pal.scarf);
      x.beginPath();
      x.moveTo(ch[0][0], ch[0][1]);
      x.quadraticCurveTo(ch[1][0], ch[1][1] + 0.05, ch[2][0], ch[2][1] + 0.02);
      x.quadraticCurveTo(ch[3][0], ch[3][1] + 0.05, ch[4][0], ch[4][1]);
      x.lineTo(ch[5][0], ch[5][1]);
      x.lineTo(ch[6][0], ch[6][1]);
      x.closePath();
      x.fill();
      // fabric folds
      x.strokeStyle = U.rgb(U.mul(o.scarf || C.pal.scarf, 0.78), 0.5);
      x.lineWidth = 0.012;
      for (let i = 0; i < 4; i++) {
        const a = P(-0.25 + i * 0.16, 0.55, 0.2), b = P(-0.3 + i * 0.2, 0.8, 0.1);
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
    } else {
      const top = MASK_R.slice(0, 6);
      const line = top.slice(1).reverse().map(([px, py]) => F(-px, py, 0.01)).concat(top.map(([px, py]) => F(px, py, 0.01)));
      x.strokeStyle = U.rgb(hair, 0.55);
      x.lineWidth = 0.03;
      x.lineCap = 'round';
      for (let i = 0; i < line.length - 1; i++) {
        const a = line[i], b = line[i + 1];
        if (a[2] < 0.04 || b[2] < 0.04) continue;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      // fringe strands
      if (child) {
        // a soft, filled fringe with a scalloped edge
        const bottom = kind === 'girl' ? -0.2 : -0.27;
        const pts = [];
        for (let i = 0; i <= 12; i++) {
          const px = -0.31 + (i / 12) * 0.62;
          pts.push([px, -0.4 + Math.abs(px) * 0.25]);
        }
        for (let i = 12; i >= 0; i--) {
          const px = -0.31 + (i / 12) * 0.62;
          pts.push([px, bottom + (i % 2 ? 0.018 : 0) + Math.abs(px) * 0.15]);
        }
        const pp = pts.map(([px, py]) => F(px, py, 0.018));
        x.fillStyle = U.rgb(hair);
        D.curve(x, pp);
        x.fill();
        x.strokeStyle = U.rgb(U.mul(hair, 1.8), 0.35);
        x.lineWidth = 0.006;
        for (let i = 1; i < 12; i += 2) {
          const px = -0.31 + (i / 12) * 0.62;
          const a = F(px, -0.38, 0.02), b = F(px + 0.01, bottom + 0.01, 0.02);
          if (a[2] < 0.05 || b[2] < 0.05) continue;
          x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
        }
      }
      const r = U.rng(5);
      const nStr = 0;
      x.strokeStyle = U.rgb(hair, 0.75);
      x.lineWidth = child ? 0.028 : 0.02;
      for (let i = 0; i < nStr; i++) {
        const px = (r() * 2 - 1) * 0.27, len = (kind === 'girl' ? 0.16 : kind === 'boy' ? 0.1 : 0.045) * (0.6 + r() * 0.8);
        const a = F(px, -0.38, 0.02), b = F(px + (r() - 0.5) * 0.08, -0.36 + len, 0.02);
        if (a[2] < 0.05 || b[2] < 0.05) continue;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      if (kind === 'girl') {
        // locks falling past her cheeks
        x.strokeStyle = U.rgb(hair);
        x.lineWidth = 0.07;
        for (const sd of [-1, 1]) {
          const pts = [[0.3, -0.25], [0.36, 0.05], [0.37, 0.3], [0.36, 0.55]].map(([px, py]) => P(sd * px, py, Math.max(0.02, surfZ(sd * px * 0.95, py))));
          if (pts[1][2] < -0.05) continue;
          D.curve(x, pts, false);
          x.stroke();
        }
      }
    }

    /* lighting pass (only over what was drawn) */
    x.save();
    x.globalCompositeOperation = 'source-atop';
    const fc = P(0, 0.02, RZ);
    const rg = x.createRadialGradient(fc[0], fc[1], 0.1, fc[0], fc[1], 0.7);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, U.rgb(o.shade || [10, 8, 12], 0.55));
    x.fillStyle = rg;
    x.fillRect(-2, -2, 4, 4);
    if (o.light) {
      // light direction arrives in screen space; convert to head space
      const cr = Math.cos(-o.roll), sr = Math.sin(-o.roll);
      let lx = o.light.dx * cr - o.light.dy * sr, ly = o.light.dx * sr + o.light.dy * cr;
      const l = Math.hypot(lx, ly) || 1; lx /= l; ly /= l;
      const g = x.createLinearGradient(fc[0] - lx * 0.55, fc[1] - ly * 0.55, fc[0] + lx * 0.55, fc[1] + ly * 0.55);
      g.addColorStop(0, U.rgb(o.shade || [10, 8, 12], o.shadow));
      g.addColorStop(0.5, U.rgb(o.shade || [10, 8, 12], 0));
      g.addColorStop(1, U.rgb(o.shade || [10, 8, 12], 0));
      x.fillStyle = g;
      x.fillRect(-2, -2, 4, 4);
      const g2 = x.createLinearGradient(fc[0] - lx * 0.55, fc[1] - ly * 0.55, fc[0] + lx * 0.55, fc[1] + ly * 0.55);
      g2.addColorStop(0, U.rgb(o.light.col, 0));
      g2.addColorStop(0.45, U.rgb(o.light.col, 0));
      g2.addColorStop(1, U.rgb(o.light.col, o.light.amt));
      x.fillStyle = g2;
      x.fillRect(-2, -2, 4, 4);
    }
    if (o.wash) {
      x.fillStyle = U.rgb(o.wash.col, o.wash.a);
      x.fillRect(-2, -2, 4, 4);
    }
    x.restore();
    // a single tear running down the cheek of the eye nearest the camera
    if (o.tear > 0 && eyesSeen.length) {
      const e = eyesSeen.reduce((a, b) => (b.vis > a.vis ? b : a));
      const len = 0.3 * U.clamp(o.tear);
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const k = i / 8, py = e.ey + 0.045 + len * k, px = e.ex * (1.02 + 0.12 * k);
        pts.push(F(px, py, 0.012));
      }
      x.strokeStyle = 'rgba(225,238,250,0.45)';
      x.lineWidth = 0.007;
      x.lineCap = 'round';
      x.beginPath();
      pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
      x.stroke();
      const d = pts[pts.length - 1];
      x.fillStyle = 'rgba(235,245,255,0.8)';
      x.beginPath(); x.ellipse(d[0], d[1], 0.011, 0.016, 0, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.9)';
      x.beginPath(); x.arc(d[0] - 0.004, d[1] - 0.005, 0.004, 0, 7); x.fill();
    }
  }

  C.head = function (ctx, opts) {
    const o = Object.assign({
      x: 0, y: 0, s: 100, yaw: 0, pitch: 0, roll: 0, eye: 1, smile: 0, worry: 0, tired: 0, open: 0, gaze: [0, 0], glisten: 0, tear: 0,
      skin: C.pal.manSkin, hair: C.pal.hair, kind: 'man', light: null, shadow: 0.55, shirt: [62, 64, 70], bust: true, alpha: 1,
    }, opts);
    const b = FILM.buffer('__head', false);
    const x = b.x;
    // only touch the pixels around this head
    const m = ctx.getTransform();
    const cx = m.a * o.x + m.c * o.y + m.e, cy = m.b * o.x + m.d * o.y + m.f;
    const r = o.s * Math.hypot(m.a, m.b) * (o.bust ? 2.0 : 1.0) + 4;
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
    if (o.kind === 'boy' || o.kind === 'girl') x.scale(1.1, 0.88); // a child's rounder, shorter face
    drawHead(x, o);
    x.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= o.alpha;
    if (o.filter) ctx.filter = o.filter;
    ctx.drawImage(b.c, bx, by, bw, bh, bx, by, bw, bh);
    ctx.restore();
  };

  /* -------------------------------------------------------------- figure */
  const DEF_POSE = { torso: 0.02, neck: 0, head: 0, sL: 0.12, eL: 0.2, sR: -0.12, eR: 0.2, hL: 0.04, kL: 0.04, hR: -0.04, kR: 0.04, fL: 0, fR: 0, rot: 0, bob: 0 };

  C.poses = {
    stand: (t = 0) => ({ torso: 0.02 + Math.sin(t * 1.3) * 0.006, sL: 0.06, eL: 0.1, sR: -0.04, eR: 0.12, hL: 0.02, kL: 0.02, hR: -0.02, kR: 0.02 }),
    walk: (ph, k = 1) => {
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        torso: 0.06 * k,
        hL: 0.42 * s * k, kL: (0.08 + 0.7 * Math.pow(Math.max(0, c), 2)) * k,
        hR: -0.42 * s * k, kR: (0.08 + 0.7 * Math.pow(Math.max(0, -c), 2)) * k,
        sL: -0.38 * s * k, eL: 0.22 + 0.25 * Math.max(0, -s) * k,
        sR: 0.38 * s * k, eR: 0.22 + 0.25 * Math.max(0, s) * k,
        fL: 0.2 * Math.max(0, -s), fR: 0.2 * Math.max(0, s),
        bob: -0.012 * (Math.cos(2 * ph) + 1) / 2,
      };
    },
    sitHunched: (t = 0, breath = 1) => {
      const b = Math.sin(t * 1.4) * 0.025 * breath;
      return { torso: 0.52 + b, neck: 0.3, head: 0.1, sL: 0.35, eL: 2.05, sR: 0.3, eR: 2.1, hL: 1.5, kL: 1.45, hR: 1.45, kR: 1.4, fL: 0, fR: 0 };
    },
    sitUpright: (t = 0, breath = 1) => {
      const b = Math.sin(t * 2.2) * 0.03 * breath;
      return { torso: 0.12 + b, neck: 0.1, sL: 0.25, eL: 0.6, sR: 0.2, eR: 0.7, hL: 1.5, kL: 1.45, hR: 1.45, kR: 1.4 };
    },
    swim: (t, reach = 1) => {
      const s = Math.sin(t * 5), c = Math.cos(t * 5);
      return {
        torso: 0.05, neck: -0.3, head: -0.2,
        sL: Math.PI - 0.25 - 0.4 * s * reach, eL: 0.2 + 0.3 * Math.max(0, c),
        sR: Math.PI - 0.1 + 0.4 * s * reach, eR: 0.25 + 0.3 * Math.max(0, -c),
        hL: 0.25 * s, kL: 0.4 + 0.3 * Math.max(0, c), hR: -0.25 * s, kR: 0.4 + 0.3 * Math.max(0, -c),
        fL: -0.9, fR: -0.9,
      };
    },
    float: (t) => ({
      torso: 0.1 + Math.sin(t * 0.7) * 0.05, neck: 0.15, head: 0.1,
      sL: 0.9 + Math.sin(t * 0.8) * 0.15, eL: 0.6, sR: 0.6 + Math.sin(t * 0.6 + 1) * 0.2, eR: 0.8,
      hL: 0.5 + Math.sin(t * 0.5) * 0.1, kL: 0.9, hR: 0.2, kR: 0.6, fL: -0.6, fR: -0.6,
    }),
    lookUp: (t = 0) => ({ torso: -0.04, neck: -0.35, head: -0.3, sL: 0.05, eL: 0.15, sR: -0.05, eR: 0.15, hL: 0.02, kL: 0.02, hR: -0.02, kR: 0.02 }),
  };

  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  function drawSide(x, o, col) {
    const h = o.h, d = o.facing, p = Object.assign({}, DEF_POSE, o.pose);
    const up = (a, l) => [Math.sin(a) * d * l, -Math.cos(a) * l];
    const dn = (a, l) => [Math.sin(a) * d * l, Math.cos(a) * l];
    const hip = [0, p.bob * h];
    const sh = add(hip, up(p.torso, 0.29 * h));
    const nk = add(sh, up(p.torso + p.neck, 0.045 * h));
    const hd = add(nk, up(p.torso + p.neck + p.head, 0.062 * h));
    const kind = o.kind;
    const child = kind === 'boy' || kind === 'girl';
    const legLen = child ? 0.26 : 0.245;
    const leg = (hA, kA, fA) => {
      const knee = add(hip, dn(hA, legLen * h));
      const ank = add(knee, dn(hA - kA, legLen * h));
      const th = hA - kA + fA;
      const toe = add(ank, [Math.cos(th) * d * 0.075 * h, -Math.sin(th) * 0.075 * h]);
      return { knee, ank, toe };
    };
    const arm = (sA, eA) => {
      const el = add(sh, dn(sA, 0.165 * h));
      const wr = add(el, dn(sA + eA, 0.15 * h));
      const hn = add(wr, dn(sA + eA, 0.03 * h));
      return { el, wr, hn };
    };
    const line = (a, b, w, c) => {
      x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round';
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
    };
    const far = (c) => U.rgb(U.mul(c, 0.72));
    const Lg = leg(p.hL, p.kL, p.fL), Rg = leg(p.hR, p.kR, p.fR);
    const La = arm(p.sL, p.eL), Ra = arm(p.sR, p.eR);
    const shoe = o.shoe;
    const drawLeg = (g, farSide) => {
      const cc = farSide ? far : (c) => U.rgb(c);
      const pantsLow = child ? col.skin : col.pants;
      line(hip, g.knee, (kind === 'girl' ? 0.07 : 0.085) * h, cc(kind === 'girl' ? col.skin : col.pants));
      line(g.knee, g.ank, (kind === 'girl' ? 0.055 : 0.066) * h, cc(pantsLow));
      if (kind === 'boy') line(g.knee, add(g.knee, [(hip[0] - g.knee[0]) * 0.1, (hip[1] - g.knee[1]) * 0.1]), 0.085 * h, cc(col.pants));
      line(g.ank, g.toe, 0.038 * h, cc(shoe || col.skin));
    };
    const drawArm = (a, farSide) => {
      const cc = farSide ? far : (c) => U.rgb(c);
      if (o.sleeves === 'short') {
        line(sh, a.el, 0.05 * h, cc(col.skin));
        line(a.el, a.wr, 0.044 * h, cc(col.skin));
        line(sh, add(sh, [(a.el[0] - sh[0]) * 0.5, (a.el[1] - sh[1]) * 0.5]), 0.066 * h, cc(col.shirt));
      } else {
        line(sh, a.el, 0.058 * h, cc(col.shirt));
        line(a.el, a.wr, 0.05 * h, cc(col.shirt));
      }
      line(a.wr, a.hn, 0.042 * h, cc(col.skin));
    };
    // far limbs
    drawArm(Ra, true);
    if (kind !== 'mother') drawLeg(Rg, true);
    else line(Rg.ank, Rg.toe, 0.038 * h, far(shoe || col.skin));
    // body
    if (kind === 'mother') {
      const ankY = Math.max(Lg.ank[1], Rg.ank[1]) - 0.02 * h;
      const midX = (Lg.ank[0] + Rg.ank[0]) / 2;
      x.fillStyle = U.rgb(col.dress);
      D.curve(x, [
        add(sh, [-d * 0.055 * h, 0]), add(sh, [d * 0.06 * h, 0.01 * h]), add(hip, [d * 0.09 * h, 0]),
        [midX + d * 0.14 * h, ankY], [midX - d * 0.12 * h, ankY], add(hip, [-d * 0.08 * h, 0]),
      ]);
      x.fill();
      // tatreez panel on the chest + hem
      x.fillStyle = U.rgb(C.pal.tatreez, 0.95);
      const px = sh[0] + d * 0.012 * h, py = sh[1] + 0.03 * h;
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
        if ((i + j) % 2) continue;
        x.fillRect(px + (j - 2) * 0.012 * h, py + i * 0.016 * h, 0.009 * h, 0.009 * h);
      }
      for (let j = -5; j <= 5; j++) x.fillRect(midX + j * 0.024 * h, ankY - 0.03 * h, 0.012 * h, 0.012 * h);
      line(Lg.ank, Lg.toe, 0.038 * h, U.rgb(shoe || col.skin));
    } else if (kind === 'girl') {
      drawLeg(Lg, false);
      // a knee-length dress
      const kneeY = Math.max(Lg.knee[1], Rg.knee[1]) + 0.02 * h;
      const midX = (Lg.knee[0] + Rg.knee[0]) / 2;
      x.fillStyle = U.rgb(col.dress);
      D.curve(x, [add(sh, [-d * 0.05 * h, 0]), add(sh, [d * 0.055 * h, 0.01 * h]), add(hip, [d * 0.07 * h, -0.04 * h]),
        [midX + d * 0.12 * h, kneeY], [midX - d * 0.11 * h, kneeY], add(hip, [-d * 0.07 * h, -0.04 * h])]);
      x.fill();
      x.strokeStyle = U.rgb(U.mul(col.dress, 0.75), 0.7);
      x.lineWidth = 0.006 * h;
      for (const f of [-0.05, 0.02, 0.08]) {
        const a = add(hip, [d * f * h, 0.02 * h]);
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(midX + d * f * 1.6 * h, kneeY - 0.01 * h); x.stroke();
      }
    } else {
      x.strokeStyle = U.rgb(col.pants);
      x.lineWidth = 0.1 * h;
      x.beginPath(); x.moveTo(hip[0], hip[1] + 0.01 * h); x.lineTo(hip[0], hip[1] - 0.02 * h); x.stroke();
      drawLeg(Lg, false);
      // shaped torso: chest forward, waist in, back curve
      const tw = (child ? 0.13 : 0.12) * h;
      const ua = p.torso;
      const ax = [Math.sin(ua) * d, -Math.cos(ua)], nv = [Math.cos(ua) * d, Math.sin(ua)];
      const at = (k, off) => [hip[0] + ax[0] * 0.29 * h * k + nv[0] * off * tw, hip[1] + ax[1] * 0.29 * h * k + nv[1] * off * tw];
      x.fillStyle = U.rgb(col.shirt);
      D.curve(x, [at(-0.02, 0.48), at(0.35, 0.5), at(0.72, 0.62), at(1.02, 0.45), at(1.08, -0.1), at(1.0, -0.52), at(0.55, -0.55), at(0.1, -0.5)]);
      x.fill();
      x.beginPath(); x.arc(sh[0], sh[1] + 0.012 * h, 0.058 * h, 0, Math.PI * 2); x.fill();
      // folds and hem
      x.strokeStyle = U.rgb(U.mul(col.shirt, 0.7), 0.6);
      x.lineWidth = 0.005 * h;
      for (const [k0, k1, o0] of [[0.15, 0.45, 0.1], [0.4, 0.7, -0.15]]) {
        const a = at(k0, o0), b = at(k1, o0 + 0.2);
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
      const h0 = at(0.02, -0.5), h1 = at(0.0, 0.5);
      x.strokeStyle = U.rgb(U.mul(col.shirt, 0.6), 0.8);
      x.beginPath(); x.moveTo(h0[0], h0[1]); x.lineTo(h1[0], h1[1]); x.stroke();
    }
    // neck + head
    line(sh, nk, 0.045 * h, U.rgb(U.mul(col.skin, 0.85)));
    const hr = (child ? 0.075 : 0.064) * h;
    const ha = p.torso + p.neck + p.head;
    const fwd = [Math.cos(ha) * d, Math.sin(ha)]; // head forward (rotated with tilt)
    if (kind === 'mother') {
      x.fillStyle = U.rgb(col.scarf || C.pal.scarf);
      x.beginPath(); x.arc(hd[0] - fwd[0] * 0.012 * h, hd[1] - 0.004 * h, hr * 1.2, 0, Math.PI * 2); x.fill();
      D.poly(x, [add(hd, [-d * hr * 1.1, 0]), add(hd, [d * hr * 0.4, hr]), add(sh, [d * 0.03 * h, 0.03 * h]), add(sh, [-d * 0.07 * h, 0.05 * h])]);
      x.fill();
      x.fillStyle = U.rgb(col.skin);
      x.beginPath(); x.ellipse(hd[0] + fwd[0] * hr * 0.5, hd[1] + fwd[1] * hr * 0.5 + 0.1 * hr, hr * 0.55, hr * 0.72, ha * d * 0.5, 0, Math.PI * 2); x.fill();
    } else {
      x.fillStyle = U.rgb(col.skin);
      x.beginPath(); x.arc(hd[0], hd[1], hr, 0, Math.PI * 2); x.fill();
      // jaw
      x.beginPath(); x.ellipse(hd[0] + fwd[0] * hr * 0.35, hd[1] + hr * 0.45, hr * 0.62, hr * 0.62, 0, 0, Math.PI * 2); x.fill();
      // nose
      x.beginPath(); x.arc(hd[0] + fwd[0] * hr * 0.95 + fwd[1] * 0.1 * hr * d, hd[1] + fwd[1] * hr * 0.95 + hr * 0.12, hr * 0.2, 0, Math.PI * 2); x.fill();
      // hair: cap over the back and top
      x.fillStyle = U.rgb(col.hair);
      x.beginPath();
      x.arc(hd[0] - fwd[0] * hr * 0.12, hd[1] - hr * 0.08, hr * (child ? 1.06 : 1.02), Math.PI + (d > 0 ? -0.25 : 0.25) + ha * d * 0, Math.PI * 2 + 0.35, false);
      x.closePath();
      x.fill();
      x.beginPath();
      x.arc(hd[0] - fwd[0] * hr * 0.3, hd[1] - hr * 0.1, hr * 0.85, 0, Math.PI * 2);
      x.fill();
      // ear
      x.fillStyle = U.rgb(U.mul(col.skin, 0.8));
      x.beginPath(); x.ellipse(hd[0] - fwd[0] * hr * 0.05, hd[1] + hr * 0.15, hr * 0.16, hr * 0.26, 0, 0, Math.PI * 2); x.fill();
      if (o.beard && kind === 'man') {
        x.fillStyle = U.rgb(col.hair, 0.3);
        x.beginPath(); x.ellipse(hd[0] + fwd[0] * hr * 0.4, hd[1] + hr * 0.6, hr * 0.55, hr * 0.42, 0, 0, Math.PI * 2); x.fill();
      }
      if (kind === 'girl') {
        // hair falling down her back
        x.fillStyle = U.rgb(col.hair);
        D.curve(x, [add(hd, [-fwd[0] * hr * 0.2, -hr * 0.9]), add(hd, [-fwd[0] * hr * 1.05, -hr * 0.2]), add(hd, [-fwd[0] * hr * 1.15, hr * 1.2]),
          add(sh, [-d * 0.05 * h, 0.05 * h]), add(sh, [-d * 0.01 * h, 0.03 * h]), add(hd, [-fwd[0] * hr * 0.1, hr * 0.5])]);
        x.fill();
      }
      // eye and brow when the figure is big enough to read them
      if (h > 220) {
        const hu = [Math.sin(ha) * d, -Math.cos(ha)];
        const ey = [hd[0] + fwd[0] * hr * 0.62 + hu[0] * hr * 0.12, hd[1] + fwd[1] * hr * 0.62 + hu[1] * hr * 0.12];
        x.fillStyle = 'rgba(20,14,12,0.85)';
        x.beginPath(); x.ellipse(ey[0], ey[1], hr * 0.08, hr * 0.1, 0, 0, Math.PI * 2); x.fill();
        x.strokeStyle = U.rgb(col.hair, 0.9);
        x.lineWidth = hr * (child ? 0.07 : 0.1);
        x.beginPath();
        x.moveTo(ey[0] - fwd[0] * hr * 0.15 + hu[0] * hr * 0.22, ey[1] - fwd[1] * hr * 0.15 + hu[1] * hr * 0.22);
        x.lineTo(ey[0] + fwd[0] * hr * 0.18 + hu[0] * hr * 0.25, ey[1] + fwd[1] * hr * 0.18 + hu[1] * hr * 0.25);
        x.stroke();
      }
    }
    drawArm(La, false);
    return { hip, sh, hd, hr, hands: [La.hn, Ra.hn], feet: [Lg.toe, Rg.toe] };
  }

  function drawFront(x, o, col) {
    const h = o.h, p = o.pose || {}, back = o.view === 'back';
    const kind = o.kind;
    const child = kind === 'boy' || kind === 'girl';
    const shW = (child ? 0.095 : kind === 'mother' ? 0.09 : 0.105) * h;
    const hipW = (kind === 'mother' ? 0.085 : 0.07) * h;
    const legLen = 0.49 * h;
    const bob = (p.bob || 0) * h;
    const hip = [0, bob];
    const sh = [0, bob - 0.29 * h];
    const line = (a, b, w, c) => {
      x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round';
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
    };
    const legs = [[-1, p.liftL || 0], [1, p.liftR || 0]];
    // legs
    for (const [sd, lift] of legs) {
      const top = [sd * hipW * 0.55, hip[1]];
      const foot = [sd * hipW * 0.6, hip[1] + legLen * (1 - 0.1 * lift) - lift * 0.02 * h];
      const knee = [U.lerp(top[0], foot[0], 0.5), U.lerp(top[1], foot[1], 0.5)];
      if (kind === 'mother') continue;
      line(top, knee, 0.085 * h, U.rgb(kind === 'girl' ? col.skin : col.pants));
      line(knee, foot, 0.068 * h, U.rgb(child ? col.skin : col.pants));
      x.fillStyle = U.rgb(o.shoe || col.skin);
      x.beginPath(); x.ellipse(foot[0], foot[1] + 0.012 * h, 0.03 * h, 0.018 * h, 0, 0, Math.PI * 2); x.fill();
    }
    // torso
    if (kind === 'mother') {
      x.fillStyle = U.rgb(col.dress);
      D.curve(x, [[-shW, sh[1] + 0.01 * h], [shW, sh[1] + 0.01 * h], [hipW * 1.2, hip[1]], [hipW * 1.7, hip[1] + legLen * 0.96], [-hipW * 1.7, hip[1] + legLen * 0.96], [-hipW * 1.2, hip[1]]]);
      x.fill();
      if (!back) {
        x.fillStyle = U.rgb(C.pal.tatreez);
        for (let i = 0; i < 5; i++) for (let j = -2; j <= 2; j++) if ((i + j) % 2 === 0) x.fillRect(j * 0.013 * h, sh[1] + 0.04 * h + i * 0.015 * h, 0.009 * h, 0.009 * h);
      }
    } else if (kind === 'girl') {
      x.fillStyle = U.rgb(col.dress);
      D.curve(x, [[-shW * 0.9, sh[1]], [shW * 0.9, sh[1]], [hipW * 1.1, hip[1] - 0.03 * h], [hipW * 1.9, hip[1] + legLen * 0.48], [-hipW * 1.9, hip[1] + legLen * 0.48], [-hipW * 1.1, hip[1] - 0.03 * h]]);
      x.fill();
      if (o.backpack && back) {
        x.fillStyle = U.rgb(o.backpack);
        D.rrect(x, -shW * 0.75, sh[1] + 0.02 * h, shW * 1.5, 0.2 * h, 0.03 * h);
        x.fill();
      }
    } else {
      x.fillStyle = U.rgb(col.shirt);
      D.curve(x, [[-shW, sh[1]], [shW, sh[1]], [shW * 0.92, sh[1] + 0.1 * h], [hipW * 1.12, hip[1] + 0.02 * h], [-hipW * 1.12, hip[1] + 0.02 * h], [-shW * 0.92, sh[1] + 0.1 * h]]);
      x.fill();
      if (o.backpack && back) {
        x.fillStyle = U.rgb(o.backpack);
        D.rrect(x, -shW * 0.75, sh[1] + 0.02 * h, shW * 1.5, 0.2 * h, 0.03 * h);
        x.fill();
      }
    }
    // arms
    for (const sd of [-1, 1]) {
      const sw = sd < 0 ? p.swingL || 0 : p.swingR || 0;
      const s0 = [sd * shW * 0.92, sh[1] + 0.02 * h];
      const el = [s0[0] + sd * 0.02 * h, s0[1] + 0.16 * h * (1 - Math.abs(sw) * 0.15)];
      const wr = [el[0] + sd * 0.008 * h, el[1] + 0.145 * h * (1 - Math.abs(sw) * 0.25)];
      const upperC = kind === 'mother' || kind === 'girl' ? col.dress : col.shirt;
      if (o.sleeves === 'short' && kind !== 'mother') {
        line(s0, el, 0.048 * h, U.rgb(col.skin));
        line(s0, [U.lerp(s0[0], el[0], 0.5), U.lerp(s0[1], el[1], 0.5)], 0.064 * h, U.rgb(col.shirt));
        line(el, wr, 0.042 * h, U.rgb(col.skin));
      } else {
        line(s0, el, 0.056 * h, U.rgb(upperC));
        line(el, wr, 0.048 * h, U.rgb(upperC));
      }
      x.fillStyle = U.rgb(col.skin);
      x.beginPath(); x.arc(wr[0], wr[1] + 0.02 * h, 0.022 * h, 0, Math.PI * 2); x.fill();
    }
    // neck + head
    const hr = (child ? 0.075 : 0.064) * h;
    const hd = [p.headX ? p.headX * h : 0, sh[1] - 0.045 * h - hr * 0.95 + (p.headDrop || 0) * h];
    line(sh, [hd[0], hd[1] + hr * 0.6], 0.045 * h, U.rgb(U.mul(col.skin, 0.8)));
    if (kind === 'mother') {
      x.fillStyle = U.rgb(col.scarf || C.pal.scarf);
      x.beginPath(); x.arc(hd[0], hd[1], hr * 1.22, 0, Math.PI * 2); x.fill();
      D.poly(x, [[hd[0] - hr * 1.2, hd[1]], [hd[0] + hr * 1.2, hd[1]], [shW * 1.05, sh[1] + 0.06 * h], [-shW * 1.05, sh[1] + 0.06 * h]]);
      x.fill();
      if (!back) {
        x.fillStyle = U.rgb(col.skin);
        x.beginPath(); x.ellipse(hd[0], hd[1] + hr * 0.1, hr * 0.7, hr * 0.85, 0, 0, Math.PI * 2); x.fill();
      }
    } else {
      if (kind === 'girl') {
        // long hair down to her shoulders, behind the head
        x.fillStyle = U.rgb(col.hair);
        if (back) {
          D.curve(x, [[hd[0] - hr * 1.05, hd[1] - hr * 0.3], [hd[0] + hr * 1.05, hd[1] - hr * 0.3], [hd[0] + hr * 1.15, sh[1] + 0.06 * h], [hd[0] - hr * 1.15, sh[1] + 0.06 * h]]);
          x.fill();
        } else {
          for (const sd of [-1, 1]) {
            D.curve(x, [[hd[0] + sd * hr * 0.5, hd[1] - hr * 0.6], [hd[0] + sd * hr * 1.1, hd[1] - hr * 0.2], [hd[0] + sd * hr * 1.15, sh[1] + 0.06 * h], [hd[0] + sd * hr * 0.75, sh[1] + 0.05 * h], [hd[0] + sd * hr * 0.8, hd[1] + hr * 0.3]]);
            x.fill();
          }
        }
      }
      x.fillStyle = U.rgb(U.mul(col.skin, 0.85));
      for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(hd[0] + sd * hr * 0.98, hd[1] + hr * 0.12, hr * 0.14, hr * 0.24, 0, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = U.rgb(back ? col.hair : col.skin);
      x.beginPath(); x.ellipse(hd[0], hd[1], hr * 0.92, hr * 1.05, 0, 0, Math.PI * 2); x.fill();
      if (back) {
        x.fillStyle = U.rgb(U.mul(col.skin, 0.8));
        x.beginPath(); x.ellipse(hd[0], hd[1] + hr * 0.95, hr * 0.5, hr * 0.2, 0, 0, Math.PI * 2); x.fill();
      } else {
        x.fillStyle = U.rgb(col.hair);
        x.beginPath(); x.ellipse(hd[0], hd[1] - hr * 0.45, hr * 0.95, hr * 0.62, 0, Math.PI, Math.PI * 2); x.fill();
        x.fillRect(hd[0] - hr * 0.95, hd[1] - hr * 0.5, hr * 1.9, hr * 0.14);
        if (h > 160) {
          x.fillStyle = U.rgb(col.hair, 0.85);
          for (const sd of [-1, 1]) {
            x.fillRect(hd[0] + sd * hr * 0.36 - hr * 0.13, hd[1] - hr * 0.08, hr * 0.26, hr * 0.06);
            x.beginPath(); x.arc(hd[0] + sd * hr * 0.36, hd[1] + hr * 0.08, hr * 0.07, 0, Math.PI * 2); x.fill();
          }
          x.fillStyle = U.rgb(U.mul(col.skin, 0.55));
          x.fillRect(hd[0] - hr * 0.2, hd[1] + hr * 0.58 - (p.smile || 0) * hr * 0.04, hr * 0.4, hr * 0.05);
          if (kind === 'man') {
            x.fillStyle = U.rgb(col.hair, 0.28);
            x.beginPath(); x.ellipse(hd[0], hd[1] + hr * 0.62, hr * 0.7, hr * 0.42, 0, 0, Math.PI); x.fill();
          }
        }
      }
    }
    return { hip, sh, hd, hr };
  }

  /* a stylised hand. Local: palm at origin, fingers toward -y. curl 0 (open) .. 1 (fist, fingers foreshortened) */
  C.hand = function (ctx, o) {
    const { x, y, s = 100, rot = 0, curl = 0, spread = 0, thumb = -0.9, thumbLen = 1, flip = 1 } = o;
    const skin = o.skin || C.pal.manSkin;
    const dark = U.mul(skin, 0.72);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s * flip, s);
    ctx.lineCap = 'round';
    // sleeve
    if (o.sleeve) {
      ctx.fillStyle = U.rgb(o.sleeve);
      D.poly(ctx, [[-0.55, 0.45], [0.55, 0.45], [0.75, 4], [-0.75, 4]]);
      ctx.fill();
    }
    ctx.strokeStyle = U.rgb(skin);
    ctx.lineWidth = 0.62;
    ctx.beginPath(); ctx.moveTo(0, 0.2); ctx.lineTo(0, o.sleeve ? 0.5 : 1.4); ctx.stroke(); // wrist
    // thumb
    const ta = thumb, tl = 0.62 * thumbLen;
    ctx.lineWidth = 0.26;
    ctx.strokeStyle = U.rgb(U.mul(skin, 0.95));
    ctx.beginPath(); ctx.moveTo(-0.34, 0.2); ctx.lineTo(-0.34 + Math.sin(ta) * tl * 0.5, 0.2 - Math.cos(ta) * tl * 0.5);
    ctx.lineTo(-0.34 + Math.sin(ta) * tl, 0.2 - Math.cos(ta) * tl); ctx.stroke();
    // palm
    ctx.fillStyle = U.rgb(skin);
    D.rrect(ctx, -0.45, -0.5, 0.9, 1.0, 0.28);
    ctx.fill();
    // fingers
    const fx = [-0.33, -0.11, 0.11, 0.33], fl = [0.72, 0.84, 0.8, 0.64];
    for (let i = 0; i < 4; i++) {
      const L = fl[i] * (1 - 0.72 * curl);
      const a = (i - 1.5) * spread * 0.18;
      const x0 = fx[i], y0 = -0.42;
      const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
      ctx.strokeStyle = U.rgb(skin);
      ctx.lineWidth = 0.21;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      // knuckle / nail shading
      ctx.strokeStyle = U.rgb(dark, 0.35 + 0.4 * curl);
      ctx.lineWidth = 0.02;
      ctx.beginPath(); ctx.moveTo(x0 - 0.08, y0 - L * 0.45); ctx.lineTo(x0 + 0.08, y0 - L * 0.45); ctx.stroke();
      if (curl > 0.4) {
        ctx.fillStyle = U.rgb(dark, 0.5);
        ctx.beginPath(); ctx.arc(x1, y1, 0.08, 0, 7); ctx.fill();
      }
    }
    // shading along the edge
    ctx.fillStyle = U.rgb(dark, 0.3);
    D.rrect(ctx, 0.25, -0.5, 0.2, 1.0, 0.1);
    ctx.fill();
    ctx.restore();
  };

  /* o: {x, y (hip), h (standing height px), facing ±1, view 'side'|'front'|'back', kind 'man'|'mother'|'boy',
         pose, col {skin, shirt, pants, hair, dress, scarf}, shoe (colour or null = bare), sleeves 'long'|'short',
         rim {col, dx, dy} optional rim light, alpha, tint [colour, amount] } */
  C.figure = function (ctx, opts) {
    const o = Object.assign({ x: 0, y: 0, h: 400, facing: 1, view: 'side', kind: 'man', pose: {}, sleeves: 'long', alpha: 1 }, opts);
    const base = Object.assign({ skin: C.pal.manSkin, shirt: [60, 62, 70], pants: [36, 38, 46], hair: C.pal.hair, dress: C.pal.thobe, scarf: C.pal.scarf }, o.col);
    let col = base;
    if (o.tint) {
      const [tc, ta] = o.tint;
      col = {};
      for (const k in base) col[k] = U.mix(base[k], tc, ta);
    }
    const shoe = o.shoe && o.tint ? U.mix(o.shoe, o.tint[0], o.tint[1]) : o.shoe;
    const oo = Object.assign({}, o, { shoe });
    const draw = o.view === 'side' ? drawSide : drawFront;
    ctx.save();
    ctx.globalAlpha *= o.alpha;
    ctx.translate(o.x, o.y);
    ctx.rotate(o.pose.rot || 0);
    let res;
    if (o.rim) {
      const rc = {};
      for (const k in col) rc[k] = o.rim.col;
      ctx.save();
      ctx.globalAlpha *= o.rim.a ?? 0.7;
      ctx.translate(o.rim.dx, o.rim.dy);
      draw(ctx, Object.assign({}, oo, { shoe: shoe ? o.rim.col : null }), rc);
      ctx.restore();
    }
    res = draw(ctx, oo, col);
    ctx.restore();
    return res;
  };
})();
