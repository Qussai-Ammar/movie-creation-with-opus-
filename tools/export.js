/* Export the film to MP4 (H.264 + AAC).
 *
 *   node tools/export.js [out.mp4] [--fps 24] [--workers 4] [--from 0] [--to <end>]
 *
 * Picture: every frame is rendered deterministically in headless Chromium (FILM.renderAt) at 1920×804
 * and letterboxed onto 1920×1080. Sound: the whole soundtrack is rendered offline (OfflineAudioContext).
 * Needs Playwright (PLAYWRIGHT=path/to/playwright) and ffmpeg with libx264 (FFMPEG=path/to/ffmpeg).
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? Number(args[i + 1]) : def; };
const OUT = path.resolve(args.find((a) => a.endsWith('.mp4')) || 'export/haneen.mp4');
const FPS = opt('fps', 24), WORKERS = opt('workers', 4);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const ROOT = path.resolve(__dirname, '..');
const GRAIN = opt('grain', 0.45); // softer film grain than on screen: same look, a far smaller file
const URL = 'file://' + path.join(ROOT, 'index.html') + '?still&q=1&grain=' + GRAIN;
const TMP = path.join(path.dirname(OUT), '.export-tmp');
fs.mkdirSync(TMP, { recursive: true });

const run = (cmd, a) => new Promise((res, rej) => {
  const p = spawn(cmd, a, { stdio: ['ignore', 'inherit', 'inherit'] });
  p.on('close', (c) => (c ? rej(new Error(cmd + ' exited ' + c)) : res()));
});

async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 804 }, ignoreHTTPSErrors: true, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.FILM && FILM.ready);
  await page.evaluate(() => document.fonts.load('400 40px Amiri').catch(() => {}));
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// render every scene's sound in parallel, then lay them on one timeline
async function renderAudio(browser, wav) {
  const probe = await openPage(browser);
  const scenes = await probe.evaluate(() => FILM.list.map((s, i) => ({ i, start: s.start, has: !!s.audio })).filter((s) => s.has));
  await probe.context().close();
  console.log(`audio: ${scenes.length} scenes on ${WORKERS} workers…`);
  const t0 = Date.now();
  const files = [];
  const queue = scenes.slice();
  const worker = async () => {
    const page = await openPage(browser);
    for (;;) {
      const sc = queue.shift();
      if (!sc) break;
      const file = path.join(TMP, `scene${sc.i}.wav`);
      const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 0 }),
        page.evaluate(async (i) => {
          const buf = await FILM.A.renderScene(i, 48000);
          const a = document.createElement('a');
          a.href = URL.createObjectURL(FILM.A.toWav(buf));
          a.download = 'scene.wav';
          document.body.appendChild(a);
          a.click();
        }, sc.i),
      ]);
      await dl.saveAs(file);
      files.push({ file, start: sc.start });
      console.log(`audio: scene ${sc.i} done`);
    }
    await page.context().close();
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));
  // mix: each scene delayed to its start, summed, then a gentle limiter
  const inputs = [], chains = [];
  files.sort((x, y) => x.start - y.start).forEach((f, k) => {
    inputs.push('-i', f.file);
    const ms = Math.round(f.start * 1000);
    chains.push(`[${k}:a]adelay=${ms}|${ms}[a${k}]`);
  });
  const mix = chains.join(';') + ';' + files.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${files.length}:normalize=0:dropout_transition=0,alimiter=limit=0.95[out]`;
  await run(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', mix, '-map', '[out]', '-ar', '48000', '-ac', '2', wav]);
  console.log(`audio: mixed in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

async function renderSegment(browser, idx, f0, f1, file) {
  const page = await openPage(browser);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-vf', 'pad=1920:1080:0:138:black', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(opt('crf', 23)), '-tune', 'film', '-pix_fmt', 'yuv420p', file],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  for (let f = f0; f < f1; f++) {
    const b64 = await page.evaluate((t) => { FILM.renderAt(t); return (FILM.outCanvas || FILM.canvas).toDataURL('image/jpeg', 0.95).slice(23); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 240 === 0) console.log(`video[${idx}]: frame ${f - f0}/${f1 - f0}`);
  }
  ff.stdin.end();
  await done;
  await page.context().close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--enable-unsafe-swiftshader'] });
  const probe = await openPage(browser);
  const total = await probe.evaluate(() => FILM.total);
  await probe.context().close();
  const from = opt('from', 0), to = Math.min(opt('to', total), total);
  const frames = Math.floor((to - from) * FPS);
  console.log(`film: ${total.toFixed(1)} s → ${frames} frames at ${FPS} fps, ${WORKERS} workers`);

  const wav = path.join(TMP, 'soundtrack.wav');
  if (!args.includes('--no-audio') || !fs.existsSync(wav)) await renderAudio(browser, wav);
  const per = Math.ceil(frames / WORKERS);
  const segs = [];
  const jobs = [];
  for (let i = 0; i < WORKERS; i++) {
    const f0 = Math.round(from * FPS) + i * per, f1 = Math.min(Math.round(from * FPS) + frames, f0 + per);
    if (f1 <= f0) break;
    const file = path.join(TMP, `seg${i}.mp4`);
    segs.push(file);
    jobs.push(renderSegment(browser, i, f0, f1, file));
  }
  await Promise.all(jobs);
  await browser.close();

  const list = path.join(TMP, 'segments.txt');
  fs.writeFileSync(list, segs.map((f) => `file '${f}'`).join('\n'));
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(from), '-t', String(to - from), '-i', wav,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', OUT]);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1), 'MB');
})().catch((e) => { console.error(e); process.exit(1); });
