# QA — The Third Place

Testing performed 12 October 2026 against the **production build** (`dist/`)
served over HTTP, unless a line says otherwise.

**What this document is.** A record of what was actually run and what it returned.
Where something could not be tested, it says so and says why. Nothing here is
inferred from reading the code.

---

## 1. Build and run

```bash
npm install          # sharp + esbuild
npm run images       # 186 derivatives from 19 originals (~5 min, first run only)
npm run build        # → ./index.html and ./dist/
npm run preview      # → http://localhost:5181
```

| | Result |
|---|---|
| `npm install` | OK — sharp 0.34 (libvips 8.17.3), esbuild 0.25 |
| `npm run images` | OK — 186 files, 19 entries in `image-data.json`, 5 min 13 s |
| `npm run build` | OK — no errors, no esbuild warnings |
| `npm run preview` | OK |

**Production build output**

| File | Size |
|------|------|
| `dist/index.html` | 40.5 kB |
| `dist/app.css` | 29.0 kB |
| `dist/app.js` + `chunk-*.js` | 21.5 kB (2 files) |
| **Code total** | **91.0 kB uncompressed** |
| `dist/assets/` | 12.7 MB (every width and format; a visit loads a fraction — §6) |

The WebGL module is a separate dynamically-imported chunk, so devices that do not
run it never download it.

### Environment note

Port **4173** was already in use by an unrelated project on this machine, so the
preview runs on **5181** and the dev server on **5180**. `tools/serve.js` now
fails loudly on a busy port instead of exiting silently — that behaviour cost
real debugging time and is fixed.

---

## 2. What was tested on

| | |
|---|---|
| Browser | The Claude desktop app's built-in browser pane — **WebKit**, ANGLE over Mesa Intel HD Graphics 5500, WebGL 1 available, `MAX_TEXTURE_SIZE` 16384 |
| OS | Linux 7.0.0-38-generic |
| DPR | 1 and 2 (both exercised) |
| Server | `tools/serve.js` over HTTP. No `file://` testing. |

**Not tested — stated plainly:** Chrome, Firefox, Safari proper, Edge; any iOS or
Android device; any real touch input; any screen reader (VoiceOver, NVDA, JAWS);
any assistive tech beyond semantics and keyboard; slow or metered networks;
real-user performance. See §9.

### Two environment limits that shaped the testing

1. **`document.hidden` was `true` in the pane for most of the session** (a foreground tab opened near the end reported `false`, which allowed the unaided re-verification in §10). Consequently
   `requestAnimationFrame` never fires on its own, CSS transitions never progress,
   and `IntersectionObserver` callbacks are suppressed or heavily delayed.
   Anything frame-driven had to be tested by shimming `requestAnimationFrame` to
   `setTimeout` and driving the real modules directly, or by asserting final state
   with transitions disabled. Both techniques are noted where used.
2. **ES modules are cached aggressively**, ignoring `Cache-Control: no-store`.
   The dev build now appends a cache-busting query to the entry script.
   Production is unaffected — esbuild emits content-hashed chunks.

---

## 3. Viewports

Checked for horizontal overflow with a script that walks every element and reports
only the *originator* (an element overflowing whose parent does not), ignoring
children of deliberate horizontal scrollers.

| Width × height | Document overflow | Originators | Notes |
|---|---|---|---|
| 320 × 568 | none | 0 | iPhone SE. Hero grows past the viewport and scrolls — by design. |
| 375 × 812 | none | 0 | |
| 390 × 844 | none | 0 | Primary phone target. |
| 640 × 800 | none | 0 | = 1280 at 200% zoom (reflow check). |
| 768 × 1024 | none | 0 | |
| 1024 × 768 | none | 0 | |
| 1440 × 900 | none | 0 | |
| 740 × 360 | none | 0 | Landscape phone. |

Also verified at each width: no clipped headings or buttons, no distorted image
crops, no content requiring hover, navigation reachable.

---

## 4. Bugs found and fixed

Everything below was found by testing the rendered page, not by reading code.
Each was fixed and re-tested.

