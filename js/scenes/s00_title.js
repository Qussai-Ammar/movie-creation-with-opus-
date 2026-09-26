/* Title — black, the name of the film, the room's sound arriving underneath. */
(function () {
  'use strict';
  const { U, W, H } = FILM;
  FILM.scene({
    order: 0, name: 'Title', dur: 7,
    post: { grain: 0.06, vignette: 0 },
    draw(ctx, t) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const a = U.win(t, 1.2, 6.2, 1.6, 1.4);
      ctx.save();
      ctx.fillStyle = `rgba(214,204,190,${a * 0.92})`;
      ctx.font = '300 46px Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sp = 26 + t * 2.2;
      const txt = 'ONE NIGHT';
      let total = 0;
      for (const ch of txt) total += ctx.measureText(ch).width + sp;
      let x = W / 2 - total / 2 + sp / 2;
      for (const ch of txt) {
        const w = ctx.measureText(ch).width;
        ctx.fillText(ch, x + w / 2, H / 2);
        x += w + sp;
      }
      ctx.restore();
    },
    audio(h, fx) {
      // the night arrives before the picture does
      const b = fx.bed(h, { color: 'brown', type: 'lowpass', f: 320, gain: 0 });
      h.param(b.g.gain, [[0, 0], [3, 0], [7, 0.06]]);
      const w = fx.wind(h, { from: 0, to: 9, gain: 0.03, f: 450, seed: 2 });
      h.param(w.p.pan, [[0, 0.3], [9, 0.3]]);
    },
  });
})();
