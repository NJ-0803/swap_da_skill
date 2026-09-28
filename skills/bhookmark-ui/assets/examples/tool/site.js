/* A sample TOOL, in the shape of a price checker: a page whose whole job is one action (find the cheapest pair in your size).
   kind: 'tool' skips the cinematic stage: the first screen is a small draggable hero and the search itself.
   All shops, shoes and prices are invented. Real data is your app's job; the kit supplies the shape and the motion. */
window.SITE = {
  kind: 'tool',
  brand: 'Pairfind', name: 'Pairfind',
  cta: null,
  heading: { style: 'reveal' },
  shell: {
    menuLabel: 'Pairfind menu',
    items: [
      { id: 'find', label: 'Find', icon: 'search', blocks: [
        { type: 'hero', eyebrow: 'Sneaker prices', heading: 'Your size. Every shop.', accent: 'Cheapest first.', lead: 'Sample data from three invented shops. Pick your size, type a shoe, star what you like.', hint: 'Drag to spin',
          objectLabel: 'A shoebox turning slowly',
          object: { type: 'extrude', box: [208, 104], hero: { yaw: -28, pitch: -14, swing: 14 },
            slabs: [
              { id: 'box', n: 34, depth: 120, z: 0, ring: 6, rim: 'rgb(var(--accent))', core: 'rgb(var(--accent-dim))', path: 'M10 26 H198 A6 6 0 0 1 204 32 V96 A6 6 0 0 1 198 102 H10 A6 6 0 0 1 4 96 V32 A6 6 0 0 1 10 26 Z' },
              { id: 'lid', n: 36, depth: 130, z: 0, ring: 6, rim: 'rgb(var(--accent))', core: 'rgb(var(--accent-dim))', path: 'M6 4 H202 A6 6 0 0 1 208 10 V30 A6 6 0 0 1 202 36 H6 A6 6 0 0 1 0 30 V10 A6 6 0 0 1 6 4 Z' }],
            faces: [
              { slab: 'box', side: 'front', svg: '<text x="104" y="70" text-anchor="middle" style="fill:rgb(var(--accent-ink));font:500 15px IBM Plex Mono,monospace;letter-spacing:.3em">PAIRFIND</text><text x="104" y="88" text-anchor="middle" style="fill:rgb(var(--accent-ink));font:11px IBM Plex Mono,monospace;opacity:.7">UK 9</text>' },
              { slab: 'lid', side: 'front', svg: '<text x="104" y="26" text-anchor="middle" style="fill:rgb(var(--accent-ink));font:italic 22px Instrument Serif,Georgia,serif;opacity:.9">pairfind</text>' },
              { slab: 'box', side: 'back', svg: '' }, { slab: 'lid', side: 'back', svg: '' }] } },
        { type: 'list', id: 'shoes', kicker: 'Search', heading: 'What are you after?', placeholder: 'Which sneaker? e.g. Court Low White', suggestions: ['Court Low', 'Trail Runner', 'Retro High', 'Canvas Slip-on'],
          filter: { label: 'Your size', options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'], default: 'UK 9' }, sort: 'asc', save: true,
          items: [
            { id: 's1', title: 'Court Low White', sub: 'Northgate Kicks', tags: ['leather', 'in stock'], meta: { 'UK 7': '$88', 'UK 8': '$88', 'UK 9': '$92', 'UK 10': '$92', 'UK 11': '$99' } },
            { id: 's2', title: 'Court Low White', sub: 'Harbor Sole', tags: ['leather'], meta: { 'UK 8': '$95', 'UK 9': '$95', 'UK 10': '$97' } },
            { id: 's3', title: 'Court Low White', sub: 'Kickyard', tags: ['leather', 'last pairs'], meta: { 'UK 9': '$89', 'UK 10': '$89', 'UK 11': '$94' } },
            { id: 's4', title: 'Trail Runner Moss', sub: 'Northgate Kicks', tags: ['mesh', 'in stock'], meta: { 'UK 8': '$120', 'UK 9': '$120', 'UK 10': '$126' } },
            { id: 's5', title: 'Trail Runner Moss', sub: 'Kickyard', tags: ['mesh'], meta: { 'UK 9': '$112', 'UK 10': '$115', 'UK 11': '$118' } },
            { id: 's6', title: 'Retro High Ember', sub: 'Harbor Sole', tags: ['suede', 'limited'], meta: { 'UK 7': '$160', 'UK 8': '$160', 'UK 9': '$168', 'UK 10': '$172' } },
            { id: 's7', title: 'Retro High Ember', sub: 'Northgate Kicks', tags: ['suede'], meta: { 'UK 8': '$155', 'UK 9': '$158' } },
            { id: 's8', title: 'Canvas Slip-on Sand', sub: 'Kickyard', tags: ['canvas', 'in stock'], meta: { 'UK 7': '$48', 'UK 8': '$48', 'UK 9': '$50', 'UK 10': '$50', 'UK 11': '$52' } }] }] },
      { id: 'saved', label: 'Saved', icon: 'saved', blocks: [
        { type: 'list', kicker: 'Saved', heading: 'Waiting for you.', itemsFrom: 'shoes', savedOnly: true, sort: 'asc', filter: { label: 'Your size', options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'], default: 'UK 9' }, save: true,
          empty: 'Nothing saved yet. Star a result on Find and it will wait here, stored in this browser only.' }] },
      { id: 'about', label: 'About', icon: 'info', blocks: [
        { type: 'faq', kicker: 'About', heading: 'Good questions.', items: [
          { q: 'Where do the prices come from?', a: 'Sample content: in this demo they are invented. A real build reads each shop\'s public search.' },
          { q: 'Where is my list stored?', a: 'In this browser only. Nothing is sent anywhere.' },
          { q: 'Why is a size missing?', a: 'A shop that does not stock your size is left out rather than shown at a price you cannot buy.' }] }] }
    ],
    footnote: 'Sample site for the Bhookmark UI skill. Pairfind, the shops, the shoes and the prices are invented.'
  }
};

/* OPTIONAL, NOT PART OF THE DEFAULT SITE. A "How it works" page, for when the visitor benefits from seeing the workflow.
   Add it only if someone asked for it:   SITE.shell.items.splice(2, 0, window.OPTIONAL_HOW);
   Two tiers: the light `flow` block below (no dependency), or an Archify `diagram` block (see references/diagrams.md; needs the
   Archify skill and a generated file). Delete this whole block if you do not want either. */
window.OPTIONAL_HOW = { id: 'how', label: 'How it works', icon: 'flow', blocks: [
  { type: 'flow', kicker: 'Under the hood', heading: 'From a word to a price.', label: 'How a search runs',
    nodes: [{ label: 'You type a shoe' }, { label: 'Read each shop', aside: 'public search only' }, { label: 'Keep exact matches' }, { label: 'Price your size' }, { label: 'Lowest first' }], note: 'shops that block bots are never worked around' }
  /* , { type: 'diagram', heading: 'The full picture.', src: '../optional-diagrams/api-cache-fallback.html', title: 'Cached read path', height: 560 } */
] };
