/* A sample PORTFOLIO. Mira Okafor and every project here are invented. kind: 'portfolio' opens with the cinematic
   stage (a name, an orbit of skills, a few numbers), then hands off to a sidebar of Work, Stack, How I build, Contact. */
window.SITE = {
  kind: 'portfolio',
  brand: 'Mira Okafor', name: 'Mira Okafor',
  eyebrow: 'AI and full-stack engineer',
  tagline: 'I build the model layer, the API and the interface, and ship all three.',
  objectLabel: 'Skills orbiting a centre: Python, TypeScript, Go, SQL, React, Next.js, Redis, Docker, AWS, LLMs, RAG, Rust',
  cta: { label: 'Get in touch', section: 'contact' },
  heading: { style: 'reveal', sections: 'reveal' },
  effects: { beam: ['.contact'] },
  object: {
    type: 'orbit', box: [560, 440], hero: { yaw: 0, pitch: -8, swing: 16 },
    orbit: { rings: [
      { r: 92,  tiltX: 70, tiltZ: -8,  speed: 0.32, items: ['PY', 'TS', 'Go'] },
      { r: 150, tiltX: 66, tiltZ: 10,  speed: -0.22, items: ['SQL', 'React', 'Next', 'Redis'] },
      { r: 208, tiltX: 62, tiltZ: -14, speed: 0.15, items: ['AWS', 'LLM', 'RAG', 'Rust', 'Docker'] }
    ] }
  },
  stage: {
    heroActions: [{ label: 'See the work', action: 'section:work' }, { label: 'Get in touch', action: 'section:contact' }],
    cardsLabel: 'At a glance',
    cards: [
      { label: 'Shipped', value: 'Nine products', note: 'Six in production today. Sample value.' },
      { label: 'Reliability', value: '70% fewer failed runs', note: 'On the support pipeline. Sample value.' },
      { label: 'Range', value: 'Model to interface', note: 'One person across the whole path.' },
      { label: 'Now', value: 'Open to a team', note: 'Remote or Lagos.' }
    ],
    outro: { heading: 'The work, the stack, and how to reach me.', lead: 'Everything else is one tap away.', primary: 'See the work', primaryTo: 'work', secondary: 'Get in touch', secondaryTo: 'contact' }
  },
  shell: {
    menuLabel: 'Portfolio menu', replayLabel: 'Replay the intro',
    items: [
      { id: 'work', label: 'Work', icon: 'work', blocks: [
        { type: 'timeline', kicker: 'Experience', heading: 'Where I have shipped.', items: [
          { when: '2024 to now', title: 'Senior software engineer', org: 'Fieldnote Health', points: [
              'Rebuilt the appointment reminder pipeline; failed runs fell by 70%.',
              'Owned onboarding for new clinics, including their custom voice flows.'], chips: ['Python', 'FastAPI', 'LLMs', 'Postgres'] },
          { when: '2022 to 2024', title: 'Full-stack engineer', org: 'Harbor & Pine', points: [
              'Shipped a document Q&A tool used by a 40-person legal team.',
              'Cut page load time from 4.1s to 1.3s across the customer app.'], chips: ['TypeScript', 'Next.js', 'Redis'] },
          { when: '2021 to 2022', title: 'Product design intern', org: 'Department of Chemical Engineering', points: ['Designed and built the lab booking site the department still uses.'], chips: ['Figma', 'React'] }] },
        { type: 'work', kicker: 'Projects', heading: 'Selected work.', style: 'rows', items: [
          { title: 'Rowhouse', year: '2025', text: 'A rental search portal with map view, saved searches and price alerts.', tags: 'Next.js, Postgres, Mapbox' },
          { title: 'Readback', year: '2025', text: 'Ask questions of a folder of PDFs and get answers with the page they came from.', tags: 'Python, embeddings, RAG' },
          { title: 'Quietline', year: '2024', text: 'A booking site and directory for a network of therapists.', tags: 'React, Node.js' },
          { title: 'Postmark', year: '2024', text: 'Turns a script into short videos and schedules them across channels.', tags: 'LLMs, queues' }] }] },
      { id: 'stack', label: 'Stack', icon: 'stack', blocks: [
        { type: 'chips', kicker: 'Tools', heading: 'The stack behind it.', groups: [
          { name: 'AI and LLM', items: ['LangChain', 'OpenAI API', 'Embeddings', 'RAG', 'Evals', 'Voice'] },
          { name: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'Go', 'Postgres', 'Redis'] },
          { name: 'Frontend', items: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'React Native'] },
          { name: 'Infra', items: ['Docker', 'AWS', 'Vercel', 'GitHub Actions'] }] }] },
      { id: 'contact', label: 'Contact', icon: 'contact', blocks: [
        { type: 'contact', kicker: 'Say hello', heading: 'Have something to build? I would like to hear about it.', lead: 'The fastest reply is email.',
          buttons: [{ label: 'Email me', href: 'mailto:hello@example.com', primary: true }, { label: 'GitHub', href: 'https://example.com/github' }, { label: 'Resume (PDF)', href: '#' }] }] }
    ],
    footnote: 'Sample site for the Swap da Skill skill. Mira Okafor, the employers, the projects and the numbers are invented.'
  }
};

/* OPTIONAL, NOT PART OF THE DEFAULT SITE. A "How I build" page: a workflow the visitor can follow. Add it only if asked:
   SITE.shell.items.splice(2, 0, window.OPTIONAL_HOW);   Delete this block if you do not want it. */
window.OPTIONAL_HOW = { id: 'how', label: 'How I build', icon: 'flow', blocks: [
  { type: 'flow', kicker: 'A pipeline I run', heading: 'From ticket to reply.', lead: 'A support triage flow, drawn the way I explain it to clients.', label: 'Support triage pipeline',
    nodes: [{ label: 'Ticket arrives' }, { label: 'Classify' }, { label: 'Retrieve docs', aside: 'vector search' }, { label: 'Draft reply', aside: 'LLM' }, { label: 'Human review' }], note: 'a person approves every reply' }
] };
