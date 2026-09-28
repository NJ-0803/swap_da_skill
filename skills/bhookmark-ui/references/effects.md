# Effects: animated headings, border beam, thinking orb

Optional add-ons in `assets/effects/`. Zero dependencies, plain HTML, follow the active theme through
its tokens, stop under `prefers-reduced-motion`. Demo: `assets/examples/effects-demo.html`.

## Animated headings

`text-effects.css` + `text-effects.js`. Any heading, any font.

| Style | Motion | Cost |
| --- | --- | --- |
| `breathe` | whole heading dims and brightens on a loop (opacity 0.5 to 1 to 0.5 over 3.6s) | opacity |
| `wave` | the same, letter by letter, so a wave of brightness runs through the word | opacity |
| `reveal` | letters rise and un-blur once, in sequence (replays each time a hidden section is shown) | transform, opacity |
| `shimmer` | a bright band sweeps across the text | paint (text clip): use on one heading |
| `gradient` | a still ink-to-rose fill | none |

```js
TextFx.apply(document.querySelector('h1'), 'breathe');
TextFx.apply(el, 'wave', { duration: '4s', font: '"Bricolage Grotesque", sans-serif' });
```
Or from the product manifest, no code: `heading: { style: 'breathe', sections: 'reveal', font: '...', fontHref: '...' }`.
`font` sets `--font-display`, so every display heading changes together; `fontHref` is a stylesheet URL.
A company that cares about privacy should self-host the font instead of linking Google Fonts.

**Contrast at the dim point.** A dimming heading is only readable if its dimmest moment still passes.
Measured for ink over the page background: opacity 0.5 gives 4.7 to 4.9:1 in the Evening skins (passes)
but 3.1 to 3.6:1 in the Daylight skins (fails 4.5:1). So `--fx-min` is 0.5 in Evening and 0.68 in Daylight
(5.3 to 6.7:1). Do not lower it. Measured, not assumed: breathe cycles 0.50, 0.75, 1.00, 0.75, 0.50, and
`wave` letters sit at different phases at the same instant (1.00 down to 0.84).
Letter styles keep the full text as the accessible name and hide the pieces from screen readers.

## Border beam

`border-beam.css` + `border-beam.js`. A light that travels around an element's border.
```js
BorderBeam.apply(el);                                              // any element; adds a ring, never overrides position:absolute
BorderBeam.apply(btn, { duration: '3s', a: 'var(--rose)', b: 'var(--accent)' });
```
Manifest: `effects: { beam: ['.buy aside.card'] }` (CSS selectors). The mask is static and only the light
rotates (transform), so it stays on the GPU. Made for wide elements; add `beam--tall` for narrow ones.
Reduced motion shows a still, quiet accent. Use it on the one thing you want looked at, not on everything.

## Thinking orb

`orb.css` + `orb.js`. States `idle`, `thinking`, `listening`. Follows the theme via `--surface`, `--accent`, `--rose`.
```js
Orb.mount(el, 'thinking');  Orb.set(el, 'listening');  Orb.level(el, 0.7);   // level: 0..1, drive it from audio
```
Only transform, rotate and opacity animate. The orb has no text, so announce state changes in an
`aria-live` region yourself (the demo does). Size with `--orb-size`.

## Should you use Animate.css?

Checked on the real file (v4.1.1, MIT). I could not read the DigitalOcean tutorial: the page came back as
navigation only. This verdict is about the library, not the tutorial.

| Check | Result |
| --- | --- |
| Size | 71.7 KB minified, 5.3 KB gzipped (95 KB unminified); 97 keyframes |
| What the keyframes animate | only `transform`, `opacity`, `visibility` (plus `transform-origin`, `backface-visibility`): compositor-friendly |
| `audit.mjs` | 0 errors; 2 warnings, both `ease-in`, only in exit and flip animations (`flip`, `flipInX/Y`, `lightSpeedOut*`, `fadeOutBottomLeft`) |
| Reduced motion | handled: `@media print, (prefers-reduced-motion: reduce)` cuts durations to 1ms |
| Default duration | 1s (`--animate-duration`). Too slow for a response to a tap; fine for an entrance |

**Verdict:** technically safe, and not needed. About a third of it is playful (bounce, shake, jello, wobble,
rubberBand, tada, heartBeat) and fights a premium tone. If you want it, use a handful of entrances
(`fadeIn`, `fadeInUp`, `fadeInDown`, `slideInUp`) and set `--animate-duration: 500ms`. Our engine and
`TextFx` already cover what a product page needs, without a dependency.

## The React libraries (border-beam and thinking-orbs)

From the repo `Jakubantalik/border-beam` (libraries.dev): seven React libraries. Verified from its README:
packages `border-beam` and `thinking-orbs`, React 18 or newer, zero other runtime dependencies, MIT
("use them anywhere, including commercial work"), with Pro content (Studio exports, Pro presets and recipes)
licensed separately by plan. `thinking-orbs` is described as nine loading states for AI interfaces; I could not
confirm the state names or the props.
```tsx
import { BorderBeam } from "border-beam";
<BorderBeam><button>Get started</button></BorderBeam>
```
I did **not** install or run either, and I did not copy their code. What is in `assets/effects/` is my own
implementation of the same idea. Use the React packages inside a React app if you want their tuned presets
(unverified by me); use ours for plain HTML, for zero dependencies, or when the effect must follow these tokens.
If you ship the React ones, keep the MIT notice and do not bundle the Pro content without the licence.
