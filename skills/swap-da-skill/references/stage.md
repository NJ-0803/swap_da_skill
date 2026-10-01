# The stage: layout that is not a vertical document

Default web layout is a document: sections stacked top to bottom, prettier each time. This kit does not do that. The default composition is a **pinned stage**: one viewport that stays put while
scroll drives a timeline. Content lives at different depths in one 3D space, a hero object turns to
keyframed poses, and panels fade in and out. Scroll is still the input; the output is a scene.

Engine: `assets/stage-engine.js` (no dependencies, about 200 lines). It knows nothing about
products. Working example: a product page built on it, one hero object plus five facts, three
focusable parts and a four-step timeline.

Vocabulary, so this applies beyond products:

| Word here | Could be |
| --- | --- |
| hero object | a product, device, dish, building, map pin, logo, character |
| actors | facts, features, steps, testimonials, metrics, team members |
| parts | hotspots, regions, ingredients, rooms, components |
| story sheet | any card that opens into a detail view |

## Anatomy

```
#track            tall runway (engine sets height = (length + 1) * 100vh)
  #stage          position: sticky; top: 0; height: 100vh; overflow: hidden
    #camera       perspective: 1100px
      #world      transform-style: preserve-3d        <- NO filter, opacity, overflow, clip-path here
        .rig      moves the hero object in space
          .object the hero object; engine sets rotate / scale / anchor-translate
        .actor    each flies through depth
    .hud          flat overlay: brand, theme toggle, chapter panels, section rail
footer            normal flow, after the track. The only vertical part.
```

Scene time `s` is scroll measured in viewport heights. Everything keys off `s`: poses, actor `at`
times, HUD fade windows. Total scroll is `(length + 1)` screens, so budget it: about 0.5 to 0.7
of a screen per actor, 0.6 per focusable part. Seven to eight screens is the ceiling for a page
this size; more than that reads as a trap, not a tour.

## 1. Not vertical: chapters with different layout families

Borrowed idea, from Taste: a layout family may appear once. The kit's families:

| Chapter | Layout family | Why it differs |
| --- | --- | --- |
| Intro | asymmetric split: text one side, object the other, no centered hero | sets the scene |
| Facts | depth fly-through, alternating sides | many small facts, no grid |
| Parts | focus and lock, object large, text left, controls right | one object, several views |
| Sequence | horizontal pan, flat cards, no rotation | a timeline reads left to right |
| End | plain footer | sources, disclaimers |

Rules:
- Hero: eyebrow, headline, one sentence, one or two buttons. Nothing else. Chips and trust strips
  belong in the facts chapter.
