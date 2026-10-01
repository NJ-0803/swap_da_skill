---
name: swap-da-skill
description: >-
  A design system and website kit. Warm burgundy Evening/Daylight themes (or any company theme), Instrument Serif + Inter type, soft-cornered cards, spring motion, a pinned 3D stage, and a sidebar shell of blocks. FIRST classify what is being made: a product/launch page (showcase), a person's portfolio, a single-task tool like a price checker, or a daily app like a vocabulary game; then build from that kind's example. Modes: BUILD (style any UI to match this look, or when asked to "use swap da skill"), SITE KIT (build a whole site from one manifest), AUDIT (review a project against the rules; report before changing anything), DEBUG MOTION (slow-motion, pause, frame-step). Trigger on: make a website, landing page, portfolio, product page, tool, app, dashboard, like <some site>, audit, redesign, slow the animation, why is this janky.
---

# Swap da Skill

The default look of this kit. Mature, warm,
premium. Burgundy on warm graphite, never cold grey and **never gold, saffron or amber**.

Two themes, `evening` (default, dark) and `daylight` (light). They are not "dark mode" and "light
mode" bolted on — both are first-class and both ship measured contrast.

## Start here: which kind of site is this?

Classify before building, say the kind and the reason in one line, and ask at most two questions and only if it is truly unclear.
Full guide: `references/archetypes.md`.

| Kind | It is | Stage | Sections | Start from |
| --- | --- | --- | --- | --- |
| **showcase** | one thing to admire and buy (product, launch) | on, long | Overview, Specs, Compare, FAQ, Buy | `assets/examples/aster-one/` |
| **portfolio** | a person or studio and their work | on, short | Work, Stack, Contact | `assets/examples/portfolio/` |
| **tool** | one job, done on the first screen (a price checker) | **off** | Find, Saved, About | `assets/examples/tool/` |
| **app** | a daily product with progress (a learning game) | **off** | Today, Practice, Library, Settings | `assets/examples/app/` |

Decide by asking: who arrives and why; must the first action work on the first screen (then no stage); how often do they return
(daily means no stage, ever); is there one thing to admire (that is the hero object; a set of things is `orbit`; nothing is no object).
Judge what a named site *is*, not how it looks: A learning game looks like a game and is an app; a price checker looks like a shop and is a tool.
Docs, blogs and catalogues are none of these: use plain Build mode. Then write a short **site brief** (see the guide), and build.

**A default build has no optional extras.** Workflow pages, Archify diagrams, animated headings, border beams, orbs, and frame, model or shader heroes
are added only when the owner asks for them (`references/archetypes.md`, "Optional features"). Never add one to make a site look fuller.

## Tokens

Declare as RGB channels on `:root` so opacity modifiers work (`rgb(var(--ink) / 0.6)`).

| Token | Evening | Daylight | What it is |
| --- | --- | --- | --- |
| `--bg` | `21 20 18` #151412 | `243 238 231` #F3EEE7 | page, warm graphite / ivory |
| `--surface` | `35 33 31` #23211F | `255 252 248` #FFFCF8 | cards, espresso / paper |
| `--surface2` | `45 42 39` #2D2A27 | `233 225 215` #E9E1D7 | raised or inset areas |
| `--line` | `58 53 49` #3A3531 | `220 210 198` #DCD2C6 | **decorative** rules only |
| `--ink` | `243 238 231` #F3EEE7 | `35 30 26` #231E1A | body text |
| `--muted` | `189 179 169` #BDB3A9 | `90 80 72` #5A5048 | secondary text |
| `--faint` | `157 148 139` #9D948B | `100 90 81` #645A51 | tertiary, still ≥4.5:1 |
| `--accent` | `142 51 64` #8E3340 | same | burgundy: buttons, emphasis |
| `--accent-ink` | `243 238 231` | same | text on burgundy |
| `--accent-dim` | `52 29 33` #341D21 | `242 222 224` #F2DEE0 | burgundy wash |
| `--rose` | `216 156 164` #D89CA4 | `142 51 64` (burgundy) | links, accent text |
| `--bad` | `229 138 146` #E58A92 | `161 45 56` #A12D38 | errors |
| `--bad-dim` | `50 26 29` #321A1D | `248 226 227` #F8E2E3 | error background |
| `--scrim` | `8 7 6` | `35 30 26` | overlays |
| `--control` | `128 118 108` | `135 123 111` | **control outlines**: input, secondary button, toggle, zone selector. Measured 3.2–4.1:1 on bg, surface and surface2 in both themes |
| `--etch` | `226 168 176` | same | highlight lines on a dark object (leather, screen, metal). `--rose` flips to burgundy in Daylight and vanishes on dark |

Shadows:

```css
/* evening */
--shadow-card: inset 0 1px 0 rgb(255 255 255 / 0.05), 0 16px 36px -20px rgb(0 0 0 / 0.7);
--shadow-float: 0 50px 100px -30px rgb(0 0 0 / 0.85), 0 22px 44px -26px rgb(142 51 64 / 0.35);
/* daylight */
--shadow-card: inset 0 1px 0 rgb(255 255 255 / 0.8), 0 14px 32px -20px rgb(60 40 30 / 0.28);
--shadow-float: 0 44px 90px -30px rgb(60 40 30 / 0.4), 0 20px 40px -26px rgb(142 51 64 / 0.22);
```

Measured contrast to preserve — Evening: ink/bg 15.9, muted/surface 7.8, faint/surface2 4.8,
rose/bg 8.1, ivory/burgundy 6.7. Daylight: ink/bg 14.3, muted/surface 7.7, faint/surface2 4.6,
burgundy/bg 6.7.

