/**
 * Menu data — transcribed from the restaurant's own 29-page printed menu as
 * published on its public Zomato listing (read 12 Oct 2026).
 * Provenance and the full transcription: research/RESEARCH.md §5.
 *
 * RULES THIS FILE FOLLOWS
 *  · Dish names and descriptions are as printed. Four obvious typographic
 *    errors were corrected (Edammame→Edamame, pomogrenate→pomegranate,
 *    Brocolli→Broccoli, Chantly→Chantilly). No meaning was changed.
 *  · `marks` reproduces only the symbols actually printed beside that dish —
 *    the menu's own allergen key and its red non-vegetarian square.
 *    No dietary claim is added. An absent mark means "not printed", never
 *    "free from".
 *  · This is a SELECTION, not the full menu. The UI says so and links out.
 *
 * ── PRICES ──────────────────────────────────────────────────────────────────
 * `price` holds the figure printed on the scan, in rupees. The scans carry no
 * date, so currency could not be confirmed and prices are HIDDEN by default.
 * Set `showPrices` to true once the owners confirm. Nothing else needs changing.
 */

export const showPrices = false;

/** The menu's own allergen key, reproduced verbatim. */
export const MARKS = {
  dairy: 'contains dairy',
  gluten: 'contains gluten',
  nuts: 'contains nuts',
  crustaceans: 'crustaceans allergy',
  nonveg: 'non-vegetarian',
};

