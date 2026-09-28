/*! text-effects.js | Bhookmark UI | TextFx.apply(el, 'breathe' | 'wave' | 'reveal' | 'shimmer' | 'gradient')
 *  Letter styles (wave, reveal) split the text into spans, keep nested markup like <em>, put the full text in a
 *  visually hidden span as the accessible name and hide the animated pieces from screen readers. Words never break mid-word. Pair with text-effects.css. */
(function (root) {
  'use strict';
  var STYLES = ['breathe', 'wave', 'reveal', 'shimmer', 'gradient'];
  function mk(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  function split(el) {                                  // keeps nested inline markup (<em>) and stays readable to screen readers
    var full = el.textContent.replace(/\s+/g, ' ').trim(), i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = mk('span', 'fx-word');
            Array.from(part).forEach(function (ch) { var c = mk('span', 'fx-ch'); c.style.setProperty('--i', i++); c.textContent = ch; w.appendChild(c); });
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    var vis = mk('span', 'fx-vis'); vis.setAttribute('aria-hidden', 'true');
    while (el.firstChild) vis.appendChild(el.firstChild);
    var sr = mk('span', 'sr-only'); sr.textContent = full;   // the accessible name; the animated pieces are hidden from AT
    el.appendChild(sr); el.appendChild(vis);
  }
  function apply(el, style, opts) {
    if (!el || STYLES.indexOf(style) < 0) return;
    opts = opts || {};
    el.classList.add('fx', 'fx-' + style);
    if (style === 'wave' || style === 'reveal') split(el);
    if (opts.font) el.style.fontFamily = opts.font;
    if (opts.duration) el.style.setProperty('--fx-dur', opts.duration);
    if (opts.min != null) el.style.setProperty('--fx-min', opts.min);
  }
  root.TextFx = { apply: apply, styles: STYLES };
})(window);
