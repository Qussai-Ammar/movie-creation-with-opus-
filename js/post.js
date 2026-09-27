/* Haneen — the painter's pass. Every finished frame goes through a WebGL2 shader that makes it read as a painted,
 * hand-drawn animation frame: Kuwahara brush smoothing, a light ink line on edges, bloom on the light, a warm grade,
 * paper texture and film grain. Falls back to the plain canvas if WebGL2 is unavailable. Disable with ?fx=0.
 */
(function () {
  'use strict';
  const FILM = window.FILM;
  const P = (FILM.post = { on: false });

  const VS = `#version 300 es
  in vec2 p; out vec2 uv;
  void main() { uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }`;

  const FS = `#version 300 es
  precision highp float;
  in vec2 uv; out vec4 o;
  uniform sampler2D tex; uniform vec2 res; uniform float time; uniform float grain; uniform int R;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  vec3 px(vec2 d) { return texture(tex, uv + d / res).rgb; }
  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    // Kuwahara: in each of four quadrants take the mean colour; keep the calmest one — flat, brushed areas
    vec3 m[4]; vec3 s[4];
    for (int k = 0; k < 4; k++) { m[k] = vec3(0); s[k] = vec3(0); }
    float n = float((R + 1) * (R + 1));
    for (int j = 0; j <= R; j++) for (int i = 0; i <= R; i++) {
      vec3 a = px(vec2(-i, -j)); m[0] += a; s[0] += a * a;
      vec3 b = px(vec2( i, -j)); m[1] += b; s[1] += b * b;
      vec3 c = px(vec2(-i,  j)); m[2] += c; s[2] += c * c;
      vec3 d = px(vec2( i,  j)); m[3] += d; s[3] += d * d;
    }
    vec3 col = vec3(0); float best = 1e9;
    for (int k = 0; k < 4; k++) {
      vec3 mu = m[k] / n; vec3 v = abs(s[k] / n - mu * mu);
      float sv = v.r + v.g + v.b;
      if (sv < best) { best = sv; col = mu; }
    }
    // keep fine drawn detail (ink lines, eyes) from being smeared away
    vec3 orig = px(vec2(0));
    // only a light touch: flatten gradients into strokes without eating the drawing
    col = mix(orig, col, 0.5 * (1.0 - smoothstep(0.35, 0.12, lum(orig))));

    // a light ink line on edges in the scene
    float tl = lum(px(vec2(-1, -1))), tc = lum(px(vec2(0, -1))), tr = lum(px(vec2(1, -1)));
    float ml = lum(px(vec2(-1, 0))), mr = lum(px(vec2(1, 0)));
    float bl = lum(px(vec2(-1, 1))), bc = lum(px(vec2(0, 1))), br = lum(px(vec2(1, 1)));
    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
    float edge = smoothstep(0.08, 0.3, length(vec2(gx, gy))) * smoothstep(0.2, 0.45, lum(orig));
    col = mix(col, col * vec3(0.86, 0.8, 0.8), edge * 0.5);

    // bloom on bright light
    vec3 bloom = vec3(0);
    for (int k = 0; k < 8; k++) {
      float a = float(k) * 0.785398;
      bloom += max(px(vec2(cos(a), sin(a)) * 9.0) - 0.75, 0.0) + max(px(vec2(cos(a + 0.4), sin(a + 0.4)) * 18.0) - 0.75, 0.0);
    }
    col += bloom * 0.05;

    // grade: a little more colour, warm highlights, soft violet shadows
    float L = lum(col);
    col = mix(vec3(L), col, 1.1);
    col += vec3(0.035, 0.018, -0.01) * smoothstep(0.45, 1.0, L);
    col += vec3(0.01, 0.0, 0.03) * (1.0 - smoothstep(0.0, 0.35, L));

    // paper: soft blotches and fibres
    vec2 q = uv * res;
    float paper = vnoise(q * 0.012) * 0.6 + vnoise(q * 0.05) * 0.3 + vnoise(q * vec2(0.4, 0.04)) * 0.1;
    col *= 0.955 + paper * 0.07;

    // film grain
    float g = hash(q + fract(time * 24.0) * 97.0) - 0.5;
    col += g * grain * 0.55;

    o = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

  P.init = (src) => {
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return false;
    const sh = (type, code) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, code);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      console.warn('painter pass unavailable:', e.message);
      return false;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {
      res: gl.getUniformLocation(prog, 'res'), time: gl.getUniformLocation(prog, 'time'),
      grain: gl.getUniformLocation(prog, 'grain'), R: gl.getUniformLocation(prog, 'R'),
    };
    // brush radius scales with the resolution
    const radius = Math.max(1, Math.round(2 * src.width / 1440));
    // swap the visible canvas for the painted one
    out.id = 'film-painted';
    src.style.display = 'none';
    src.parentNode.insertBefore(out, src);
    // on a machine too slow for the pass, give the frame rate back: drop to the plain canvas
    const still = new URLSearchParams(location.search).has('still');
    const gaps = [];
    let last = 0;
    const watch = () => {
      const now = performance.now();
      if (last && now - last < 1000) gaps.push(now - last);
      last = now;
      if (gaps.length < 90) return;
      const med = gaps.sort((a, b) => a - b)[45];
      gaps.length = 0;
      if (med > 55) {
        console.warn('painter pass off: frame time', med.toFixed(0), 'ms');
        P.on = false;
        out.style.display = 'none';
        src.style.display = '';
        FILM.outCanvas = src;
      }
    };
    P.apply = (t, grainAmt) => {
      if (!still) watch();
      gl.viewport(0, 0, out.width, out.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.uniform2f(U.res, out.width, out.height);
      gl.uniform1f(U.time, t);
      gl.uniform1f(U.grain, grainAmt || 0);
      gl.uniform1i(U.R, radius);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    P.on = true;
    FILM.outCanvas = out;
    return true;
  };
})();
