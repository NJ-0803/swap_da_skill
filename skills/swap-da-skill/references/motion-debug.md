# Debugging motion

Two things go wrong with motion: it is wrong in time (easing kinks, start and end mismatches,
things out of sync) and wrong in cost (janky because it animates layout). Slow it down to see
the first; measure to catch the second.

## motion-debug.js

```html
<script src="motion-debug.js"></script>     then load the page with ?motion-debug
```
or call `MotionDebug.open()`. Keys with the panel open: `1`..`4` speed (1×, ½×, ¼×, ⅒×),
`Space` pause, `.` step one frame.

- Slows CSS transitions, CSS animations and Web Animations through `document.getAnimations()`.
- Slows `stage-engine.js` through `window.__motionScale`; pause and single-step through
  `__motionPaused` and `__motionStep`. Other rAF code must read the same globals to slow down.
- Lists every animation that touches layout (warn) or paint (info), and logs layout ones to the
  console. Compositor-friendly properties (transform, opacity, filter) are not flagged.
- Shows fps and counts frames over 20ms.
- Verified on a fixture: all animations went to ¼, `width` and `left` were flagged while
  `transform` and `opacity` were not, pause held every animation, and one step advanced exactly
  one frame at that speed. The engine hook was confirmed to slow it (rough headless measure).

## Chrome DevTools, the same job by hand

- **Animations** panel (More tools): capture, replay at 25% or 10%, scrub the timeline, see each
  animation's easing and duration.
- **Rendering** tab: Paint flashing and Layer borders show what repaints and what is composited.
- **Performance** panel: record while interacting, look for long frames and "Layout" in the flame.
- Test touch on a real phone, not the emulator.

## Freeze the timeline and look at stills

For a scroll-driven stage, animation panels do not see the camera. Freeze the timeline and
capture: in the engine, set `S.frozen = true; S.target = S.s = <scene time>` and screenshot.
Headless Chrome renders few animation frames, so damping may not have converged; set
`S.reduce = true` to make poses snap before judging a final pose.

## What to look for

Start and end states that do not match. An ease that stops dead. Overshoot larger than the
distance. Layout jump when an element mounts. Wrong `transform-origin`. Two things that should
move together, not. A first frame that flashes the final state. Flicker at a fixed angle.

## Bugs this found, so you do not repeat them

- **Diagonal strip across a 3D object at certain angles.** Cause: large flat "depth frame" planes
  in the same `preserve-3d` container as the object. When the object turned through a plane,
  Chrome split its polygons along the intersection and drew a strip. Found by hiding groups of
  layers one at a time until it vanished (bisecting), after two wrong guesses. Fix: give
  background planes their own sibling 3D container. Rule: nothing large and flat that the object
  can rotate through goes in the object's 3D context. `audit.mjs` cannot see this one.
- **A hidden card reappeared.** The engine rewrote `visibility` every frame, overriding the page's
  own `hidden`. Fix: the `held` flag on an actor.
- **Blank screenshots.** Headless Chrome captures document coordinates, so a scrolled sticky stage
  was outside the frame. Drive the timeline directly instead of scrolling.