| # | Bug | Cause | Fix |
|---|---|---|---|
| 1 | Hero texture 404 — `room-day-1600.jpg` | Filename hand-written in the template; that width is never generated because the original is only 1536 px wide. | Build now emits every asset URL from `image-data.json` (`{{src}}`, `{{preload}}`). No filename is hand-written anywhere. |
| 2 | **No image filled its frame** — every figure showed a band of blurred placeholder. | `.fig__frame > img` never matched: the direct child is `<picture>`, not `<img>`. | Added `.fig__frame picture { display:block; height:100% }` and moved `object-fit` onto `.fig__frame img`. Verified: 11/11 figures now fill exactly. |
| 3 | **"— today" appeared on all seven** hours rows. | `.hours__today { display:inline-block }` silently overrides the UA's `[hidden]` rule, making `el.hidden = true` a no-op. | Global `[hidden] { display:none !important }`. |
| 4 | **Horizontal page scroll at ≤840 px** — document 653 px wide in a 390 px viewport. | WebKit does not collapse a flex scroll container's automatic minimum size, so the menu's chip row set a 637 px floor. | `min-width: 0` on `.cats`; all grid tracks hardened to `minmax(0, …)`. |
| 5 | Section headings squeezed into a narrow column with two-thirds of the row empty. | `max-width: 34ch` sat on the wrapper, where `ch` resolves against *body* text, not the display font three steps larger. | Cap moved onto the heading itself at `19ch`; menu head split into heading + lead side by side. |
| 6 | **Blank canvas covering the hero** whenever rendering paused. | WebGL clears the drawing buffer after compositing; the hero deliberately stops rendering when offscreen or hidden, so the first paused frame left an empty canvas over the photograph. | `preserveDrawingBuffer: true`. Reproduced at 740×360 and confirmed fixed. |
| 7 | Header opaque-cream over the hero photograph whenever the hero was taller than the viewport. | `setStuck(!entry.isIntersecting)` on a 1 px sentinel at the hero's bottom: at page top with a tall hero the sentinel is simply below the fold, which is not the same thing as "scrolled past". | Observe the hero element itself. Verified across top / inside / past / back-to-top / deep. |
| 8 | Scroll-spy never highlighted anything, **and** ranked sections wrongly. | IO ranking by `intersectionRatio` compares each section against its *own* area, so a short section barely on screen outranks a tall one filling the viewport. | Replaced with a deterministic reading-line test at 35% viewport height, rAF-throttled and passive. |
| 9 | Focus went to `<body>`, not the toggle, when the mobile drawer closed. | `document.activeElement` is `<body>` when a button is activated by pointer, and it was restored blindly. | Restore only a real, still-connected, non-body element; otherwise the toggle. |
| 10 | Header wordmark and close icon nearly invisible over the open drawer. | Header sits above the drawer and kept its light-on-photograph treatment over a cream surface. | `body[data-drawer-open]` pins the header to the drawer's palette. |
| 11 | Hero photograph unreadable on phones — the room disappeared into the scrim. | The desktop left-to-right scrim wash covers nearly the whole width at 390 px. | Vertical-only scrim below 840 px; horizontal pass added back at desktop; soft text halo for insurance. |
| 12 | Headline collided with the fixed header at 320×568 and 740×360. | `height: 100svh` forced the content up under the bar on short screens. | `min-height` instead of `height`; header-clearance padding on the content; height-based type scale under 580 px tall. |
| 13 | Four AA contrast failures in the menu section (3.6–4.3:1). | `--ink-45` and `--vermilion` were tuned against `--paper`, but the menu section uses the warmer `--paper-warm`. | `--ink-45` → `#676057`; new `--accent-ink` `#A83826` for small red text, brand `--vermilion` reserved for fills. All 27 samples now pass. |
| 14 | Counter-section image cropped to mostly ceiling and ductwork. | A 4:3 original forced into a 21:9 band. | Swapped to a natively 16:9 image; wired up the `focus` field that was declared in config but never used, so all 19 images now have real `object-position` control. |
| 15 | **Published hours were wrong** — 11:45 pm, from aggregator snippets. | Third-hand source. | Corrected to Mon 3–11 pm, Tue–Sun 12–11:30 pm from the restaurant's own Google Business profile. Fixed in `hours.js`, the static table, the hero fallback and the JSON-LD. |

One change was made and then **reverted**: the hero `<link rel=preload>` was removed
on the belief it caused a duplicate 240 kB fetch. A cold-cache measurement showed
the second entry had `transferSize: 0` and `duration: 0` — a cache hit from an
earlier test navigation, not a duplicate download. The preload was restored and
re-verified cold at two viewport widths as a single fetch.

