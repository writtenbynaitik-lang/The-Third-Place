# Project brief — The Third Place

Speculative website concept. Koregaon Park, Pune.
Prepared 12 October 2026. Not deployed. Restaurant not contacted.

---

## 1. The problem

The Third Place has no website. Its entire digital presence is a Zomato listing it
has never claimed — one that gets its cuisine wrong in four words out of four — a
District booking page buried under twenty-five bank-card offers, and an Instagram
account with 4,124 followers and a bio truncated at "Open daily, 12:00 pm…".

Meanwhile the restaurant itself is unusually well made. The menu is beautifully
typeset with a real mark and a real voice. The room is designed. The wine list has a
point of view. **The gap between the quality of the place and the quality of its
digital presence is the whole opportunity.**

## 2. The audience

Koregaon Park locals and Pune's design-literate crowd; people who already drink
natural wine or want to start; the laptop-and-cortado crowd at 2 pm who become the
wine-by-the-glass crowd at 8 pm; out-of-towners looking for the one good room in the
neighbourhood. They are deciding in about forty seconds, usually on a phone, usually
while someone else is also deciding.

## 3. The concept — "Home. Work. And here."

Two verified facts drive everything:

**The name means something.** Ray Oldenburg's "third place" is the public room
between home and work where community happens. The founder says it in as many words:
*"Your first place is your home, second place is your work and what we have here is
your third place."* Most restaurant names are decoration. This one is a thesis.

**The mark is three strokes — `| | |`.** On every menu page, and as the Instagram
avatar. Three strokes for the third place.

So the site is built on **three**. Three strokes. Three words in the headline. Three
panels in the hero. The mark is not a logo dropped in a corner — it is the structural
rhythm of the page, and it is the 3D object.

### The day-to-night arc

The second idea comes from the hours: **noon to 11:30 pm**. One room that is a
coffee house at noon and a wine bar at night. That is the business, and the page
performs it. The site **begins in daylight and ends after dark** — cream paper and
sunlit photography at the top, moving through the all-day menu, into deep lacquer red
and lamplight for the wine bar, and back to a warm close.

Scrolling the page is the arc of a day in the room. It is not a decorative gradient;
it is the single most distinctive operational fact about the business, made visible.

### The signature interaction — the room turns

The hero is a photograph of the room split into vertical slats that rotate on their
vertical axis, like a louvre. Face-on they form one continuous photograph. Turned,
they resolve into a rhythm of vertical strokes — **the mark**. Turn them further and
the reverse faces carry the same room in evening light.

The brand mark *is* the room, seen edge-on. Day turns into night by physically
turning. One idea, doing four jobs: logo, hero, transition, and the thesis of the
whole site. Three textured quads in raw WebGL — a few kilobytes, not a framework.

## 4. What this is not

No black-and-gold. No serif-on-dark luxury clichés — the room is ochre, terracotta
and daylight, and dressing it as a steakhouse would be a lie. No glassmorphism, no
floating blobs, no cursor trail, no stock photography, no endless rounded cards, no
fake reservation widget, no invented story about passion and heritage. The restaurant
already has a voice; it does not need a new one.

## 5. Voice

Taken directly from their own menu. Plainspoken, warm, slightly dry, never
overselling: *"trust the wine"*, *"this one means what it says"*, *"classic for a
reason"*, *"simple things, done well"*. Short sentences. No adjective stacking. The
site should sound like the person who wrote the wine list.

## 6. Structure

| # | Section | Job | Light |
|---|---------|-----|-------|
| 1 | Hero | The room, the mark, the thesis, book a table | Day |
| 2 | The idea | What a third place is, in the founder's words | Day |
| 3 | The menu | Middle-Eastern, European, Modern Indian — a selection, set the way their menu is set | Day |
| 4 | Counter / coffee | SOIL Coffee, the daytime half of the room | Day |
| 5 | The wine bar | Local Legends — Indian wine taken seriously | **Night** |
| 6 | The room | Materials, makers, what it is like to be there | Dusk |
| 7 | Visit | Address, hours, phone, directions, booking | Warm |
| 8 | Footer | Navigation, Instagram, honest attribution | Warm |

Seven content sections, each a different shape. No two laid out alike.

## 7. Non-negotiables

* Every fact traceable to `research/RESEARCH.md`. Nothing invented.
* No prices until the owners confirm they are current.
* No ratings, reviews, offers, awards or dietary claims.
* No email address — none exists.
* Every link goes somewhere real. No `href="#"`.
* No form that pretends to send anything.
* The page works with WebGL off, JavaScript off, images failed, and motion reduced.
* Keyboard-complete. Readable at 320px and at 200% zoom.

## 8. Success

The owners open it on a phone and think: *that is our room, and whoever made this
understood it.* Then they look for who to call.

## 9. Deliverables

`index.html` · `src/css/` · `src/js/` · `assets/` · `tools/` (image pipeline, build,
dev server) · `project-brief.md` · `design-system.md` · `research/RESEARCH.md` ·
`assets/ASSET-MANIFEST.md` · `QA.md` · `README.md`
