/*! object-extrude.js | Swap da Skill | object backend #1: an SVG outline extruded in CSS 3D.
 *  Backend contract (every backend implements this):
 *    Backend.mount(el, spec) -> { flat: boolean, onPose?(yawDeg, pitchDeg) }
 *  flat:false  the engine rotates and scales `el` in 3D (this backend).
 *  flat:true   the engine only scales and translates `el`; the backend picks what to draw from yaw.
 *  The wall is a stack of thin outline rings and each side gets ONE solid cap inside its face SVG:
 *  many large filled planes 2px apart make Chrome's 3D depth sort flicker in bands. */
(function (root) {
  'use strict';
  function mount(el, spec) {
    var W = spec.box[0], H = spec.box[1], VB = '0 0 ' + W + ' ' + H;
    function ring(s) {
      var out = '', bevel = s.bevel != null ? s.bevel : 0.015, sw = s.ring || 6;
      for (var i = 0; i < s.n; i++) {
        var t = s.n === 1 ? 0 : (i / (s.n - 1)) * 2 - 1, k = Math.round(Math.pow(Math.abs(t), 3) * 100);
        var sc = 1 - bevel * (1 - Math.sqrt(1 - t * t)), z = s.z + t * s.depth / 2;
        out += '<svg class="slice" width="' + W + '" height="' + H + '" viewBox="' + VB + '" style="transform:translateZ(' + z.toFixed(2) + 'px) scale(' + sc.toFixed(4) +
          ');fill:none;stroke-width:' + sw + ';stroke:color-mix(in srgb,' + s.rim + ' ' + k + '%,' + s.core + ')"><use href="#g-' + s.id + '"/></svg>';
      }
      return out;
    }
    function face(f) {
      var s = spec.slabs.filter(function (x) { return x.id === f.slab; })[0], back = f.side === 'back';
      var z = back ? s.z - s.depth / 2 - 0.5 : s.z + s.depth / 2 + 0.5;
      var inner = '<use href="#g-' + s.id + '" style="fill:' + s.rim + ';stroke:none"/>' + f.svg;
      if (back) inner = '<g transform="translate(' + W + ' 0) scale(-1 1)">' + inner + '</g>';
      return '<svg class="face" data-side="' + f.side + '" width="' + W + '" height="' + H + '" viewBox="' + VB + '" style="transform:translateZ(' + z.toFixed(2) + 'px)' + (back ? ' rotateY(180deg)' : '') + '">' + inner + '</svg>';
    }
    el.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + (-W / 2) + 'px;top:' + (-H / 2) + 'px';
    el.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      spec.slabs.map(function (s) { return '<path id="g-' + s.id + '" d="' + s.path + '"/>'; }).join('') + '</defs></svg>' +
      spec.slabs.map(ring).join('') + spec.faces.map(face).join('');
    return { flat: false };
  }
  root.ObjectExtrude = { mount: mount };
})(window);
