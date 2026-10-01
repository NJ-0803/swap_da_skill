#!/usr/bin/env node
/* render-turntable.mjs | Swap da Skill | turn a page that draws your object into a frame sequence. Zero dependencies.
 *
 *   node render-turntable.mjs --page=turntable.html --out=frames --count=30 --size=520x720 --scale=1.25 [--format=webp|png] [--quality=82]
 * WebP needs cwebp (brew install webp); without it the tool writes PNG. WebP keeps the alpha channel.
 *
 * For each frame i it opens  <page>?yaw=<i * 360 / count>&pitch=<pitch>  in headless Chrome with a
 * transparent background and saves out/f_<i>.png. The page can draw ANYTHING: the bundled turntable.html
 * draws the extruded model, so this proves the pipeline. For a real product, export the same N frames
 * from your renderer (Blender, Keyshot, C4D) named f_00.png ... and skip this script.
 * Env: CHROME=/path/to/chrome overrides the default browser location. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const page = resolve(arg('page', 'turntable.html')), out = resolve(arg('out', 'frames'));
let cwebp = ''; try { cwebp = execFileSync('which', ['cwebp'], { encoding: 'utf8' }).trim(); } catch {}
let format = arg('format', cwebp ? 'webp' : 'png'), quality = arg('quality', '82');
if (format === 'webp' && !cwebp) { console.warn('cwebp not found (brew install webp); writing PNG instead.'); format = 'png'; }
let [w, h] = arg('size', '520x720').split('x').map(Number);
if (w < 500) { console.warn(`Headless Chrome cannot lay out narrower than 500 CSS px; using width 500 instead of ${w}.`); w = 500; }
const count = +arg('count', 30), scale = +arg('scale', 1.25), pitch = arg('pitch', '-4');
const pad = String(count - 1).length < 2 ? 2 : String(count - 1).length;
const chrome = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => { try { return statSync(p).isFile(); } catch { return false; } });
if (!chrome) { console.error('No Chrome found. Set CHROME=/path/to/chrome'); process.exit(2); }
mkdirSync(out, { recursive: true });
let bytes = 0;
for (let i = 0; i < count; i++) {
  const base = `${out}/f_${String(i).padStart(pad, '0')}`, file = base + '.png', yaw = (i * 360 / count).toFixed(3);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', `--force-device-scale-factor=${scale}`,
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=4000', `--window-size=${w},${h}`, `--screenshot=${file}`,
    `${pathToFileURL(page).href}?yaw=${yaw}&pitch=${pitch}`], { stdio: 'ignore' });
  if (format === 'webp') {                         // transparent PNG -> WebP, keep alpha, drop the PNG
    execFileSync(cwebp, ['-quiet', '-q', quality, '-alpha_q', '95', '-m', '6', file, '-o', base + '.webp']);
    unlinkSync(file); bytes += statSync(base + '.webp').size;
  } else bytes += statSync(file).size;
  process.stdout.write(`\r${i + 1}/${count}`);
}
console.log(`\nWrote ${count} frames to ${out} (${(bytes / 1e6).toFixed(1)} MB, ${Math.round(w * scale)}x${Math.round(h * scale)} each). In the manifest use box: [${w}, ${h}] and subject: [<object w>, <object h>]. Frames: frames: { count: ${count}, src: 'frames/f_{n}.${format}', pad: ${pad} }, `);
