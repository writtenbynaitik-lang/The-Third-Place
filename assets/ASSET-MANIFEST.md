# Asset manifest — The Third Place

Last generated 12 October 2026. The machine-readable companion to this file is
`assets/image-data.json`, written by `npm run images`.

---

## 1. Provenance — read this first

**Every photograph on this site is the restaurant's own.** All nineteen were
uploaded by the business to its public Zomato listing (restaurant ID `22184793`)
and served from `b.zmtcdn.com/data/pictures/.../22184793/` — the path Zomato uses
for restaurant-supplied images, as distinct from `/data/reviews_photos/`, which
holds customer uploads.

| | |
|---|---|
| **Source** | The Third Place's own public Zomato listing, retrieved 12 Oct 2026 |
| **Rights** | **The Third Place** (or the photographer it commissioned). **Not the author of this concept.** |
| **Licence obtained** | **None.** |
| **Used here because** | This is a speculative concept shown to the owners of the business whose photographs these are, running locally and not deployed. |
| **Before any public launch** | **Replace with owner-supplied originals, or obtain written permission.** See §5. |

**What was deliberately not used**

* **Customer review photographs** (`/data/reviews_photos/…`). Around forty-four
  exist on the listing. Their copyright sits with individual reviewers, which is a
  worse rights position than the restaurant's own images, so none were touched.
* **Instagram imagery.** The grid sits behind a login wall. It was not bypassed.
* **Stock photography.** None. A stock photo of someone else's dining room passed
  off as this one would defeat the entire purpose.
* **Generated imagery.** None. `assets/generated/` exists in the tree and is
  **empty** — nothing on this site is AI-generated or synthetic, and nothing is
  described as a photograph of the venue that is not one.

No watermark was removed, no access control was circumvented, and no image was
retouched beyond resizing and format conversion.

---

## 2. Directory layout

```
assets/
  originals/      19 untouched downloads — the archive. Not shipped to dist/.
  brand/          mark.svg, favicon.svg — redrawn, see §4
  fonts/          5 self-hosted woff2 files
  hero/           hero art, up to 1536w
  interior/       the room
  food/           plates
  details/        supporting / atmospheric
  generated/      EMPTY, intentionally
  image-data.json generated index: dimensions, widths, alt, focus, LQIP
```

Derivatives are `<name>-<width>.<avif|webp|jpg>`. Originals are never modified and
never deployed — `tools/build.js` excludes `assets/originals/` from `dist/`.

---

## 3. The images

`Focus` is the CSS `object-position` applied so a tight crop keeps its subject.
`Alt` is abbreviated here; the full text lives in `tools/assets.config.js`.

| ID | Original | Native | Role | Focus | Alt? |
|----|----------|--------|------|-------|------|
| `hero-room-day` | r03.jpg | 1536×1024 | **Hero, primary.** Daylit room, and the day face of the slats. | center 55% | yes |
| `hero-room-evening` | r18.jpg | 1280×720 | Hero — the slats' reverse face, evening light. | center 55% | yes |
| `bar-bottles` | r01.jpg | 720×1280 | Wine bar — the backlit red bottle wall. | center 32% | yes |
| `window-night` | r15.jpg | 720×1280 | Wine bar — banquette and lamps at night. | center 72% | yes |
| `wine-racks` | r16.jpg | 1280×720 | Wine bar — the rack dividing the room. | center 50% | yes |
| `room-windows` | r13.jpg | 1280×960 | The room — daylight and greenery. | center 52% | yes |
| `communal-table` | r02.jpg | 720×1280 | The room — communal table, ochre wall. | center 50% | yes |
| `shelves-ceramics` | r14.jpg | 720×1280 | The room — shelving and objects. | center 45% | yes |
| `shelves-wide` | r17.jpg | 1280×960 | Visit — the shelving wall. | center 58% | yes |
| `bar-terrazzo` | r11.jpg | 1280×960 | The room — bar and terrazzo. | center 55% | yes |
| `room-plants` | r07.jpg | 1280×720 | The counter band — wide daytime room. | center 62% | yes |
| `pizza` | r06.jpg | 1169×1077 | Menu — wood-fired pizza. | 42% center | yes |
| `greens` | r09.jpg | 2832×4240 | The room mosaic — charred greens. | center 45% | yes |
| `rigatoni` | r12.jpg | 1280×1006 | Built, **not currently placed.** Spare for the menu. | center | yes |
| `plated-main` | r08.jpg | 4240×2832 | Built, **not currently placed.** Spare. | center 50% | yes |
| `plated-main-warm` | r19.jpg | 4240×2832 | Built, **not currently placed.** Spare. | center 50% | yes |
| `lamp-corner` | r04.jpg | 720×1280 | Built, **not placed.** Decorative (`alt=""`). | center 50% | no |
| `bar-wide` | r05.jpg | 1448×1086 | Built, **not placed.** Decorative. | center 50% | no |
| `plated-dark` | r10.jpg | 2832×4240 | Built, **not placed.** Decorative. | center 50% | no |

