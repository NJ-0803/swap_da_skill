#!/usr/bin/env node
/* audit.mjs | Bhookmark UI audit mode. Zero dependencies.
 *
 *   node audit.mjs <dir|file> [--json] [--allow=width,height] [--config=audit.config.json]
 *
 * Scans .css .html .vue .svelte .tsx .jsx and prints a Before / After / Why table.
 * REPORT FIRST: this never edits files. Exit code 1 when any error-level finding exists.
 * Mechanical rules only. Layout, hero discipline and taste still need a human or model
 * pass; the report ends with that checklist so it is never mistaken for a full review.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const args = process.argv.slice(2);
const target = args.find(a => !a.startsWith('--')) || '.';
const asJson = args.includes('--json');
const allow = new Set(((args.find(a => a.startsWith('--allow=')) || '').slice(8)).split(',').filter(Boolean));
/* Brand rules live in a config so a company can swap them. Defaults are Bhookmark's.
   audit.config.json: { "off": ["gold"], "forbiddenHues": [[36,54]], "forbiddenWords": ["gold","amber"],
                        "weightCap": 600, "minTarget": 44 } */
const cfgPath = (args.find(a => a.startsWith('--config=')) || '').slice(9);
const cfg = Object.assign({ off: [], forbiddenHues: [[36, 54]], forbiddenWords: ['gold', 'goldenrod', 'amber', 'saffron'], weightCap: 600, minTarget: 44 }, cfgPath ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {});
const off = new Set(cfg.off);
const wordRe = new RegExp('\\b(' + cfg.forbiddenWords.join('|') + ')\\b', 'i'), nameRe = new RegExp('^(--[\\w-]*(' + cfg.forbiddenWords.join('|') + ')[\\w-]*)$');
const IGNORE = new Set(['audit-fixtures', 'optional-diagrams' /* generated third-party artifacts */, 'node_modules', '.git', '.next', 'dist', 'build', 'out', '.vercel', 'coverage']);
const EXT = new Set(['.css', '.html', '.vue', '.svelte', '.tsx', '.jsx']);

/* ---------- colour maths ---------- */
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function toRGB(v) {
  v = v.trim();
  let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
  if (m) { let h = m[1]; if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  m = v.match(/^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})(?:\s*\/.*)?$/);              // channel triple: "142 51 64"
  if (m) return [+m[1], +m[2], +m[3]];
  m = v.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return null;
}
const isGold = rgb => { const [h, s, l] = hsl(rgb); return cfg.forbiddenHues.some(([a, b]) => h >= a && h <= b) && s > 0.45 && l > 0.28 && l < 0.78; };

/* ---------- tolerant CSS parser (handles nested @media / @keyframes) ---------- */
function parseCSS(src, baseOffset = 0, lineOf) {
  const text = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));   // blank comments, keep offsets
  const rules = [], stack = [];
  let buf = '', bufStart = 0, paren = 0, quote = null;
  const at = () => stack.filter(s => s.kind === 'at').map(s => s.head);
  const addDecl = (top, raw, start) => {
    const i = raw.indexOf(':'); if (i < 0) return;
    const lead = raw.length - raw.trimStart().length;
    top.decls.push({ prop: raw.slice(0, i).trim().toLowerCase(), value: raw.slice(i + 1).trim(), line: lineOf(baseOffset + start + lead) });
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) { buf += ch; if (ch === quote && text[i - 1] !== '\\') quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; if (!buf.trim()) bufStart = i; buf += ch; continue; }
    if (ch === '(') paren++; else if (ch === ')') paren = Math.max(0, paren - 1);
    if (paren === 0 && ch === '{') {
      const head = buf.trim();
      stack.push(head.startsWith('@') ? { kind: 'at', head } : { kind: 'rule', sel: head, decls: [], line: lineOf(baseOffset + bufStart) });
      buf = ''; bufStart = i + 1;
    } else if (paren === 0 && ch === '}') {
      const top = stack[stack.length - 1];
      if (top && top.kind === 'rule' && buf.trim()) addDecl(top, buf, bufStart);
      buf = ''; bufStart = i + 1;
      const c = stack.pop();
      if (c && c.kind === 'rule') rules.push({ sel: c.sel, decls: c.decls, line: c.line, at: at() });
    } else if (paren === 0 && ch === ';') {
      const top = stack[stack.length - 1];
      if (top && top.kind === 'rule') addDecl(top, buf, bufStart);
      else if (buf.trim().startsWith('@')) rules.push({ sel: buf.trim(), decls: [], line: lineOf(baseOffset + bufStart), at: [], statement: true });
      buf = ''; bufStart = i + 1;
    } else { if (!buf.trim()) bufStart = i; buf += ch; }
  }
  return rules;
}

