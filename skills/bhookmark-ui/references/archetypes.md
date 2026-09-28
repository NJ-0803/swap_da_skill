# Which site is this? Classify before you build

The skill builds four kinds of site from the same parts. The kind decides almost everything that matters:
whether there is a cinematic opening, what the hero object is, what the sidebar holds. Pick it from the
request, say which you picked and why in one line, and only ask if it is genuinely unclear.

## The four kinds

| | **showcase** | **portfolio** | **tool** | **app** |
| --- | --- | --- | --- | --- |
| What it is | one thing to admire and buy (a product, launch, car, sneaker) | a person or studio and their work | a page that does one job (search, track, convert, calculate) | a product people return to daily, with progress or a library |
| Reference | Aster One (`examples/aster-one`) | Mira Okafor (`examples/portfolio`), in the spirit of a developer portfolio with an orbit hero | Pairfind (`examples/tool`), in the spirit of a price checker | Wordlark (`examples/app`), in the spirit of a vocabulary game |
| Who arrives, and why | a stranger deciding whether to want it | a hirer or client deciding whether to call | someone with a task, right now | someone coming back, for the loop |
| First action | look, then buy | see the work, then get in touch | do the task on the first screen | start today's session |
| Cinematic stage | **on**, long (5 to 7 screens) | **on**, short (3 to 4 screens) | **off** | **off** |
| Hero object | the product: `extrude`, `frames` or `glb` | a system that orbits: `orbit` (skills, tools) | small, in-page, draggable: `extrude` (a box) | small, in-page: `orbit` or none |
| Depth cards | facts about the product | numbers about the person | none | none |
| Focus-and-lock parts | yes, if there is an object | no | no | no |
| Sidebar sections | Overview, Specs, Compare, FAQ, Buy | Work, Stack, Contact | Find, Saved, About | Today, Practice, My words, Settings |
| Typical blocks | `lead` `specs` `compare` `faq` `buy` | `timeline` `work` `chips` `contact` | `hero` `list` `faq` | `hero` `stats` `tiles` `list` `prose` |
| Headline effect | `breathe` or none | `reveal` | `reveal` | `gradient` |
| Border beam on | the Buy card | the Contact card | nothing (it is a work surface) | nothing |

## Signals in the request

- **showcase**: "product page", "launch", "landing page for my <thing>", a physical or single item, "buy now", "specs", "cinematic".
- **portfolio**: "my portfolio", "personal site", "about me", "resume", "like <a person>'s site", "agency", "case studies".
- **tool**: "like a price checker", "price tracker", "search", "compare prices", "converter", "calculator", "paste a link", one input and a result.
- **app**: "like a vocabulary game", "learning app", "dashboard", "habit", "notes", "game", "streak", "daily", accounts or saved progress, several features.
- If the request names an existing site, work out which of the four *it* is, not what it looks like. A vocabulary game looks like a game and is an **app**; a price checker looks like a shop and is a **tool**.

## Decide with four questions

1. **Who arrives and what did they come to do?** A stranger deciding, or a person with a task, or a regular?
2. **Must the first action be possible on the first screen?** If yes, there is **no stage** (tool, app). A cinematic scroll in front of a search box is a barrier.
3. **How often do they come back?** Once to be convinced means a stage may earn its length. Daily means it never will.
4. **Is there a thing to admire?** If yes it is the hero object. If the "thing" is a set of things (skills, integrations, words), use `orbit`. If nothing, use no object.

## When it is unclear

Ask at most two questions, then build. Good ones: "Is this for visitors who arrive to decide (a launch page), or to do something right away (a tool)?"
and "Is there one thing to show off, or several?" If the user has already answered by naming a reference, do not ask.

## Mixed and outside cases

- **Portfolio that ships a tool**: `portfolio`, with the tool as one project row linking out. Do not merge the two shells.
- **Product with an app**: `showcase` for the marketing page; the app is a separate `app` site.
- **Docs, a blog, a store catalogue, a long article**: not a stage or a shell. Use plain Build mode (tokens, type, cards) or `kind: 'custom'` with `html` blocks. Do not force a cinematic opening on reading.
- **A company skin**: swap the tokens file (`themes/`); the kind does not change.

## Optional features: add only when asked

A default build contains none of these. Each has a trigger; without it, leave it out. Do not add a section, a diagram or an effect
"to make the site richer": extra pages are extra weight and extra things to maintain.

| Feature | Add it when | What it costs |
| --- | --- | --- |
| A "How it works" or "How I build" page (`flow` block) | the visitor benefits from seeing a process, or the owner asks | nothing: it is built in |
| An Archify architecture diagram (`diagram` block) | the owner asks for an architecture, workflow or sequence diagram, or the audience needs the real system picture | the Archify skill installed, a generated file of about 800 KB, its own colours (see `diagrams.md`) |
| Animated headings, border beam, thinking orb | asked for, or the brief names a mood that needs them | small, zero dependencies (`effects.md`) |
| A frame, model or shader hero (`frames`, `glb`, `shader`) | the owner has a render or a model, or a showcase has nothing to show | see `site-kit.md` |
| A company theme (`themes/`) | a brand supplies its colours | one file |

The example sites keep an "OPTIONAL" block at the bottom of `site.js` for the workflow page, unattached: splice it in only if wanted.

## The site brief (write this before any code)

```
Kind:            tool  (price-checker-like: task first)
Visitor:         a shopper with a size in mind
First action:    search a shoe, priced for their size
Stage:           off; small draggable shoebox at the top of Find
Object:          extrude (a shoebox), theme-coloured
Sections:        Find, Saved, About
Blocks:          hero, list (size filter, lowest first, save), faq
Optional:        none asked for
Theme + effects: burgundy Evening/Daylight; headline reveal; no beam
Verify:          search, star, saved tab, both themes, 390px, reduced motion, audit.mjs
```

Then build from `assets/examples/<kind>/`: copy the folder's `index.html` and `site.js`, edit the manifest, keep the assets.
