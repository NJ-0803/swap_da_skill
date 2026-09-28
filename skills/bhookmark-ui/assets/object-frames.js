/*! object-frames.js | Bhookmark UI | object backend #2: a pre-rendered turntable, scrubbed by yaw.
 *  A company exports N frames of its own render turning through 360 degrees (Blender, Keyshot, C4D, a
 *  photographed turntable) and points the manifest at them:
 *    object: { type: 'frames', box: [w, h], subject: [w, h],
 *              frames: { count: 30, src: 'frames/f_{n}.webp', pad: 2, maxWidth: 900, concurrency: 4 } }
 *  The stage's yaw picks the frame; the frame before and after are cross-faded, so 30 frames is enough.
 *  Any image format the browser decodes works (WebP with alpha is the default of render-turntable.mjs).
 *  Loading: frames arrive coarse to fine (a rough turntable after a handful of files, full smoothness after
 *  all), are decoded off the main thread with createImageBitmap, and can be down-scaled with maxWidth to cap
 *  memory. Progress: spec.onProgress(loaded, total) and a bubbling 'frames-progress' event on the element.
 *  Anchors (ax, ay) are where the feature appears IN THE FRAME at that yaw, px from centre. Pitch is ignored. */
(function (root) {
  'use strict';
  function order(N) {                       // coarse to fine: every ~N/6th frame, then every ~N/12th, then the rest
    var seen = {}, out = [];
    [Math.max(1, Math.round(N / 6)), Math.max(1, Math.round(N / 12)), 1].forEach(function (step) {
      for (var i = 0; i < N; i += step) if (!seen[i]) { seen[i] = 1; out.push(i); }
    });
    return out;
  }
  function mount(el, spec) {
    var W = spec.box[0], H = spec.box[1], fr = spec.frames, N = fr.count, pad = fr.pad || String(N - 1).length;
    var imgs = new Array(N), ready = 0, last = { i: -1, t: -1 }, conc = fr.concurrency || 4;
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.className = 'frames-canvas'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px';
    el.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + (-W / 2) + 'px;top:' + (-H / 2) + 'px';
    el.innerHTML = ''; el.appendChild(cv);
    function url(i) { return fr.src.replace('{n}', String(i).padStart(pad, '0')); }
    function size(im) { if (cv.width !== im.width) { cv.width = im.width; cv.height = im.height; last.i = -1; } }
    function done(i, img) {
      if (img) imgs[i] = img; else if (root.console) console.warn('[object-frames] missing ' + url(i));
      ready++;
      if (spec.onProgress) spec.onProgress(ready, N);
      el.dispatchEvent(new CustomEvent('frames-progress', { bubbles: true, detail: { loaded: ready, total: N } }));
      last.i = -1;                                                  // redraw: a better neighbour may have just arrived
    }
    var natW = 0;                                                    // native width, learned from the first frame
    function load(i) {
      // CAPPED DENSITY: never decode more than ~2.5x the frame's CSS size at 2x density. Only ever shrinks, never upscales.
      var cap = Math.min(fr.maxWidth || Infinity, Math.round(W * Math.min(root.devicePixelRatio || 1, 2) * 2.5));
      var opts = natW && natW > cap ? { resizeWidth: cap, resizeQuality: 'high' } : undefined;
      function got(im) { if (!natW) natW = im.width; done(i, im); }
      if (root.createImageBitmap && root.fetch) {
        return fetch(url(i)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
          .then(function (b) { return createImageBitmap(b, opts); }).then(got, function () { done(i, null); });
      }
      return new Promise(function (res) { var im = new Image(); im.onload = function () { got(im); res(); }; im.onerror = function () { done(i, null); res(); }; im.src = url(i); });
    }
    var queue = order(N), active = 0;
    function pump() { while (active < conc && queue.length) { active++; load(queue.shift()).then(function () { active--; pump(); }); } }
    active = 1; load(queue.shift()).then(function () { active = 0; pump(); });   // frame 0 alone first, so the rest know the native size
    function nearest(i) { for (var d = 0; d < N; d++) { var a = imgs[(i + d) % N], b = imgs[(i - d + N * 2) % N]; if (a) return a; if (b) return b; } return null; }
    function onPose(yaw) {
      var a = (((yaw % 360) + 360) % 360) / 360 * N, i0 = Math.floor(a) % N, t = a - Math.floor(a), i1 = (i0 + 1) % N;
      if (i0 === last.i && last.t >= 0 && Math.abs(t - last.t) < 0.02) return;
      // Cross-fade ONLY when both neighbours are loaded; otherwise the single closest loaded frame (no ghosts).
      var both = imgs[i0] && imgs[i1], A = both ? imgs[i0] : nearest(t < 0.5 ? i0 : i1); if (!A) return;
      size(A); ctx.clearRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; ctx.drawImage(A, 0, 0, cv.width, cv.height);
      if (both && t > 0.02) { ctx.globalAlpha = t; ctx.drawImage(imgs[i1], 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
      last.i = i0; last.t = both ? t : -1;
    }
    return { flat: true, onPose: onPose, loaded: function () { return ready; }, total: N };
  }
  root.ObjectFrames = { mount: mount };
})(window);
