/* One Night — the score. Synthesized live with Web Audio: oud (Karplus-Strong plucked string), ney (breathy flute),
 * string pad, piano and cello. One theme in Maqam Nahawand on D carries the mother and the balloon; it returns in
 * Ajam (D major) when he smiles for the first time.
 *
 * Each scene gets a cue. Cues are attached to the scenes' existing audio so the director starts, stops and seeks
 * them in sync with the picture.
 */
(function () {
  'use strict';
  const FILM = window.FILM, U = FILM.U, A = FILM.A;
  const M = (FILM.music = {});

  /* ------------------------------------------------------------- pitches */
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const N = (name) => {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    const midi = 12 * (+m[3] + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  M.N = N;

  // the theme (Nahawand on D) — the mother, the kitchen, the balloon
  const THEME_A = [['A4', 2], ['F4', 1], ['E4', 1], ['D4', 2], [null, 1], ['E4', 1], ['F4', 1], ['G4', 1], ['A4', 2], ['Bb4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 3], [null, 1]];
  const THEME_B = [['D4', 1], ['F4', 1], ['A4', 1], ['D5', 2], ['C#5', 1], ['A4', 2], ['Bb4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 4]];
  // the same melody in Ajam (major) — hope
  const HOPE_A = [['A4', 2], ['F#4', 1], ['E4', 1], ['D4', 2], [null, 1], ['E4', 1], ['F#4', 1], ['G4', 1], ['A4', 2], ['B4', 1], ['A4', 1], ['G4', 1], ['F#4', 1], ['E4', 3], [null, 1]];
  const HOPE_B = [['D4', 1], ['F#4', 1], ['A4', 1], ['D5', 2], ['C#5', 1], ['A4', 2], ['B4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 4]];

  const CH = {
    Dm: ['D3', 'F3', 'A3', 'D4'], Bb: ['Bb2', 'D3', 'F3', 'Bb3'], Gm: ['G2', 'D3', 'G3', 'Bb3'], A: ['A2', 'E3', 'A3', 'C#4'],
    D: ['D3', 'F#3', 'A3', 'D4'], Bm: ['B2', 'F#3', 'B3', 'D4'], G: ['G2', 'D3', 'G3', 'B3'], Asus: ['A2', 'E3', 'A3', 'D4'],
    F: ['F2', 'C3', 'F3', 'A3'], lowD: ['D2', 'A2', 'D3'], cluster: ['D2', 'Eb2', 'A2', 'Bb2'],
  };

  /* --------------------------------------------------------- instruments */
  const ks = {};
  // Karplus-Strong: a burst of filtered noise circulating in a delay line the length of one period
  function ksBuffer(ac, f, bright) {
    const key = Math.round(f * 10) + ':' + bright;
    if (ks[key]) return ks[key];
    const sr = ac.sampleRate, len = Math.floor(sr * 3), P = Math.max(2, Math.round(sr / f));
    const b = ac.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < P; i++) { const w = Math.random() * 2 - 1; lp += (w - lp) * bright; d[i] = lp; }
    for (let i = P; i < len; i++) {
      const a = d[i - P], c = i - P - 1 >= 0 ? d[i - P - 1] : a;
      d[i] = 0.996 * 0.5 * (a + c);
    }
    let mx = 0;
    for (let i = 0; i < len; i++) mx = Math.max(mx, Math.abs(d[i]));
    for (let i = 0; i < len; i++) d[i] /= mx || 1;
    ks[key] = b;
    return b;
  }

  const ins = {};
  // oud: plucked string through a woody body resonance
  ins.oud = (h, dest, when, f, dur, o = {}) => {
    const ac = h.ac;
    const s = ac.createBufferSource();
    s.buffer = ksBuffer(ac, f, o.bright ?? 0.55);
    const body = h.filter('peaking', 260, 1.2); body.gain.value = 5;
    const lp = h.filter('lowpass', 3600, 0.5);
    const g = h.gain(0);
    const peak = o.gain ?? 0.3;
    g.gain.setValueAtTime(peak, when);
    g.gain.setValueAtTime(peak, when + Math.max(0.05, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.05, dur) + 0.6);
    s.connect(body).connect(lp).connect(g).connect(h.pan(o.pan ?? -0.15)).connect(dest);
    s.start(when);
    s.stop(when + dur + 0.7);
    h.track(s);
    // the oud's double course: a second string, a hair apart
    if (!o.single) ins.oud(h, dest, when + 0.012, f * 1.002, dur, Object.assign({}, o, { gain: peak * 0.5, single: true, pan: (o.pan ?? -0.15) + 0.1 }));
  };
  // ney: breathy reed flute with a late vibrato
  ins.ney = (h, dest, when, f, dur, o = {}) => {
    const ac = h.ac, g0 = o.gain ?? 0.1;
    const osc = ac.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(f * 0.975, when);
    osc.frequency.exponentialRampToValueAtTime(f, when + 0.14);
    const o2 = ac.createOscillator(); o2.type = 'triangle';
    o2.frequency.setValueAtTime(f * 2 * 0.975, when);
    o2.frequency.exponentialRampToValueAtTime(f * 2, when + 0.14);
    const vib = ac.createOscillator(); vib.frequency.value = 5.2;
    const vg = h.gain(0);
    vg.gain.setValueAtTime(0, when);
    vg.gain.linearRampToValueAtTime(f * 0.007, when + Math.min(0.6, dur * 0.6));
    vib.connect(vg); vg.connect(osc.frequency);
    const h2 = h.gain(0.18);
    o2.connect(h2);
    const breath = h.noise('pink');
    const bf = h.filter('bandpass', f * 1.5, 1.4);
    const bg = h.gain(0.5);
    breath.connect(bf).connect(bg);
    const env = h.gain(0);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(g0, when + 0.12);
    env.gain.setValueAtTime(g0, when + Math.max(0.15, dur - 0.1));
    env.gain.linearRampToValueAtTime(0, when + dur + 0.35);
    const lp = h.filter('lowpass', 3200, 0.5);
    osc.connect(lp); h2.connect(lp); bg.connect(lp);
    lp.connect(env).connect(h.pan(o.pan ?? 0.2)).connect(dest);
    for (const n of [osc, o2, vib]) { n.start(when); n.stop(when + dur + 0.5); h.track(n); }
    breath.stop(when + dur + 0.5);
  };
  // piano-ish: struck, decaying partials
  ins.piano = (h, dest, when, f, dur, o = {}) => {
    const ac = h.ac, g0 = o.gain ?? 0.16;
    const env = h.gain(0);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(g0, when + 0.006);
    env.gain.exponentialRampToValueAtTime(g0 * 0.35, when + 0.4);
    env.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(1.5, dur) + 1.8);
    const lp = h.filter('lowpass', 2800, 0.5);
    lp.connect(env).connect(h.pan(o.pan ?? 0)).connect(dest);
    [[1, 1, 'triangle'], [2.001, 0.3, 'sine'], [3.003, 0.1, 'sine']].forEach(([k, a, type]) => {
      const osc = ac.createOscillator(); osc.type = type; osc.frequency.value = f * k;
      const gg = h.gain(a);
      osc.connect(gg).connect(lp);
      osc.start(when); osc.stop(when + Math.max(1.5, dur) + 2); h.track(osc);
    });
  };
  // bowed low strings
  ins.cello = (h, dest, when, f, dur, o = {}) => {
    const ac = h.ac, g0 = o.gain ?? 0.08;
    const osc = ac.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f;
    const vib = ac.createOscillator(); vib.frequency.value = 5.4;
    const vg = h.gain(f * 0.004); vib.connect(vg); vg.connect(osc.frequency);
    const lp = h.filter('lowpass', o.cut ?? 700, 0.9);
    const env = h.gain(0);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(g0, when + (o.a ?? 0.35));
    env.gain.setValueAtTime(g0, when + Math.max(0.4, dur - 0.2));
    env.gain.linearRampToValueAtTime(0, when + dur + (o.r ?? 0.8));
    osc.connect(lp).connect(env).connect(h.pan(o.pan ?? -0.1)).connect(dest);
    for (const n of [osc, vib]) { n.start(when); n.stop(when + dur + (o.r ?? 0.8) + 0.1); h.track(n); }
  };
  // string pad: a chord of detuned saws, slow in, slow out
  ins.pad = (h, dest, when, notes, dur, o = {}) => {
    const ac = h.ac, g0 = (o.gain ?? 0.12) / notes.length;
    const lp = h.filter('lowpass', o.cut ?? 1000, 0.6);
    const env = h.gain(0);
    const a = o.a ?? 1.6, r = o.r ?? 2.2;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(1, when + a);
    env.gain.setValueAtTime(1, when + Math.max(a, dur));
    env.gain.linearRampToValueAtTime(0, when + Math.max(a, dur) + r);
    lp.connect(env).connect(dest);
    if (o.trem) {
      const lfo = ac.createOscillator(); lfo.frequency.value = o.trem;
      const lg = h.gain(0.45); lfo.connect(lg).connect(env.gain);
      lfo.start(when); lfo.stop(when + dur + r + 0.1); h.track(lfo);
    }
    notes.forEach((nm, i) => {
      const f = typeof nm === 'number' ? nm : N(nm);
      for (const det of [-7, 6]) {
        const osc = ac.createOscillator(); osc.type = 'sawtooth';
        osc.frequency.value = f; osc.detune.value = det + (o.drift ? 0 : 0);
        if (o.drift) osc.detune.linearRampToValueAtTime(det + o.drift, when + dur + r);
        const gg = h.gain(g0 * 0.5);
        const p = h.pan((i / Math.max(1, notes.length - 1) - 0.5) * 0.8);
        osc.connect(gg).connect(p).connect(lp);
        osc.start(when); osc.stop(when + Math.max(a, dur) + r + 0.1); h.track(osc);
      }
    });
  };
  // a soft low drum
  ins.thump = (h, dest, when, f = 55, dur = 0.5, o = {}) => {
    const ac = h.ac, g0 = o.gain ?? 0.25;
    const osc = ac.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(f * 1.4, when);
    osc.frequency.exponentialRampToValueAtTime(f * 0.7, when + dur);
    const env = h.gain(0);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(g0, when + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(env).connect(dest);
    osc.start(when); osc.stop(when + dur + 0.05); h.track(osc);
  };

  /* ----------------------------------------------------------- sequencing */
  function bus(h, level, verb = 'hall', send = 0.4) {
    const b = h.gain(level * 2.0);
    b.connect(h.in);
    if (send > 0 && A.verbIn(verb)) { const s = h.gain(send); b.connect(s).connect(A.verbIn(verb)); b.send = s; }
    return b;
  }
  // play a phrase: [[note|null, beats], ...]
  function phrase(h, dest, T0, beat, pat, inst, o = {}) {
    let T = T0;
    for (const [nm, beats] of pat) {
      if (nm) {
        const f = N(nm) * (o.oct ? Math.pow(2, o.oct) : 1), d = beats * beat * (o.legato ?? 0.95);
        h.at(T, (w) => ins[inst](h, dest, w, f, d, o));
      }
      T += beats * beat;
    }
    return T;
  }
  const at = (h, T, fn) => h.at(T, fn);
  const pad = (h, dest, T, chord, dur, o) => at(h, T, (w) => ins.pad(h, dest, w, CH[chord] || chord, dur, o));
  const note = (h, dest, T, inst, nm, dur, o) => at(h, T, (w) => ins[inst](h, dest, w, N(nm), dur, o));

  /* ----------------------------------------------------------------- cues */
  const CUES = {
    0(h) { // title: the first four notes of the theme, alone
      const b = bus(h, 0.6);
      pad(h, b, 0.3, 'lowD', 6.5, { gain: 0.06, a: 2.5, r: 2.5, cut: 500 });
      phrase(h, b, 1.3, 0.75, [['A4', 2], ['F4', 1], ['E4', 1], ['D4', 3]], 'oud', { gain: 0.22 });
    },
    1(h) { // bedroom: the theme's head, slow, as if half-remembered
      const b = bus(h, 0.45);
      pad(h, b, 3, 'lowD', 20, { gain: 0.06, a: 4, r: 3, cut: 450 });
      [['A4', 6], ['F4', 8.8], ['E4', 11.8], ['D4', 15.2]].forEach(([nm, T]) => note(h, b, T, 'piano', nm, 2.5, { gain: 0.08 }));
    },
    2(h) { // falling asleep: the harmony sinks and goes out of tune
      const b = bus(h, 0.5, 'dream', 0.5);
      pad(h, b, 0, 'Bb', 9, { gain: 0.07, a: 2, r: 3, cut: 600, drift: -60 });
      note(h, b, 1.5, 'piano', 'D4', 2.5, { gain: 0.07 });
      note(h, b, 4.2, 'piano', 'C#4', 3, { gain: 0.06 });
      at(h, 8, (w) => ins.cello(h, b, w, N('D2'), 9, { gain: 0.07, a: 3, r: 1 }));
      at(h, 10, (w) => ins.cello(h, b, w, N('Eb2'), 7, { gain: 0.05, a: 3, r: 1 }));
    },
    3(h) { // drowning: a low drone, pulses, clusters on every pull; far above, one high note of the theme
      const b = bus(h, 0.55, 'dream', 0.5);
      at(h, 0, (w) => ins.cello(h, b, w, N('D1') * 2, 33, { gain: 0.08, a: 2, r: 2, cut: 300 }));
      for (let T = 0.5; T < 33; T += 1.56) note(h, b, T, 'thump', 'D1', 0.6, { gain: 0.16 });
      for (const T of [9.1, 16.5, 24.0]) pad(h, b, T, 'cluster', 1.4, { gain: 0.16, a: 0.08, r: 1.8, cut: 900 });
      for (const [T, nm] of [[7.6, 'A5'], [15.2, 'F5'], [22.6, 'E5']]) note(h, b, T, 'ney', nm, 1.4, { gain: 0.035, pan: 0.4 });
    },
    4(h) { // corridor: a two-note ostinato that walks with him, then runs, then stops dead
      const b = bus(h, 0.45, 'hall', 0.5);
      pad(h, b, 6, 'lowD', 23, { gain: 0.05, a: 3, r: 1, cut: 400 });
      let T = 7, i = 0;
      while (T < 29.3) {
        const nm = i % 2 ? 'Bb3' : 'A3';
        note(h, b, T, 'piano', nm, 0.4, { gain: 0.07 + 0.04 * U.inv(7, 27, T) });
        T += T > 24 && T < 27.5 ? 0.24 : 0.55;
        i++;
      }
    },
    5(h) { // the cup: trembling strings; a blow when it grows; a chase; then warmth as he falls into it
      const b = bus(h, 0.55, 'dream', 0.45);
      pad(h, b, 0, ['A3', 'Bb3', 'D4'], 11.4, { gain: 0.05, a: 2, r: 0.4, trem: 7, cut: 1600 });
      at(h, 11.58, (w) => { ins.thump(h, b, w, 40, 2, { gain: 0.5 }); ins.pad(h, b, w, CH.cluster, 1.2, { gain: 0.2, a: 0.02, r: 2, cut: 1200 }); });
      pad(h, b, 13, ['D3', 'Eb3', 'A3', 'Bb3'], 14, { gain: 0.07, a: 1, r: 0.8, trem: 11, cut: 1800 });
      for (let T = 13; T < 27; T += 0.3) note(h, b, T, 'cello', 'D2', 0.18, { gain: 0.05, a: 0.02, r: 0.08, cut: 900 });
      pad(h, b, 26.8, 'Dm', 4, { gain: 0.1, a: 2.5, r: 3, cut: 1400 });
      note(h, b, 27.5, 'ney', 'A4', 3.5, { gain: 0.07 });
    },
    6(h) { // the memory: the theme, whole, on oud and ney over warm strings
      const b = bus(h, 0.6, 'room', 0.5);
      // the memory is cut off with everything else at the door
      h.param(b.gain, [[0, 0.95], [44.3, 0.95], [44.36, 0]]);
      if (b.send) h.param(b.send.gain, [[0, 0.5], [44.3, 0.5], [44.36, 0]]);
      const prog = ['Dm', 'Bb', 'Gm', 'A'];
      for (let i = 0; i < 11; i++) {
        const T = 0.5 + i * 4;
        if (T > 44) break;
        const swell = T >= 34 ? 1.8 : 1;
        pad(h, b, T, prog[i % 4], 4.2, { gain: 0.08 * swell, a: 1.2, r: 1.8, cut: T >= 34 ? 1600 : 1100 });
      }
      phrase(h, b, 2.0, 0.55, THEME_A, 'oud', { gain: 0.24 });
      phrase(h, b, 15.2, 0.62, THEME_B, 'ney', { gain: 0.08 });
      phrase(h, b, 28.6, 0.55, THEME_A, 'oud', { gain: 0.22 });
      phrase(h, b, 28.6, 0.55, THEME_A, 'ney', { gain: 0.05, oct: 1 });
      // her gaze: the theme's answer, high and full
      phrase(h, b, 36.4, 0.5, THEME_B, 'ney', { gain: 0.1 });
      note(h, b, 40.2, 'cello', 'D3', 4, { gain: 0.08, a: 1.5 });
    },
    7(h) { // waking: nothing — then a low note at 04:52, the theme's head on piano, the ney from the photograph
      const b = bus(h, 1.0, 'hall', 0.45);
      note(h, b, 12.0, 'cello', 'D2', 3, { gain: 0.06, a: 0.8 });
      pad(h, b, 14.5, 'Dm', 16, { gain: 0.045, a: 3, r: 3, cut: 700 });
      [['A4', 15.4], ['F4', 16.6], ['E4', 17.5], ['D4', 18.8]].forEach(([nm, T]) => note(h, b, T, 'piano', nm, 2.2, { gain: 0.08 }));
      phrase(h, b, 21.8, 0.62, [['A4', 2], ['F4', 1], ['E4', 1], ['D4', 2], [null, 1], ['E4', 1], ['F4', 1], ['G4', 1], ['A4', 3]], 'ney', { gain: 0.05, pan: 0.3 });
    },
    8() { /* the bathroom stays silent: painfully ordinary */ },
    9(h) { // leaving: a light pulse for the city waking
      const b = bus(h, 0.6, 'street', 0.4);
      const pat = ['D4', 'A3', 'D4', 'C4', 'A3', 'G3', 'A3', 'C4'];
      let i = 0;
      for (let T = 10; T < 25.5; T += 0.5, i++) note(h, b, T, 'oud', pat[i % pat.length], 0.35, { gain: 0.1 + 0.04 * (i % 4 === 0), bright: 0.45 });
      pad(h, b, 10, ['D3', 'A3', 'C4', 'E4'], 15, { gain: 0.04, a: 3, r: 2, cut: 900 });
    },
    10(h) { // work: the corridor's two notes return, quicken as the pile grows, and sink into the sea's drone
      const b = bus(h, 0.55, 'hall', 0.45);
      note(h, b, 4.6, 'cello', 'D2', 4.5, { gain: 0.06, a: 1.2 });
      pad(h, b, 4.6, ['A3', 'Bb3', 'D4'], 4.4, { gain: 0.04, a: 1.5, r: 1, trem: 6, cut: 1400 });
      let T = 9.8, i = 0;
      while (T < 25.3) {
        note(h, b, T, 'piano', i % 2 ? 'Bb3' : 'A3', 0.35, { gain: 0.05 + 0.05 * U.inv(9.8, 25, T) });
        T += U.lerp(0.55, 0.3, U.inv(15, 25, T));
        i++;
      }
      pad(h, b, 15.5, 'lowD', 10, { gain: 0.05, a: 3, r: 1, cut: 500 });
      at(h, 25.3, (w) => ins.cello(h, b, w, N('D1') * 2, 4, { gain: 0.09, a: 1.5, r: 0.2, cut: 300 }));
      pad(h, b, 25.3, 'cluster', 3.9, { gain: 0.1, a: 2.5, r: 0.1, cut: 700 });
      for (let T2 = 25.6; T2 < 29.2; T2 += 0.8) note(h, b, T2, 'thump', 'D1', 0.5, { gain: 0.14 });
      // after: one soft chord, the afternoon
      pad(h, b, 30.2, 'F', 3.8, { gain: 0.05, a: 1.5, r: 2 });
    },
    11(h) { // the girl: warmth, then the theme on oud as she holds it up to him; it turns major as he takes it
      const b = bus(h, 0.9, 'street', 0.45);
      pad(h, b, 8.5, 'F', 7, { gain: 0.09, a: 2.5, r: 2, cut: 1000 });
      phrase(h, b, 15.6, 0.6, [['A4', 2], ['F4', 1], ['E4', 1], ['D4', 2], [null, 1], ['E4', 1], ['F4', 1], ['G4', 1]], 'oud', { gain: 0.2 });
      pad(h, b, 15.2, 'Dm', 5, { gain: 0.06, a: 1.5, r: 1.5 });
      pad(h, b, 20.2, 'Bb', 6, { gain: 0.07, a: 1.2, r: 2 });
      note(h, b, 20.4, 'oud', 'F4', 1.2, { gain: 0.2 });
      note(h, b, 21.0, 'oud', 'Bb4', 2, { gain: 0.2 });
      pad(h, b, 26, 'F', 6, { gain: 0.06, a: 1.5, r: 2.5 });
      phrase(h, b, 26.4, 0.6, [['C5', 1], ['A4', 1], ['F4', 2], ['G4', 1], ['A4', 3]], 'ney', { gain: 0.07 });
    },
    12(h) { // the smile: the first major chord of the film; the theme in Ajam; release; home; rest
      const b = bus(h, 0.85, 'hall', 0.45);
      pad(h, b, 2.3, 'D', 5, { gain: 0.08, a: 2.2, r: 2 });
      phrase(h, b, 2.8, 0.6, [['A4', 2], ['F#4', 1], ['E4', 1], ['D4', 3]], 'oud', { gain: 0.22 });
      pad(h, b, 7.2, 'Asus', 4, { gain: 0.08, a: 1, r: 1.5 });
      note(h, b, 8.7, 'ney', 'E5', 2.2, { gain: 0.07 });
      const prog = ['D', 'Bm', 'G', 'A', 'D'];
      prog.forEach((c, i) => pad(h, b, 11 + i * 3.2, c, 3.4, { gain: 0.12 + i * 0.015, a: 1, r: 1.8, cut: 1800 }));
      phrase(h, b, 11.2, 0.55, HOPE_A, 'oud', { gain: 0.24 });
      phrase(h, b, 11.2, 0.55, HOPE_A, 'ney', { gain: 0.06, oct: 1 });
      phrase(h, b, 20.8, 0.6, HOPE_B, 'ney', { gain: 0.09 });
      pad(h, b, 24.5, 'D', 6, { gain: 0.07, a: 1.5, r: 3, cut: 900 });
      [['D5', 24.8], ['A4', 25.6], ['F#4', 26.4], ['D4', 27.6]].forEach(([nm, T]) => note(h, b, T, 'piano', nm, 2, { gain: 0.07 }));
      // the golden room: a lullaby ending on the home chord
      pad(h, b, 31, 'G', 3, { gain: 0.1, a: 2, r: 1 });
      pad(h, b, 34, 'D', 6, { gain: 0.11, a: 1.5, r: 4 });
      phrase(h, b, 31.5, 0.7, [['B4', 1], ['A4', 1], ['F#4', 2], ['E4', 1], ['F#4', 1], ['D4', 4]], 'piano', { gain: 0.12 });
    },
    end(h) { // end card: the theme once more, in major
      const b = bus(h, 0.62, 'hall', 0.45);
      ['D', 'Bm', 'G', 'A'].forEach((c, i) => pad(h, b, 0.4 + i * 3.4, c, 3.6, { gain: 0.08, a: 1.2, r: 2 }));
      phrase(h, b, 0.8, 0.6, HOPE_A, 'oud', { gain: 0.2 });
      phrase(h, b, 0.8, 0.6, HOPE_A, 'ney', { gain: 0.05, oct: 1 });
      // under the dedication: the theme's answer, alone on the ney
      pad(h, b, 14, 'G', 4, { gain: 0.06, a: 1.5, r: 1.5 });
      phrase(h, b, 14.4, 0.62, HOPE_B, 'ney', { gain: 0.08 });
      // and the home chord, held to the end
      pad(h, b, 18, 'D', 5.5, { gain: 0.07, a: 2, r: 3, cut: 800 });
      note(h, b, 18.3, 'oud', 'D4', 3, { gain: 0.14 });
    },
  };

  // attach cues to the scenes' own audio
  for (const s of FILM.list) {
    const key = s.num ?? (s.order === 0 ? 0 : s.name === 'End' ? 'end' : null);
    const cue = CUES[key];
    if (!cue) continue;
    const own = s.audio;
    s.audio = (h, fx) => {
      if (own) own(h, fx);
      try { cue(h, M); } catch (e) { console.error('music', s.name, e); }
    };
    if (key === 'end') s.audioTail = 4;
  }
  M.ins = ins;
})();
