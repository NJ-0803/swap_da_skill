/*! stage-engine.js  |  Bhookmark UI  |  no dependencies
 *
 * A scroll-driven, pinned 3D stage. The page is one viewport tall and stays put;
 * scrolling drives a timeline `s` (in viewport-heights) that moves a camera-less
 * world: actors fly through depth, one hero object turns to keyframed poses, and
 * HUD panels fade in and out. Nothing here knows about shoes or products.
 *
 * DOM contract (all positioned absolute, left:50%; top:50%, inside #world which
 * is transform-style: preserve-3d and has NO filter / opacity / overflow):
 *   track  : tall runway, engine sets its height
 *   stage  : position: sticky; top: 0; height: 100vh; perspective host's parent
 *   world  : preserve-3d container, holds the rig and the actors
 *            Large flat planes the object can rotate THROUGH (depth frames, floors, panels) must NOT live here:
 *            Chrome splits the object's polygons along the intersection and draws diagonal strips. Give them
 *            their own sibling preserve-3d container (see o.also).
 *   rig    : moves the hero object in space (translate3d)
 *   object : the hero object; engine sets rotate/scale/translate on it
 * The engine only reads/writes inline transform, opacity, visibility, filter and
 * pointer-events on these elements.
 */
(function (root) {
  'use strict';

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var damp = function (cur, tgt, rate, dt) { return cur + (tgt - cur) * (1 - Math.exp(-rate * dt)); };
  var POSE = ['x', 'y', 'z', 'yaw', 'pitch', 'sc', 'ax', 'ay', 'az', 'float', 'swing', 'lock'];

  /** Interpolate keyframed poses at scene time s. Two keys with the same values make a HOLD. */
  function poseAt(keys, s) {
    if (s <= keys[0].s) return keys[0];
    var last = keys[keys.length - 1];
    if (s >= last.s) return last;
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i], b = keys[i + 1];
      if (s >= a.s && s < b.s) {
        var t = smooth((s - a.s) / (b.s - a.s)), out = {};
        POSE.forEach(function (k) { out[k] = (a[k] || 0) + ((b[k] || 0) - (a[k] || 0)) * t; });
        return out;
      }
    }
    return last;
  }

  /** Depth of something flying past. d = s - at. Arrives slowly, dwells near z=near, then accelerates past the camera. */
  function flyZ(d, o) {
    o = o || {};
    var near = o.near != null ? o.near : -70, far = o.far || 2000, appr = o.approach || 1.1,
        exit = o.exit || 1100, leave = o.leave || 0.7;
    if (d < 0) return near - far * Math.pow(Math.min(-d / appr, 1), 1.5);
    return near + exit * Math.pow(Math.min(d / leave, 1), 1.6);
  }
  /** Fade in from the far distance, fade out as it passes the camera. */
  function flyOpacity(z) {
    return smooth((z + 1900) / 900) * (1 - smooth((z - 60) / 440));
  }
  /** 0..1 window: rises across [inA,inB], falls across [outA,outB]. */
  function fadeWindow(s, inA, inB, outA, outB) {
    return smooth((s - inA) / (inB - inA)) * (1 - smooth((s - outA) / (outB - outA)));
  }
  function show(el, op, interactiveAt) {
    el.style.opacity = op.toFixed(3);
    el.style.visibility = op < 0.02 ? 'hidden' : 'visible';   // hidden = out of the tab order too
    el.style.pointerEvents = op > (interactiveAt || 0.6) ? 'auto' : 'none';
  }

  function create(o) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var S = { s: 0, target: 0, vw: 0, vh: 0, mx: 0, my: 0, t: 0, frozen: false, reduce: reduce.matches, pose: null };
    var keys, cur = null, last = 0;
    var pointer = { x: 0, y: 0 };
    var drag = { on: false, x: 0, y: 0, yaw: 0, pitch: 0 };
    var trackTop = 0;

    function measure() {
      S.vw = window.innerWidth; S.vh = window.innerHeight;
      o.track.style.height = ((o.length + 1) * 100) + 'vh';
      trackTop = o.track.getBoundingClientRect().top + window.scrollY;
      keys = o.poses(S.vw, S.vh);
    }
    function readScroll() { return clamp((window.scrollY - trackTop) / S.vh, 0, o.length); }
    function seek(s) {
      window.scrollTo({ top: trackTop + s * S.vh, behavior: S.reduce ? 'auto' : 'smooth' });
    }

    function placeActor(a) {
      var d = S.s - a.at, L = a.layout(S.vw, S.vh), x = L.x, y = L.y, z, op, rot = 0, blur = 0;
      if (S.reduce) {                       // no zoom-through: only the focused actor shows, crossfaded
        z = -60; op = 1 - smooth(Math.abs(d) / 0.22);
      } else {
        z = flyZ(d, a.fly); op = flyOpacity(z);
        rot = -(L.side || 0) * (a.tilt || 0) * (0.5 + 0.5 * clamp(Math.abs(z + 70) / 800, 0, 1));
        blur = clamp((-z - 500) / 700, 0, 1) * 3;
      }
      a.el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateY(' + rot + 'deg) translate(-50%,-50%)';
      a.el.style.filter = blur > 0.2 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
      show(a.el, op);
      if (a.held) a.el.style.visibility = 'hidden';   // e.g. the source of a shared-element morph
    }

    function placeRig(dt) {
      var tgt = poseAt(keys, S.s);
      if (!cur) { cur = {}; POSE.forEach(function (k) { cur[k] = tgt[k] || 0; }); }
      POSE.forEach(function (k) {
        cur[k] = S.reduce ? (tgt[k] || 0) : damp(cur[k], tgt[k] || 0, (k === 'yaw' || k === 'pitch') ? 6 : 7, dt);
      });
      if (!drag.on) { drag.yaw = damp(drag.yaw, 0, 2.5, dt); drag.pitch = damp(drag.pitch, 0, 2.5, dt); }
      var free = 1 - clamp(cur.lock, 0, 1);            // lock = 1 means "stands fixed": no parallax, no drag
      var fl = S.reduce ? 0 : cur.float;
      var z = cur.z + fl * (110 * Math.sin(S.t * 0.9) + 30 * Math.sin(S.t * 2.1));   // in and out of the screen
      var y = cur.y + fl * 10 * Math.sin(S.t * 1.3);
      var yaw = cur.yaw + cur.swing * Math.sin(S.s * 2.2) + free * (S.mx * 7 + drag.yaw) + fl * 2 * Math.sin(S.t * 0.5);
      var pitch = cur.pitch - free * S.my * 4 + free * drag.pitch;
      o.rig.style.transform = 'translate3d(' + cur.x + 'px,' + y + 'px,' + z + 'px)';
      if (o.delegate) {                                // backend renders itself (WebGL model): it gets the whole pose
        if (o.onPose) o.onPose(yaw, pitch, cur);
      } else if (o.flat) {                             // 2D backend (frame sequence): yaw picks the frame, no 3D turn
        o.object.style.transform = 'scale(' + cur.sc + ') translate(' + (-cur.ax) + 'px,' + (-cur.ay) + 'px)';
        if (o.onPose) o.onPose(yaw, pitch);
      } else {
        o.object.style.transform = 'rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg) scale(' + cur.sc + ') translate(' + (-cur.ax) + 'px,' + (-cur.ay) + 'px)';
      }
      S.pose = cur; S.rigY = y; S.rigZ = z; S.yaw = yaw;
    }

    function frame(now) {
      // motion-debug.js hooks: window.__motionScale (slow-mo), __motionPaused + __motionStep (frame stepping)
      var raw = Math.min(0.05, ((now || 0) - (last || now || 0)) / 1000); last = now;
      var dt = raw * (window.__motionScale == null ? 1 : window.__motionScale);
      if (window.__motionPaused) {
        if (!window.__motionStep) { requestAnimationFrame(frame); return; }
        window.__motionStep = false; dt = 1 / 60;
      }
      S.t += dt;
      if (!S.frozen) S.target = readScroll();
      S.s = S.reduce ? S.target : damp(S.s, S.target, 9, dt);
      S.mx = damp(S.mx, pointer.x, 3, dt); S.my = damp(S.my, pointer.y, 3, dt);
      var wt = S.reduce ? '' : 'rotateY(' + (S.mx * 1.6) + 'deg) rotateX(' + (-S.my * 1.1) + 'deg)';
      if (o.world) o.world.style.transform = wt;
      (o.also || []).forEach(function (el) { el.style.transform = wt; });   // e.g. a separate 3D context for background planes
      placeRig(dt);
      o.actors.forEach(placeActor);
      if (o.onFrame) o.onFrame(S);
      requestAnimationFrame(frame);
    }

    // input
    window.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / S.vw) * 2 - 1; pointer.y = (e.clientY / S.vh) * 2 - 1;
    }, { passive: true });
    o.stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button,input,[data-nodrag]') || (cur && cur.lock > 0.5)) return;
      drag.on = true; drag.x = e.clientX; drag.y = e.clientY;
      try { o.stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    o.stage.addEventListener('pointermove', function (e) {
      if (!drag.on) return;
      drag.yaw += (e.clientX - drag.x) * 0.45;
      drag.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.25, -20, 20);
      drag.x = e.clientX; drag.y = e.clientY;
    });
    var endDrag = function () { drag.on = false; };
    o.stage.addEventListener('pointerup', endDrag); o.stage.addEventListener('pointercancel', endDrag);
    o.actors.forEach(function (a) { a.el.addEventListener('focusin', function () { seek(a.at); }); });   // keyboard users land on the actor
    reduce.addEventListener('change', function () { S.reduce = reduce.matches; });
    window.addEventListener('resize', measure);
    measure();
    S.s = S.target = readScroll();
    requestAnimationFrame(frame);

    S.seek = seek; S.measure = measure;
    return S;
  }

  /**
   * Shared-element morph: animate a fixed panel from a source rect to its natural rect.
   * Animates real box properties (not scale), so text is never stretched in flight.
   * Returns the Animation; call .cancel() in .finished to hand control back to CSS.
   */
  function morph(panel, fromRect, toRect, opt) {
    var box = function (r, radius) {
      return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: 'none', borderRadius: radius };
    };
    return panel.animate([box(fromRect, opt.r0), box(toRect, opt.r1)], {
      duration: opt.duration, easing: opt.easing || 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both'
    });
  }


  /**
   * An object that lives INSIDE a page (no pinned scroll): idles with a slow swing, follows the pointer, spins on
   * drag and eases back, pauses when offscreen. For tools and apps (a shoebox at the top of a search page).
   * o: { object, hero:{yaw,pitch,swing}, sc, flat, delegate, onPose, host } where host is the element that takes pointer drag.
   */
  function createInline(o) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)'), hero = o.hero || {};
    var cur = { sc: o.sc || 1, ax: 0, ay: 0, az: 0 }, t = 0, last = 0, mx = 0, my = 0, on = true;
    var pointer = { x: 0, y: 0 }, drag = { on: false, x: 0, y: 0, yaw: 0, pitch: 0 };
    window.addEventListener('pointermove', function (e) { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
    var host = o.host || o.object;
    host.addEventListener('pointerdown', function (e) { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; try { host.setPointerCapture(e.pointerId); } catch (err) {} });
    host.addEventListener('pointermove', function (e) { if (!drag.on) return; drag.yaw += (e.clientX - drag.x) * 0.45; drag.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.25, -25, 25); drag.x = e.clientX; drag.y = e.clientY; });
    var end = function () { drag.on = false; }; host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; }, { rootMargin: '150px' }).observe(host);
    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, ((now || 0) - (last || now || 0)) / 1000); last = now;
      if (!on || document.hidden) return;
      var scale = window.__motionScale == null ? 1 : window.__motionScale; t += dt * scale;
      var still = reduce.matches;
      mx = damp(mx, still ? 0 : pointer.x, 3, dt); my = damp(my, still ? 0 : pointer.y, 3, dt);
      if (!drag.on) { drag.yaw = damp(drag.yaw, 0, 2.2, dt); drag.pitch = damp(drag.pitch, 0, 2.2, dt); }
      var yaw = (hero.yaw || 0) + (still ? 0 : (hero.swing || 0) * Math.sin(t * 0.55) + mx * 7) + drag.yaw;
      var pitch = (hero.pitch || 0) - (still ? 0 : my * 4) + drag.pitch;
      o.object.style.translate = still ? '' : '0 ' + (6 * Math.sin(t * 1.3)) + 'px';
      if (o.delegate) { if (o.onPose) o.onPose(yaw, pitch, cur, t); }
      else if (o.flat) { o.object.style.transform = 'scale(' + cur.sc + ')'; if (o.onPose) o.onPose(yaw, pitch, cur, t); }
      else { o.object.style.transform = 'rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg) scale(' + cur.sc + ')'; if (o.onPose) o.onPose(yaw, pitch, cur, t); }
    }
    requestAnimationFrame(frame);
    return { cur: cur };
  }

  root.Stage = { create: create, createInline: createInline, poseAt: poseAt, flyZ: flyZ, flyOpacity: flyOpacity, fadeWindow: fadeWindow, show: show, morph: morph, smooth: smooth, clamp: clamp, damp: damp };
})(window);
