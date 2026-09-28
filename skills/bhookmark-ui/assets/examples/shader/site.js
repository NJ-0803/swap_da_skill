/* A sample SHOWCASE whose hero is a procedural shader orb: no model, no images, about 4 KB of shader.
   Halo is invented. The object follows the theme colours and stops moving under prefers-reduced-motion. */
window.SITE = {
  kind: 'showcase',
  brand: 'Halo', name: 'Halo',
  eyebrow: 'An assistant that thinks out loud',
  tagline: 'Ask, watch it work, and see why it answered the way it did.',
  objectLabel: 'A softly moving glowing orb',
  cta: { label: 'Try Halo', section: 'overview' },
  heading: { style: 'breathe' },
  object: { type: 'shader', box: [420, 420], hero: { yaw: 0, pitch: 0, swing: 24 }, shader: { maxDpr: 1.5, maxPixels: 1200000, still: 6 } },
  stage: {
    heroActions: [{ label: 'See how it works', action: 'section:overview' }],
    cardsLabel: 'Why it feels different',
    cards: [
      { label: 'Visible', value: 'Every step shown', note: 'Sample value.' },
      { label: 'Fast', value: 'First words in a blink', note: 'Sample value.' },
      { label: 'Yours', value: 'Stays on your device', note: 'Sample value.' }],
    outro: { heading: 'One tap to the details.', lead: 'How it works, and what it is not.', primary: 'How it works', primaryTo: 'overview' }
  },
  shell: {
    menuLabel: 'Halo menu',
    items: [
      { id: 'overview', label: 'How it works', icon: 'overview', blocks: [
        { type: 'lead', kicker: 'How it works', heading: 'Thinking, made visible.', paragraphs: ['Halo shows its reasoning as it goes, so you can stop it, correct it, or trust it.', 'The orb on the first screen is drawn by a tiny shader, not an image or a model file.'],
          aside: { rows: [['Hero object', 'Procedural shader'], ['Weight', 'About 4 KB'], ['Motion', 'Stops on request']] } }] },
      { id: 'faq', label: 'FAQ', icon: 'faq', blocks: [
        { type: 'faq', kicker: 'FAQ', heading: 'Good questions.', items: [
          { q: 'Does the orb slow my phone?', a: 'It draws at a capped pixel density and pauses when offscreen or when the tab is hidden.' },
          { q: 'What if I turn animation off?', a: 'The orb shows one calm frame and does not move.' }] }] }
    ],
    footnote: 'Sample site for the Bhookmark UI skill. Halo and its claims are invented.'
  }
};
