# Two habits every animated piece follows

Learned from studying the render loops of a developer portfolio site (see `acquired-patterns.md`), then built in and measured here.

## Capped pixel density

**What it means.** A screen has two sizes: the CSS size (a 420 px box) and the number of physical dots inside it. A phone at
"3x" packs 3 by 3 dots into every CSS pixel, so a canvas drawn at full density has nine times the pixels of the same canvas on a
plain screen, and every one of them has to be computed 60 times a second. The extra sharpness on a *soft, blurry glow* is
invisible; the cost is a hot phone and a dropped frame rate. Capping means: draw at `min(the screen's density, a limit)` and never more
than a total pixel budget, then let the browser scale it up.

**Measured on `object-shader.js`** (a 420 px orb): on a 3x screen it draws a **630 by 630** canvas, not 1260 by 1260. That is
397,000 pixels instead of 1,588,000, four times fewer, and the orb looks the same.

| Backend | How it caps |
| --- | --- |
| `object-shader.js` | `maxDpr` (default 1.5) and `maxPixels` (default 1.2 million), whichever bites first |
| `object-glb.js` | `maxDpr` (default 1.75) and a 4.5 million pixel ceiling on the whole canvas |
| `object-frames.js` | decoded frame width is capped at about 2.5x the box at up to 2x density; it only ever shrinks a frame, never enlarges one. `frames.maxWidth` tightens it |
| `object-extrude.js`, `object-orbit.js` | not canvas: the browser draws vector shapes at native density, so there is nothing to cap |

## Honouring reduced motion

**What it means.** Operating systems have a setting, "Reduce motion" (macOS, iOS, Windows, Android), that a person turns on because
large or constant movement makes them dizzy, nauseous or unable to focus (vestibular disorders, migraines) or simply because they find
it distracting. Browsers pass it to pages as `prefers-reduced-motion: reduce`. Honouring it means: **the page stops moving on its own.**
It does not mean the page stops working: buttons still act, sections still swap, colour can still change. Only motion that travels,
loops, zooms or spins goes still.

What each part does when it is on:

| Part | Behaviour |
| --- | --- |
| Stage (`stage-engine.js`) | no fly-through and no zoom; only the card in focus shows, crossfading; the object snaps to each pose; no floating |
| `object-shader.js` | one calm frame, then **nothing**: 1 draw and a clock frozen at 6, measured. It redraws only if you resize, switch theme or turn it |
| `object-orbit.js` | the chips hold still |
| Headings (`text-effects.css`) | plain, fully visible text; no breathing, no wave, no reveal |
| Border beam, thinking orb, flow diagram | a still accent, or no animation |
| Sections and buttons | animations shrink to a hair's breadth; state changes stay instant |

**How to check it.** macOS: System Settings, Accessibility, Display, Reduce motion. Chrome DevTools: Rendering, "Emulate CSS media feature
prefers-reduced-motion". Headless: `--force-prefers-reduced-motion`. `audit.mjs` flags any project that animates without handling it.

## Also built in

Pause when offscreen (`IntersectionObserver`) or the tab is hidden; survive a lost WebGL context; obey `window.__motionScale` so
`motion-debug.js` can slow everything; a soft fallback when WebGL is missing.
