# Site kit: one manifest, any kind of website

`assets/site-kit.js` builds a whole site from `window.SITE`. Nothing in it knows whether the site is a product
launch, a portfolio, a search tool or an app: the manifest decides. **First decide the kind** (`archetypes.md`).

```
assets/<tokens>.css           brand layer: colours, fonts, radii, shadows. bhookmark.tokens.css or themes/*.css. Swap to re-skin.
assets/site-kit.css           structure: stage, HUD, sidebar shell, every block
assets/stage-engine.js        scroll-driven pinned 3D stage, and the in-page hero object
assets/site-kit.js            builds the page from window.SITE (or a legacy window.PRODUCT)
assets/object-*.js            hero object backends: extrude, frames, glb, orbit, shader
assets/effects/*              animated headings, border beam, thinking orb (optional, see effects.md)
assets/examples/<kind>/       a complete example per kind: index.html + site.js
```

Start: copy `examples/<kind>/`, edit `site.js`, keep the assets, open `index.html`. Load only the object backend you use.

## Two parts, either optional

**Act 1, the stage** (`stage.enabled`, on by default for showcase and portfolio): a pinned cinematic opening. Hero,
depth cards, focus-and-lock parts, an outro. **Act 2, the shell** (always): a sidebar (bottom bar on phones) whose items
swap sections in place; each section is a list of **blocks**. Tools and apps have only Act 2, with an in-page `hero` block
on the first section. Deep links work (`#work`, `#saved`).

## The manifest (`window.SITE`)

| Field | Notes |
| --- | --- |
| `kind` | `showcase`, `portfolio`, `tool`, `app` or `custom`. Sets the default for `stage.enabled` only; everything else is yours |
| `brand`, `name`, `title`, `eyebrow`, `tagline` | text, escaped |
| `cta` | `{label, section}` for the persistent header button, or `null` |
| `heading` | `{style, sections, font, fontHref}`: see `effects.md` |
| `effects` | `{beam: [css selectors]}` |
| `object` | the stage's hero object: `{type, box, subject, hero:{yaw,pitch,swing}, ...}` or omit for none. `type`: `extrude` (default), `frames`, `glb`, `orbit`, `shader` |
| `stage` | `{enabled, heroActions:[{label, action}], cards:[{label,value,note}], cardsLabel, parts:[...], partsHeading, partsLead, partsLabel, outro:{heading,lead,primary,primaryTo,secondary,secondaryTo}}`. `action` is `part:N`, `section:id` or `seek:F` |
| `shell` | `{menuLabel, replayLabel, items:[{id, label, icon, blocks:[...]}]}` |
| `footnote` | small print at the foot of the shell |

Icons for `items` and `tiles`: overview, specs, compare, faq, buy, work, stack, contact, search, saved, bell, info, flow, star.

## Blocks

| Block | Fields | For |
| --- | --- | --- |
| `hero` | `eyebrow, heading, accent, lead, actions:[{label,section}], object, hint, objectLabel` | an in-page hero with an optional draggable object (tools, apps) |
| `prose` | `kicker, heading, paragraphs` | plain text |
| `lead` | `kicker, heading, paragraphs, aside:{rows, price, cta}` | text with a key-facts card |
| `specs` | `groups:[{group, rows:[[k,v]]}]` | grouped facts |
| `compare` | `cols, rows, highlight` | a comparison table |
| `faq` | `items:[{q,a}]` | native accordions |
| `buy` | `options:[{label,price}], links, notes, currency, pickTitle` | options, a live price, buy links |
| `timeline` | `items:[{when,title,org,points,chips}]` | experience, history, roadmap |
| `work` | `items:[{title,year,text,tags,href}], style:'rows'\|'cards'` | projects, case studies |
| `chips` | `groups:[{name, items}]` | a stack, skills, tags |
| `flow` | `nodes:[{label,aside}], note, lead` | **optional**: a "how it works" page, when the visitor benefits from seeing a process |
| `contact` | `heading, lead, buttons:[{label,href,primary}]` | the closing call |
| `list` | `items, id, itemsFrom, filter, sort:'asc', save, savedOnly, placeholder, suggestions, empty` | search, filter, sort, star: the app block |
| `stats` | `items:[{label,value,note}]` | your numbers |
| `tiles` | `items:[{icon,title,text,section\|href}]` | doors into other sections |
| `diagram` | `src, title, height, caption, lead` | **optional, on request**: an Archify diagram in a sandboxed frame (see `diagrams.md`). Nothing in the kit loads Archify unless a site uses this block |
| `html` | `html` | escape hatch; trusted markup |

