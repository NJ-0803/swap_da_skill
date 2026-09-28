# Diagrams: Archify (optional, on request)

**This is a feature, not a default.** Most sites never need it. Use it only when the owner asks for an architecture, workflow, sequence,
data-flow or lifecycle diagram, or when a visitor genuinely needs to see how a system works. Nothing in the site kit loads or depends on
Archify: it does nothing unless a manifest contains a `diagram` block, and the skill is installed separately. For a simple process,
prefer the built-in `flow` block, which needs neither.

For an architecture, workflow, sequence, data-flow or lifecycle diagram, use **Archify** (MIT, by tt-a1i): a small typed JSON in, one
self-contained interactive HTML out (animated trace, Dark and Light, Present, guided views, export). The kit embeds it with the
`diagram` block. The kit's own `flow` block stays as the zero-dependency option for a simple vertical pipeline.

## Install, and the name to type

```
npx skills add tt-a1i/archify -g -a claude-code -s archify -y --copy
```
Copy the slug exactly. It is **`tt-a1i`: the digit 1 and the letter a.** A one-character typo points at a different or nonexistent
repository, which is also how name-squatting works (`tt-ali/archify`, with two letters, does not exist). Verified before installing: the real repo has 73,167 stars, MIT, an owner since 2019, and the installer is Vercel's `vercel-labs/skills`. Its render
code makes no network calls; its only outbound call is an optional update check (a version file on its GitHub Pages) which we skip.
`-a claude-code -s archify --copy` installs only the one skill, only for Claude Code, as plain files; `DISABLE_TELEMETRY=1` turns off the
installer's own install telemetry.

## Workflow (its own, and it works)

1. Pick the type. `node bin/archify.mjs guide "<scenario>" --json` recommends one; for "what exists and how is it connected" it says
   `architecture`: 8 to 12 core components, one primary path, external dependencies, trust boundaries, detail on cards not edges.
2. Write the JSON (components with positions, `boundaries` of kind `region` or `security-group`, `connections`, `cards`). `meta.animation: "trace"` turns motion on.
3. `validate ... --quality showcase --json` until 0 errors and 0 warnings. Its messages give exact fixes (label offsets, border-riding routes).
4. `deliver ... out.html --quality showcase --json`, then `visual-check out.html --json`.
5. **Then look at it.** Both commands say a human still has to review the picture, and they are right.

## What its checks missed (found by looking)

- An edge label sat 4 px outside the drawing area, clipped, and `validate`, `deliver` and `visual-check` all passed. Fix: `meta.viewBox` is
  **two numbers, `[width, height]`** (minimum 320 by 240), not the four of an SVG.
- `deliver` passed while `visual-check` failed at 1440 by 900 and 1600 by 1000: four cards wrapped onto a second row and the page overflowed
  vertically. Fix: three cards and tighter vertical spacing. Always run both.
- Text projects small when the layout is wide; tightening the horizontal spacing raised the smallest node text from 6.8 px to 8.2 px.

## Limits

- **Archify's palette is its own, and it uses amber.** Cloud nodes and region outlines are drawn in amber inside the frame, which cannot be re-themed from outside. The Bhookmark no-gold rule covers Bhookmark's UI, not a third-party artifact in an iframe, and `audit.mjs` skips `examples/optional-diagrams/` for that reason. If a brand forbids amber, avoid the `cloud` component type and expect the region outline to stay amber; whether another `visual_preset` (blueprint, editorial, signal-flow) changes that is untested.

- The embedded viewer has its own theme toggle and no documented parameter or message to follow the site's Evening and Daylight switch.
- Each file is about 800 KB (the viewer and a font are inside). Fine for one diagram, heavy for ten.
- The examples in `assets/examples/optional-diagrams/` are a generic reference design (a cache-first read path), not a description of any real system.
