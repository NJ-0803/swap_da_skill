/*! orb.js | Bhookmark UI | Orb.mount(el, state) builds the orb; Orb.set(el, state); Orb.level(el, 0..1) for audio-reactive listening */
(function (root) {
  'use strict';
  var LABEL = { idle: 'Idle', thinking: 'Thinking', listening: 'Listening' };
  function set(el, state) {
    if (!LABEL[state]) state = 'idle';
    el.dataset.state = state; el.setAttribute('aria-label', LABEL[state]);
  }
  function mount(el, state) {
    el.classList.add('orb'); el.setAttribute('role', 'img');
    el.innerHTML = '<i class="orb-halo"></i><i class="orb-body"><i class="orb-swirl"></i><i class="orb-swirl two"></i><i class="orb-shine"></i></i>';
    set(el, state || 'idle'); return el;
  }
  function level(el, v) { el.style.setProperty('--orb-level', Math.max(0, Math.min(1, v)).toFixed(3)); }
  root.Orb = { mount: mount, set: set, level: level };
})(window);