export const CATEGORIES = [
  {
    id: 'to-start',
    label: 'To start',
    items: [
      {
        name: 'Hummus Al Bayt',
        desc: 'Spiced chickpeas, zhug, Arabic pickle, warm pita',
        marks: [],
        price: 585,
      },
      {
        name: 'Gojju Smashed Potatoes',
        desc: 'Crispy baby potatoes, caramelised onion glaze, sweet & tangy tomato gojju',
        marks: [],
        price: 475,
      },
      {
        name: 'Avocado Toast',
        desc: 'Grilled sourdough, spicy tomato relish, hass avocado, black lime chimichurri, rocket & nutty dukkah',
        marks: ['nuts'],
        price: 585,
      },
      {
        name: 'Muhammara',
        desc: 'Toasted walnuts, pomegranate molasses, fried pita',
        marks: [],
        price: 395,
      },
      {
        name: "Za'atar Focaccia",
        desc: 'Whipped labneh, chilli honey drizzle, shards of golden garlic',
        marks: ['gluten', 'dairy'],
        price: 235,
      },
      {
        name: 'The Grilled Slice',
        desc: 'Sourdough, whipped ricotta, cracked pepper blend, parmesan snow, hot honey',
        marks: ['dairy'],
        price: 255,
      },
      {
        name: 'Labneh Stuffed Olives',
        desc: "With za'atar and togarashi",
        marks: ['dairy'],
        price: 365,
      },
      {
        name: 'Corn Ribs',
        desc: 'Jalapeño aioli, lemon',
        marks: [],
        price: 455,
      },
      {
        name: 'Moroccan Lamb Hummus',
        desc: 'House hummus, slow-braised Moroccan lamb, zhug, Arabic pickles, biwas & warm pita',
        marks: ['nonveg'],
        price: 695,
      },
      {
        name: 'Prawns en Verde Cafreal',
        desc: 'Herb-marinated grilled prawns, cafreal, lime, served with grilled sourdough',
        marks: ['crustaceans', 'nonveg'],
        price: 695,
      },
    ],
  },
  {
    id: 'grills',
    label: 'Rustic grills',
    items: [
      {
        name: 'Charred Grilled Greens',
        desc: 'Smoked almond sauce, black lime glaze, spicy chimichurri & toasted almonds',
        marks: ['nuts'],
        price: 535,
      },
      {
        name: 'Mediterranean Cottage Cheese',
        desc: 'Charred cottage cheese with a tangy house marinade, finished with garlic toum & biwas',
        marks: ['dairy'],
        price: 575,
      },
      {
        name: 'Grilled Prawns',
        desc: 'Tiger prawns glazed in smoky harissa butter, charred lemon, garlic toum, house salad & chives',
        marks: ['crustaceans', 'nonveg'],
        price: 695,
      },
      {
        name: 'Joojeh Kebab',
        desc: 'Warm saj bread, charred tomatoes & chillies, spicy biwas, garlic toum',
        marks: ['nonveg'],
        price: 635,
      },
      {
        name: 'Lamb Seekh Kebab',
        desc: 'Charred tomatoes, Bhavnagri chilli, biwas salad, garlic toum with zhug',
        marks: ['nonveg'],
        price: 655,
      },
      {
        name: 'Charcoal Wings',
        desc: 'Ras el hanout spiced wings, fries & toums',
        marks: ['nonveg'],
        price: 565,
      },
    ],
  },
  {
    id: 'pizza',
    label: 'Pizza',
    note: 'Wood-fired, Neapolitan-style, on a 72-hour slow-fermented dough.',
    items: [
      {
        name: 'Pinky Promise',
        desc: 'Spicy tomato cream, fresh mozzarella, confit garlic, basil, six pepper',
        marks: ['dairy', 'gluten'],
        price: 695,
      },
      {
        name: 'Margherita',
        desc: 'San Marzano tomato, fresh mozzarella, roasted cherry tomato, basil',
        marks: ['dairy', 'gluten'],
        price: 665,
      },
      {
        name: 'Truffle Mushroom',
        desc: 'Mushroom pâté, roasted mushrooms, parmesan, rocket, truffle, walnuts',
        marks: ['dairy', 'gluten', 'nuts'],
        price: 775,
      },
      {
        name: 'Beirut Calling',
        desc: "Lahmacun spiced chicken ragù, za'atar onion, biwas, garlic toum with zhug",
        marks: ['gluten', 'nonveg'],
        price: 725,
      },
      {
        name: 'The K-pop Caesar',
        desc: 'Gochujang chicken, caesar cream, lettuce, golden garlic croutons, parmesan snow',
        marks: ['dairy', 'gluten', 'nonveg'],
        price: 705,
      },
      {
        name: 'Pepperoni',
        desc: 'Spicy pepperoni, mozzarella, burrata, chilli, garlic',
        marks: ['dairy', 'gluten', 'nonveg'],
        price: 995,
      },
    ],
  },
  {
    id: 'pasta',
    label: 'Pasta',
    items: [
      {
        name: 'Rigatoni alla Norma',
        desc: 'Pomodoro, fresh basil, fried eggplant & whipped ricotta',
        marks: ['dairy', 'gluten'],
        price: 595,
      },
      {
        name: 'Aglio Olio e Peperoncino',
        desc: 'Spaghetti, extra virgin olive oil, garlic, chilli & parsley',
        marks: ['gluten'],
        price: 595,
      },
      {
        name: 'Linguine Basil Pesto',
        desc: 'House basil pesto, black olives, cherry tomato, Calabrian burrata',
        marks: ['dairy', 'gluten'],
        price: 625,
      },
      {
        name: 'Truffle Tagliatelle Alfredo',
        desc: 'Fresh pasta ribbons, parmesan cream, black pepper, truffle',
        marks: ['dairy', 'gluten'],
        price: 655,
      },
      {
        name: 'Prawn Picante',
        desc: 'Chilli butter pomodoro, prawns, garlic streusel & fresh chives',
        marks: ['crustaceans', 'gluten', 'nonveg'],
        price: 705,
      },
      {
        name: 'Mushroom Mezzalune',
        desc: 'Truffled mascarpone & mushroom, sage butter monté, sautéed mushrooms, pickled shimeji',
        marks: ['dairy', 'gluten'],
        price: 675,
      },
    ],
  },
  {
    id: 'mains',
    label: 'Mains',
    items: [
      {
        name: 'Asparagus & Sweet Peas Risotto',
        desc: 'Parmesan risotto, charred asparagus, sweet peas',
        marks: ['dairy'],
        price: 725,
      },
      {
        name: 'Chakram Curry',
        desc: 'Tofu, fragrant coconut curry, herbs, jasmine rice',
        marks: [],
        price: 635,
      },
      {
        name: 'Mutton Alni Risotto',
        desc: 'Creamy alni stock risotto, tender kala mutton, fresh coriander, mint',
        marks: ['nonveg'],
        price: 875,
      },
      {
        name: 'Grilled Chicken',
        desc: 'Confit chicken leg char-grilled, mash potatoes, pepper and mushroom jus, roasted veggies',
        marks: ['nonveg'],
        price: 775,
      },
      {
        name: 'Mushroom Tikki',
        desc: 'Mushroom kebab, Awadhi masala, fennel-walnut chutney',
        marks: ['nuts'],
        price: 515,
      },
      {
        name: "Banger's and Mash",
        desc: 'Chicken sausage, mash potato, onion gravy',
        marks: ['nonveg'],
        price: 535,
      },
    ],
  },
  {
    id: 'dessert',
    label: 'Dessert',
    items: [
      {
        name: 'Dark Chocolate Terrine',
        desc: 'Chocolate terrine, boozy cherries, vanilla chantilly',
        marks: ['dairy'],
        price: 455,
      },
      {
        name: 'Tiramisu',
        desc: 'Coffee-soaked layers & mascarpone. Classic for a reason.',
        marks: ['dairy', 'nonveg'],
        price: 515,
      },
      {
        name: 'Sorbet & Gelatos',
        desc: 'Seasonal scoops — ask the server for the scoop of the day',
        marks: [],
        price: 325,
      },
    ],
  },
];
