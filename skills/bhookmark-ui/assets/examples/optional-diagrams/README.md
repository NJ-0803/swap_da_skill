# Diagrams (made with Archify)

`api-cache-fallback` and `runtime-overview` are drawn with [Archify](https://github.com/tt-a1i/archify) (MIT, by tt-a1i): a JSON description
in, one self-contained interactive HTML file out (animated trace, Dark and Light, Present mode, export). The `.json` files are the sources.

Embed one with the `diagram` block: `{ type: 'diagram', src: '../optional-diagrams/runtime-overview.html', title, height, caption }`.
The embedded viewer keeps its own theme toggle: it does not follow the site's Evening and Daylight switch (Archify documents no embed API).
Regenerate after editing a JSON file, then look at it:

```
node ~/.claude/skills/archify/bin/archify.mjs validate architecture X.json --quality showcase --json
node ~/.claude/skills/archify/bin/archify.mjs deliver  architecture X.json X.html --quality showcase --json
node ~/.claude/skills/archify/bin/archify.mjs visual-check X.html --json
```
