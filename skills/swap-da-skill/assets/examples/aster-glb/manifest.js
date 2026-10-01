/* manifest.js (GLB model example) | the ONE file a company fills in. Everything below is invented demo content
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
  /* Backend #3: a real 3D model. three.js loads on demand. `height` normalises the model to box px, so the
     anchors below use the same numbers as the extruded example; az is depth (positive toward the front). */
  object: {
    type: 'glb',
    box: [260, 520],
    hero: { yaw: -24, pitch: -4, swing: 22 },
    glb: { src: 'aster.glb', height: 520, maxDpr: 1.75 }
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
    { key: 'display', label: 'Display', desc: 'Edge to edge, with a pill for the front camera.', pose: { ax: 0, ay: -30, az: 13, yaw: -14, pitch: 4, zoom: 1.45 } },
    { key: 'camera', label: 'Camera', desc: 'Two lenses in a raised module on the back.', pose: { ax: 48, ay: -178, az: -26, yaw: 196, pitch: -6, zoom: 2.3 } },
    { key: 'edge', label: 'Frame', desc: 'A single frame around glass on both faces.', pose: { ax: 130, ay: -20, az: 0, yaw: -72, pitch: -10, zoom: 1.7 } }
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
  footnote: 'Demo product for the Swap da Skill skill. Northline and Aster One are invented; every spec, price and link is a placeholder.'
};
