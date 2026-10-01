# Patterns acquired from a developer portfolio site

Studied on 2026-09-28 by loading the live page, scrolling it, and reading its public network requests and
JavaScript bundles for library names and techniques. **Ideas only. No code, shader or asset was copied.**
The site belongs to its author; this is a study of what it does, not a template.

## What it actually is (a correction)

A common assumption is Framer Motion plus three.js. The evidence says half of that:

| Claim | Evidence |
| --- | --- |
| Framer Motion | Yes, by API: `whileInView` (12), `useScroll`, `useSpring` (16), `useTransform`, `layoutId` (21), `AnimatePresence`, 76 motion-value references. The package name itself is minified away. |
| three.js | **No.** Across all 17 chunks (980 KB raw, 272 KB transferred) there is no `WebGLRenderer`, `ShaderMaterial`, `GLTFLoader`, `@react-three`, `useFrame` or `REVISION`. The single match for "THREE" is a fictional boot-screen line, `(C) 1987 THREEUI`. |
| 3D models, images | None. 21 requests total: code, fonts, one manifest. No GLB, no PNG, no WebP. |
| What the effects are | **Hand-written raw WebGL shaders**, 4 to 23 KB each. A full three.js import is far larger than all of them together. |

So the site is a study in *tiny procedural effects*, not in loading models. That matters for the plan below.

## What is on the page

1. **CRT boot intro**: green phosphor, scanlines, curved screen, typewriter text. The shader exposes scan, grille, triad, chroma, curve, flicker, grain, halo and vignette controls.
2. **Hero**: orbiting tech icons on ellipses, an "energy orb" shader, a headline with a drawn underline, an inline pill of rolling words, a CTA with a travelling border light, a huge ghost wordmark, floating contact buttons, a custom cursor canvas.
3. A logo **marquee**, an **experience timeline** with a rail that fills as you scroll, an **animated flow diagram** (pipeline nodes light in sequence with travelling dots), project rows, chip lists.
4. **"The stack behind it"**: a WebGL canvas with a pointer-driven dissolve ("move to dissolve, click to pull it in"), using ping-pong textures.
5. A thin **scroll-progress line** across the top.

It is a normal vertical document with reveal-on-scroll. Jumping down the page shows large blank regions until content reveals.

## Render-loop habits worth copying (adopted)

| Habit seen in the bundle | Now in this skill |
| --- | --- |
| Caps and reads `devicePixelRatio`, `ResizeObserver` | capped density in the shader, GLB and frame backends: see `render-habits.md` (measured) |
| `IntersectionObserver` and `visibilitychange` around loops | `object-glb.js` pauses when offscreen or the tab is hidden |
| `prefers-reduced-motion` in 7 files | already an engine rule; every new piece honours it |
| Small canvases sized to their box | GLB canvas is viewport-sized but transparent and `pointer-events: none` |
| **No `webglcontextlost` handling (a gap)** | `object-glb.js` handles lost and restored contexts and falls back to a poster |

## Ideas queue (not built yet), by value

1. **Procedural shader backend** (`object-shader.js`, BUILT): raw WebGL, about 4 KB, zero assets. A glowing orb or energy field as the hero object or the stage background, for products with no model or render. This is the biggest thing the site proves is cheap.
2. **Scroll progress line** and a **filling timeline rail**: trivial, high polish.
3. **Sliding active pill** in the sidebar (shared layout): the menu pill glides between items instead of jumping.
4. **Flow diagram component** for "how it works" in Specs: nodes light in sequence with travelling dots.
5. **Orbit layout** for integrations or accessories around the hero object.
6. Inline **rolling-word pill**, drawn **underline**, **marquee** strip, floating **Buy / contact** buttons.
7. **CRT boot intro** as an optional `intro: 'crt'` for technical brands. Wrong for a premium consumer product.

## Do not copy

- Reveal-on-scroll that leaves blank screens when the visitor jumps. The pinned stage does not have this problem.
- Raw WebGL with no context-loss handling.
- Framer Motion itself: it is a React dependency. This skill is dependency-free; a React shop can drive `stage-engine.js` from a hook instead.
