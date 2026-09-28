# Third-party notices

The code in this repository is MIT licensed (see `LICENSE`). The parts below belong to other people and keep their own licenses.

## What is included in this repository

### Archify (generated diagram files)

`skills/bhookmark-ui/assets/examples/optional-diagrams/*.html` were generated with [Archify](https://github.com/tt-a1i/archify) v2.17 and each
contains Archify's viewer runtime. The two `*.architecture.json` files next to them are our own diagram descriptions.
These files are an optional example: no other part of this repository loads them.

```
MIT License

Copyright (c) 2026 tt-a1i (Archify)
Copyright (c) 2025 Cocoon AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### JetBrains Mono (font, embedded in the Archify files above)

```
Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## What is referenced but not included

| Item | License | How it is used here |
| --- | --- | --- |
| [three.js](https://threejs.org), its GLTFLoader, GLTFExporter and RoomEnvironment | MIT | loaded on demand from the jsDelivr CDN by `object-glb.js` and `make-glb.html`; not bundled. Self-host by changing the URLs in the manifest |
| Instrument Serif, Inter, Inter Tight, IBM Plex Mono | SIL Open Font License 1.1 | linked from Google Fonts by the example pages; not bundled. Self-host if visitor privacy matters |
| [border-beam](https://github.com/Jakubantalik/border-beam) and thinking-orbs | MIT (Pro content licensed separately) | documented as an option for React projects; **not installed, run or copied**. `effects/` contains our own implementations |
| Animate.css | MIT | evaluated in `references/effects.md`; not included |

## Media in `docs/`

`docs/media/swap_da_skill.mp4` (and its poster and GIF) is a 21.5 s launch video made with the `brag` skill and Hyperframes. The frames are
captures of this repository's own examples. It embeds third-party audio, which is **not** distributed as separate files here:

| Item | License | Credit |
| --- | --- | --- |
| Music: "Happy Beats / Business Moves", Vol. 12 | CC BY 4.0 (the publisher states all music on its site is CC BY 4.0, commercial use allowed; terms at <https://ende.app/en/standard-license>) | Music by [ende.app](https://ende.app/en) |
| Interface sounds (drop, switch, bong) | CC0 1.0, [Kenney](https://kenney.nl) Interface Sounds | Public domain, no attribution required |
| Keypress sounds | CC0 1.0, "Keyboard Soundpack #1" by unicae_games on OpenGameArt | Public domain, no attribution required |
| Fonts in the video (Instrument Serif, Inter, IBM Plex Mono) | SIL Open Font License 1.1 | rendered into the video only; font files are not in this repository |

## Acknowledgements

Motion guidance in `references/` was informed by public writing on interface animation (including Emil Kowalski's) and by the Taste Skill's
layout rules. **No code or text was copied from either.** A developer portfolio was studied for technique only, from its public network
requests and scripts (`references/acquired-patterns.md`); nothing from it was copied.

## Names

"Bhookmark", "Wordlark", "Pairfind", "Aster One", "Northline", "Halo" and "Mira Okafor" are used for examples. The product, company and person
names in `examples/` are invented; any resemblance to a real product or person is coincidental. No real brand's logos or assets are used.
