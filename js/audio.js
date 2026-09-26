/* One Night — procedural environmental sound (Web Audio). No music, no voices.
 *
 * Each scene has an optional `audio(h, fx)` function. `h` is a per-scene handle:
 *   h.in           — input node (everything routed here passes the scene fade envelope)
 *   h.at(T, fn)    — schedule a one-shot at scene-local time T; fn(when) gets the AudioContext time
 *   h.param(p, k)  — automate an AudioParam with scene-local keyframes [[T, v], ...]
 *   h.verb(name,a) — send the scene to a shared reverb ('room' | 'hall' | 'dream' | 'street')
 * Scenes are started/stopped by the director so seeking always lands on the right sounds.
 */
(function () {
  'use strict';
  const FILM = window.FILM, U = FILM.U;
  const A = (FILM.A = { on: false });
  let ac, master, out, buffers = {}, verbs = {}, muted = false;

  /* ------------------------------------------------------------- building */
  function noiseBuffer(kind, sec = 6) {
    const n = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'white') d[i] = w * 0.5;
        else if (kind === 'pink') {
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
          b6 = w * 0.115926;
        } else {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        }
      }
      // crossfade the loop seam
      const f = 2048;
      for (let i = 0; i < f; i++) {
        const k = i / f;
        d[n - f + i] = d[n - f + i] * (1 - k) + d[i] * k;
      }
    }
    return b;
  }

  function impulse(sec, decay, dark) {
    const n = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        lp = lp + (w - lp) * (1 - dark);
        d[i] = lp * Math.pow(1 - i / n, decay);
      }
    }
    return b;
  }

  function makeVerb(sec, decay, dark, level) {
    const c = ac.createConvolver();
    c.buffer = impulse(sec, decay, dark);
    const g = ac.createGain();
    g.gain.value = level;
    c.connect(g).connect(master);
    return c;
  }

  A.init = () => {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();
    A.ac = ac;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5;
    comp.attack.value = 0.005; comp.release.value = 0.3;
    master = ac.createGain();
    master.gain.value = 1;
    out = ac.createGain();
    out.gain.value = 0.9;
    master.connect(comp).connect(out).connect(ac.destination);
    buffers.white = noiseBuffer('white');
    buffers.pink = noiseBuffer('pink');
    buffers.brown = noiseBuffer('brown');
    verbs.room = makeVerb(1.1, 3.2, 0.35, 0.7);
    verbs.hall = makeVerb(4.2, 2.1, 0.25, 0.8);
    verbs.dream = makeVerb(6.5, 1.6, 0.7, 0.9);
    verbs.street = makeVerb(2.2, 3.5, 0.3, 0.55);
    A.on = true;
  };

  A.verbIn = (name) => verbs[name];
  A.output = () => out;

  A.toggleMute = () => {
    muted = !muted;
    out.gain.setTargetAtTime(muted ? 0 : 0.9, ac.currentTime, 0.05);
  };

  /* --------------------------------------------------------------- handle */
  class Handle {
    constructor(scene, off, t0) {
      this.scene = scene;
      this.off = off;               // scene-local time at which we joined
      this.base = t0 + scene.start; // ac time of scene-local 0
      this.ac = ac;
      this.env = ac.createGain();
      this.env.gain.value = 0;
      this.env.connect(master);
      this.in = ac.createGain();
      this.in.connect(this.env);
      this.nodes = [];
      this.events = [];
      this.ei = 0;
      this.sends = [];
      this.dead = false;
    }
    T(t) { return this.base + t; }
    now() { return ac.currentTime - this.base; }
    at(T, fn) { this.events.push({ T, fn }); }
    track(n) { this.nodes.push(n); return n; }
    verb(name, amt) {
      const g = ac.createGain();
      g.gain.value = amt;
      this.env.connect(g).connect(verbs[name]);
      this.sends.push(g);
      return g;
    }
    // keyframed automation starting from wherever we joined
    param(p, k, exp = false) {
      const v0 = U.keys(k, this.off, (x) => x);
      const t0 = Math.max(ac.currentTime, this.T(this.off));
      p.cancelScheduledValues(0);
      p.setValueAtTime(v0, t0);
      for (const [T, v] of k) {
        if (T <= this.off) continue;
        if (exp && v > 0) p.exponentialRampToValueAtTime(v, this.T(T));
        else p.linearRampToValueAtTime(v, this.T(T));
      }
    }
    // generic node helpers
    gain(v = 1) { const g = ac.createGain(); g.gain.value = v; return g; }
    filter(type, f, Q = 0.7) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = Q; return b; }
    pan(p = 0) { const s = ac.createStereoPanner(); s.pan.value = p; return s; }
    noise(color = 'pink', rate = 1) {
      const s = ac.createBufferSource();
      s.buffer = buffers[color];
      s.loop = true;
      s.playbackRate.value = rate;
      s.start(ac.currentTime, Math.random() * 5);
      return this.track(s);
    }
    osc(type, f) {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.start(ac.currentTime);
      return this.track(o);
    }
    chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }
    pump() {
      if (!this.sorted) { this.events.sort((a, b) => a.T - b.T); this.sorted = true; }
      const horizon = this.now() + 0.8;
      while (this.ei < this.events.length && this.events[this.ei].T <= horizon) {
        const e = this.events[this.ei++];
        if (e.T < this.off - 0.02) continue;
        try { e.fn(Math.max(this.T(e.T), ac.currentTime + 0.005)); } catch (err) { console.error(err); }
      }
      // forget finished one-shots now and then
      if (this.nodes.length > 400) this.nodes = this.nodes.filter((n) => !n._done);
    }
    stop() {
      if (this.dead) return;
      this.dead = true;
      const now = ac.currentTime;
      this.env.gain.cancelScheduledValues(0);
      this.env.gain.setValueAtTime(this.env.gain.value, now);
      this.env.gain.linearRampToValueAtTime(0, now + 0.12);
      for (const n of this.nodes) { try { n.stop(now + 0.15); } catch (e) { /* already stopped */ } }
      setTimeout(() => { try { this.env.disconnect(); } catch (e) { /* ok */ } }, 400);
    }
  }

  /* ------------------------------------------------------------- director */
  let t0 = 0;
  const active = new Map();
  A.time = () => ac.currentTime - t0;
  A.seek = (t) => {
    for (const h of active.values()) h.stop();
    active.clear();
    t0 = ac.currentTime - t;
  };
  A.play = (t) => {
    ac.resume();
    A.seek(t);
  };
  A.pause = () => { ac.suspend(); };
  A.update = (t) => {
    for (const s of FILM.list) {
      if (!s.audio) continue;
      const tail = s.audioTail ?? 2.5;
      const want = t >= s.start - 0.05 && t < s.start + s.dur + tail;
      let h = active.get(s);
      if (want && !h) {
        h = new Handle(s, Math.max(0, t - s.start), t0);
        const fin = s.audioIn ?? 0.8;
        h.param(h.env.gain, [[0, 0], [fin, 1], [s.dur, 1], [s.dur + tail, 0]]);
        try { s.audio(h, FX); } catch (e) { console.error('audio', s.name, e); }
        active.set(s, h);
      } else if (!want && h) {
        h.stop();
        active.delete(s);
        h = null;
      }
      if (h) h.pump();
    }
  };

  /* ----------------------------------------------------------- sound kit */
  const FX = (A.fx = {});
  const done = (n) => { n.onended = () => { n._done = true; }; return n; };

  function envGain(g, when, a, peak, d) {
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(peak, when + a);
    g.gain.exponentialRampToValueAtTime(0.0001, when + a + d);
  }

  // filtered noise hit
  FX.burst = (h, when, o = {}) => {
    const { color = 'white', type = 'bandpass', f = 1000, Q = 1, a = 0.002, d = 0.1, gain = 0.5, pan = 0, rate = 1, dest = h.in, f2 } = o;
    const s = ac.createBufferSource();
    s.buffer = buffers[color];
    s.playbackRate.value = rate;
    const fl = h.filter(type, f, Q);
    if (f2) { fl.frequency.setValueAtTime(f, when); fl.frequency.exponentialRampToValueAtTime(f2, when + a + d); }
    const g = ac.createGain();
    envGain(g, when, a, gain, d);
    const p = h.pan(pan);
    s.connect(fl).connect(g).connect(p).connect(dest);
    s.start(when, Math.random() * 4);
    s.stop(when + a + d + 0.05);
    h.track(done(s));
    return { s, fl, g };
  };

  // enveloped oscillator with optional glide
  FX.tone = (h, when, o = {}) => {
    const { type = 'sine', f = 440, f2, a = 0.005, d = 0.2, gain = 0.3, pan = 0, dest = h.in, lp } = o;
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, when);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, when + a + d);
    const g = ac.createGain();
    envGain(g, when, a, gain, d);
    let n = osc;
    if (lp) { const fl = h.filter('lowpass', lp); n.connect(fl); n = fl; }
    n.connect(g).connect(h.pan(pan)).connect(dest);
    osc.start(when);
    osc.stop(when + a + d + 0.05);
    h.track(done(osc));
    return { osc, g };
  };

  // continuous filtered noise bed
  FX.bed = (h, o = {}) => {
    const { color = 'pink', type = 'lowpass', f = 800, Q = 0.7, gain = 0.2, pan = 0, rate = 1, dest = h.in } = o;
    const s = h.noise(color, rate);
    const fl = h.filter(type, f, Q);
    const g = h.gain(gain);
    const p = h.pan(pan);
    h.chain(s, fl, g, p, dest);
    return { s, f: fl, g, p };
  };

  // mains hum (fridge, fluorescent tubes)
  FX.hum = (h, o = {}) => {
    const { f = 50, gain = 0.03, harm = [1, 0.5, 0.25, 0.12], lp = 400, dest = h.in, pan = 0 } = o;
    const g = h.gain(gain);
    const fl = h.filter('lowpass', lp);
    harm.forEach((k, i) => {
      if (!k) return;
      const osc = h.osc(i % 2 ? 'triangle' : 'sine', f * (i + 1));
      const hg = h.gain(k);
      osc.connect(hg).connect(fl);
    });
    fl.connect(g).connect(h.pan(pan)).connect(dest);
    return g;
  };

  // gusting wind across a span of scene time
  FX.wind = (h, o = {}) => {
    const { from = 0, to = 30, gain = 0.12, f = 500, Q = 0.8, seed = 1, dest = h.in, pan = 0, gust = 0.7 } = o;
    const b = FX.bed(h, { color: 'pink', type: 'bandpass', f, Q, gain: 0, dest, pan });
    const kg = [], kf = [];
    for (let T = from; T <= to + 0.01; T += 0.7) {
      const n = U.clamp(0.5 + U.fbm(T * 0.18, seed) * gust);
      kg.push([T, gain * (0.25 + 0.75 * n)]);
      kf.push([T, f * (0.7 + 0.6 * n)]);
    }
    h.param(b.g.gain, kg);
    h.param(b.f.frequency, kf);
    return b;
  };

  FX.footstep = (h, when, o = {}) => {
    const { bare = false, gain = 0.4, pan = 0, dest = h.in, hard = 1 } = o;
    FX.burst(h, when, { color: 'brown', type: 'lowpass', f: bare ? 380 : 260, Q: 0.8, d: 0.09, gain: gain * 1.4, pan, dest });
    if (bare) FX.burst(h, when + 0.035, { color: 'white', type: 'bandpass', f: 1600, Q: 1.3, d: 0.05, gain: gain * 0.35, pan, dest });
    else FX.burst(h, when + 0.012, { color: 'white', type: 'highpass', f: 2600, Q: 0.7, d: 0.028, gain: gain * 0.45 * hard, pan, dest });
  };

  FX.tick = (h, when, o = {}) => {
    const { gain = 0.08, pan = 0, pitch = 1, dest = h.in } = o;
    FX.burst(h, when, { type: 'highpass', f: 3500 * pitch, d: 0.012, gain, pan, dest });
    FX.tone(h, when, { f: 2300 * pitch, d: 0.018, gain: gain * 0.4, pan, dest });
  };

  FX.bubble = (h, when, o = {}) => {
    const { size = 1, gain = 0.12, pan = 0, dest = h.in } = o;
    const f = 520 / size;
    FX.tone(h, when, { f, f2: f * (2 + Math.random()), d: 0.05 * size + 0.02, gain, pan, dest });
  };

  FX.heartbeat = (h, when, o = {}) => {
    const { gain = 0.4, dest = h.in } = o;
    FX.tone(h, when, { f: 62, f2: 38, a: 0.01, d: 0.16, gain, dest });
    FX.tone(h, when + 0.26, { f: 55, f2: 36, a: 0.01, d: 0.2, gain: gain * 0.7, dest });
  };

  FX.breath = (h, when, o = {}) => {
    const { dur = 1.6, inhale = true, gain = 0.12, f = 1100, Q = 0.9, pan = 0, dest = h.in, rough = 0 } = o;
    const s = ac.createBufferSource();
    s.buffer = buffers.pink;
    const fl = h.filter('bandpass', f, Q);
    fl.frequency.setValueAtTime(inhale ? f * 0.8 : f * 1.1, when);
    fl.frequency.linearRampToValueAtTime(inhale ? f * 1.25 : f * 0.7, when + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + dur * (inhale ? 0.6 : 0.25));
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    let n = s.connect(fl);
    if (rough) {
      const ws = ac.createWaveShaper();
      const c = new Float32Array(256);
      for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * (1 + rough * 12)); }
      ws.curve = c;
      n = n.connect(ws);
    }
    n.connect(g).connect(h.pan(pan)).connect(dest);
    s.start(when, Math.random() * 4);
    s.stop(when + dur + 0.05);
    h.track(done(s));
  };

  FX.whoosh = (h, when, o = {}) => {
    const { dur = 1.2, f1 = 200, f2 = 1400, gain = 0.25, Q = 1.2, pan = 0, dest = h.in, color = 'pink' } = o;
    const s = ac.createBufferSource();
    s.buffer = buffers[color];
    const fl = h.filter('bandpass', f1, Q);
    fl.frequency.setValueAtTime(f1, when);
    fl.frequency.exponentialRampToValueAtTime(f2, when + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    s.connect(fl).connect(g).connect(h.pan(pan)).connect(dest);
    s.start(when, Math.random() * 4);
    s.stop(when + dur + 0.05);
    h.track(done(s));
  };

  FX.thud = (h, when, o = {}) => {
    const { gain = 0.5, f = 70, dest = h.in, d = 0.35 } = o;
    FX.tone(h, when, { f, f2: f * 0.5, a: 0.004, d, gain, dest });
    FX.burst(h, when, { color: 'brown', type: 'lowpass', f: 300, d: d * 0.5, gain: gain * 0.8, dest });
  };

  // inharmonic partials: porcelain / glass / metal
  FX.ring = (h, when, o = {}) => {
    const { f = 2600, partials = [1, 2.32, 3.87, 5.4], decay = [0.5, 0.35, 0.22, 0.14], gain = 0.12, pan = 0, dest = h.in } = o;
    partials.forEach((k, i) => {
      FX.tone(h, when, { f: f * k * (1 + (Math.random() - 0.5) * 0.004), a: 0.001, d: decay[i] || 0.1, gain: gain / (i + 1), pan, dest });
    });
    FX.burst(h, when, { type: 'highpass', f: 5000, d: 0.01, gain: gain * 0.6, pan, dest });
  };
  FX.porcelain = (h, when, o = {}) => FX.ring(h, when, Object.assign({ f: 2400 * (o.pitch || 1) }, o));
  FX.glass = (h, when, o = {}) => FX.ring(h, when, Object.assign({ f: 3100, partials: [1, 1.52, 2.26, 3.1], decay: [0.9, 0.6, 0.4, 0.25] }, o));
  FX.spoon = (h, when, o = {}) => {
    FX.ring(h, when, Object.assign({ f: 3400, partials: [1, 2.7, 4.1], decay: [0.25, 0.15, 0.08], gain: 0.07 }, o));
  };

  FX.drip = (h, when, o = {}) => {
    const { rev = false, gain = 0.1, pan = 0, f = 700, dest = h.in } = o;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    if (!rev) {
      osc.frequency.setValueAtTime(f, when);
      osc.frequency.exponentialRampToValueAtTime(f * 2.4, when + 0.07);
      envGain(g, when, 0.002, gain, 0.08);
    } else {
      osc.frequency.setValueAtTime(f * 2.4, when);
      osc.frequency.exponentialRampToValueAtTime(f, when + 0.5);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(gain, when + 0.5);
      g.gain.setValueAtTime(0.0001, when + 0.51);
    }
    osc.connect(g).connect(h.pan(pan)).connect(dest);
    osc.start(when);
    osc.stop(when + 0.6);
    h.track(done(osc));
  };

  FX.bird = (h, when, o = {}) => {
    const { gain = 0.05, pan = 0, n = 3 + Math.floor(Math.random() * 4), base = 2800 + Math.random() * 1800, dest = h.in } = o;
    let t = when;
    for (let i = 0; i < n; i++) {
      const f = base * (0.85 + Math.random() * 0.35);
      const d = 0.04 + Math.random() * 0.07;
      FX.tone(h, t, { f, f2: f * (0.65 + Math.random() * 0.8), a: 0.006, d, gain: gain * (0.6 + Math.random() * 0.4), pan, dest });
      t += d + 0.03 + Math.random() * 0.09;
    }
  };

  FX.carPass = (h, when, o = {}) => {
    const { dur = 6, gain = 0.2, p1 = -0.8, p2 = 0.8, dest = h.in, far = 0 } = o;
    const s = ac.createBufferSource();
    s.buffer = buffers.brown;
    const fl = h.filter('lowpass', 250, 0.7);
    const lp = far ? 500 : 1100;
    fl.frequency.setValueAtTime(220, when);
    fl.frequency.linearRampToValueAtTime(lp, when + dur * 0.5);
    fl.frequency.linearRampToValueAtTime(240, when + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + dur * 0.5);
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    const p = h.pan(p1);
    p.pan.setValueAtTime(p1, when);
    p.pan.linearRampToValueAtTime(p2, when + dur);
    s.connect(fl).connect(g).connect(p).connect(dest);
    // tyre hiss
    const s2 = ac.createBufferSource();
    s2.buffer = buffers.pink;
    const f2 = h.filter('bandpass', 900, 0.6);
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0.0001, when);
    g2.gain.linearRampToValueAtTime(gain * (far ? 0.15 : 0.35), when + dur * 0.5);
    g2.gain.linearRampToValueAtTime(0.0001, when + dur);
    s2.connect(f2).connect(g2).connect(p);
    s.start(when, Math.random() * 4); s.stop(when + dur + 0.1);
    s2.start(when, Math.random() * 4); s2.stop(when + dur + 0.1);
    h.track(done(s)); h.track(done(s2));
  };

  // metal roller shutter
  FX.shutter = (h, when, o = {}) => {
    const { dur = 2.4, gain = 0.12, pan = 0, dest = h.in } = o;
    const s = ac.createBufferSource();
    s.buffer = buffers.white;
    const fl = h.filter('bandpass', 1500, 2.5);
    const am = ac.createGain();
    am.gain.value = 0.5;
    const lfo = ac.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(22, when);
    lfo.frequency.linearRampToValueAtTime(15, when + dur);
    const lg = ac.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(am.gain);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.15);
    g.gain.setValueAtTime(gain, when + dur - 0.2);
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    s.connect(fl).connect(am).connect(g).connect(h.pan(pan)).connect(dest);
    s.start(when); s.stop(when + dur + 0.05);
    lfo.start(when); lfo.stop(when + dur + 0.05);
    h.track(done(s)); h.track(done(lfo));
    FX.thud(h, when + dur, { gain: gain * 1.5, f: 110, d: 0.2, dest });
    FX.ring(h, when + dur, { f: 900, partials: [1, 1.9, 3.3], decay: [0.3, 0.2, 0.1], gain: gain * 0.4, pan, dest });
  };

  FX.doorClose = (h, when, o = {}) => {
    const { gain = 0.35, soft = true, dest = h.in } = o;
    FX.thud(h, when, { gain: gain * (soft ? 0.6 : 1), f: 85, d: 0.3, dest });
    FX.burst(h, when + 0.04, { type: 'highpass', f: 2500, d: 0.02, gain: gain * 0.5, dest });
    FX.burst(h, when + 0.09, { type: 'bandpass', f: 3500, Q: 3, d: 0.03, gain: gain * 0.35, dest });
  };

  FX.click = (h, when, o = {}) => {
    const { gain = 0.1, f = 3000, pan = 0, dest = h.in } = o;
    FX.burst(h, when, { type: 'bandpass', f, Q: 2, d: 0.012, gain, pan, dest });
  };

  FX.swallow = (h, when, o = {}) => {
    const { gain = 0.2, dest = h.in } = o;
    FX.tone(h, when, { f: 170, f2: 80, a: 0.02, d: 0.18, gain, dest, lp: 400 });
    FX.burst(h, when + 0.05, { color: 'pink', type: 'lowpass', f: 600, d: 0.08, gain: gain * 0.5, dest });
  };

  // an irregular stream of one-shots between two scene-local times
  FX.scatter = (h, from, to, rate, seed, fn) => {
    const r = U.rng(seed);
    let T = from + r() / rate;
    while (T < to) {
      const k = r();
      h.at(T, (w) => fn(w, k, r));
      T += (0.3 + r() * 1.4) / rate;
    }
  };
})();
