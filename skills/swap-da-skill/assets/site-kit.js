/*! site-kit.js | Swap da Skill | builds a whole website from window.SITE (or a legacy window.PRODUCT).
 *  Act 1 (optional): a pinned cinematic stage, stage-engine.js.  Act 2: a sidebar shell whose menu swaps sections,
 *  each made of BLOCKS (prose, timeline, work, chips, flow, contact, list, specs, compare, faq, buy, lead, html).
 *  Needs: stage-engine.js, one tokens file, site-kit.css, one object backend if SITE.object is set, <div id="app">.
 *  Manifest text is escaped, links are sanitised; `html` blocks and object faces are trusted markup. */
(function () {
  'use strict';
  var St = window.Stage, clamp = St.clamp;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var href = function (u) { u = String(u == null ? '#' : u); return /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(u) ? esc(u) : '#'; };
  var root = document.documentElement, reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- legacy: a PRODUCT manifest becomes a SITE ---------- */
  function fromProduct(P) {
    var D = P.details, fmt = function (n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: P.currency, maximumFractionDigits: 0 }).format(n); };
    return {
      kind: 'showcase', brand: P.brand, name: P.name, eyebrow: P.eyebrow, tagline: P.tagline, cta: P.cta, heading: P.heading, effects: P.effects, object: P.object, footnote: P.footnote,
      stage: { heroActions: [{ label: 'Take a closer look', action: 'part:0' }, { label: 'See the details', action: 'section:overview' }], cards: P.facts, cardsLabel: 'Facts',
               partsHeading: P.partsHeading, partsLead: P.partsLead, partsLabel: 'Parts', parts: P.parts, outro: P.outro },
      shell: { menuLabel: 'Product menu', items: [
        { id: 'overview', label: 'Overview', icon: 'overview', blocks: [{ type: 'lead', kicker: 'Overview', heading: D.overview.heading, paragraphs: D.overview.paragraphs,
            aside: { rows: D.overview.highlights, price: 'From ' + fmt(P.priceFrom), cta: { label: P.cta.label, section: P.cta.section } } }] },
        { id: 'specs', label: 'Specs', icon: 'specs', blocks: [{ type: 'specs', kicker: 'Specs', heading: 'Specifications', groups: D.specs }] },
        { id: 'compare', label: 'Compare', icon: 'compare', blocks: [{ type: 'compare', kicker: 'Compare', heading: 'Which one?', cols: D.compare.cols, rows: D.compare.rows, highlight: D.compare.highlight }] },
        { id: 'faq', label: 'FAQ', icon: 'faq', blocks: [{ type: 'faq', kicker: 'FAQ', heading: 'Good questions.', items: D.faq }] },
        { id: 'buy', label: 'Buy', icon: 'buy', blocks: [{ type: 'buy', kicker: 'Buy', heading: D.buy.heading, options: D.buy.options, links: D.buy.links, notes: D.buy.notes, currency: P.currency, pickTitle: P.brand + ' ' + P.name }] }] }
    };
  }
  var SITE = window.SITE || fromProduct(window.PRODUCT);
  var KIND = SITE.kind || 'showcase';
  // The kind sets the default: showcases and portfolios open with the cinematic stage; tools and apps go straight to the work.
  var ST = Object.assign({ enabled: !(KIND === 'tool' || KIND === 'app'), cards: [], parts: [], heroActions: [], cardsLabel: 'Highlights', partsLabel: 'Detail', outro: null }, SITE.stage || {});
  var SH = Object.assign({ menuLabel: 'Menu', replayLabel: 'Replay the intro', items: [] }, SITE.shell || {});
  var OBJ = SITE.object || null, HAS_STAGE = ST.enabled !== false;
  var PARTS = OBJ ? ST.parts : [];

  /* ---------- icons ---------- */
  var IC = {
    overview: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    specs: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    compare: '<rect x="3.5" y="4" width="7" height="16" rx="2"/><rect x="13.5" y="4" width="7" height="16" rx="2"/>',
    faq: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 16.7h.01"/>',
    buy: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    work: '<rect x="3.5" y="7" width="17" height="12" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
    stack: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
    contact: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    saved: '<path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-4-6 4V5.5a1 1 0 0 1 1-1z"/>',
    bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h.01"/>',
    flow: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="M8 7l8 4M8 17l8-4"/>',
    star: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7 6.9 19.4l1-5.6-4.1-4 5.7-.8z"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4h4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  var ico = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || IC.info) + '</svg>'; };
  var themeSeg = function () {
    return '<div class="seg" role="group" aria-label="Theme"><button type="button" data-theme-btn="evening" aria-pressed="true">' + ico('moon') + 'Evening</button>' +
      '<button type="button" data-theme-btn="daylight" aria-pressed="false">' + ico('sun') + 'Daylight</button></div>';
  };
  var kick = function (b) { return b.kicker ? '<p class="label">' + esc(b.kicker) + '</p>' : ''; };
  var head = function (b) { return b.heading ? '<h2 class="big">' + esc(b.heading) + '</h2>' : ''; };
  var rowsHTML = function (rows) { return '<dl class="rows">' + rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>'; };
  var money = function (n, cur) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(n); };
  var uid = 0;

  /* ---------- blocks: each returns markup; INIT[type] wires behaviour after insertion ---------- */
  var BLOCKS = {
    prose: function (b) { return kick(b) + head(b) + (b.paragraphs || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join(''); },

    lead: function (b) {                                                       // prose on the left, a key-facts card on the right
      var a = b.aside;
      return kick(b) + '<div class="ov"><div>' + head(b) + (b.paragraphs || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
        (a ? '<aside class="card">' + (a.rows ? rowsHTML(a.rows) : '') + (a.price ? '<p class="price" style="margin-top:18px">' + esc(a.price) + '</p>' : '') +
          (a.cta ? '<button class="btn" type="button" data-go="' + esc(a.cta.section) + '">' + esc(a.cta.label) + '</button>' : '') + '</aside>' : '') + '</div>';
    },

    specs: function (b) {
      return kick(b) + head(b) + '<div class="specs">' + b.groups.map(function (g) { return '<div class="card"><h3>' + esc(g.group) + '</h3>' + rowsHTML(g.rows) + '</div>'; }).join('') + '</div>';
    },

    compare: function (b) {
      return kick(b) + head(b) + '<div class="tablewrap" tabindex="0" role="region" aria-label="Comparison table, scrolls sideways on small screens"><table><thead><tr><th scope="col"><span class="label">Feature</span></th>' +
        b.cols.map(function (c, i) { return '<th scope="col"' + (i === b.highlight ? ' class="hl"' : '') + '>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th>' + r.slice(1).map(function (v, i) { return '<td' + (i === b.highlight ? ' class="hl"' : '') + '>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    },

    faq: function (b) {
      return kick(b) + head(b) + '<div class="faq">' + b.items.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div>';
    },

    buy: function (b) {
      var cur = b.currency, first = b.options[0];
      return kick(b) + '<div class="buy"><div>' + head(b) + '<div class="opts" role="radiogroup" aria-label="' + esc(b.optionsLabel || 'Options') + '">' +
        b.options.map(function (o, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-opt="' + i + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
        '<p class="price" data-price>' + money(first.price, cur) + '</p><div class="actions">' +
        b.links.map(function (l) { return '<a class="btn' + (l.primary ? '' : ' ghost') + '" href="' + href(l.href) + '">' + esc(l.label) + '</a>'; }).join('') + '</div>' +
        '<ul class="notes">' + (b.notes || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>' +
        '<aside class="card"><p class="label">Your pick</p><h3 style="margin:6px 0 4px">' + esc(b.pickTitle || '') + '</h3><p data-pick style="margin:0">' + esc(first.label) + '</p></aside></div>';
    },

    timeline: function (b) {                                                   // a rail of dated entries with bullets and chips
      return kick(b) + head(b) + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') + '<ol class="tl">' + b.items.map(function (it) {
        return '<li class="tl-item"><p class="tl-when num">' + esc(it.when) + '</p><h3>' + esc(it.title) + '</h3>' + (it.org ? '<p class="tl-org">' + esc(it.org) + '</p>' : '') +
          (it.points ? '<ul class="checks">' + it.points.map(function (p) { return '<li>' + ico('check') + '<span>' + esc(p) + '</span></li>'; }).join('') + '</ul>' : '') +
          (it.chips ? '<div class="chips">' + it.chips.map(function (c) { return '<span class="pill">' + esc(c) + '</span>'; }).join('') + '</div>' : '') + '</li>';
      }).join('') + '</ol>';
    },

    work: function (b) {                                                       // ruled rows, or cards when style: 'cards'
      var cards = b.style === 'cards';
      return kick(b) + head(b) + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') + '<div class="' + (cards ? 'work-cards' : 'work-rows') + '">' + b.items.map(function (it) {
        var inner = '<div><h3>' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p>' + (it.tags ? '<p class="tags num">' + esc(it.tags) + '</p>' : '') + '</div>' + (it.year ? '<span class="yr num">' + esc(it.year) + '</span>' : '');
        return it.href ? '<a class="work-item card" href="' + href(it.href) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<div class="work-item' + (cards ? ' card' : '') + '">' + inner + '</div>';
      }).join('') + '</div>';
    },

    chips: function (b) {
      return kick(b) + head(b) + b.groups.map(function (g) { return '<div class="chipgroup"><h3>' + esc(g.name) + '</h3><div class="chips">' + g.items.map(function (c) { return '<span class="pill">' + esc(c) + '</span>'; }).join('') + '</div></div>'; }).join('');
    },

    flow: function (b) {                                                       // a vertical pipeline whose nodes light in turn (opacity/transform only)
      return kick(b) + head(b) + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') + '<div class="flow card" role="img" aria-label="' + esc(b.label || b.heading || 'Flow diagram') + ': ' + esc(b.nodes.map(function (n) { return n.label; }).join(', then ')) + '">' +
        b.nodes.map(function (n, i) { return '<div class="flow-row"><span class="flow-node" style="--i:' + i + '">' + esc(n.label) + '</span>' + (n.aside ? '<span class="flow-aside">' + esc(n.aside) + '</span>' : '') + '</div>'; }).join('') +
        (b.note ? '<p class="flow-note num">' + esc(b.note) + '</p>' : '') + '</div>';
    },

    contact: function (b) {
      return '<div class="contact card">' + kick(b) + '<h2 class="big">' + esc(b.heading) + '</h2>' + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') + '<div class="actions">' +
        b.buttons.map(function (x) { return '<a class="btn' + (x.primary ? '' : ' ghost') + '" href="' + href(x.href) + '">' + esc(x.label) + '</a>'; }).join('') + '</div></div>';
    },

    list: function (b) {                                                       // searchable, filterable, saveable list: the app block
      var id = 'lst' + (uid++); b._uid = id;
      var items = b.itemsFrom ? DATASETS[b.itemsFrom] : b.items; if (b.id) DATASETS[b.id] = items; b._items = items || [];
      var f = b.filter;
      return kick(b) + head(b) + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') + '<div class="list" data-list="' + id + '">' +
        (f ? '<div class="filterbar"><span class="label">' + esc(f.label) + '</span><div class="chips pick" role="radiogroup" aria-label="' + esc(f.label) + '">' + f.options.map(function (o) {
          return '<button type="button" role="radio" class="chip pickchip" aria-checked="' + (o === f.default) + '" data-f="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div></div>' : '') +
        (b.savedOnly ? '' : '<form class="search" role="search" data-search><input type="search" class="field" autocomplete="off" placeholder="' + esc(b.placeholder || 'Search') + '" aria-label="' + esc(b.placeholder || 'Search') + '">' +
          '<button class="btn" type="submit">Search</button></form>' +
          (b.suggestions ? '<p class="sugg"><span class="label">Try</span> ' + b.suggestions.map(function (s) { return '<button type="button" class="chip" data-sugg="' + esc(s) + '">' + esc(s) + '</button>'; }).join(' ') + '</p>' : '')) +
        '<p class="status num" role="status" aria-live="polite" data-status></p><ul class="results" data-results></ul></div>';
    },

    html: function (b) { return b.html || ''; },
    diagram: function (b) {                                                    // an Archify diagram (self-contained HTML) in a frame
      return kick(b) + head(b) + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') +
        '<figure class="diagram card"><iframe title="' + esc(b.title || b.heading || 'Diagram') + '" src="' + href(b.src) + '" loading="lazy" sandbox="allow-scripts allow-downloads" style="height:' + (+b.height || 560) + 'px"></iframe>' +
        (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
    },

    hero: function (b) {                                                       // an in-page hero (no pinned scroll) with an optional draggable object
      return '<div class="hero-inline"><div class="hero-copy">' + (b.eyebrow ? '<p class="label">' + esc(b.eyebrow) + '</p>' : '') +
        '<h1 class="big hero-h1">' + esc(b.heading) + (b.accent ? ' <em>' + esc(b.accent) + '</em>' : '') + '</h1>' + (b.lead ? '<p>' + esc(b.lead) + '</p>' : '') +
        (b.actions ? '<div class="actions">' + b.actions.map(function (a, i) { return '<button class="btn' + (i ? ' ghost' : '') + '" type="button" data-go="' + esc(a.section) + '">' + esc(a.label) + '</button>'; }).join('') + '</div>' : '') + '</div>' +
        (b.object ? '<div class="hero-obj" data-hero-obj role="img" aria-label="' + esc(b.objectLabel || b.heading) + '"><div class="rig-i"><div class="object" data-hobj></div></div>' + (b.hint ? '<p class="hint label" aria-hidden="true">' + esc(b.hint) + '</p>' : '') + '</div>' : '') + '</div>';
    },

    stats: function (b) {
      return kick(b) + head(b) + '<div class="stats">' + b.items.map(function (it) { return '<div class="stat card"><span class="label">' + esc(it.label) + '</span><b class="num">' + esc(it.value) + '</b>' + (it.note ? '<span>' + esc(it.note) + '</span>' : '') + '</div>'; }).join('') + '</div>';
    },

    tiles: function (b) {                                                      // a grid of doors into other sections
      return kick(b) + head(b) + '<div class="tiles">' + b.items.map(function (it) {
        var inner = '<span class="tile-ic">' + ico(it.icon || 'info') + '</span><b>' + esc(it.title) + '</b><span>' + esc(it.text || '') + '</span>';
        return it.href ? '<a class="tile card" href="' + href(it.href) + '">' + inner + '</a>' : '<button type="button" class="tile card" data-go="' + esc(it.section || '') + '">' + inner + '</button>';
      }).join('') + '</div>';
    }
  };
  var DATASETS = {}, INIT = {};


  INIT.hero = function (el, b) {
    if (!b.object) return;
    var host = $('[data-hero-obj]', el), obj = $('[data-hobj]', el), o = b.object;
    var BK = { frames: window.ObjectFrames, glb: window.ObjectGlb, orbit: window.ObjectOrbit, shader: window.ObjectShader }, be = BK[o.type] || window.ObjectExtrude;
    if (!be) { if (window.console) console.warn('site-kit: load object-' + (o.type || 'extrude') + '.js'); return; }
    var m = be.mount(obj, o), subj = o.subject || o.box, inl = St.createInline({ object: obj, host: host, hero: o.hero, sc: 1, flat: m.flat, delegate: m.delegate, onPose: m.onPose });
    function fit() { var r = host.getBoundingClientRect(); if (!r.width) return; inl.cur.sc = Math.min(0.9 * r.height / subj[1], 0.9 * r.width / subj[0]); }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host); fit();
  };

  INIT.buy = function (el, b) {
    $$('.opts button', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var o = b.options[+btn.dataset.opt];
        $$('.opts button', el).forEach(function (x) { x.setAttribute('aria-checked', String(x === btn)); });
        $('[data-price]', el).textContent = money(o.price, b.currency); $('[data-pick]', el).textContent = o.label;
      });
    });
  };

  var SAVE_KEY = 'sk-saved:' + (SITE.name || 'site');
  function saved() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch (e) { return []; } }
  function setSaved(a) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(a)); } catch (e) {} document.dispatchEvent(new CustomEvent('sk-saved-change')); }
  var num = function (s) { var m = String(s).replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : Infinity; };
  INIT.list = function (el, b) {
    var q = '', fv = b.filter ? b.filter.default : null, res = $('[data-results]', el), status = $('[data-status]', el);
    var meta = function (it) { return it.meta && typeof it.meta === 'object' ? (it.meta[fv] != null ? it.meta[fv] : '') : (it.meta || ''); };
    function draw() {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean), sv = saved();
      var out = b._items.filter(function (it) {
        if (b.savedOnly && sv.indexOf(it.id) < 0) return false;
        var hay = (it.title + ' ' + (it.sub || '') + ' ' + (it.tags || []).join(' ')).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) >= 0; }) && (!b.filter || meta(it) !== '');
      });
      if (b.sort === 'asc') out.sort(function (x, y) { return num(meta(x)) - num(meta(y)); });
      status.textContent = out.length ? out.length + (out.length === 1 ? ' result' : ' results') + (b.sort === 'asc' ? ', lowest first' : '') : '';
      res.innerHTML = out.length ? out.map(function (it, i) {
        var on = sv.indexOf(it.id) >= 0;
        return '<li class="res card"><div class="res-main"><h3>' + esc(it.title) + '</h3><p>' + esc(it.sub || '') + '</p>' + (it.tags ? '<p class="tags num">' + esc(it.tags.join(' · ')) + '</p>' : '') + '</div>' +
          '<div class="res-meta"><span class="price-s num">' + esc(meta(it)) + '</span>' + (i === 0 && b.sort === 'asc' ? '<span class="pill best">Lowest</span>' : '') + '</div>' +
          (b.save === false ? '' : '<button type="button" class="save" data-save="' + esc(it.id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Save ') + esc(it.title) + '">' + ico('star') + '</button>') + '</li>';
      }).join('') : '<li class="empty">' + esc(b.savedOnly ? (b.empty || 'Nothing saved yet. Star a result and it will wait here.') : (b.emptySearch || 'Nothing matches. Try fewer words.')) + '</li>';
    }
    var form = $('[data-search]', el), input = form && $('input', form);
    if (form) { form.addEventListener('submit', function (e) { e.preventDefault(); q = input.value; draw(); }); input.addEventListener('input', function () { q = input.value; draw(); }); }
    $$('[data-sugg]', el).forEach(function (s) { s.addEventListener('click', function () { input.value = s.dataset.sugg; q = s.dataset.sugg; draw(); input.focus(); }); });
    $$('.pickchip', el).forEach(function (c) { c.addEventListener('click', function () { fv = c.dataset.f; $$('.pickchip', el).forEach(function (x) { x.setAttribute('aria-checked', String(x === c)); }); draw(); }); });
    res.addEventListener('click', function (e) {
      var s = e.target.closest('[data-save]'); if (!s) return;
      var a = saved(), id = s.dataset.save, k = a.indexOf(id); if (k >= 0) a.splice(k, 1); else a.push(id); setSaved(a);
    });
    document.addEventListener('sk-saved-change', draw);
    draw();
  };

  function renderBlock(b) { var f = BLOCKS[b.type]; if (!f) return '<p class="label">Unknown block: ' + esc(b.type) + '</p>'; return '<div class="blk blk-' + esc(b.type) + '" data-blk="' + esc(b.type) + '">' + f(b) + '</div>'; }
  var SECTIONS = SH.items.map(function (s) { return [s.id, s.label]; });
  var navHTML = SH.items.map(function (s) { return '<button type="button" data-sec-btn="' + esc(s.id) + '">' + ico(s.icon) + esc(s.label) + '</button>'; }).join('');
  var sectionsHTML = SH.items.map(function (s) { return '<section class="sec" data-sec="' + esc(s.id) + '" hidden>' + s.blocks.map(renderBlock).join('') + '</section>'; }).join('');
  var firstSec = SH.items.length ? SH.items[0].id : '';

  /* ---------- Act 1 markup ---------- */
  var cardsHTML = ST.cards.map(function (f, i) {
    return '<article class="actor card fact" data-actor="f' + i + '"><p class="label">' + esc(f.label) + '</p><p class="v">' + esc(f.value) + '</p><p class="n">' + esc(f.note) + '</p></article>';
  }).join('');
  var partsHTML = PARTS.map(function (p) { return '<button class="part" type="button" data-part-btn="' + esc(p.key) + '" aria-pressed="false"><b>' + esc(p.label) + '</b><span>' + esc(p.desc) + '</span></button>'; }).join('');
  function actionAttr(a) {
    var m = String(a.action || '').split(':');
    if (m[0] === 'part') return 'data-seek-part="' + esc(m[1] || 0) + '"';
    if (m[0] === 'section') return 'data-go="' + esc(m[1]) + '"';
    if (m[0] === 'seek') return 'data-rail="' + esc(m[1] || 0) + '"';
    return 'data-go=""';
  }
  var heroActs = (ST.heroActions.length ? ST.heroActions : [{ label: 'Explore', action: 'section:' + firstSec }]).map(function (a, i) { return '<button class="btn' + (i ? ' ghost' : '') + '" type="button" ' + actionAttr(a) + '>' + esc(a.label) + '</button>'; }).join('');
  var ctaHTML = SITE.cta ? '<button class="btn" type="button" data-go="' + esc(SITE.cta.section) + '">' + esc(SITE.cta.label) + '</button>' : '';
  var outro = ST.outro;
  var railHTML = '<button type="button" data-rail="0" data-at="0">Intro</button>' + (ST.cards.length ? '<button type="button" data-rail="F" data-at="F">' + esc(ST.cardsLabel) + '</button>' : '') +
    (PARTS.length ? '<button type="button" data-rail="P" data-at="P">' + esc(ST.partsLabel) + '</button>' : '') + '<button type="button" data-go="" data-at="9999">Details</button>';

  var stageHTML = !HAS_STAGE ? '' :
    '<div id="track"><div id="stage"><div class="floor" id="floor" aria-hidden="true"></div>' +
      '<div id="camera"><div id="frames" aria-hidden="true"></div><div id="world">' +
        '<div class="rig" id="rig"' + (OBJ ? ' role="img" aria-label="' + esc(SITE.objectLabel || (SITE.name + ', animated')) + '"' : ' aria-hidden="true"') + '><div class="object" id="object"></div></div>' +
        '<div class="actor hero" data-actor="hero"><p class="label" style="margin-bottom:4px">' + esc(SITE.eyebrow || '') + '</p><h1>' + esc(SITE.name) + '</h1><p class="sub">' + esc(SITE.tagline || '') + '</p><div class="actions">' + heroActs + '</div></div>' +
        cardsHTML + '</div></div>' +
      '<div class="hud"><div class="load-bar" id="load-bar" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden></div>' +
        '<header class="top"><div class="brand"><span class="serif">' + esc(SITE.brand || SITE.name) + '</span>' + (SITE.brand && SITE.brand !== SITE.name ? '<span class="label">' + esc(SITE.name) + '</span>' : '') + '</div>' +
          '<div class="right"><button class="btn ghost skip" type="button" data-go="">Skip intro</button>' + ctaHTML + themeSeg() + '</div></header>' +
        (PARTS.length ? '<section class="hud-panel" id="hud-parts" aria-labelledby="parts-h"><div class="copy"><p class="label">' + esc(ST.partsLabel) + '</p><h2 id="parts-h">' + esc(ST.partsHeading || 'Look closer') + '</h2><p class="lead">' + esc(ST.partsLead || '') + '</p></div><div class="parts" role="group" aria-label="Parts">' + partsHTML + '</div></section>' : '') +
        (outro ? '<section class="hud-panel" id="hud-outro" aria-labelledby="outro-h"><div class="copy"><h2 id="outro-h">' + esc(outro.heading) + '</h2><p class="lead">' + esc(outro.lead) + '</p><div class="actions"><button class="btn" type="button" data-go="' + esc(outro.primaryTo || firstSec) + '">' + esc(outro.primary) + '</button>' +
          (outro.secondary ? '<button class="btn ghost" type="button" data-go="' + esc(outro.secondaryTo || (SITE.cta && SITE.cta.section) || firstSec) + '">' + esc(outro.secondary) + '</button>' : '') + '</div></div></section>' : '') +
        '<nav class="rail" aria-label="Chapters" id="rail">' + railHTML + '</nav></div></div></div>';

  document.title = SITE.title || (SITE.brand && SITE.brand !== SITE.name ? SITE.name + ' by ' + SITE.brand : SITE.name);
  document.getElementById('app').innerHTML = stageHTML +
    '<main class="shell" id="details"><aside class="side" aria-label="' + esc(SH.menuLabel) + '"><div class="side-brand"><span class="serif">' + esc(SITE.brand || SITE.name) + '</span>' + (SITE.brand && SITE.brand !== SITE.name ? '<span class="label">' + esc(SITE.name) + '</span>' : '') + '</div>' +
      '<nav class="side-nav">' + navHTML + '</nav><div class="side-foot">' + (HAS_STAGE ? '<button class="btn ghost replay" type="button" data-replay>' + ico('replay').replace('<svg', '<svg style="width:18px;height:18px;margin-right:8px;stroke:currentColor;fill:none;stroke-width:1.7"') + esc(SH.replayLabel) + '</button>' : '') + themeSeg() + '</div></aside>' +
      '<div><div class="m-head"><div class="brand"><span class="serif">' + esc(SITE.brand || SITE.name) + '</span></div>' + themeSeg() + '</div><div class="main" id="main">' + sectionsHTML +
      '<p class="foot-note">' + esc(SITE.footnote || '') + '</p></div></div></main>';
  if (!HAS_STAGE) document.body.classList.add('in-details', 'no-stage');

  // wire block behaviours
  SH.items.forEach(function (s) { $$('[data-sec="' + s.id + '"] [data-blk]').forEach(function (el, i) { var b = s.blocks[i]; if (b && INIT[b.type]) INIT[b.type](el, b); }); });

  /* ---------- loading line ---------- */
  var lb = $('#load-bar');
  document.addEventListener('frames-progress', function (e) {
    if (!lb || (OBJ && OBJ.loader === false)) return;
    var d = e.detail, pct = Math.round(d.loaded / d.total * 100);
    lb.hidden = false; lb.style.setProperty('--p', d.loaded / d.total); lb.setAttribute('aria-valuenow', pct);
    if (d.loaded >= d.total) { lb.classList.add('done'); setTimeout(function () { lb.hidden = true; }, 500); }
  });

  /* ---------- hero object backend: extrude (default), frames, glb, orbit, or none ---------- */
  var mounted = { delegate: true, onPose: function () {} };
  if (HAS_STAGE && OBJ) {
    var BK = { frames: window.ObjectFrames, glb: window.ObjectGlb, orbit: window.ObjectOrbit, shader: window.ObjectShader };
    var backend = BK[OBJ.type] || window.ObjectExtrude;
    if (!backend) throw new Error('site-kit: load object-' + (OBJ.type || 'extrude') + '.js before site-kit.js');
    mounted = backend.mount($('#object'), OBJ); window.__object = mounted;
  }

  /* ---------- optional effects ---------- */
  var HD = SITE.heading || {}, FX = SITE.effects || {};
  if (HD.fontHref) { var fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = HD.fontHref; document.head.appendChild(fl); }
  if (HD.font) root.style.setProperty('--font-display', HD.font);
  if (HD.style && window.TextFx) {
    var h1 = $('.hero h1'); if (h1) TextFx.apply(h1, HD.style);
    $$('.hero-h1').forEach(function (el) { TextFx.apply(el, HD.style); });
    if (HD.sections) $$('.big:not(.hero-h1)').forEach(function (el) { TextFx.apply(el, HD.sections === true ? HD.style : HD.sections); });
  }
  (FX.beam || []).forEach(function (sel) { $$(sel).forEach(function (el) { if (window.BorderBeam) BorderBeam.apply(el); }); });

  /* ---------- theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    $$('[data-theme-btn]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeBtn === t)); });
    try { localStorage.setItem('sk-theme', t); } catch (e) {}
  }
  try { var svd = localStorage.getItem('sk-theme'); if (svd === 'daylight' || svd === 'evening') setTheme(svd); } catch (e) {}
  $$('[data-theme-btn]').forEach(function (b) { b.addEventListener('click', function () { setTheme(b.dataset.themeBtn); }); });

  /* ---------- Act 2: the menu swaps sections ---------- */
  var secs = $$('[data-sec]'), secBtns = $$('[data-sec-btn]'), details = $('#details');
  function openSection(id, replaceHash) {
    if (!secs.some(function (s) { return s.dataset.sec === id; })) id = firstSec;
    secs.forEach(function (s) {
      var on = s.dataset.sec === id; s.hidden = !on; s.classList.remove('in');
      if (on) { void s.offsetWidth; if (!reduceMQ.matches) s.classList.add('in'); }
    });
    secBtns.forEach(function (b) { if (b.dataset.secBtn === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (replaceHash !== false) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
  }
  function goDetails(id) {
    if (id) openSection(id);
    if (HAS_STAGE) details.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  }
  secBtns.forEach(function (b) { b.addEventListener('click', function () { openSection(b.dataset.secBtn); }); });
  if (HAS_STAGE) new IntersectionObserver(function (es) { document.body.classList.toggle('in-details', es[0].isIntersecting); }, { threshold: 0.15 }).observe(details);

  /* ---------- Act 1: timeline, derived from the manifest ---------- */
  var S = null, T = {};
  if (HAS_STAGE) {
    var W = 260, H = 520;
    if (OBJ) { var subj = OBJ.subject || OBJ.box; W = subj[0]; H = subj[1]; }
    var nC = ST.cards.length, F0 = 1.0, STEP = 0.45, lastF = nC ? F0 + STEP * (nC - 1) : 0.4;
    var C = PARTS.map(function (_, i) { return lastF + 1.1 + 0.55 * i; }), c0 = C[0], cN = C.length ? C[C.length - 1] : lastF;
    var outroIn = cN + (PARTS.length ? 0.8 : 0.7), LENGTH = outroIn + 0.9;
    T = { F0: F0, lastF: lastF, C: C, LENGTH: LENGTH };

    var poses = function (vw, vh) {
      var m = vw < 768, fit = m ? Math.min(0.36 * vh / H, 0.8 * vw / W) : Math.min(0.62 * vh / H, 0.40 * vw / W);
      var hero = (OBJ && OBJ.hero) || {};
      var base = { x: 0, y: 0, z: 0, yaw: hero.yaw || 0, pitch: hero.pitch || 0, sc: fit, ax: 0, ay: 0, az: 0, float: 1, swing: 0, lock: 0 };
      var K = function (s, o) { var p = Object.assign({}, base, o); p.s = s; return p; };
      var heroPose = m ? { y: 0.2 * vh, sc: fit * 0.9 } : { x: 0.23 * vw };
      var factsPose = m ? { y: -0.17 * vh, sc: fit * 0.8, swing: hero.swing || 0 } : { y: 0.02 * vh, sc: fit * 0.85, swing: hero.swing || 0 };
      var keys = [K(0, heroPose), K(0.7, heroPose)];
      if (nC) keys.push(K(F0 + 0.15, factsPose), K(lastF + 0.5, factsPose));
      var yaw = base.yaw;
      PARTS.forEach(function (pt, i) {
        var q = Object.assign({}, pt.pose); while (q.yaw < yaw) q.yaw += 360; yaw = q.yaw;
        var z = { x: m ? 0 : -0.03 * vw, y: m ? -0.1 * vh : 0, sc: fit * q.zoom, ax: q.ax, ay: q.ay, az: q.az || 0, yaw: q.yaw, pitch: q.pitch, float: 0.1, lock: 1 };
        keys.push(K(C[i] - 0.16, z), K(C[i] + 0.16, z));
      });
      var oy = base.yaw; while (oy < yaw) oy += 360;
      var outroPose = Object.assign({ yaw: oy }, heroPose);
      keys.push(K(outroIn + 0.15, outroPose), K(outroIn + 9, outroPose));
      return keys;
    };
    var Y = [-70, 50, -30, 70, -10, 40];
    var cardLayout = function (i) { return function (vw, vh) {
      if (vw < 768) return { x: 0, y: 0.25 * vh, side: 0 };
      var side = i % 2 === 0 ? -1 : 1; return { x: side * Math.min(vw * 0.30, 430), y: Y[i % Y.length] * vh / 900, side: side };
    }; };
    var actors = [{ el: $('[data-actor="hero"]'), at: 0, tilt: 0, fly: { near: -40, approach: 1, exit: 1600, leave: 0.45 },
      layout: function (vw, vh) { return vw < 768 ? { x: 0, y: -0.2 * vh, side: 0 } : { x: -0.235 * vw, y: 0, side: 0 }; } }];
    ST.cards.forEach(function (_, i) { actors.push({ el: $('[data-actor="f' + i + '"]'), at: F0 + STEP * i, tilt: 12, layout: cardLayout(i) }); });

    var frames = [], fh = $('#frames');
    for (var f = 0; f < 7; f++) { var fe = document.createElement('div'); fe.className = 'frame'; fh.appendChild(fe); frames.push(fe); }
    var object = $('#object'), floorEl = $('#floor'), hudParts = $('#hud-parts'), hudOutro = $('#hud-outro');
    var partBtns = $$('[data-part-btn]'), partEls = $$('[data-part]', object), railBtns = $$('#rail button');
    if (OBJ) { floorEl.style.width = Math.max(W, H * 0.6) + 'px'; floorEl.style.marginLeft = -Math.max(W, H * 0.6) / 2 + 'px'; } else floorEl.style.display = 'none';
    var activePart = null, lastLight = null, activeRail = -1;
    var hudShow = function (el, op) { if (el) { el.style.opacity = op.toFixed(3); el.style.visibility = op < 0.02 ? 'hidden' : 'visible'; } };

    S = St.create({
      track: $('#track'), stage: $('#stage'), world: $('#world'), rig: $('#rig'), object: object,
      length: LENGTH, poses: poses, actors: actors, also: [fh], flat: mounted.flat, delegate: mounted.delegate, onPose: mounted.onPose,
      onFrame: function (S) {
        var s = S.s, p = S.pose;
        hudShow(hudParts, PARTS.length ? St.fadeWindow(s, lastF + 0.55, lastF + 0.95, cN + 0.35, cN + 0.75) : 0);
        hudShow(hudOutro, St.fadeWindow(s, outroIn, outroIn + 0.3, 99, 100));
        var inParts = PARTS.length && s > c0 - 0.4 && s < cN + 0.4, key = null, best = 9;
        if (inParts) PARTS.forEach(function (pt, i) { var d = Math.abs(s - C[i]); if (d < best) { best = d; key = pt.key; } });
        if (key !== activePart) { activePart = key; partBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.partBtn === key)); }); }
        if (key !== lastLight) { lastLight = key; partEls.forEach(function (g) { g.classList.toggle('on', g.dataset.part === key); }); }
        frames.forEach(function (fe, i) {
          if (S.reduce) return;
          var z = ((i * 520 + s * 700) % 3640 + 3640) % 3640 - 3200;
          fe.style.transform = 'translateZ(' + z + 'px)';
          fe.style.opacity = (St.flyOpacity(z) * 0.5 * (1 - St.smooth((z + 500) / 400))).toFixed(3);
        });
        if (OBJ) {
          floorEl.style.transform = 'translate(' + p.x + 'px,' + (S.rigY + (H / 2) * 0.94 * p.sc + 6) + 'px) scale(' + (1 + S.rigZ / 1400) + ',1)';
          floorEl.style.opacity = (0.55 * (1 - p.lock)).toFixed(2);
        }
        var cur = 0; railBtns.forEach(function (b, i) {
          var at = b.dataset.at === 'F' ? F0 : b.dataset.at === 'P' ? (c0 || 0) - 0.3 : parseFloat(b.dataset.at);
          if (s >= at - 0.3) cur = i;
        });
        if (cur !== activeRail) { activeRail = cur; railBtns.forEach(function (b, i) { if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); }
      }
    });
    partBtns.forEach(function (b, i) { b.addEventListener('click', function () { S.seek(C[i]); }); });
    $$('[data-seek-part]').forEach(function (b) { b.addEventListener('click', function () { if (C.length) S.seek(C[+b.dataset.seekPart]); else goDetails(firstSec); }); });
    $$('[data-rail]').forEach(function (b) { b.addEventListener('click', function () { S.seek(b.dataset.rail === 'F' ? F0 : b.dataset.rail === 'P' ? c0 : 0); }); });
    window.__stage = S; window.__timeline = T;
  }

  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { goDetails(b.dataset.go || null); }); });
  $$('[data-replay]').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMQ.matches ? 'auto' : 'smooth' }); }); });
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) {
      if (reduceMQ.matches) return;
      var r = b.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2, d = document.createElement('span');
      d.className = 'ripple';
      d.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + (e.clientX - r.left - sz / 2) + 'px;top:' + (e.clientY - r.top - sz / 2) + 'px';
      b.appendChild(d);
      d.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(0.23,1,0.32,1)' }).onfinish = function () { d.remove(); };
    });
  });

  /* deep link: #<section id> lands straight in Act 2 */
  var hash = (location.hash || '').slice(1), known = SECTIONS.some(function (s) { return s[0] === hash; });
  openSection(known ? hash : firstSec, false);
  if (known && HAS_STAGE) requestAnimationFrame(function () { details.scrollIntoView({ behavior: 'auto' }); });
})();