- No centered hero, no row of three equal cards, no split header, no decorative dots, no
  "scroll" cue, no marquee. (Taste's bans; they hold here too.)
- Mobile (under 768px): collapse to one column. Actors centre under the object, controls sit in a
  bottom bar, descriptions inside controls are dropped. The stage still pins.
- Reduced motion: the engine stops the fly-through and crossfades only the focused actor. The
  object snaps to poses instead of easing.

## 2. Immersive object: CSS 3D, not WebGL

Reference: a CSS-3D shoebox (`perspective` + `preserve-3d`, drag to spin) is enough for this; three.js is not needed.
Same technique, three additions.

**Extrude any 2D silhouette by stacking slices in Z.** One `<path>` in `<defs>`, then 25 to 35
slices, each `<svg><use href="#path"/></svg>` at `translateZ(t * depth / 2)`. Give each slice a
colour from `color-mix(in srgb, rim k%, core)` with `k = |t|^3` so the edges are lit and the
middle is deep. Scale the outermost slices down about 5% for a rounded edge. Put the detail lines
on two transparent face layers at `+depth/2 + 0.8` and (mirrored, `rotateY(180deg)`) at
`-depth/2 - 0.8`. Split parts of different widths into separate slabs (a narrow upper on a wide
sole) and the result reads as an object, not a cut-out. 60 layers total is fine on desktop.

**Float in and out of the screen.** The rig adds a slow sine to `translateZ` (about ±110px) plus
a small bob and yaw drift. With `perspective: 1100px` that reads as the object moving toward and
away from the viewer, not bobbing in place.

**Pointer parallax and drag.** Pointer position nudges yaw (±7°) and pitch (±4°); dragging adds
to yaw and eases back on release. Both switch off when the pose has `lock: 1`.

Constraints that bite:
- **Large flat planes the object can turn through** (depth frames, floors, panels) must not share
  the object's `preserve-3d` container. Chrome splits the object's polygons along the intersection
  and draws a diagonal strip. Put them in a sibling container and pass it as `also:` to the engine
  so it gets the same parallax. (Found the hard way; see `motion-debug.md`.)
- A wall built from many large filled planes 2px apart is heavier than needed. Stack thin outline
  rings for the wall and draw one solid cap per side inside the face SVG.
- Any `filter`, `opacity < 1`, `overflow` or `clip-path` on an ancestor inside the 3D chain
  flattens it. Apply those on leaves only. To dim the scene, use an overlay, not a filter.
- Outline glows via `filter: drop-shadow` are fine on SVG leaves.
- Etched or highlighted colour on a dark object needs its own token (`--etch`), the same in both
  themes. `--rose` flips to burgundy in Daylight and disappears on dark leather.

## 3. Depth cards: content lives in the space, it is not laid out

Actors are absolutely positioned at the centre and moved with `translate3d(x, y, z)`. Never
rotate them around the object; that is a carousel. They pass by.

- `flyZ(d)` with `d = s - at`: arrives slowly from about -2000px, dwells near `z = -70`, then
  accelerates past the camera. `flyOpacity(z)` fades in far away and out as it passes.
- Alternate sides (`x = ±min(vw * 0.30, 430)`), stagger `y`, tilt each card 8 to 12° toward the
  centre. Next actor is already visible behind, smaller and blurred up to 3px.
- Cards stay opaque and keep real text. The blur is depth of field, not decoration.
- `visibility: hidden` when faint, so hidden cards are out of the tab order. A `focusin` on an
  actor seeks to its `at` time, so keyboard users are brought to it.
- Depth frames: 6 to 8 rounded rectangles streaming past in `z` sell the travel. Fade them
  before they cross the HUD.

## 4. Focus and lock: click a part, the object turns to it and holds

Poses are keyframes `{ s, x, y, z, yaw, pitch, sc, ax, ay, float, swing, lock }`. Two keys with
equal values are a **hold**. The engine interpolates with smoothstep between keys, then damps
toward the result, so it always eases.

- `ax, ay` is the **anchor**: the point on the object, in the object's own pixels from its
  centre, that the camera locks onto. The engine applies
  `rotateX rotateY scale translate(-ax, -ay)`, so scaling and turning happen around that point
  and it stays put on screen. That is what makes the object appear to "stand fixed into" a part.
- A far side is just a bigger yaw (190° shows the back face). Continue forward past 360° when
  leaving; do not unwind.
- **Scroll is the timeline; buttons are seek handles.** A part button calls `seek(centre)`,
  which smooth-scrolls there. The wheel and the button drive the same thing, so there is no
  second state to keep in sync. The active part is the nearest centre; set `aria-pressed` and
  the highlight class from that.
- `lock: 1` in a hold turns off parallax and drag: the object stands still and the part reads.

## 5. Story sheet: the card itself grows

Not a modal fading in over a dimmed page.

1. Measure the card rect. Freeze the timeline (`S.frozen = true`), `overflow: hidden` on `html`
   with `scrollbar-gutter: stable` so nothing shifts, add `.recede` to the stage
   (`scale(0.965)`, 620ms).
2. `showModal()` a full-viewport transparent `<dialog>` holding its own scrim and a fixed panel.
   Hide the original card (`visibility: hidden`) so the panel reads as the card.
3. `Stage.morph(panel, cardRect, panelRect, ...)`: animates **left, top, width, height and
   border-radius** (not `scale`, which stretches text). 640ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
   Scrim fades over 520ms.
4. Content is `.rv` children that blur-and-rise in on a 70ms stagger, starting 140ms in, after
   the box is big enough to hold text.
5. Close is the exact reverse: content out in 140ms, panel morphs back to the card's *current*
   rect in 500ms (`cubic-bezier(0.45, 0, 0.2, 1)`), then `close()`, reveal the card, restore
   focus to it. Never a bare fade.

## Pre-flight

- One viewport tall, pinned; no more than 8 screens of runway.
- At least four layout families across the chapters; none used twice.
- Every text pair 4.5:1 and every control outline 3:1, in both themes, on the real surfaces.
- No `filter`/`opacity`/`overflow`/`clip-path` on an ancestor of a 3D element.
- Actors and controls hidden from the tab order when off stage; focus brings them on.
- Reduced motion: no zoom-through, no float, poses snap.
- Buttons and part selectors are ≥44px.

## What has and has not been checked

Checked, in headless Chrome stills: hero, facts at three timeline positions, all three parts,
the timeline chapter, the story sheet, 1280px and 500px widths, both themes, and contrast maths.
**Not checked:** how the motion feels at 60fps, real touch drag, Safari and Firefox rendering of
`color-mix` on SVG and `drop-shadow` on SVG children, 390px width, and GPU memory on a phone (60
slice layers at 760×240). Do those before shipping a page built on this.

## When not to use it

Forms, settings, dashboards, docs, long-form reading, anything a user must scan quickly or
search. A stage is for showing one thing well. Use the ordinary layout there.
