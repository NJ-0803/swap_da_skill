/*! object-glb.js | Bhookmark UI | object backend #3: a real 3D model (GLB) rendered with three.js.
 *  three.js is loaded on demand with dynamic import(), only when a page uses this backend, so pages that use
 *  the extruded or frame backends never download it. Point the URLs at your own copy to self-host.
 *
 *    object: { type: 'glb', box: [260, 520], hero: { yaw: -24, pitch: -4, swing: 22 },
 *              glb: { src: 'model.glb', height: 520, poster: 'poster.webp', maxDpr: 1.75 } }
 *
 *  `height` normalises the model: its bounding box is scaled to this many box pixels tall, so poses use the
 *  same numbers as the extruded backend. Anchors (ax, ay, az) are model-space points in those pixels from
 *  the model's centre, with y DOWN like CSS (the backend flips it). The engine gives this backend the whole
 *  pose (yaw, pitch, scale, anchor); it renders crisply at any zoom instead of scaling a bitmap.
 *
 *  Loop discipline: pixel ratio is capped; it renders only when the pose changed; it pauses when the canvas
 *  is offscreen or the tab is hidden; it survives WebGL context loss; if WebGL or the model fails it leaves
 *  the poster image in place and fires 'object-error'. Progress uses the same 'frames-progress' event the
 *  page's loading line listens to. */
(function (root) {
  'use strict';
  var V = '0.170.0';
  var URLS = {
    three: 'https://cdn.jsdelivr.net/npm/three@' + V + '/+esm',
    gltf: 'https://cdn.jsdelivr.net/npm/three@' + V + '/examples/jsm/loaders/GLTFLoader.js/+esm',
    env: 'https://cdn.jsdelivr.net/npm/three@' + V + '/examples/jsm/environments/RoomEnvironment.js/+esm'
  };

  function mount(el, spec) {
    var g = spec.glb, W = spec.box[0], H = spec.box[1], urls = Object.assign({}, URLS, g.three || {});
    var canvas = document.createElement('canvas');
    canvas.className = 'glb-canvas'; canvas.setAttribute('aria-hidden', 'true');
    el.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + (-W / 2) + 'px;top:' + (-H / 2) + 'px';
    el.innerHTML = '';
    var poster = null;
    if (g.poster) { poster = new Image(); poster.src = g.poster; poster.alt = ''; poster.className = 'glb-poster'; poster.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;object-fit:contain'; el.appendChild(poster); }
    el.appendChild(canvas);

    var S = { THREE: null, renderer: null, scene: null, camera: null, pivot: null, holder: null, ready: false, lost: false,
              visible: true, sig: '', vw: 0, vh: 0, pending: null, disposed: false };

    function fail(err) {
      if (root.console) console.warn('[object-glb] ' + (err && err.message || err));
      canvas.style.display = 'none';
      el.dispatchEvent(new CustomEvent('object-error', { bubbles: true, detail: { message: String(err && err.message || err) } }));
    }
    function progress(loaded, total) { el.dispatchEvent(new CustomEvent('frames-progress', { bubbles: true, detail: { loaded: loaded, total: total } })); }

    function size() {
      var vw = Math.max(320, root.innerWidth), vh = Math.max(320, root.innerHeight);
      if (!S.renderer || (vw === S.vw && vh === S.vh)) return;
      S.vw = vw; S.vh = vh;
      var dpr = Math.min(root.devicePixelRatio || 1, g.maxDpr || 1.75);
      while (vw * vh * dpr * dpr > 4.5e6 && dpr > 1) dpr -= 0.25;          // cap total pixels on huge screens
      S.renderer.setPixelRatio(dpr); S.renderer.setSize(vw, vh, false);
      canvas.style.cssText = 'position:absolute;pointer-events:none;width:' + vw + 'px;height:' + vh + 'px;left:' + (W / 2 - vw / 2) + 'px;top:' + (H / 2 - vh / 2) + 'px';
      var D = 1100;                                                        // same distance as the page's CSS perspective
      S.camera.fov = 2 * Math.atan(vh / 2 / D) * 180 / Math.PI; S.camera.aspect = vw / vh; S.camera.position.set(0, 0, D);
      S.camera.updateProjectionMatrix(); S.sig = '';
    }

    function init(THREE, GLTFLoader, RoomEnvironment) {
      S.THREE = THREE;
      var gl;
      try { S.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' }); }
      catch (e) { return fail(e); }
      S.renderer.setClearColor(0x000000, 0);
      S.renderer.toneMapping = THREE.ACESFilmicToneMapping; S.renderer.toneMappingExposure = g.exposure || 1.05;
      S.scene = new THREE.Scene(); S.camera = new THREE.PerspectiveCamera(30, 1, 10, 4000);
      var pm = new THREE.PMREMGenerator(S.renderer);
      S.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;      // reflections for the metal and glass
      var key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-300, 500, 700); S.scene.add(key);
      S.pivot = new THREE.Group(); S.holder = new THREE.Group(); S.pivot.add(S.holder); S.scene.add(S.pivot);
      size();
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); S.lost = true; });
      canvas.addEventListener('webglcontextrestored', function () { S.lost = false; S.sig = ''; if (S.pending) draw.apply(null, S.pending); });
      new GLTFLoader().load(g.src, function (gltf) {
        if (S.disposed) return;
        var m = gltf.scene, box = new THREE.Box3().setFromObject(m), sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
        var k = (g.height || H) / sz.y;                                              // normalise: bounding-box height -> box px
        m.scale.setScalar(k); m.position.copy(c.multiplyScalar(-k));
        S.holder.add(m); S.ready = true; if (poster) poster.style.opacity = 0; S.sig = '';
        progress(1, 1); if (S.pending) draw.apply(null, S.pending);
      }, function (xhr) { if (xhr.lengthComputable) progress(xhr.loaded, xhr.total); }, fail);
    }

    // three.js loads lazily; nothing is fetched until this backend is mounted
    Promise.all([import(urls.three), import(urls.gltf), import(urls.env)]).then(function (m) {
      init(m[0], m[1].GLTFLoader, m[2].RoomEnvironment);
    }).catch(fail);

    // pause when offscreen or hidden
    if ('IntersectionObserver' in root) new IntersectionObserver(function (es) { S.visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(el);
    root.addEventListener('resize', size);

    function draw(yaw, pitch, cur) {
      S.pending = [yaw, pitch, cur];
      if (!S.ready || S.lost || !S.visible || document.hidden) return;
      // render on demand: skip when nothing visible changed
      var sig = [yaw.toFixed(2), pitch.toFixed(2), cur.sc.toFixed(3), cur.ax.toFixed(1), cur.ay.toFixed(1), cur.az.toFixed(1)].join('|');
      if (sig === S.sig) return; S.sig = sig;
      var d = Math.PI / 180;
      S.pivot.rotation.set(-pitch * d, yaw * d, 0, 'XYZ');          // CSS rotateX is opposite to three's because CSS y points down
      S.pivot.scale.setScalar(cur.sc);
      S.holder.position.set(-cur.ax, cur.ay, -cur.az);              // pivot the turn about the anchor, y flipped to y-up
      S.renderer.render(S.scene, S.camera);
    }
    function dispose() {
      S.disposed = true; if (!S.renderer) return;
      S.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(function (mt) { mt.dispose(); }); });
      S.renderer.dispose(); S.renderer.forceContextLoss();
    }
    return { delegate: true, onPose: draw, dispose: dispose, ready: function () { return S.ready; } };
  }
  root.ObjectGlb = { mount: mount };
})(window);
