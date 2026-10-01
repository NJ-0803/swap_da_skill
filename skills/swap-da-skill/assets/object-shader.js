/*! object-shader.js | Swap da Skill | object backend #5: a procedural glowing orb drawn by a small WebGL shader.
 *  No model, no images, no dependency: about 4 KB of shader. For a product with nothing to show yet, an AI feature,
 *  or a background object. Colours come from the active theme (--accent, --rose) and follow the theme switch.
 *    object: { type: 'shader', box: [420, 420], hero: { yaw: 0, pitch: 0, swing: 20 },
 *              shader: { maxDpr: 1.5, maxPixels: 1200000, speed: 1, still: 6 } }
 *  Two habits are built in, and both are measurable through .stats():
 *    CAPPED PIXEL DENSITY: the canvas is drawn at min(devicePixelRatio, maxDpr) and never more than maxPixels in
 *      total, so a 3x phone screen does not pay for nine times the pixels of a 1x screen.
 *    REDUCED MOTION: with prefers-reduced-motion the clock stops; it draws one calm frame, and redraws only when
 *      something you did changes it (a resize, a theme switch, a turn), never on a timer.
 *  It also pauses offscreen and on hidden tabs, obeys window.__motionScale (motion-debug.js), and survives context loss. */
(function (root) {
  'use strict';
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision mediump float;uniform vec2 uR;uniform float uT;uniform vec2 uO;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;' +
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}' +
    'void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/min(uR.x,uR.y);uv+=uO;float r=length(uv);' +
    'vec2 q=vec2(fbm(uv*2.2+uT*.12),fbm(uv*2.2-uT*.10+3.1));float f=fbm(uv*2.5+q*1.7+uT*.07);' +
    'float body=smoothstep(.5,.16,r);float rim=smoothstep(.52,.44,r)-smoothstep(.44,.2,r);float glow=exp(-r*3.4);' +
    'vec3 col=mix(uA,uB,f);col=mix(col,uC,pow(f,3.)*1.5);' +
    'vec3 c=col*body+uC*rim*.4+uB*glow*.3;float a=clamp(body+rim*.4+glow*.35,0.,1.);gl_FragColor=vec4(c*a,a);}';

  function triple(name, k) {                                   // "142 51 64" -> [r,g,b] in 0..1
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).map(Number);
    return (v.length >= 3 && !isNaN(v[0]) ? v : [142, 51, 64]).slice(0, 3).map(function (x) { return x / 255 * (k || 1); });
  }

  function mount(el, spec) {
    var W = spec.box[0], H = spec.box[1], o = spec.shader || {}, hero = spec.hero || {};
    var canvas = document.createElement('canvas'); canvas.className = 'shader-canvas'; canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px';
    el.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + (-W / 2) + 'px;top:' + (-H / 2) + 'px';
    el.innerHTML = ''; el.appendChild(canvas);
    var reduce = root.matchMedia('(prefers-reduced-motion: reduce)');
    var st = { draws: 0, dpr: 1, w: 0, h: 0, t: 0, clock: 0, lost: false, visible: true, key: '', gl: null };
    var gl, prog, loc = {}, cols;

    function fail(msg) {                                        // no WebGL: a soft CSS orb instead of nothing
      canvas.style.display = 'none';
      el.style.background = 'radial-gradient(circle at 50% 50%, rgb(var(--rose) / 0.55), rgb(var(--accent) / 0.35) 38%, transparent 62%)';
      el.dispatchEvent(new CustomEvent('object-error', { bubbles: true, detail: { message: msg } }));
    }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (function () { throw new Error(gl.getShaderInfoLog(s)); })(); }
    function init() {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
      if (!gl) return fail('WebGL unavailable');
      try {
        prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
        gl.useProgram(prog); var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var p = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
        ['uR', 'uT', 'uO', 'uA', 'uB', 'uC'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
      } catch (e) { return fail(String(e.message || e)); }
      st.gl = gl; st.key = ''; sizeCanvas(); readColours();
    }
    function sizeCanvas() {                                     // CAPPED PIXEL DENSITY
      var dpr = Math.min(root.devicePixelRatio || 1, o.maxDpr || 1.5), budget = o.maxPixels || 1200000;
      while (W * H * dpr * dpr > budget && dpr > 0.5) dpr -= 0.25;
      st.dpr = dpr; st.w = Math.round(W * dpr); st.h = Math.round(H * dpr);
      if (canvas.width !== st.w) { canvas.width = st.w; canvas.height = st.h; }
      if (gl) gl.viewport(0, 0, st.w, st.h); st.key = '';
    }
    function readColours() { cols = { a: triple('--accent', 0.55), b: triple('--accent', 1), c: triple('--rose', 1) }; st.key = ''; }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); st.lost = true; });
    canvas.addEventListener('webglcontextrestored', function () { st.lost = false; init(); });
    new MutationObserver(readColours).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    root.addEventListener('resize', sizeCanvas);
    if ('IntersectionObserver' in root) new IntersectionObserver(function (es) { st.visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(el);
    var last = 0;

    function onPose(yaw, pitch, cur) {
      if (!gl || st.lost || !st.visible || document.hidden) return;
      var now = performance.now(), dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var scale = (root.__motionScale == null ? 1 : root.__motionScale) * (o.speed || 1);
      if (reduce.matches) st.clock = o.still != null ? o.still : 6;          // REDUCED MOTION: the clock does not run
      else st.clock += dt * scale;
      var ox = yaw * 0.0016, oy = -pitch * 0.0016;
      var key = reduce.matches ? [yaw.toFixed(1), pitch.toFixed(1), st.w, cols.b[0]].join('|') : '';
      if (reduce.matches && key === st.key) return;                          // still: redraw only if something changed
      st.key = key;
      gl.uniform2f(loc.uR, st.w, st.h); gl.uniform1f(loc.uT, st.clock); gl.uniform2f(loc.uO, ox, oy);
      gl.uniform3fv(loc.uA, cols.a); gl.uniform3fv(loc.uB, cols.b); gl.uniform3fv(loc.uC, cols.c);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); st.draws++; st.t = st.clock;
    }
    init();
    return { flat: true, onPose: onPose, stats: function () { return { draws: st.draws, dpr: st.dpr, canvas: [st.w, st.h], css: [W, H], clock: +st.t.toFixed(2), reduced: reduce.matches }; } };
  }
  root.ObjectShader = { mount: mount };
})(window);