Thirteen are in use: eleven in figures, `hero-room-day` as the hero `<img>`, and
`hero-room-evening` as the slats' reverse texture (a WebGL texture, not an `<img>`,
which is why it does not appear in the figure count). The remaining six are built
and ready to place.

Four of the originals are full-resolution professional shots (4240×2832 and
2832×4240), which suggests the restaurant has a commissioned set somewhere —
worth asking for.

---

## 4. Brand assets

| File | What it is |
|------|------------|
| `brand/mark.svg` | The `\| \| \|` mark, **redrawn as clean vector**. Proportions measured from the menu masthead: three bars 6 units wide at x = 0, 58, 116 in a 122×56 box. Inherits `currentColor`. |
| `brand/favicon.svg` | The same mark, vermilion on paper, rounded tile. |
| `fonts/*.woff2` | Jost (variable 300–500), Zilla Slab 600/700, IBM Plex Mono 400/500 — Latin subsets from Google Fonts, all under the SIL Open Font Licence 1.1. Self-hosted: 120 kB total, no third-party request at runtime. |

The mark is a **redraw, not a traced copy of a file**. It is geometrically simple
(three rectangles), so it should match the real artwork closely — but the official
wordmark typeface was not identified. **Ask the owners for the original logo files
and confirm the typeface** (open question G in `research/RESEARCH.md`). Jost is
standing in for a Futura-like geometric sans.

---

## 5. Replacing the photography

The pipeline is built so a swap is a two-line change per image, not a rebuild.

1. Drop the new file into `assets/originals/`.
2. In `tools/assets.config.js`, point that entry's `src` at it, and adjust `focus`
   and `alt`.
3. `npm run images` — regenerates every width and format, recomputes dimensions
   and the LQIP placeholder, and rewrites `image-data.json`.
4. `npm run build`.

No filename, width or aspect ratio is hardcoded in the HTML; the template refers to
images only by `id`, and the build resolves the rest. Swapping a 1536×1024 original
for a 6000×4000 one needs no markup change at all.

**Missing / wanted from the owners**

* Original full-resolution files for all nineteen, especially the four already
  shot professionally.
* A proper exterior / entrance shot. There is none in the set, which is why the
  Visit section uses an interior and a written wayfinding note instead of an
  exterior photograph.
* Images of the two retail corners (Altrove, Style Mati) and of the books —
  all three are described on the site but none can be shown.
* A portrait-oriented hero crop. The current hero is 3:2 and is cropped hard on
  phones; an art-directed portrait original would improve it.
* Written permission, or replacement, before anything is published.

---

## 6. Generated derivatives

186 files: 19 images × 3 formats × 2–4 widths, 13 MB on disk for the full set.

A real visit loads a small fraction of that — **343 kB total** on a cold desktop
load, of which 150 kB is the single hero image (see `QA.md` §6). AVIF is roughly
40% the weight of the equivalent JPEG; `<picture>` falls back AVIF → WebP → JPEG,
so there is a working path on any browser.

Every image also carries a 20px-wide WebP placeholder inlined as a data URI in
`image-data.json` and applied as the figure frame's background. That is what keeps
a failed image from leaving a broken icon or a collapsed box — verified in
`QA.md` §5.3.
