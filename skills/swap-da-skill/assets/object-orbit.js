/*! object-orbit.js | Swap da Skill | object backend #4: labelled chips travelling on tilted rings. No model, no images.
 *  For a portfolio's skills, a product's integrations, a team, anything that orbits a centre.
 *    object: { type: 'orbit', box: [520, 420], hero: { yaw: 0, pitch: 0, swing: 18 },
 *              orbit: { core: 'Mira', rings: [ { r: 190, tiltX: 66, tiltZ: -12, speed: 0.20, items: ['PY', 'TS', 'Go'] }, ... ] } }
 *  Positions are projected in JavaScript (no overlapping CSS 3D planes, so no depth-sort artefacts); chips fade
 *  toward the back and always face the viewer. The engine's yaw and pitch turn the whole system, its scale zooms it.
 *  With prefers-reduced-motion the chips hold still. Chips are decorative: label the object on the page. */
(function (root) {
  'use strict';
  var D = 1100, still = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)');
  function mount(el, spec) {
    var W = spec.box[0], H = spec.box[1], o = spec.orbit, rad = Math.PI / 180, chips = [];
    el.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + (-W / 2) + 'px;top:' + (-H / 2) + 'px';
    el.innerHTML = '<svg class="orbit-svg" width="' + W + '" height="' + H + '" viewBox="' + (-W / 2) + ' ' + (-H / 2) + ' ' + W + ' ' + H + '" aria-hidden="true">' +
      o.rings.map(function () { return '<path class="orbit-ring" fill="none"/>'; }).join('') + '</svg><span class="orbit-core" aria-hidden="true"><i></i></span>';
    var paths = Array.prototype.slice.call(el.querySelectorAll('.orbit-ring'));
    o.rings.forEach(function (ring, ri) {
      ring.items.forEach(function (label, i) {
        var c = document.createElement('span'); c.className = 'orbit-chip'; c.setAttribute('aria-hidden', 'true'); c.textContent = label;
        el.appendChild(c); chips.push({ el: c, ring: ring, ri: ri, a0: (i / ring.items.length) * Math.PI * 2 + (ri * 0.7) });
      });
    });
    function ringPt(r, a, tx, tz) {
      var x = r * Math.cos(a), z = r * Math.sin(a);
      var y1 = -z * Math.sin(tx), z1 = z * Math.cos(tx);                    // tilt about X
      return [x * Math.cos(tz) - y1 * Math.sin(tz), x * Math.sin(tz) + y1 * Math.cos(tz), z1];   // tilt about Z
    }
    function project(p, yaw, pitch, sc) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;          // yaw about Y
      var y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;               // pitch about X (CSS convention, y down)
      var s = D / (D - z2); return { x: x1 * s * sc, y: y2 * s * sc, z: z2, s: s * sc };
    }
    function onPose(yawDeg, pitchDeg, cur, t) {
      var yaw = yawDeg * rad, pitch = pitchDeg * rad, sc = cur.sc, time = (still && still.matches) ? 0 : (t != null ? t : performance.now() / 1000);
      chips.forEach(function (c) {
        var a = c.a0 + time * c.ring.speed, p = ringPt(c.ring.r, a, c.ring.tiltX * rad, c.ring.tiltZ * rad), q = project(p, yaw, pitch, sc);
        var back = (q.z / (c.ring.r || 1) + 1) / 2;                          // 0 far .. 1 near
        c.el.style.transform = 'translate(-50%,-50%) translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px) scale(' + (q.s).toFixed(3) + ')';
        c.el.style.opacity = (0.4 + 0.6 * back).toFixed(2); c.el.style.zIndex = Math.round(q.z + 1000);
      });
      o.rings.forEach(function (ring, i) {
        var d = '';
        for (var k = 0; k <= 72; k++) { var q = project(ringPt(ring.r, k / 72 * Math.PI * 2, ring.tiltX * rad, ring.tiltZ * rad), yaw, pitch, sc); d += (k ? 'L' : 'M') + (q.x).toFixed(1) + ' ' + (q.y).toFixed(1); }
        paths[i].setAttribute('d', d);
      });
    }
    onPose(spec.hero ? spec.hero.yaw || 0 : 0, spec.hero ? spec.hero.pitch || 0 : 0, { sc: 1 }, 0);
    return { delegate: true, onPose: onPose };
  }
  root.ObjectOrbit = { mount: mount };
})(window);
