# Design system — The Third Place

Derived from the restaurant's own printed menu and the photography of the room.
Tokens live in `src/css/tokens.css`; this document explains *why* each one exists.

---

## 1. Where it comes from

Three artefacts set the entire system:

1. **The printed menu** (29 scanned pages) — the `| | |` mark, vermilion on cream,
   typewriter-slab headings, monospace body, `||| SECTION |||` dividers, vertical
   side tabs, allergen key.
2. **The room** — ochre clay render, lacquer-red bar, terrazzo, bentwood, exposed
   concrete and ductwork, indoor trees, daylight by day and small amber lamps by night.
3. **The hours** — noon to 11:30 pm. Coffee house to wine bar in one room.

Nothing here was invented for novelty. If a token has no source in the list above,
it should not exist.

---

## 2. Colour

Sampled from the menu scans and interior photography.

```
--paper        #F4EFE7   menu stock. The default page surface.
--paper-warm   #EAE1D3   recessed panels, table rules
--paper-deep   #DED2C0   borders, dividers on light
--ink          #1A1714   text. Near-black, warmed — never #000
--ink-70       #4A443C   secondary text
--ink-45       #676057   captions, metadata (tuned for --paper-warm, see below)
--vermilion    #B8402C   brand red. FILLS and the mark only (white on it = 6.5:1)
--vermilion-lo #9A3222   pressed / hover
--accent-ink   #A83826   the same red, safe as SMALL TEXT on both day surfaces
--clay         #A8542C   terracotta render
--ochre        #C08A3E   the amber glow; the mustard wall
--lacquer      #6E1A16   the bar wall at night
--night        #16110E   night sections. Warm-black, not neutral.
--night-2      #241B16   raised surfaces on night
--paper-night  #EFE4D6   text on night surfaces
--olive        #5A6049   from the daytime menu system. Used sparingly.
```

**Rules**

* Vermilion is an **accent, never a surface**. It appears as the mark, section
  numerals, rules, hover states and one word of emphasis per section. If it ever
  reads as "red website", it has been overused.
* Two surface modes only: `paper` (day) and `night`. Sections declare
  `data-tone="day|night"` and inherit; no third mode.
* Warm-black never neutral-black. `#16110E` not `#000`. The room has no pure black
  in it.
