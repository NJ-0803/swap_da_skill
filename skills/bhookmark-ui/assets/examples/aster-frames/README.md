# Frame-sequence example

The same Aster One page, but the phone is drawn from a pre-rendered turntable instead of the
extruded model. The 30 WebP frames (about 0.4 MB) are checked in under `frames/`, baked with the burgundy
Bhookmark tokens so the phone matches the page. To regenerate them from this folder:

```
node ../../render-turntable.mjs --page=../aster-one/turntable.html --out=frames --count=30 --size=520x720 --scale=1.25
```

The theme baked into the frames is whichever token file `../aster-one/turntable.html` links, so change that
`<link>` first if your page uses another theme. To use your own render, skip that command and drop your frames
in `frames/` as `f_00.webp` ... `f_29.webp` (transparent background), then edit `manifest.js`
(`frames.count`, `frames.src`, `box`, `subject`, and each part's `pose` for your frames).
Hold yaws must be multiples of 360 / count. See `references/site-kit.md`.
