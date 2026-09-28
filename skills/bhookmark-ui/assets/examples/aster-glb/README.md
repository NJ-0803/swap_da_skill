# GLB model example

The Aster One page with the phone drawn from a real 3D model (`aster.glb`, about 1.9 MB, checked in) by three.js,
which loads on demand from a CDN (edit `glb.three` in the manifest to self-host).

To rebuild the model, open `../aster-one/make-glb.html` in Chrome (it builds the phone with three.js, in the
burgundy palette) and save the base64 in `#out` as `aster.glb`. The text is wrapped as `GLB_BASE64:` ... `:END`;
strip both markers before decoding, and check the file starts with `glTF` and that its length equals the
length declared in bytes 8 to 12.

For a real product, export your own GLB from Blender or CAD, put it here, and set `glb.src`. Reduce weight with
Draco or Meshopt geometry compression and WebP textures before shipping. See `references/site-kit.md`.

Note: this backend pauses while the tab is hidden or the object is off screen, on purpose. A background tab or an
automated screenshot of a hidden tab shows an empty stage until the tab is visible.
