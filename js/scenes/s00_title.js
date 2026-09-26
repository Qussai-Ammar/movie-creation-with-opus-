/* Opening — the director's credit, then the title. The night's sound arrives underneath. */
(function () {
  'use strict';
  const { U, W, H } = FILM;
  const AR = 'Amiri, "Noto Naskh Arabic", "Geeza Pro", "Arial", serif';

  FILM.scene({
    order: 0, name: 'Title', dur: 11,
    post: { grain: 0.06, vignette: 0 },
    draw(ctx, t) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // فيلم من إخراج قصي أنس
      const a = U.win(t, 0.8, 4.8, 1.2, 1.0);
      if (a > 0) {
        ctx.fillStyle = `rgba(214,204,190,${a * 0.75})`;
        ctx.font = `400 34px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('فيلم من إخراج', W / 2, H / 2 - 36);
        ctx.fillStyle = `rgba(226,216,202,${a * 0.95})`;
        ctx.font = `700 56px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('قصي أنس', W / 2, H / 2 + 34);
      }
      // حنين
      const b = U.win(t, 5.4, 10.8, 1.6, 1.4);
      if (b > 0) {
        ctx.fillStyle = `rgba(232,222,206,${b})`;
        ctx.font = `400 ${150 + t * 2}px ${AR}`;
        ctx.direction = 'rtl';
        ctx.fillText('حنين', W / 2, H / 2 - 20);
        ctx.fillStyle = `rgba(214,204,190,${b * 0.6})`;
        ctx.font = '300 20px Georgia, "Times New Roman", serif';
        const txt = 'N O S T A L G I A';
        ctx.direction = 'ltr';
        ctx.fillText(txt, W / 2, H / 2 + 98);
      }
    },
    audio(h, fx) {
      const b = fx.bed(h, { color: 'brown', type: 'lowpass', f: 320, gain: 0 });
      h.param(b.g.gain, [[0, 0], [7, 0], [11, 0.06]]);
      const w = fx.wind(h, { from: 0, to: 13, gain: 0.03, f: 450, seed: 2 });
      h.param(w.p.pan, [[0, 0.3], [13, 0.3]]);
    },
  });
})();
