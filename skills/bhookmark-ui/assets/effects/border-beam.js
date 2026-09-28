/*! border-beam.js | Bhookmark UI | BorderBeam.apply(el, { width, duration, a, b }) */
(function (root) {
  'use strict';
  function apply(el, o) {
    if (!el || el.querySelector(':scope > .beam-ring')) return;
    o = o || {};
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';   // never override absolute actors
    el.classList.add('beam');
    var r = document.createElement('span'); r.className = 'beam-ring'; r.setAttribute('aria-hidden', 'true');
    el.insertBefore(r, el.firstChild);
    if (o.width) el.style.setProperty('--beam-w', o.width);
    if (o.duration) el.style.setProperty('--beam-dur', o.duration);
    if (o.a) el.style.setProperty('--beam-a', o.a);
    if (o.b) el.style.setProperty('--beam-b', o.b);
  }
  root.BorderBeam = { apply: apply };
})(window);