`list` shares data: give the first `id: 'shoes'` and the second `itemsFrom: 'shoes'` with `savedOnly: true`. Saved items live in
`localStorage` for this site only. Links are sanitised to http(s), mailto, tel and relative. **Add a block** by adding one function to
`BLOCKS` (returns markup) and, if it needs behaviour, one to `INIT`; nothing else changes.

## Themes: swap one file

`assets/bhookmark.tokens.css` is the burgundy Bhookmark skin. `assets/themes/midnight.tokens.css`
is a second, complete skin: black and electric blue, with the gradient carrying the whole screen.
Link one **instead of** the other; nothing else changes. Both files define the same roles.

A theme skins more than buttons. Besides the usual colour tokens it sets:

| Token | What it controls |
| --- | --- |
| `--stage-bg`, `--shell-bg`, `--side-bg` | the full-screen gradients of the stage, the details shell and the rail |
| `--obj-rim`, `--obj-core` | frame colours of the hero object |
| `--obj-screen-a/b/c`, `--obj-back-a/b` | the object's face gradients (RGB triples, used with `rgb(var(...))` in the manifest) |
| `--etch` | highlight lines on the dark object |

Midnight's contrast was checked two ways: `audit.mjs` on the token pairs (0 findings), and by
sampling real rendered pixels behind muted text (8.6 to 11.1:1, worst case at the gradient's
brighter middle). The brightest blue stop is kept away from text on purpose: muted text placed
directly on it would fall to about 4.5:1 and faint text to 3.4:1. Keep text off the bloom.

The Bhookmark *identity* rules (burgundy, no gold) apply to Bhookmark's own apps. A company's
theme replaces them; only the contrast floor, target sizes and motion rules carry over.
`audit.mjs --config` takes the company's own brand rules.

## Object backends

Every backend implements `Backend.mount(el, spec) -> { flat, delegate, onPose? }`; `site-kit.js` picks one
from `object.type`. Load the matching script before `site-kit.js`.

| Backend | Script | `object.type` | Use it for |
| --- | --- | --- | --- |
| Extruded outline | `object-extrude.js` | omit (default) | phones, slabs, packaging, simple silhouettes; no assets needed |
| Frame sequence | `object-frames.js` | `'frames'` | **a company's own render**, exported as a turntable |
| GLB (three.js) | `object-glb.js` | `'glb'` | real geometry with live lighting; crisp at any zoom; three.js is fetched on demand |
| Shader | `object-shader.js` | `'shader'` | a procedural glowing orb from about 4 KB of WebGL: no model, no images. Theme-coloured. Spec: `shader: { maxDpr, maxPixels, speed, still }` |
| Orbit | `object-orbit.js` | `'orbit'` | no model at all: labelled chips on tilted rings (skills, integrations, words). Positions are projected in JS, so no depth-sort artefacts; honours reduced motion. Spec: `orbit: { rings: [{ r, tiltX, tiltZ, speed, items: ['PY','TS'] }] }` |

### Frame sequence: how a company plugs in its render (WebP, with a loader)

1. Export N frames of the product turning through 360 degrees (Blender, Keyshot, C4D, or a
   photographed turntable), transparent background, named `f_00.png` ... `f_29.png`.
2. Point the manifest at them:
```js
object: { type: 'frames', box: [520, 720], subject: [260, 520], hero: { yaw: -24, pitch: 0, swing: 22 },
          frames: { count: 30, src: 'frames/f_{n}.png', pad: 2 } }
```
   `box` is the frame size in CSS px; `subject` is the product's own size inside it (fit and floor
   use that).
3. Set each part's `pose` for the frame view (see the rules below).

To generate frames from anything that can draw the object at `?yaw=`, use the bundled tool. The
bundled `turntable.html` draws the extruded model, which is how the demo was made:
```
node render-turntable.mjs --page=turntable.html --out=frames --count=30 --size=520x720 --scale=1.25
```
It writes transparent PNGs via headless Chrome (needs Chrome; set `CHROME=` to override the path;
Chrome cannot lay out narrower than 500px, so the tool enforces that).

