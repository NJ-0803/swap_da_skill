/* A sample APP, in the shape of a vocabulary game: a daily-loop product whose sidebar IS the app (Today, Practice, My words).
   kind: 'app' skips the cinematic stage. The first screen is Today: a small orbiting hero, your numbers, and doors into
   the modes. All content is invented; the kit supplies the shell, the blocks and the motion, the learning logic is yours. */
window.SITE = {
  kind: 'app',
  brand: 'Wordlark', name: 'Wordlark',
  cta: null,
  heading: { style: 'gradient' },
  shell: {
    menuLabel: 'Wordlark menu',
    items: [
      { id: 'today', label: 'Today', icon: 'overview', blocks: [
        { type: 'hero', eyebrow: 'Thursday', heading: 'One word a day,', accent: 'kept for good.', lead: 'Sample app. Three words are waiting, and your streak is safe until midnight.', hint: 'Drag to spin', objectLabel: 'Letters orbiting a centre',
          object: { type: 'orbit', box: [420, 260], hero: { yaw: 0, pitch: -10, swing: 12 }, orbit: { rings: [
            { r: 62, tiltX: 68, tiltZ: -6, speed: 0.4, items: ['a', 'r'] }, { r: 104, tiltX: 64, tiltZ: 8, speed: -0.28, items: ['w', 'o', 'd', 'l'] }, { r: 146, tiltX: 60, tiltZ: -12, speed: 0.18, items: ['k', 'e', 'p', 't', 's'] }] } },
          actions: [{ label: 'Start today\'s words', section: 'practice' }, { label: 'My words', section: 'words' }] },
        { type: 'stats', kicker: 'Your numbers', items: [{ label: 'Streak', value: '6 days', note: 'Best so far: 11.' }, { label: 'Saved', value: '42 words', note: 'Nine to review.' }, { label: 'Recall', value: '84%', note: 'Over the last week.' }] },
        { type: 'tiles', kicker: 'Jump in', items: [
          { icon: 'info', title: 'Word of the day', text: 'Meet one new word with an example.', section: 'practice' },
          { icon: 'saved', title: 'Review', text: 'Nine words are due.', section: 'words' }] }] },
      { id: 'practice', label: 'Practice', icon: 'flow', blocks: [
        { type: 'prose', kicker: 'Practice', heading: 'Pick a way in.', paragraphs: ['Each mode takes about two minutes. Short on purpose: you come back tomorrow.'] },
        { type: 'tiles', items: [
          { icon: 'search', title: 'Unscramble', text: 'Put the letters back in order. The meaning is your clue.', section: 'words' },
          { icon: 'compare', title: 'Match', text: 'Pair each word with what it means.', section: 'words' },
          { icon: 'faq', title: 'Fill the gap', text: 'Choose the word that fits the sentence.', section: 'words' }] }] },
      { id: 'words', label: 'My words', icon: 'saved', blocks: [
        { type: 'list', kicker: 'My words', heading: 'Everything you kept.', placeholder: 'Search your words', suggestions: ['calm', 'light', 'old'], save: true,
          items: [
            { id: 'w1', title: 'petrichor', sub: 'The smell of rain on dry earth.', tags: ['noun', 'nature'], meta: 'learned Mon' },
            { id: 'w2', title: 'liminal', sub: 'Sitting on a threshold between two states.', tags: ['adjective'], meta: 'learned Tue' },
            { id: 'w3', title: 'serein', sub: 'A fine rain that falls from a clear sky at dusk.', tags: ['noun', 'nature'], meta: 'learned Wed' },
            { id: 'w4', title: 'ephemeral', sub: 'Lasting a very short time.', tags: ['adjective', 'time'], meta: 'due today' },
            { id: 'w5', title: 'halcyon', sub: 'Calm and peaceful, often about a past time.', tags: ['adjective', 'calm'], meta: 'due today' },
            { id: 'w6', title: 'sonder', sub: 'Realising everyone else has a life as vivid as yours.', tags: ['noun'], meta: 'learned last week' }] }] },
      { id: 'settings', label: 'Settings', icon: 'info', blocks: [
        { type: 'prose', kicker: 'Settings', heading: 'Make it yours.', paragraphs: ['Theme and motion follow your device. Use the toggle at the foot of the menu to switch between Evening and Daylight.'] },
        { type: 'faq', items: [
          { q: 'Does it work offline?', a: 'Sample answer: yes, after the first visit your words are stored in this browser.' },
          { q: 'Can I export my words?', a: 'Sample answer: a CSV export is planned. Nothing is sent to a server.' }] }] }
    ],
    footnote: 'Sample app shell for the Swap da Skill skill. Wordlark and every word, number and date are invented.'
  }
};
