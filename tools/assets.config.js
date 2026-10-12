/**
 * Single source of truth for photography.
 *
 * `src`  — file in assets/originals/ (see assets/ASSET-MANIFEST.md for provenance)
 * `out`  — folder/basename written into assets/<folder>/
 * `role` — where it is used on the page
 * `focus`— CSS object-position applied to the rendered image, so the subject
 *         survives a tight crop. Emitted into image-data.json and set as
 *         --focus on the figure frame by the build.
 * `alt`  — descriptive alt text, or null for decorative images (rendered with alt="")
 * `sizes`— widths generated. Hero art gets larger widths; thumbnails stay small.
 *
 * To swap in owner-supplied originals: drop the new file into assets/originals/,
 * point `src` at it, adjust `focus`/`alt`, then run `npm run images`.
 */

export const LOADING_PRIORITY = 'hero-room-day';

/** @type {Array<{id:string,src:string,out:string,role:string,focus:string,alt:string|null,sizes:number[],ratio?:number}>} */
export const IMAGES = [
  // ── Hero ────────────────────────────────────────────────────────────────
  {
    id: 'hero-room-day',
    src: 'r03.jpg',
    out: 'hero/room-day',
    role: 'Hero — primary. Daylit dining room, the signature view.',
    focus: 'center 55%',
    alt:
      'The first-floor dining room at The Third Place in daylight: a tall black steel shelf of ceramics and glassware behind a counter, round marble-topped tables with bentwood chairs, and potted plants against a wall of windows.',
    sizes: [640, 960, 1280, 1600, 2000, 2400],
  },
  {
    id: 'hero-room-evening',
    src: 'r18.jpg',
    out: 'hero/room-evening',
    role: 'Hero — second slat face. Same room, warm evening light.',
    focus: 'center 55%',
    alt:
      'The dining room at The Third Place in the evening, with warm light glowing beneath a curved counter, high tables and bentwood chairs under an exposed concrete ceiling.',
    sizes: [640, 960, 1280, 1600, 2000, 2400],
  },

  // ── Interior ────────────────────────────────────────────────────────────
  {
    id: 'bar-bottles',
    src: 'r01.jpg',
    out: 'interior/bar-bottles',
    role: 'Wine bar — signature image.',
    focus: 'center 32%',
    alt:
      'The bar at The Third Place: shelves of wine bottles against a deep red backlit wall, with rows of wine glasses resting upside down along the counter edge.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'window-night',
    src: 'r15.jpg',
    out: 'interior/window-night',
    role: 'Evening / wine section — atmosphere.',
    focus: 'center 72%',
    alt:
      'Banquette seating beside floor-to-ceiling steel-framed windows at night, lit by small cordless brass table lamps, with trees visible outside.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'shelves-ceramics',
    src: 'r14.jpg',
    out: 'interior/shelves-ceramics',
    role: 'The space — objects and retail shelving.',
    focus: 'center 45%',
    alt:
      'Open black steel shelving stacked with earthenware pots, ceramics and woven baskets, beside a long wooden table and steel-framed glazing.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'shelves-wide',
    src: 'r17.jpg',
    out: 'interior/shelves-wide',
    role: 'The space — wide shelving wall.',
    focus: 'center 58%',
    alt:
      'A full wall of open shelving holding plates, ceramics and candles, with plants, bentwood chairs and a wooden counter in the foreground.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'room-windows',
    src: 'r13.jpg',
    out: 'interior/room-windows',
    role: 'The space — daylight and greenery.',
    focus: 'center 52%',
    alt:
      'A corner of the dining room with curved pale banquettes, round tables, large indoor plants and daylight coming through tall windows.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'bar-terrazzo',
    src: 'r11.jpg',
    out: 'interior/bar-terrazzo',
    role: 'The space — bar and terrazzo floor.',
    focus: 'center 55%',
    alt:
      'The red-lit bar counter seen across a terrazzo floor, with bentwood chairs, marble café tables and a wine rack along the wall.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'wine-racks',
    src: 'r16.jpg',
    out: 'interior/wine-racks',
    role: 'Wine section — storage wall.',
    focus: 'center 50%',
    alt:
      'A tall black wine rack filled with bottles dividing the room, with the bar and café seating beyond it.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'communal-table',
    src: 'r02.jpg',
    out: 'interior/communal-table',
    role: 'The space — communal table, ochre wall.',
    focus: 'center 50%',
    alt:
      'A long pale oak communal table with chairs along both sides, set against an ochre clay wall with a framed mirror and a warm floor lamp.',
    sizes: [480, 768, 1100, 1500],
  },

  // ── Food ────────────────────────────────────────────────────────────────
  {
    id: 'pizza',
    src: 'r06.jpg',
    out: 'food/pizza',
    role: 'Menu — wood-fired pizza.',
    focus: '42% center',
    alt:
      'A wood-fired pizza with a blistered, leopard-spotted crust, scattered with fresh herbs and sliced onion, served with two small bowls of green and chilli-oil dips.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'rigatoni',
    src: 'r12.jpg',
    out: 'food/rigatoni',
    role: 'Menu — pasta.',
    focus: 'center center',
    alt:
      'A plate of rigatoni in a rich tomato sauce, finished with soft white cheese and basil leaves, served on a fluted glass plate.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'greens',
    src: 'r09.jpg',
    out: 'food/greens',
    role: 'Menu — charred greens from the grill.',
    focus: 'center 45%',
    alt:
      'Charred asparagus and broccolini piled over a smoky red sauce in a wide white bowl, scattered with sliced sausage.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'plated-main',
    src: 'r08.jpg',
    out: 'food/plated-main',
    role: 'Menu — a main from the kitchen.',
    focus: 'center 50%',
    alt:
      'A plated main course in a shallow white bowl: braised meat in a dark glossy sauce alongside a ridged quenelle of potato purée, finished with small green leaves.',
    sizes: [480, 768, 1100, 1500],
  },
  {
    id: 'plated-main-warm',
    src: 'r19.jpg',
    out: 'food/plated-main-warm',
    role: 'Menu — alternate main, warmer light.',
    focus: 'center 50%',
    alt:
      'Braised meat and piped potato purée in a dark sauce, photographed close in low warm light.',
    sizes: [480, 768, 1100, 1500],
  },

  // ── Details ─────────────────────────────────────────────────────────────
  {
    id: 'lamp-corner',
    src: 'r04.jpg',
    out: 'details/lamp-corner',
    role: 'Texture — clay wall and lamplight.',
    focus: 'center 50%',
    alt: null, // decorative: used as an atmospheric texture panel
    sizes: [480, 768, 1100],
  },
  {
    id: 'room-plants',
    src: 'r07.jpg',
    out: 'details/room-plants',
    role: 'The counter / coffee band — wide daytime view of the room.',
    focus: 'center 62%',
    alt:
      'The dining room in warm daylight: marble-topped café tables and bentwood chairs, indoor trees, and a backlit shelf of ceramics along the far wall beneath exposed ducting.',
    sizes: [480, 768, 1100],
  },
  {
    id: 'bar-wide',
    src: 'r05.jpg',
    out: 'details/bar-wide',
    role: 'Texture — wide bar view.',
    focus: 'center 55%',
    alt: null,
    sizes: [480, 768, 1100],
  },
  {
    id: 'plated-dark',
    src: 'r10.jpg',
    out: 'details/plated-dark',
    role: 'Texture — plated dish, dark.',
    focus: 'center 50%',
    alt: null,
    sizes: [480, 768, 1100],
  },
];
