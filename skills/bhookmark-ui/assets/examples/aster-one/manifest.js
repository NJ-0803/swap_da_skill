/* manifest.js | the ONE file a company fills in. Everything below is invented demo content
   (Northline / Aster One do not exist; specs and prices are placeholders). */
window.PRODUCT = {
  demo: true,
  brand: 'Northline',
  name: 'Aster One',
  eyebrow: 'Model A1',
  tagline: 'One slab of glass, cut from a single idea.',
  currency: 'USD',
  priceFrom: 799,
  description: 'Aster One is a 6.3-inch phone with a dual 48 MP camera and an all-day battery.',
  cta: { label: 'Buy', section: 'buy' },

  /* Optional. heading.style: breathe | wave | reveal | shimmer | gradient (sections: true, or a style name, styles the section headings too).
     heading.font + heading.fontHref swap the display typeface. effects.beam: CSS selectors that get a travelling border light. */
  heading: { style: 'breathe', sections: 'reveal' },
  effects: { beam: ['.buy aside.card'] },

  /* The hero object. Slabs are extruded silhouettes; faces are drawn in the same coordinates for
     the front, and mirrored automatically for the back. Swap this whole block for a GLB or a
     frame sequence backend later; the timeline and poses do not change. */
  object: {
    box: [260, 520],
    hero: { yaw: -24, pitch: -4, swing: 22 },
    slabs: [
      { id: 'body', n: 14, depth: 26, z: 0, rim: 'var(--obj-rim)', core: 'var(--obj-core)',
        path: 'M44 0 H216 A44 44 0 0 1 260 44 V476 A44 44 0 0 1 216 520 H44 A44 44 0 0 1 0 476 V44 A44 44 0 0 1 44 0 Z' },
      { id: 'bump', n: 6, depth: 14, z: -20, rim: 'var(--obj-rim)', core: 'var(--obj-core)',
        path: 'M142 22 H214 A24 24 0 0 1 238 46 V118 A24 24 0 0 1 214 142 H142 A24 24 0 0 1 118 118 V46 A24 24 0 0 1 142 22 Z' }
    ],
    faces: [
      { slab: 'body', side: 'front', svg:
        '<defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:rgb(var(--obj-screen-a))"/><stop offset=".55" style="stop-color:rgb(var(--obj-screen-b))"/><stop offset="1" style="stop-color:rgb(var(--obj-screen-c))"/></linearGradient></defs>' +
        '<rect x="9" y="9" width="242" height="502" rx="36" fill="#0b0a0a"/>' +
        '<rect x="12" y="12" width="236" height="496" rx="33" fill="url(#scr)"/>' +
        '<rect x="96" y="24" width="68" height="20" rx="10" fill="#000"/>' +
        '<text x="130" y="170" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="86" fill="#f3eee7" fill-opacity=".92">12:00</text>' +
        '<text x="130" y="200" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="2" fill="#f3eee7" fill-opacity=".6">TUESDAY 14</text>' +
        '<rect x="96" y="494" width="68" height="4" rx="2" fill="#f3eee7" fill-opacity=".55"/>' +
        '<g data-part="display"><rect class="part-hl" x="8" y="8" width="244" height="504" rx="37"/></g>' },
      { slab: 'body', side: 'back', svg:
        '<defs><linearGradient id="bk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:rgb(var(--obj-back-a))"/><stop offset="1" style="stop-color:rgb(var(--obj-back-b))"/></linearGradient></defs>' +
        '<path d="M44 0 H216 A44 44 0 0 1 260 44 V476 A44 44 0 0 1 216 520 H44 A44 44 0 0 1 0 476 V44 A44 44 0 0 1 44 0 Z" fill="url(#bk)"/>' +
        '<path d="M60 380 C110 340 170 340 230 380" fill="none" stroke="#f3eee7" stroke-opacity=".08" stroke-width="30"/>' },
      { slab: 'bump', side: 'back', svg:
        '<path d="M142 22 H214 A24 24 0 0 1 238 46 V118 A24 24 0 0 1 214 142 H142 A24 24 0 0 1 118 118 V46 A24 24 0 0 1 142 22 Z" fill="#1a1614"/>' +
        '<g fill="#0a0909" stroke="#8d8479" stroke-width="2.5"><circle cx="146" cy="52" r="16"/><circle cx="146" cy="112" r="16"/></g>' +
        '<g fill="#2b2f45"><circle cx="146" cy="52" r="8"/><circle cx="146" cy="112" r="8"/></g>' +
        '<circle cx="206" cy="82" r="7" fill="#e9dcc8"/>' +
        '<g data-part="camera"><path class="part-hl" d="M142 22 H214 A24 24 0 0 1 238 46 V118 A24 24 0 0 1 214 142 H142 A24 24 0 0 1 118 118 V46 A24 24 0 0 1 142 22 Z"/></g>' }
    ]
  },

  facts: [
    { label: 'Display', value: '6.3-inch OLED', note: 'Adaptive 1 to 120 Hz. Demo value.' },
    { label: 'Camera', value: 'Dual 48 MP', note: 'Main and ultra-wide. Demo value.' },
    { label: 'Battery', value: 'All-day', note: 'Rated for 26 hours of video. Demo value.' },
    { label: 'Price', value: 'From $799', note: '256 GB. Demo value.' }
  ],

  partsHeading: 'Look closer',
  partsLead: 'Pick a part and the phone turns to it and holds still.',
  /* pose: anchor (ax, ay) in object pixels from its centre; zoom is relative to the fitted size */
  parts: [
    { key: 'display', label: 'Display', desc: 'Edge to edge, with a pill for the front camera.', pose: { ax: 0, ay: -30, yaw: -14, pitch: 4, zoom: 1.45 } },
    { key: 'camera', label: 'Camera', desc: 'Two lenses in a raised module on the back.', pose: { ax: 48, ay: -178, yaw: 196, pitch: -6, zoom: 2.3 } },
    { key: 'edge', label: 'Frame', desc: 'A single frame around glass on both faces.', pose: { ax: 130, ay: -20, yaw: -72, pitch: -10, zoom: 1.7 } }
  ],
  outro: { heading: 'The rest is one tap away.', lead: 'Specs, a comparison, answers and where to buy.', primary: 'See the details', secondary: 'Buy' },

  details: {
    overview: {
      heading: 'Meet Aster One.',
      paragraphs: [
        'Aster One keeps the important parts simple: a bright display that stays smooth, two cameras that cover most of what you shoot, and a battery you stop thinking about.',
        'It is built around one frame and two sheets of glass, so there is very little to notice except what is on the screen.'
      ],
      highlights: [['Display', '6.3 in OLED'], ['Camera', '48 MP + 12 MP'], ['Battery', '4,300 mAh'], ['Weight', '186 g'], ['Storage', '256 GB to 1 TB']]
    },
    specs: [
      { group: 'Display', rows: [['Size', '6.3 in'], ['Type', 'LTPO OLED'], ['Refresh rate', '1 to 120 Hz'], ['Peak brightness', '2,000 nits']] },
      { group: 'Camera', rows: [['Main', '48 MP, f/1.7'], ['Ultra-wide', '12 MP, f/2.2'], ['Front', '12 MP'], ['Video', '4K at 60 fps']] },
      { group: 'Battery', rows: [['Capacity', '4,300 mAh'], ['Wired charging', '30 W'], ['Wireless charging', '15 W']] },
      { group: 'Body', rows: [['Height', '149.6 mm'], ['Width', '71.5 mm'], ['Depth', '7.8 mm'], ['Weight', '186 g']] }
    ],
    compare: {
      cols: ['Aster One', 'Aster One Max'], highlight: 0,
      rows: [['Display', '6.3 in', '6.9 in'], ['Main camera', '48 MP', '48 MP'], ['Telephoto', 'None', '5x, 12 MP'], ['Battery', '4,300 mAh', '5,000 mAh'], ['Weight', '186 g', '226 g'], ['From', '$799', '$999']]
    },
    faq: [
      { q: 'Does it come with a charger?', a: 'Demo answer: the box holds the phone and a USB-C cable. A charger is sold separately.' },
      { q: 'Is it water resistant?', a: 'Demo answer: rated for splashes and brief immersion in fresh water.' },
      { q: 'How long is the warranty?', a: 'Demo answer: two years, with free repairs for manufacturing faults.' },
      { q: 'Can I trade in my old phone?', a: 'Demo answer: yes, at checkout, with credit applied to the price.' }
    ],
    buy: {
      heading: 'Choose yours.',
      options: [{ label: '256 GB', price: 799 }, { label: '512 GB', price: 899 }, { label: '1 TB', price: 1099 }],
      links: [{ label: 'Buy now', href: '#buy-now', primary: true }, { label: 'Find a store', href: '#stores' }],
      notes: ['Free returns within 14 days (demo)', 'Ships in 2 to 3 days (demo)']
    }
  },
  footnote: 'Demo product for the Bhookmark UI skill. Northline and Aster One are invented; every spec, price and link is a placeholder.'
};