* **Contrast is tuned against `--paper-warm` (#EAE1D3), not `--paper`.** The menu
  section uses the warmer surface, so a value that only clears 4.5:1 on the lighter
  one fails across a whole section. Measured in the built page: `--ink` 13.8:1,
  `--ink-70` 7.4:1, `--ink-45` 4.8:1, `--accent-ink` 5.0:1, `--paper-night` on
  `--night` 15.1:1. All 27 text samples measured in `QA.md` pass AA.
* `--vermilion` is 4.3:1 on `--paper-warm` — fine as a fill or a rule, **not** as
  small text. That is why `--accent-ink` exists and why `--accent` points at it.

### The day→night arc

| Section | Tone |
|---------|------|
| Hero, The idea, The menu, Counter | `day` |
| The wine bar | `night` |
| The room | `night` → warms |
| Visit, Footer | `day`, warmed |

The transition into night happens once, at the wine bar, and is the pivot of the page.

---

## 3. Typography

Three families, each with a distinct job taken from the printed menu. All
**self-hosted** as woff2 in `assets/fonts/` — no third-party font request at runtime.

| Role | Family | Weights | Used for |
|------|--------|---------|----------|
| Wordmark / nav / UI | **Jost** | 300, 400, 500 | The wordmark (wide-tracked caps, matching the menu masthead), navigation, buttons, labels |
| Display | **Zilla Slab** | 600, 700 | Section headings and the hero. The menu's typewriter-slab headings. |
| Mono | **IBM Plex Mono** | 400, 500 | Menu items, tasting notes, metadata, allergen key, section numerals. The menu's monospace body. |

**Why monospace is confined.** The printed menu sets *everything* in mono. That works
on paper at arm's length; it punishes a reader on a screen. So mono keeps the jobs
where it is authentic and charming — dish names, tasting notes, labels, numerals —
and Jost carries anything longer than two lines.

### Scale

Fluid, `clamp()`-based, 320 → 1440px.

```
--step--1  clamp(0.80rem, 0.77rem + 0.14vw, 0.88rem)   captions, allergen key
--step-0   clamp(1.00rem, 0.95rem + 0.22vw, 1.13rem)   body
--step-1   clamp(1.20rem, 1.11rem + 0.42vw, 1.45rem)   lead paragraphs
--step-2   clamp(1.50rem, 1.33rem + 0.84vw, 2.00rem)   sub-headings
--step-3   clamp(1.95rem, 1.63rem + 1.60vw, 2.90rem)   section headings
--step-4   clamp(2.50rem, 1.90rem + 3.00vw, 4.30rem)   large display
--step-5   clamp(3.20rem, 1.90rem + 6.50vw, 7.50rem)   hero
```

**Rules**

* Measure caps at `68ch` for body. Display headings cap at `19ch` **set on the
  heading itself** — `ch` resolves against the element's own font, so a cap placed
  on a wrapper would be measured in body-text characters and strangle the heading.
* Display headings: `line-height: 0.98`, `letter-spacing: -0.02em`.
* Wordmark and eyebrow labels: `letter-spacing: 0.22em`, uppercase.
* Mono dish names: `letter-spacing: 0`, weight 500.
* Hyphenation off on headings; `text-wrap: balance` on headings, `pretty` on body.

---

## 4. The mark

`| | |` — three bars, `viewBox="0 0 122 56"`, bars 6 wide at x = 0, 58, 116.
Proportions measured off the menu masthead. Inherits `currentColor`.

Used four ways, and no others:

1. **Wordmark** — mark + "THE THIRD PLACE" in tracked Jost caps.
2. **Section divider** — `||| THE MENU |||`, exactly as the menu sets it.
3. **Structural rhythm** — the hero's slats; the 01/02/03 "places" list.
4. **Favicon.**

Never rotated, never gradient-filled, never animated for its own sake. The only
motion it has is the hero slats, where the mark *is* the photograph.

---

## 5. Space and grid

8px base.

```
--s-1 4px   --s-2 8px   --s-3 12px  --s-4 16px  --s-5 24px
--s-6 32px  --s-7 48px  --s-8 64px  --s-9 96px  --s-10 128px --s-11 192px
```

Section rhythm is deliberately uneven — `--s-9` to `--s-11` vertically, varied per
section so the page breathes differently as it goes. Equal padding everywhere is the
template look the brief rules out.

**Grid.** 12 columns, `--gutter` 16px (mobile) → 32px (desktop), max content width
1320px, with a `--measure` inner rail of 68ch for prose. Images are allowed to break
the rail and bleed to the viewport edge; text never does.

**Breakpoints.** `480` · `640` · `840` · `1024` · `1280`. Layouts are mostly
intrinsic (`clamp`, `minmax`, `auto-fit`); these are for structural changes only.

---

## 6. Imagery

* Real photography of the actual room and plates only. Provenance in
  `assets/ASSET-MANIFEST.md`.
* Served AVIF → WebP → JPEG via `<picture>`, 4–6 widths each, generated by
  `npm run images` from `tools/assets.config.js`.
* **Every image has explicit `width`/`height`** and a blurred LQIP data-URI as its
  CSS background, so the slot is filled from first paint and nothing shifts.
* `fetchpriority="high"` on the hero only; everything else `loading="lazy"`
  `decoding="async"`.
* Treatment: no filters at all. The photography is already warm; grading it would
  only make it look processed.
* Crops: each image declares a `focus` (a CSS `object-position`) in
  `tools/assets.config.js`. The build emits it as `--focus` on the figure frame, so
  a tight crop keeps its subject — the bar's bottles sit at 32% height, the night
  window's lamps at 72%.
* Photographs are **not labelled with dish names** — the menu is typographic, the
  photography is atmospheric. This is both honest (individual plates could not be
  identified with confidence) and the reason the page does not look like a delivery app.

---

## 7. Motion

**Principle: things move the way objects move.** Nothing eases for decoration.

```
--dur-1 140ms   state changes: hover, focus, press
--dur-2 320ms   element reveals, menu switching
--dur-3 620ms   section reveals
--dur-4 900ms   reserved for the longest transitions

--ease-out   cubic-bezier(0.22, 1, 0.36, 1)    things arriving
--ease-io    cubic-bezier(0.65, 0, 0.35, 1)    things travelling
--ease-sharp cubic-bezier(0.4, 0, 0.2, 1)      UI
```

* Reveals are **one** gesture: 16px rise + fade. No scale, no blur, no stagger beyond
  60ms between siblings.
* Scroll-linked work is capped to transform/opacity, runs off a single shared
  `requestAnimationFrame` loop, and is skipped entirely when offscreen.
* No scroll hijacking. No pinned sections. No smooth-scroll override — native
  `scroll-behavior` only, and that is disabled under reduced motion.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured globally and at the source:

* All transitions and animations collapse to `0.01ms` via a global rule.
* The WebGL hero **never initialises**; the static hero image is final.
* Reveals render in their final state immediately — no element is ever left hidden.
* The menu's filtering still works; only the transition is removed.

---

## 8. Components

**Buttons.** Two only. `.btn--solid` (vermilion fill, paper text) for the single
primary action per screen; `.btn--line` (1px rule, currentColor) for everything else.
Min target 44×44px. Focus: 2px `--vermilion` outline at 3px offset — and on night
surfaces, `--paper-night`, so it is always visible against its background.

**Links in prose.** 1px underline at 0.14em offset, thickening on hover. Never
colour-only.

**Section head.** `||| LABEL |||` in mono caps vermilion, then the display heading,
then an optional lead. One pattern, used by every section, which is what lets the
*layouts* differ wildly without the page falling apart.

**Menu list.** Dish name in mono 500; description in Jost `--ink-70`; a vermilion
hairline rule between items; allergen marks as small caps tokens. No cards, no images,
no boxes — it is a printed menu.

**Figure.** Image + optional mono caption, caption aligned to the image's left edge,
`--ink-45`.

---

## 9. Responsive intent

Not one layout scaled. Three distinct ones.

* **Mobile (≤640).** Single column. The hero crops to a portrait frame of the room
  with the headline over it. The menu becomes a horizontally scrollable category
  strip — thumb-reachable — with the list below. Phone and Book sit in a fixed
  bottom bar after the hero scrolls away, because on a phone those are the only two
  actions that matter.
* **Tablet (641–1023).** Two columns where content pairs naturally; the hero keeps
  the slat composition but at reduced slat count.
* **Desktop (≥1024).** Full 12-column editorial. Images break the text rail.
  Asymmetric compositions. The hero runs full-bleed.

Short/landscape viewports (≤520px tall) get a compressed hero that never exceeds
`100svh`, with the headline and actions guaranteed visible.

---

## 10. Accessibility commitments

* Landmarks: `header` / `nav` / `main` / `section[aria-labelledby]` / `footer`.
* Skip link, first in tab order, visible on focus.
* Mobile menu: a real `<button>` with `aria-expanded` and `aria-controls`, focus moved
  in and restored out, Escape closes, focus trapped while open, background inert.
* Heading order strictly h1 → h2 → h3.
* Focus visible on every interactive element, on both tones.
* Informative images have descriptive alt text; decorative ones have `alt=""` and are
  declared decorative in `tools/assets.config.js`.
* Nothing conveyed by colour, hover or motion alone.
* Reflow to 320px and 200% zoom without horizontal scroll.
* Menu category switching announces via a polite live region.

Automated checks passing is not a conformance claim. See `QA.md` for what was
actually tested and what was not.
