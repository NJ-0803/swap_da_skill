/*! motion-debug.js | Bhookmark UI | slow-motion, pause, frame-step and a motion linter for ANY page. No dependencies.
 *
 *   <script src="motion-debug.js"></script>            then add ?motion-debug to the URL, or call MotionDebug.open()
 *   Keys (panel open):  1..4 = 1x .5x .25x .1x   Space = pause / resume   . = step one frame   L = list animations
 *
 * What it slows: CSS transitions, CSS animations and Web Animations (via document.getAnimations()),
 * and anything driven by stage-engine.js (via window.__motionScale). It does not slow raw
 * requestAnimationFrame code that ignores __motionScale, which is why the engine reads it.
 * It also flags animations that touch layout or paint properties, and counts frames that ran long.
 */
(function (root) {
  'use strict';
  var SPEEDS = [['1×', 1], ['½×', 0.5], ['¼×', 0.25], ['⅒×', 0.1]];
  var GOOD = /^(transform|opacity|translate|rotate|scale|offset|filter|backdrop-filter)$/;          // compositor-friendly
  var PAINT = /^(color|background(-color|-position)?|border-color|fill|stroke|outline-color|text-decoration-color|clip-path|mask(-position)?)$/;
  var state = { scale: 1, paused: false, panel: null, timer: 0, seen: new WeakSet(), flagged: {}, frames: 0, long: 0, last: 0, fps: 0, fpsT: 0, fpsN: 0 };

  function camel2kebab(p) { return p.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }); }

  function props(a) {
    var out = {};
    try {
      if (a.transitionProperty) out[a.transitionProperty] = 1;
      var kf = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : [];
      kf.forEach(function (k) { Object.keys(k).forEach(function (p) { if (!/^(offset|computedOffset|easing|composite)$/.test(p)) out[camel2kebab(p)] = 1; }); });
    } catch (e) {}
    return Object.keys(out);
  }
  function describe(a) {
    var t = a.effect && a.effect.target, name = a.animationName || a.transitionProperty || 'animation';
    var who = t ? (t.tagName || '').toLowerCase() + (t.id ? '#' + t.id : '') + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/)[0] : '') : '?';
    return who + ' · ' + name;
  }

  function apply() {
    var list = document.getAnimations();
    list.forEach(function (a) {
      try {
        if (state.paused) a.pause(); else if (a.playState === 'paused' && state.wasPausedByUs) a.play();
        a.playbackRate = state.scale;
      } catch (e) {}
      if (!state.seen.has(a)) {
        state.seen.add(a);
        props(a).forEach(function (p) {
          if (GOOD.test(p)) return;
          var kind = PAINT.test(p) ? 'paint' : 'layout';
          var key = describe(a) + '|' + p;
          if (!state.flagged[key]) { state.flagged[key] = { who: describe(a), prop: p, kind: kind, sev: kind === 'layout' ? 'warn' : 'info' }; if (kind === 'layout' && root.console) console.warn('[motion-debug] ' + describe(a) + ' animates "' + p + '" (layout every frame; prefer transform/opacity)'); }
        });
      }
    });
    state.wasPausedByUs = state.paused;
    render();
  }

  function setScale(s) { state.scale = s; root.__motionScale = s; apply(); }
  function setPaused(p) { state.paused = p; root.__motionPaused = p; root.__motionStep = false; apply(); }
  function step() {
    if (!state.paused) setPaused(true);
    root.__motionStep = true;
    document.getAnimations().forEach(function (a) { try { a.currentTime = (a.currentTime || 0) + 1000 / 60 * state.scale; } catch (e) {} });
    render();
  }

  function el(tag, css, html) { var n = document.createElement(tag); if (css) n.style.cssText = css; if (html != null) n.innerHTML = html; return n; }
  function build() {
    var p = el('div', 'position:fixed;z-index:2147483647;right:12px;bottom:12px;width:300px;max-height:60vh;overflow:auto;padding:12px;border-radius:14px;background:rgba(20,18,16,.94);color:#f3eee7;font:12px/1.45 ui-monospace,Menlo,monospace;box-shadow:0 20px 50px rgba(0,0,0,.6);border:1px solid #6b6259');
    p.setAttribute('role', 'region'); p.setAttribute('aria-label', 'Motion debugger'); p.setAttribute('data-motion-debug', '');
    p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="letter-spacing:.08em">MOTION DEBUG</b><button data-x style="all:unset;cursor:pointer;padding:6px 10px">close</button></div>' +
      '<div data-speeds style="display:flex;gap:6px;margin-bottom:8px"></div>' +
      '<div style="display:flex;gap:6px;margin-bottom:8px"><button data-pause></button><button data-step>step ▸</button></div>' +
      '<div data-stats style="color:#bdb3a9;margin-bottom:8px"></div><div data-list></div>';
    var sp = p.querySelector('[data-speeds]');
    SPEEDS.forEach(function (s) { var b = el('button', '', s[0]); b.dataset.speed = s[1]; sp.appendChild(b); });
    p.querySelectorAll('button').forEach(function (b) { b.style.cssText += ';cursor:pointer;min-height:32px;min-width:44px;padding:0 10px;border-radius:8px;border:1px solid #6b6259;background:#2d2a27;color:#f3eee7;font:inherit'; });
    p.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-x')) close(); else if (b.dataset.speed) setScale(+b.dataset.speed); else if (b.hasAttribute('data-pause')) setPaused(!state.paused); else if (b.hasAttribute('data-step')) step();
    });
    document.body.appendChild(p); return p;
  }
  function render() {
    var p = state.panel; if (!p) return;
    p.querySelectorAll('[data-speed]').forEach(function (b) { var on = +b.dataset.speed === state.scale; b.style.background = on ? '#8e3340' : '#2d2a27'; b.setAttribute('aria-pressed', String(on)); });
    p.querySelector('[data-pause]').textContent = state.paused ? 'resume ▶' : 'pause ❚❚';
    var live = document.getAnimations().length;
    p.querySelector('[data-stats]').innerHTML = 'speed ' + state.scale + '× · ' + live + ' running · ' + state.fps + ' fps · ' + state.long + ' long frames (>20ms)';
    var f = Object.keys(state.flagged).map(function (k) { return state.flagged[k]; });
    f.sort(function (a, b) { return a.sev === b.sev ? 0 : a.sev === 'warn' ? -1 : 1; });
    p.querySelector('[data-list]').innerHTML = f.length ? f.map(function (x) {
      return '<div style="padding:4px 0;border-top:1px solid #3a3531"><span style="color:' + (x.sev === 'warn' ? '#e58a92' : '#bdb3a9') + '">' + x.sev + '</span> ' + x.who + ' → <b>' + x.prop + '</b> (' + x.kind + ')</div>';
    }).join('') : '<div style="color:#bdb3a9">No layout or paint animations seen yet. Trigger some.</div>';
  }
  function loop(t) {
    if (state.last) { var d = t - state.last; state.frames++; if (d > 20) state.long++; state.fpsT += d; state.fpsN++; if (state.fpsT >= 500) { state.fps = Math.round(state.fpsN * 1000 / state.fpsT); state.fpsT = 0; state.fpsN = 0; } }
    state.last = t; if (state.panel) requestAnimationFrame(loop);
  }
  function onKey(e) {
    if (!state.panel || /input|textarea/i.test((e.target.tagName || ''))) return;
    if (e.key >= '1' && e.key <= '4') setScale(SPEEDS[+e.key - 1][1]);
    else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); setPaused(!state.paused); }
    else if (e.key === '.') step();
  }
  function open() {
    if (state.panel) return; state.panel = build(); state.last = 0; requestAnimationFrame(loop);
    state.timer = setInterval(apply, 200); document.addEventListener('keydown', onKey); apply();
  }
  function close() {
    if (!state.panel) return; setScale(1); setPaused(false); clearInterval(state.timer); document.removeEventListener('keydown', onKey);
    state.panel.remove(); state.panel = null; root.__motionScale = 1;
  }
  root.MotionDebug = { open: open, close: close, setScale: setScale, pause: function () { setPaused(true); }, resume: function () { setPaused(false); }, step: step, flagged: function () { return Object.keys(state.flagged).map(function (k) { return state.flagged[k]; }); } };
  if (/[?&]motion-debug/.test(location.search)) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open); else open(); }
  var m = location.search.match(/[?&]motion=([\d.]+)/); if (m) { root.__motionScale = +m[1]; }
})(window);