---

## 5. Failure states

Tested with real harnesses served over HTTP, each a copy of the production page
with one capability removed.

### 5.1 No WebGL

`getContext('webgl'|'experimental-webgl')` forced to return `null`.

* Canvas removed from the DOM entirely — no empty element left behind.
* Static hero photograph renders full-bleed; headline, sub-copy, both actions and
  the status line all correct.
* `console.info` explains why, rather than failing silently.
* Rest of the page unaffected.

**Pass.**

### 5.2 No JavaScript

Module script stripped.

| Check | Result |
|---|---|
| Hero photograph and headline | render |
| Menu category tabs | hidden — no dead controls (`.menu__tabs-wrap[hidden]`) |
| Menu content | 6-dish static fallback list visible |
| Reveal content | all 33 elements visible; `.reveal` class never applied |
| Hours | static table; hero shows "Mon 3 pm–11 pm · Tue–Sun 12 pm–11:30 pm" instead of the live status |
| Links and actions | all work |

**Pass.** `.reveal` is added by JS at runtime precisely so a JS failure cannot
leave content invisible.

### 5.3 All images fail

Every `src`/`srcset` repointed at a 404.

* 11/11 figure frames keep their exact dimensions — **0 collapsed**.
* Broken `<img>` elements hidden (`visibility:hidden`), so no broken-image icons.
* The inlined LQIP placeholder remains as the frame background, so slots read as
  soft blurred colour rather than empty boxes.
* `data-failed="true"` set on each affected frame.
* Hero falls back to a clean dark surface with fully legible text.

**Pass.**

### 5.4 Reduced motion

The pane offers no `prefers-reduced-motion` emulation, so this was tested two ways
and **not** with a real OS-level setting.

*Code path* — `matchMedia` patched to report `reduce: true`, then the real logic
re-run: the `.reveal` class is never added (33/33 nodes at opacity 1), and the
slats gate returns `'prefers-reduced-motion'` so the canvas is removed.

*Stylesheet* — all three `@media (prefers-reduced-motion: reduce)` blocks confirmed
present in the minified `dist/app.css`: the global duration collapse, the hero
entrance forced to its final state, and `.reveal,.reveal.is-in{opacity:1;transform:none;transition:none}`.

**Pass, with the caveat above.** The layering is deliberate: JS never hides the
content, and even if it did, CSS forces it visible.

---

## 6. Performance — measured, not estimated

Cold cache, production build, served from a fresh origin so nothing was reused.
1440 × 900, DPR 1.

| | |
|---|---|
| Requests | **8** |
| HTML | 41 kB |
| CSS | 29 kB |
| JS | 16 kB |
| Fonts | 108 kB (5 self-hosted woff2) |
| Images | 150 kB (**one** hero AVIF) |
| **Total transfer** | **343 kB** |
| DOMContentLoaded | 79 ms |
| Load event | 110 ms |
| **Cumulative Layout Shift** | **0** |

At 640 × 800 / DPR 2 a fuller scroll pulled 15 requests and ~786 kB including
six images — still modest for a photography-led page.

**CLS of 0** is the result of every image carrying explicit `width`/`height`, every
frame carrying an `aspect-ratio`, and the fonts being self-hosted and preloaded.

**Not measured:** Lighthouse, LCP, INP, TTFB on a real network. WebKit does not
expose `largest-contentful-paint`, and everything here was served from localhost,
so no real-world performance claim is made. **No Lighthouse score is claimed.**

Measures taken: AVIF→WebP→JPEG via `<picture>` with 2–4 widths each;
`fetchpriority="high"` on the hero only and `loading="lazy"` on everything else;
the WebGL chunk split out and dynamically imported; the hero's day texture reuses
the already-decoded hero `<img>` rather than fetching a second copy; one shared
rAF-throttled passive scroll listener; rendering stopped when the hero is offscreen
or the document is hidden; DPR capped at 2.

---

## 7. Accessibility

Tested by direct DOM assertion and keyboard simulation against the production page.

### 7.1 Structure

