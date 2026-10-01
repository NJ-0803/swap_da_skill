# Audit mode

Use when the user says audit, review, redesign, "does this match", or hands over an existing
project. **Report first. Never edit until the user has seen the report and said which findings to fix.**

## Run

```
node assets/audit.mjs <dir|file> [--json] [--allow=width,height] [--config=audit.config.json]
```

Scans `.css .html .vue .svelte .tsx .jsx` (skips `node_modules`, `.next`, `dist`...), prints a
Before / After / Why table, and exits 1 when any error-level finding exists. Zero dependencies.

## What it checks (mechanical only)

| Id | Level | Rule |
| --- | --- | --- |
| `gold` | error | no gold, amber or saffron: by name, keyword, hex, rgb, channel triple, Tailwind class |
| `contrast` | error | token contract: text pairs 4.5:1, control outlines 3:1, per theme, computed |
| `no-control-token` | warn | `--line` used where a control outline needs 3:1 |
| `reduced-motion` | error | any animation with no `prefers-reduced-motion` handling anywhere |
| `outline-none` | warn, error if no `:focus-visible` exists | removed focus ring |
| `3d-flatten` | error | `filter`, `opacity < 1`, `overflow`, `clip-path`, `mask` on a `preserve-3d` element |
| `non-compositor` | warn | transition or keyframes on layout properties (width, top, margin, box-shadow ...) |
| `paint-only` | info | transition or keyframes on colour, background (incl. position), mask or clip-path: repaints, no re-layout |
| `transition-all` | warn | `transition: all` |
| `ease-in` | warn | `ease-in` on a response |
| `scale-zero` | warn | animating from `scale(0)` |
| `weight` | warn | font-weight above the cap (600) |
| `target-size` | warn | height under 44px on buttons, chips, tabs, toggles |
| `font-import` | warn | `@import` of web fonts inside CSS |
| `hover-gate` | info | `:hover` outside `@media (hover: hover)` |

Brand rules are configurable so this works for a company that is not using the default theme. `audit.config.json`:
`{ "off": ["gold"], "forbiddenHues": [[36,54]], "forbiddenWords": ["gold"], "weightCap": 600, "minTarget": 44 }`.
Known false-positive guards: icon and pseudo-element sizes are not treated as touch targets.

## Workflow

1. Run it. Paste the table.
2. Say what it cannot see: the "Not automated" list at the end (layout families, hero
   discipline, type roles, copy). Do that review yourself, by reading the pages, and add rows.
3. Ask which findings to fix. Group them: brand rules, accessibility, motion, layout.
4. Fix with the smallest diffs, one group at a time. Re-run. Report the count going down.
5. A finding may be intentional. If so, record it as an exception in the project (config `off`,
   `--allow`, or a comment) and do not re-raise it.

## Tested on

`audit-fixtures/bad.css` (every rule fires), the example sites in this repo, and two real-world projects: one clean apart from a single
`scale(0)`, the other with sub-44px targets, `--line` used as an outline at 1.4:1, animated `width` and `left`, and amber (correct for
the default theme, turned off with a config). Only a handful of projects; expect to tune false positives on new codebases.