**Rules for the frame backend (each one was hit while building it):**
- **Yaw picks the frame; pitch is ignored.** It is a turntable. Dragging the object still spins it.
- **Hold yaws must be multiples of 360 / count** (12 degrees with 30 frames). Between frames the
  backend cross-fades neighbours; a hold that lands between two frames freezes a double image.
- **Anchors (`ax`, `ay`) are where the feature appears in the frame at that yaw**, in px from the
  frame centre, not model coordinates. Work them out by looking at the frame, or by projecting the
  model point through the yaw.
- Frames load coarse to fine (about every 5th, then every 3rd, then the rest) and decode off the main thread, so a rough turntable works after a handful of files. A thin line at the top of the stage shows progress and fades when done (`object.loader: false` turns it off). It cross-fades only when both neighbours are loaded; until then it shows the single nearest loaded frame.
- No per-part glow overlay (that needs geometry). Highlight with the HUD instead.
- Weight: 30 PNGs at 650x900 were 3,880 KB; as WebP (`render-turntable.mjs` default when `cwebp` is installed) 396 KB, about 90% smaller, alpha kept. Decoded size is still about 70 MB, so set `frames.maxWidth` to cap it on phones.

### GLB model: how a company plugs in a real model

```js
object: { type: 'glb', box: [260, 520], hero: { yaw: -24, pitch: -4, swing: 22 },
          glb: { src: 'model.glb', height: 520, poster: 'poster.webp', maxDpr: 1.75, exposure: 1.05 } }
```
Load `object-glb.js` in place of the other backends. three.js and its GLTF loader load on demand from a CDN by
dynamic `import()`, so pages that do not use this backend never download it; override `glb.three` with your own
URLs to self-host. `height` scales the model's bounding box to that many box pixels, so poses use the same numbers
as the extruded backend. Anchors are model-space points from the model's centre with **y down** (like CSS) plus
`az` for depth (positive toward the front): the camera-module anchor for the demo phone is `ax: 48, ay: -178, az: -26`.

Because the backend renders itself, zoom is crisp: it moves the model, not a bitmap. Behaviour worth knowing:
- Pixel ratio is capped and total pixels are capped; it renders **only when the pose changed**, and pauses when the
  canvas is offscreen or the tab is hidden.
- If WebGL is unavailable, the model is missing, or the context is lost, it hides the canvas, keeps the poster image and
  fires an `object-error` event with the reason. Tested: a 404 model and a no-WebGL browser both left the page working.
- It loads the same `frames-progress` event as the frame backend, so the top loading line works for models too.
- The demo model (`aster.glb`, made by `make-glb.html` with three's exporter) is 1.9 MB. That is heavy. **Not done:**
  Draco or Meshopt geometry compression and WebP or KTX2 textures. A real product needs them before shipping.

## What the buyer supplies

Their tokens (replace `bhookmark.tokens.css`, keep the roles and the contrast floor), their copy,
and the object (an outline for the extruded backend, or a frame sequence).

## Legacy product manifests

`window.PRODUCT` (the format of `examples/aster-one`) still works: `site-kit.js` converts it to a `showcase` SITE. New sites should write `SITE`.

## Honest status

Checked in headless Chrome: all four example sites load with no JS errors. Showcase (Aster One, three backends), portfolio (orbit hero,
timeline, chips, flow, contact), tool (search "court" gave three results lowest first with a working star and saved tab; shoebox from the
extrude backend) and app (Today dashboard: orbit, stats, tiles). The frame backend was checked end to end; the GLB backend in real
Chrome with WebGL, including a missing model and no-WebGL browser.

**Not checked:** the motion at real speed, Safari and Firefox, 390px on the new examples, screen-reader passes, touch drag, a frame
sequence from a real renderer, a GLB from a real modelling tool. The example data is invented and there is no real backend behind `list`:
a real tool supplies its own data and fetching.

**Still needed before a company could adopt this:**
1. A pre-render step so the HTML exists without JavaScript (SEO, link previews).
2. Compressed GLBs (Draco or Meshopt, WebP textures), a procedural shader backend (see `acquired-patterns.md`), AVIF or sprite-sheet frames.
3. A manifest JSON schema with validation and readable errors.
4. Analytics hooks (section reached, part opened, save, buy click).
5. Measured evidence: Lighthouse and Web Vitals budgets, before/after on a real page.
6. i18n and right-to-left support.