**`--line` fails 3:1 as a control outline** (about 1.3–1.6:1 against its own surface). It is for
decorative rules. Any border that shows *where a control is* — input, select, fieldset, secondary
button, drop zone — needs its own token at ≥3:1 on every surface it sits on (WCAG 1.4.11). Derive
one per theme and check it rather than reaching for `--line`.

## Type

- **Instrument Serif** — the hero string only: the product name, wordmark or headline
  elsewhere. Never boxed, allowed to wrap, never used for dense text or for numbers in a table.
- **Inter Tight** — headings.
- **Inter** — body and every control.
- **IBM Plex Mono** — small uppercase labels, used sparingly, and tabular figures.
- Metadata sits at 13–16px. Cap weight at 600: no bold, extrabold or black.

Load fonts with `<link>` tags in the HTML head, never `@import` inside a bundled stylesheet — a late
discovery loses the race on a real network and the page lands on system fallbacks. **If the product
is privacy-sensitive or public-facing, self-host the woff2 instead**: a Google Fonts request tells a
third party who visited. Keep a real system stack in every `font-family` as the fallback.

## Cards and surfaces

- 20–24px corners, `--shadow-card`, a subtle 1px top edge highlight.
- Photography leads where there is any. Fallback is a fine-line category illustration — never
  monograms, initials, or a different subject's photo.
- Say a name once per card, then its secondary detail; do not repeat the name.
- Essential content is opaque. Transparency is for decorative glass only.

## Motion

- Tap: compress plus ripple.
- Open: shared-layout lift, ~300–450ms spring with a small overshoot, background recedes to 0.96,
  a brief reflection, then it goes still so the content can be read.
- Everything inside `@media (prefers-reduced-motion: no-preference)`; honour reduced motion.

## Modes

| Mode | When | Read |
| --- | --- | --- |
| Build | styling or restyling a UI | this file |
| Site kit | building any whole site: showcase, portfolio, tool or app | `references/archetypes.md` first, then `references/site-kit.md`. Five hero-object backends: extrude, frames (WebP), glb, orbit, shader. Ideas queue: `references/acquired-patterns.md` |
| Audit | "audit", "review", "redesign", an existing project | `references/audit.md`; run `assets/audit.mjs`; report first, edit only after the user picks |
| Debug motion | "slow it down", "why is it janky", "the animation feels off" | `references/motion-debug.md`; `assets/motion-debug.js` |
| Effects (opt-in) | the user asks for animated or unusual headings, a border beam, a thinking orb, or "should I use animate.css" | `references/effects.md`; `assets/effects/` |
| Diagrams (opt-in) | **only when the user asks** for an architecture, workflow, sequence, data-flow or lifecycle diagram, or for a visitor-facing "how it works" page | `references/diagrams.md`; the Archify skill (installed separately, not required by the kit); the `diagram` block |
| Render habits | "why does it stutter on phones", pixel density, reduced motion | `references/render-habits.md` |

## Themes

`assets/swap.tokens.css` is the default burgundy identity. `assets/themes/midnight.tokens.css`
is a full black-and-blue skin (gradient-led) proving the system re-skins for another brand.
Both include object and full-screen gradient tokens, so a theme changes the whole page, not just
buttons. The burgundy and no-gold rules are the default identity; another theme keeps only the
contrast floor, 44px targets and motion rules.

## What stays constant across themes (the signature)

Colour and typeface belong to the theme and can be swapped completely. These belong to the kit and do not:

1. **Structure.** A pinned stage that hands off to a sidebar shell; content moves through depth. Never a page of stacked sections.
2. **Motion feel.** Press compresses to 0.97 with a ripple; things open by growing from where they were and close by shrinking back; ease-out on entrances; everything stops under reduced motion.
3. **Shape.** 22px cards and 14px controls with a soft top-edge highlight, opaque essentials.
4. **Evidence first.** Lead with what the visitor came to check; say a name once per card; label unknown or demo values honestly.
5. **The floor.** Text 4.5:1, control outlines 3:1, targets 44px, focus always visible.

## Layout: a stage, not a document

Do not lay a page out as sections stacked down the screen with nicer cards. For a showcase or portfolio the
composition is a **pinned stage** (a tool or app skips it and goes straight to the shell): one viewport, scroll drives a timeline, content lives at
different depths, one hero object turns to keyframed poses. Read `references/stage.md` before
building any marketing, product, portfolio or showcase page; the engine is
`assets/stage-engine.js`. Four patterns, all general:

1. **Not vertical.** Chapters with different layout families, each used once. No centered hero,
   no row of three equal cards.
2. **Immersive object.** CSS 3D (`perspective` + `preserve-3d`), a 2D silhouette extruded by
   stacking slices, floating in and out on Z, pointer parallax and drag.
3. **Depth cards.** Facts fly through the space beside the object at different depths. They
   pass by; they never orbit.
4. **Focus and lock.** Clicking a part seeks the timeline; the object turns to it and holds
   still with that part locked on screen. Also: a card opens into its detail by growing, and
   closes by shrinking back.

Use the ordinary layout for forms, settings, dashboards, docs and anything read at length.

## Rules that outrank looking good

- Accessibility is not traded for the palette. Every text pair ≥4.5:1, control outlines ≥3:1, focus
  always visible, targets ≥44px. If a token would break one of these in a new context, derive a
  variant and check it — do not ship the failing pair.
- A newer brief from the owner of the design system beats this file: update this skill when one arrives.

## Porting to a non-food product

Keep the palette, the corner radius, the shadows and the type roles. Re-map the *content* roles
honestly rather than literally:

- Instrument Serif goes to the product wordmark or page headline, not to data.
- Numbers belong in IBM Plex Mono or an Inter stack with `font-variant-numeric: tabular-nums`; a
  serif is the wrong tool for a column of figures.
- "Photo-led" becomes "evidence-led": lead the card with the thing the user came to check.