| Check | Result |
|---|---|
| Heading order | **No skips.** h1 → h2 ×5 → h3 ×4 → h2 ×3 |
| Landmarks | 1 `header`, 1 `main`, 1 `footer`, 2 `nav` (each `aria-label`led) |
| Sections | all `aria-labelledby` their heading |
| Images | 12 rendered; **0** missing `alt`; 0 with empty `alt` left exposed (decorative images also `aria-hidden`); **0** missing `width`/`height` |
| Controls | **0** unnamed buttons |
| Document language | `lang="en-IN"` |

### 7.2 Links

37 links. **0** placeholder `href` (`#`, empty, `javascript:void(0)`).
**0** `target="_blank"` without `rel="noopener"`.
Five distinct external destinations, each verified to resolve (§8).

### 7.3 Keyboard

*Mobile drawer*

| Check | Result |
|---|---|
| `aria-expanded` toggles | false → true → false |
| Focus moves into the drawer on open | yes, first link |
| `main` and `footer` set `inert` while open | yes, both |
| Background scroll locked | yes |
| Tab from last item wraps to first | yes |
| Escape closes | yes |
| Focus restored to the toggle | yes (after fix #9) |
| Breakpoint change while open | closes, no stranded focus |

*Menu tab list* — full WAI-ARIA tabs pattern confirmed: roving `tabindex`
(`[0,-1,-1,-1,-1,-1]`), `ArrowLeft`/`ArrowRight` with wrap, `Home`/`End`, exactly
one visible panel at a time, and a polite live region announcing e.g.
"Pizza — 6 dishes shown".

*Focus visibility* — 2 px outline at 3 px offset on every interactive element;
the ring colour switches to `--paper-night` on dark sections so it is visible on
both tones.

### 7.4 Contrast

27 text samples measured programmatically against their resolved opaque
background (WCAG 2.1 formula, large-text threshold applied where it qualifies).

**27 / 27 pass AA.** Lowest passing values: `--ink-45` captions 4.8:1,
`--accent-ink` eyebrows 5.0:1, today's hours row 4.8:1. Body copy 7.4–8.4:1,
headings 13.8:1.

Hero text sits over photography, where a single ratio is not meaningful. It is
protected by a bottom-weighted scrim (0.74 black at the baseline) plus a soft text
halo, and was checked visually at every tested viewport and at both ends of the
slat rotation, including over the brightest part of the image.

### 7.5 Reflow and zoom

No horizontal scroll at 320 px, or at 640 px (= 1280 at 200% zoom). All type is
`rem`/`clamp`-based, so browser zoom scales it.

### 7.6 Not claimed

**No WCAG conformance is claimed.** No screen reader was run. Automated and
keyboard checks passing is not the same as being usable with assistive technology.

---

## 8. Functional checks

| Action | Destination | Verified |
|---|---|---|
| Book a table (×4 on the page) | `district.in/dining/pune/the-third-place-koregaon-park` | Loaded; live booking flow with date/guest pickers |
| Call (×4) | `tel:+917397999999` | Matches Zomato, District and Google |
| See the full menu | `zomato.com/.../the-third-place-koregaon-park/menu` | Loaded; 29 menu pages |
| Get directions (×2) | Google Maps search for the verified address | **Loaded and resolves to the correct business** — "The Third Place", 1st Floor Jewel Tower, 18.5361418, 73.897288 |
| Instagram (×2) | `instagram.com/thirdplaceinpune/` | Loaded; official account |
| Logo | `#top` | Works |

*Anchors* — all six section anchors land with the heading clear of the fixed
header (`scroll-padding-top: 100px` vs a 76 px bar; every section settles 100 px
from the top).

*Scroll-spy* — correct at hero (nothing marked), idea, menu, wine, room and visit;
clears when returning to the hero.

*Header state* — correct at top, inside the hero, past the hero, deep in the page,
and back at the top.

*Live hours* — correctly showed "Opens today at 3 pm" on a Monday, computed in
`Asia/Kolkata` regardless of the visitor's clock, and today's row highlighted in
the hours table on the right day only.

### Things the site deliberately does not do

No booking form, no order flow, no email capture, no newsletter, no contact form.
Nothing is collected or stored, and no success message is ever shown for something
that did not happen. Booking is handed to District in a new tab, and the page says
so in plain words next to the button.

---

## 9. Console and network

Measured in a **fresh tab**, so the buffer holds only this page load. Production
build, 1440 × 900:

* **0 errors.**
* **0 warnings.**
* **0 failed requests** — every one of the ~30 requests returned 200.
* Exactly one hero image fetched. No duplicate, no unused-preload warning.

Separately, a static crawl of the built output confirms **123 referenced local
URLs and 5 CSS `url()` references, 0 missing on disk**.

Two caveats about earlier readings, recorded so they are not mistaken for defects:
the pane's console and network buffers accumulate across navigations within a tab,
so 404s from the deliberately-broken `__t-noimg.html` harness and
"preloaded but not used" warnings from loads where the viewport was resized
*after* navigation both persisted in the buffer after the cause was gone. Both
disappear on a clean load in a fresh tab.

One `console.info` is emitted by design when the hero slats are unavailable,
naming the reason — observed as `hero slats unavailable — no-webgl` in a tab where
the session had exhausted the browser's WebGL context limit. The page fell back to
the static photograph correctly, which is an unplanned but welcome live
demonstration of §5.1.

---

## 10. The WebGL hero — how it was verified

Verified twice, the second time without any instrumentation at all.

**Pass 1 — driven.** For most of the session `document.hidden` was stuck true
(§2), so `requestAnimationFrame` never fired. The animation was driven explicitly:
`requestAnimationFrame` shimmed to `setTimeout`, then the **real, unmodified
module** from the production bundle instantiated against the real hero canvas.

**Pass 2 — live.** A tab opened in the foreground late in the session reported
`document.hidden === false`, and everything ran unaided: the slats initialised and
rendered on their own, the pause control mounted, the scroll-linked turn played
while scrolling by hand, the scroll reveals animated normally, and the header
swapped to its opaque state at the right point. The results below hold in both
passes.

| Check | Result |
|---|---|
| Initialises | yes — `onReady` fired, no `onFail` |
| Canvas sized | yes, matches layout, DPR capped at 2 |
| Renders the actual photograph at rest | yes — confirmed by screenshot |
| Slats rotate | yes — at ~0.34 the room resolves into a rhythm of vertical strokes (the mark) |
| Reverse face | yes — at 1.0 the evening photograph shows, mirrored |
| Pause control appears only once rendering starts | yes |
| Pause control toggles `aria-pressed` and label | yes |
| Headline legible at every rotation | yes — checked at 0, 0.34 and 1.0 |
| Survives pausing | yes, after fix #6 |
| Context loss handled | yes — destroys and removes the canvas, photograph remains |

Slat count is 9 on desktop and 5 on phones. The scene renders only while the hero
is on screen and the document is visible.

**Not verified:** behaviour on a real GPU-constrained mobile device, and sustained
frame rate under normal (non-shimmed) rAF. The frame budget is three to nine
textured quads with no per-pixel work beyond two texture reads, so it should be
cheap, but that is reasoning, not a measurement.

---

## 11. Known limitations

**Content**

* Opening hours come from the Google Business profile, not from the restaurant
  directly. Breakfast service appears in the 2025 launch press but in no current
  source — see `research/RESEARCH.md` open question A.
* Menu prices are transcribed but **hidden**, because the scans are undated.
  One flag in `src/js/menu-data.js` publishes them.
* The menu shown is a selection of 37 dishes from a 29-page menu. The page says so.
* Three recurring events visible in the Instagram highlight names ("Saturday Muse",
  "Wed Theatre", "D'canted Wine") are **not described**, because nothing about them
  could be verified without logging in.
* No email address anywhere — none exists in any source, and inventing one is not
  acceptable.

**Assets**

* All photography is the restaurant's own, taken from its public Zomato listing,
  **without a licence**. Fine for a local concept shown to its owners; must be
  replaced or cleared before any public launch. See `assets/ASSET-MANIFEST.md`.
* No exterior photograph exists in the set, so Visit uses an interior plus a
  written wayfinding note.
* The `| | |` mark is a redraw. The official wordmark typeface was not identified;
  Jost stands in.

**Technical**

* No canonical URL or `og:url` — the production domain is unknown, and a guess
  would be worse than the omission.
* `og:image` is a relative path; it needs an absolute URL once a domain exists.
* Open Graph and structured data otherwise carry only verified fields. **No
  `aggregateRating`, no `priceRange`, no menu prices, no review markup.**
* The site is a single page. No 404 page, because there are no other routes.

**Testing**

* One browser engine, one machine, no real devices, no screen reader, no slow
  network. §2 and §7.6 say what that does and does not establish.