/* ---------- gather ---------- */
function walk(p, out = []) {
  const st = statSync(p);
  if (st.isFile()) { if (EXT.has(extname(p))) out.push(p); return out; }
  for (const f of readdirSync(p)) if (!IGNORE.has(f) && !f.startsWith('.')) walk(join(p, f), out);
  return out;
}
const files = walk(target);
const root = statSync(target).isDirectory() ? target : join(target, '..');
const findings = [];
const add = (sev, id, file, line, before, after, why) => off.has(id) || findings.push({ sev, id, where: `${relative(root, file) || file}:${line}`, before, after, why });

const NONCOMP = /^(width|height|min-width|min-height|max-width|max-height|top|left|right|bottom|margin(-\w+)?|padding(-\w+)?|box-shadow|border(-\w+)?|border-radius|font-size|line-height|gap|grid-template(-\w+)?|inset)$/;
const PAINT = /^(color|background(-color|-position)?|border-color|fill|stroke|outline-color|text-decoration-color|mask(-position)?|clip-path)$/;
let anyMotion = false, anyReduced = false, anyFocusVisible = false, hoverUngated = [];
const themes = {};                                   // token contract per theme

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lineOfFull = pos => src.slice(0, pos).split('\n').length;
  const ext = extname(file);
  const blocks = [];
  if (ext === '.css') blocks.push({ text: src, off: 0 });
  else for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) blocks.push({ text: m[1], off: m.index + m[0].indexOf('>') + 1 });

  for (const b of blocks) {
    for (const r of parseCSS(b.text, b.off, lineOfFull)) {
      if (r.statement) {
        if (/^@import\b.*(fonts\.googleapis|fonts\.gstatic|typekit)/i.test(r.sel)) add('warn', 'font-import', file, r.line, r.sel, 'a <link rel="stylesheet"> in the HTML head', 'A late-discovered @import loses the race on a real network and the page lands on fallback fonts.');
        continue;
      }
      const inKeyframes = r.at.some(a => /^@keyframes/i.test(a));
      const inHoverMQ = r.at.some(a => /hover:\s*hover/i.test(a));
      if (r.at.some(a => /prefers-reduced-motion/i.test(a))) anyReduced = true;
      if (/:focus-visible/.test(r.sel)) anyFocusVisible = true;
      if (/:hover/.test(r.sel) && !inHoverMQ) hoverUngated.push({ file, line: r.line, sel: r.sel });
      const d = Object.fromEntries(r.decls.map(x => [x.prop, x]));

      // token contract: :root / [data-theme=...] custom properties
      if (/^(:root|html)(\[data-theme=["']?(\w+)["']?\])?$|^\[data-theme=["']?(\w+)["']?\]$/.test(r.sel.trim())) {
        const name = (r.sel.match(/data-theme=["']?(\w+)/) || [, 'root'])[1];
        themes[name] = themes[name] || { file, line: r.line, t: {} };
        for (const x of r.decls) if (x.prop.startsWith('--')) { const c = toRGB(x.value); if (c) themes[name].t[x.prop.slice(2)] = c; }
      }

      for (const x of r.decls) {
        const { prop, value, line } = x;
        // colour: gold / amber / saffron
        if (nameRe.test(prop) || wordRe.test(value)) {
          add('error', 'gold', file, line, `${prop}: ${value}`, 'burgundy, rose or a neutral from the token set', 'Bhookmark never uses gold, saffron or amber.');
        } else {
          for (const m of value.matchAll(/#[0-9a-f]{3,6}\b|rgba?\([^)]*\)|(?<![\w.-])\d{1,3}\s+\d{1,3}\s+\d{1,3}(?![\w.%-])/gi)) {
            const c = toRGB(m[0]); if (c && isGold(c)) add('error', 'gold', file, line, `${prop}: ${value}`, 'burgundy, rose or a neutral from the token set', `Colour ${m[0]} reads as gold/amber. Bhookmark never uses it.`);
          }
        }
        if (prop === 'font-weight' && (/^(bold|bolder)$/i.test(value) || +value > cfg.weightCap)) add('warn', 'weight', file, line, `font-weight: ${value}`, `font-weight: ${cfg.weightCap} (cap)`, 'The type system caps weight at 600: no bold, extrabold or black.');
        if (/^(transition|transition-property|animation|animation-name|will-change)$/.test(prop) || inKeyframes) { if (prop !== 'will-change') anyMotion = true; }
        if (prop === 'transition' || prop === 'transition-property') {
          if (/(^|[\s,])all(?![-\w])/.test(value)) add('warn', 'transition-all', file, line, `${prop}: ${value}`, 'name the exact properties, e.g. transform, opacity', '`all` animates properties you did not mean to and blocks the compositor fast path.');
          for (const part of value.split(/,(?![^(]*\))/)) {
            const p = part.trim().split(/\s+/)[0];
            if (allow.has(p)) continue;
            if (NONCOMP.test(p)) add('warn', 'non-compositor', file, line, `transition on ${p}`, 'animate transform / opacity instead (or document the exception)', `${p} triggers layout or paint every frame; only transform and opacity stay on the GPU.`);
            else if (PAINT.test(p)) add('info', 'paint-only', file, line, `transition on ${p}`, 'fine for small controls; avoid on large or many elements', `${p} repaints but does not re-layout.`);
          }
        }
        if (inKeyframes && NONCOMP.test(prop) && !allow.has(prop)) add('warn', 'non-compositor', file, line, `@keyframes animates ${prop}`, 'animate transform / opacity instead', `${prop} triggers layout every frame.`);
        if (/(transition|animation)(-timing-function)?$/.test(prop) && /(^|[\s,])ease-in(?![-\w])/.test(value)) add('warn', 'ease-in', file, line, `${prop}: ${value}`, 'ease-out (or cubic-bezier(0.16, 1, 0.3, 1)); ease-in-out for on-screen moves', 'ease-in starts slow, so a response to a tap feels sluggish.');
        if ((prop === 'transform' || prop === 'scale') && /scale\(\s*0\s*[,)]/.test(value)) add('warn', 'scale-zero', file, line, `${prop}: ${value}`, 'start from scale(0.95) plus opacity', 'Things do not appear from nothing in the real world; scale(0) reads as a pop.');
        if ((prop === 'height' || prop === 'min-height') && /button|btn|chip|\btab\b|toggle|\.seg/.test(r.sel) && !/^(svg|img|i|span|path|use|b|small)\b/.test(r.sel.split(/[\s>+~]+/).pop()) && !/::?(before|after)\b/.test(r.sel)) {
          const m = value.match(/^(\d+(?:\.\d+)?)px$/); if (m && +m[1] < cfg.minTarget) add('warn', 'target-size', file, line, `${r.sel} { ${prop}: ${value} }`, `${prop}: ${cfg.minTarget}px`, `Touch targets must be at least ${cfg.minTarget}px.`);
        }
      }
      if (d['outline'] && /^(none|0)\b/.test(d['outline'].value) && !/:focus-visible/.test(r.sel)) add('warn', 'outline-none', file, d['outline'].line, `${r.sel} { outline: ${d['outline'].value} }`, 'keep a visible :focus-visible ring instead', 'Removing focus outlines locks keyboard users out.');
      if (d['transform-style'] && /preserve-3d/.test(d['transform-style'].value)) {
        for (const k of ['filter', 'backdrop-filter', 'clip-path', 'mix-blend-mode', 'mask', 'isolation']) if (d[k]) add('error', '3d-flatten', file, d[k].line, `${r.sel} { transform-style: preserve-3d; ${k}: ${d[k].value} }`, `move ${k} to a leaf element`, `${k} on a preserve-3d element flattens everything inside it into one plane.`);
        if (d['opacity'] && +d['opacity'].value < 1) add('error', '3d-flatten', file, d['opacity'].line, `${r.sel} { transform-style: preserve-3d; opacity: ${d['opacity'].value} }`, 'move opacity to a leaf element', 'opacity below 1 on a preserve-3d element flattens its children.');
        if (d['overflow'] && !/^visible$/.test(d['overflow'].value)) add('error', '3d-flatten', file, d['overflow'].line, `${r.sel} { transform-style: preserve-3d; overflow: ${d['overflow'].value} }`, 'clip on a parent instead', 'overflow on a preserve-3d element flattens its children.');
      }
    }
  }

  // utility-class scan (Tailwind and friends) across markup files
  if (ext !== '.css') {
    src.split('\n').forEach((ln, i) => {
      const cls = [...ln.matchAll(/(?:class|className)=["'{`]([^"'`}]*)/g)].map(m => m[1]).join(' ');
      if (!cls) return;
      if (/(^|\s)font-(bold|extrabold|black)(\s|$)/.test(cls)) add('warn', 'weight', file, i + 1, cls.match(/font-(bold|extrabold|black)/)[0], 'font-semibold (600) at most', 'The type system caps weight at 600.');
      if (/(^|\s)transition-all(\s|$)/.test(cls)) add('warn', 'transition-all', file, i + 1, 'transition-all', 'transition-transform or transition-opacity', '`all` animates unintended properties.');
      if (/(^|\s)ease-in(\s|$)/.test(cls)) add('warn', 'ease-in', file, i + 1, 'ease-in', 'ease-out', 'ease-in feels sluggish on a response.');
      const g = cls.match(/(?:bg|text|border|from|to|via|ring|fill|stroke)-(amber|yellow|orange)-\d+/); if (g) add('error', 'gold', file, i + 1, g[0], 'a burgundy or neutral token', 'Bhookmark never uses gold, saffron or amber.');
      if (/(^|\s)(transition|animate-[\w-]+)/.test(cls)) anyMotion = true;
      if (/motion-(safe|reduce)/.test(cls)) anyReduced = true;
    });
    if (/prefers-reduced-motion/.test(src)) anyReduced = true;
  }
}

/* ---------- project-level checks ---------- */
if (anyMotion && !anyReduced) add('error', 'reduced-motion', target, 1, 'animation present, no prefers-reduced-motion handling', 'wrap motion in @media (prefers-reduced-motion: no-preference) or add a reduce override', 'Motion that ignores the OS setting can make people ill.');
const lostFocus = findings.filter(f => f.id === 'outline-none').length;
if (lostFocus && !anyFocusVisible) findings.filter(f => f.id === 'outline-none').forEach(f => (f.sev = 'error'));
if (hoverUngated.length) add('info', 'hover-gate', hoverUngated[0].file, hoverUngated[0].line, `${hoverUngated.length} :hover rule(s) outside @media (hover: hover), first: ${hoverUngated[0].sel}`, 'wrap in @media (hover: hover) and (pointer: fine)', 'Touch devices stick on hover states after a tap.');

const need = { bg: 'bg', surface: 'surface', surface2: 'surface2', ink: 'ink', muted: 'muted', faint: 'faint', accent: 'accent', accentInk: 'accent-ink', rose: 'rose', control: 'control' };
for (const [name, th] of Object.entries(themes)) {
  const t = th.t, need4 = [['ink', 'bg', 4.5], ['ink', 'surface', 4.5], ['muted', 'surface', 4.5], ['muted', 'bg', 4.5], ['faint', 'surface2', 4.5], ['faint', 'bg', 4.5], ['accent-ink', 'accent', 4.5], ['rose', 'bg', 4.5], ['control', 'bg', 3], ['control', 'surface', 3], ['control', 'surface2', 3]];
  for (const [a, b, min] of need4) if (t[a] && t[b]) {
    const r = ratio(t[a], t[b]);
    if (r < min) add('error', 'contrast', th.file, th.line, `[${name}] --${a} on --${b} = ${r.toFixed(2)}:1`, `raise to at least ${min}:1`, min === 3 ? 'Control outlines need 3:1 (WCAG 1.4.11).' : 'Text needs 4.5:1 (WCAG 1.4.3).');
  }
  if (t['line'] && t['surface'] && ratio(t['line'], t['surface']) < 3 && !t['control']) add('warn', 'no-control-token', th.file, th.line, `[${name}] --line is ${ratio(t['line'], t['surface']).toFixed(2)}:1 and no --control token exists`, 'derive a --control outline token at 3:1 or more', '--line is for decorative rules; a border that shows where a control is needs 3:1.');
}

/* ---------- report ---------- */
const seen = new Set();
for (let i = findings.length - 1; i >= 0; i--) { const k = [findings[i].id, findings[i].where.split(':')[0], findings[i].before].join('|'); if (seen.has(k)) findings.splice(i, 1); else seen.add(k); }
const order = { error: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.where.localeCompare(b.where));
const count = s => findings.filter(f => f.sev === s).length;
if (asJson) { console.log(JSON.stringify({ scanned: files.length, findings }, null, 2)); }
else {
  const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  console.log(`# Bhookmark audit: ${target}\n\nScanned ${files.length} file(s). ${count('error')} error, ${count('warn')} warning, ${count('info')} info.\n`);
  if (findings.length) {
    console.log('| Sev | Where | Before | After | Why |\n| --- | --- | --- | --- | --- |');
    for (const f of findings) console.log(`| ${f.sev} | ${cell(f.where)} | \`${cell(f.before)}\` | ${cell(f.after)} | ${cell(f.why)} |`);
  } else console.log('No mechanical findings.');
  console.log(`\n## Not automated: review these by hand or with a model\n
- Layout: is it a document stacked top to bottom, or a stage? Are layout families repeated? Any centered hero or row of three equal cards?
- Hero: eyebrow, headline, one sentence, one or two buttons, and nothing else?
- Type roles: serif only for the hero string, mono for small labels and figures, never serif for numbers.
- Say every name once per card. Essential content opaque. Photography or evidence leads.
- Motion feels intentional: durations match the action, springs only where they earn it.
- Anything the mechanical pass cannot see: real copy, real imagery, real data.\n`);
}
process.exit(count('error') ? 1 : 0);
