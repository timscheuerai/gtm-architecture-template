// Renders the AP engine live graphic from a results.json and writes GIF + MP4 (+ a still PNG).
// Needs Playwright with Chromium (npm install --no-save playwright && npx playwright install chromium) and ffmpeg.
//   node capture.mjs --results <results.json> [--out <dir>] [--names] [--fps 12] [--hold 1.6]
// Same timeline as opening graphic.html in a browser; frames are stepped with window.__setTime.
import { chromium } from 'playwright';
import { mkdir, rm, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
const results = resolve(arg('results', join(here, '../generated/live/results.json')));
const out = resolve(arg('out', dirname(results)));
const names = process.argv.includes('--names');
const fps = Number(arg('fps', 12)), hold = Number(arg('hold', 1.6));

const data = JSON.parse(await readFile(results, 'utf8'));
// results.js feeds the page; it is regenerated on every run so the browser view matches the capture.
await writeFile(join(here, 'results.js'), `window.__RESULTS = ${JSON.stringify(data)};\nwindow.__NAMES = ${names};\n`);
await mkdir(out, { recursive: true });
const frames = join(out, 'frames'); await rm(frames, { recursive: true, force: true }); await mkdir(frames, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.addInitScript(() => { window.__CAPTURE = true; });
await page.goto(pathToFileURL(join(here, 'graphic.html')).href);
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.__duration);
const total = Math.round((duration + hold) * fps);
for (let f = 0; f < total; f++) {
  const t = Math.min(f / fps, duration);
  await page.evaluate((t) => window.__setTime(t), t);
  await page.locator('.art').screenshot({ path: join(frames, `f${String(f).padStart(4, '0')}.png`) });
}
await page.evaluate((t) => window.__setTime(t), duration);
await page.locator('.art').screenshot({ path: join(out, 'ap-engine-live-still.png') });
await browser.close();

const ff = (args) => { const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }); if (r.status) throw Error('ffmpeg failed'); };
// Palette from the final full frame keeps the logos and QR crisp (never stats_mode=diff on its own).
const last = join(frames, `f${String(total - 1).padStart(4, '0')}.png`);
ff(['-i', last, '-vf', 'palettegen=max_colors=192:reserve_transparent=0', join(frames, 'palette.png')]);
ff(['-framerate', String(fps), '-i', join(frames, 'f%04d.png'), '-i', join(frames, 'palette.png'),
  '-lavfi', `fps=${fps}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', join(out, 'ap-engine-live.gif')]);
ff(['-framerate', String(fps), '-i', join(frames, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', join(out, 'ap-engine-live.mp4')]);
await rm(frames, { recursive: true, force: true });
const size = (await stat(join(out, 'ap-engine-live.gif'))).size / 1e6;
console.log(`Captured ${total} frames at ${fps} fps (${(total / fps).toFixed(1)} s). GIF ${size.toFixed(1)} MB + MP4 + still in ${out}`);
