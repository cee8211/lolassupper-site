/* ================================================================
   LoLa's Supper Club — App JS
   Navigation, Modal, Menu Data & Recipe Toggles
   ================================================================ */

// ---- Navigation ----

const header    = document.getElementById('site-header');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');
const allLinks  = navLinks.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);

  // Highlight active section
  let current = '';
  document.querySelectorAll('section[id]').forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
  });
  allLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.section === current);
  });
}, { passive: true });

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ---- Recipe Toggle ----

function toggleRecipe(btn) {
  const body = btn.nextElementSibling;
  const open = body.classList.toggle('visible');
  btn.classList.toggle('open', open);
  btn.querySelector('.recipe-icon').textContent = open ? '×' : '+';
}

// ---- Event Modal ----

const modal        = document.getElementById('event-modal');
const modalContent = document.getElementById('modal-content');

function openEvent(id) {
  const data = EVENTS[id];
  if (!data) return;
  modalContent.innerHTML = buildMenuHTML(data);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function buildMenuHTML(data) {
  let html = `
    <span class="menu-eyebrow">${data.label}</span>
    <h2 class="menu-title">${data.title}</h2>
    <p class="menu-subtitle">${data.subtitle}</p>
  `;

  data.courses.forEach(course => {
    html += `<div class="menu-course">`;
    html += `<h3 class="menu-course-title">${course.name}</h3>`;
    if (course.note) html += `<p style="font-size:0.82rem;color:var(--text-mid);font-style:italic;margin-bottom:1rem;">${course.note}</p>`;

    course.items.forEach((item, i) => {
      const recipeId = `r_${data.title.replace(/\s/g, '')}_${i}`;
      html += `
        <div class="menu-item">
          <div class="menu-item-name">${item.name}</div>
          ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
          <div class="recipe-box">
            <button class="recipe-toggle" onclick="toggleRecipe(this)">
              <i class="recipe-icon">+</i> Recipe
            </button>
            <div class="recipe-body">
              <span class="recipe-label">Serves</span>
              <p class="recipe-yield">${item.recipe.yield}</p>
              <span class="recipe-label">Ingredients</span>
              <ul class="recipe-ingredients">
                ${item.recipe.ingredients.map(x => `<li>${x}</li>`).join('')}
              </ul>
              <span class="recipe-label">Method</span>
              <ol class="recipe-method">
                ${item.recipe.steps.map(s => `<li>${s}</li>`).join('')}
              </ol>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  return html;
}

// ================================================================
//  MENU DATA
// ================================================================

const EVENTS = {

  'skin-contact': {
    label:    'Past Event',
    title:    'Skin Contact',
    subtitle: 'ode to all things orange',
    courses: [
      {
        name: 'Starters',
        items: [
          {
            name: 'Seared Tuna Crudo',
            desc: 'with gooseberry salsa',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                'Tuna',
                'Salt & pepper',
                '2 tbsp soy sauce',
                'Juice & zest of 1 lemon (~1 tbsp)',
                'Juice & zest of 1 small orange (~2–3 tbsp)',
                '~¼ cup olive oil',
                'Thinly sliced gooseberries (or oranges!)',
              ],
              steps: [
                'Sear tuna with salt & pepper.',
                'Make the marinade: mix soy sauce, lemon juice & zest, orange juice & zest, and olive oil.',
                'Add more of everything to taste — if too acidic, add more soy sauce.',
                'Top with thinly sliced gooseberry (or orange slices work great too!).',
              ],
            },
          },
          {
            name: 'Salmon Tartare',
            desc: 'served on homemade sweet potato chip',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '300g fresh salmon fillet, skin removed',
                '1 tbsp capers, roughly chopped',
                '2 tbsp crème fraîche',
                '1 tsp Dijon mustard',
                '1 tsp white wine vinegar',
                '1 tbsp fresh dill, chopped',
                '1 tsp lemon zest',
                '2 medium sweet potatoes',
                'Vegetable oil for frying',
                'Flaked sea salt',
              ],
              steps: [
                'Peel sweet potatoes and slice paper-thin on a mandoline.',
                'Fry in batches at 180°C until golden and crisp, about 3–4 minutes. Drain on paper towel and season immediately with flaked salt.',
                'Very finely dice the salmon. Mix with capers, crème fraîche, Dijon, vinegar, dill, and lemon zest. Season to taste.',
                'Refrigerate tartare for 20 minutes before serving.',
                'Top each chip with a small spoonful of tartare just before serving.',
              ],
            },
          },
          {
            name: 'Sweet Potato Galettes',
            desc: 'with feta & crispy sage',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                'Puff pastry from Woolies — defrost in fridge the night before!',
                '2–3 sweet potatoes, skin on',
                '1 yellow onion',
                'Half butter / half olive oil (for onions)',
                '~1/3 cup milk',
                '~½ tbsp plain flour',
                '1 egg (for egg wash)',
                'Crumbled feta',
                'Fresh sage leaves',
              ],
              steps: [
                'Defrost puff pastry in the fridge the night before.',
                'Put sweet potatoes skin on in the oven at 200°C for 35–45 min. You want them a bit firm so they\'re sliceable.',
                'Slow cook yellow onion in a mix of butter and olive oil on medium heat. Caramelisation is a labour of love — takes about 45 min. Stir every so often and add a splash of water (1 tsp) if it starts getting dry.',
                'While onions are caramelising, cut puff pastry into whatever shape you want. Poke little holes with a fork, leaving the edges clear for the border. Put back in the fridge uncovered.',
                'Once onions are well caramelised, make a roux with the butter in your onions — add a splash of milk and about ½ tbsp flour. Mix until thickening, then slowly add ~1/3 cup milk, stirring constantly. Add more flour as needed until you have a spreadable, jam-like consistency.',
                'Quick egg wash on the pastry (break an egg in a bowl — a paper towel works great if you don\'t have a brush).',
                'Spread a spoonful of the caramelised onion mixture over the pastry.',
                'Add sweet potato slices, leaving a narrow border. The edges will puff up over the potatoes while baking.',
                'Top with crumbled feta and sage leaves.',
                'Bake at 200°C for 15–25 min until golden. Watch it — it can go fast!',
              ],
            },
          },
        ],
      },
      {
        name: 'Primi',
        items: [
          {
            name: 'Pumpkin Rigatoni',
            desc: 'topped with toasted seeds & pancetta',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                'Pumpkin chunks (pre-cut from Woolies works great)',
                'Olive oil, salt & pepper',
                'Pasta',
                'Fresh sage leaves',
                'Butter',
                'Pumpkin seeds (optional — totally fine raw too)',
              ],
              steps: [
                'Heat oven to 200°C.',
                'Toss pumpkin chunks in olive oil, salt, and pepper.',
                'Line a baking sheet with foil (the bottoms can get stuck otherwise) and roast for 15–20 min — long enough that you can flatten the pumpkin easily with a fork.',
                'Blend pumpkin with an immersion blender or regular blender, adding a splash of olive oil or milk if you need it smoother.',
                'Cook your pasta. Add the pumpkin mixture and splash with pasta water until you reach the right consistency.',
                'Toast sage leaves in butter on low heat for ~5 min. If it starts turning into brown butter — even better!',
                'Top with pumpkin seeds for extra punch.',
              ],
            },
          },
        ],
      },
      {
        name: 'Secondi',
        items: [
          {
            name: 'Honey Orange Pork Tenderloin',
            desc: '',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                'Pork',
                '1/3 cup orange marmalade',
                '3 tbsp soy sauce',
                '3 tbsp apple cider vinegar',
                '1 clove garlic, minced',
                'Honey to taste (skip if your marmalade is already quite sweet)',
              ],
              steps: [
                'Make the marinade: mix marmalade, soy sauce, apple cider vinegar, garlic, and honey to taste. Shake it up!',
                'Preheat oven to 200°C.',
                'Brown the pork on all sides in an oven-safe pan.',
                'Once brown, pour about half the marinade on top.',
                'Put in oven for ~20 min, turning the pork about halfway through.',
                'Drizzle with the remaining marinade. 🤤',
              ],
            },
          },
          {
            name: 'Roasted Carrots',
            desc: "served with yoghurt and a lil' crunch",
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '800g carrots (rainbow if available), scrubbed and halved lengthwise',
                '2 tbsp honey',
                '2 tbsp olive oil',
                '1 tsp cumin seeds',
                '½ tsp harissa paste',
                '250g Greek yoghurt',
                '1 clove garlic, minced',
                '50g dukkah or roughly chopped toasted nuts',
                'Lemon juice, fresh parsley or mint',
                'Salt',
              ],
              steps: [
                'Toss carrots with honey, olive oil, cumin seeds, harissa, and a good pinch of salt.',
                'Roast at 200°C for 30–35 minutes until tender, caramelised at the edges, and slightly charred in spots.',
                'Mix yoghurt with garlic, a squeeze of lemon juice, and salt.',
                'Spread yoghurt generously across a serving platter. Arrange carrots on top.',
                'Scatter dukkah and fresh herbs, finish with a drizzle of olive oil.',
              ],
            },
          },
        ],
      },
      {
        name: 'Sweet Treat',
        items: [
          {
            name: 'Orange Olive Oil Cake',
            desc: '& take-home surprise!',
            recipe: {
              yield: 'Makes one 23cm cake',
              ingredients: [
                '240ml good quality extra virgin olive oil',
                '3 large eggs',
                '250g caster sugar',
                'Zest of 2 large oranges',
                '120ml fresh orange juice',
                '240ml whole milk',
                '300g plain flour',
                '2 tsp baking powder',
                '½ tsp fine salt',
                'Icing sugar & caramelised orange slices to finish',
              ],
              steps: [
                'Preheat oven to 175°C. Grease and line a 23cm cake tin.',
                'Whisk eggs, caster sugar, and orange zest together for 3 minutes until pale and slightly thickened.',
                'Stream in olive oil, orange juice, and milk, whisking to combine.',
                'Fold in flour, baking powder, and salt until just combined — don\'t overwork it.',
                'Pour into tin. Bake 45–55 minutes until deep golden and a skewer comes out clean.',
                'Cool completely before dusting heavily with icing sugar. Garnish with caramelised orange slices.',
              ],
            },
          },
        ],
      },
    ],
  },

  'happies': {
    label:    'Past Event — 12.07.25',
    title:    'Happies',
    subtitle: 'middle eastern mezze night',
    courses: [
      {
        name: 'Happies',
        items: [
          {
            name: 'Spanakopita',
            desc: 'pastry stuffed with spinach & feta',
            recipe: {
              yield: 'Makes about 20 pieces',
              ingredients: [
                '500g fresh spinach (or frozen, fully thawed & squeezed dry)',
                '300g feta, crumbled',
                '2 eggs, lightly beaten',
                '1 small onion, finely diced',
                '2 cloves garlic, minced',
                'Generous handful of fresh dill, chopped',
                '¼ tsp freshly grated nutmeg',
                '250g filo pastry',
                '100g butter, melted (or good olive oil)',
                'Salt & pepper',
              ],
              steps: [
                'Wilt spinach in a hot dry pan in batches. Drain thoroughly and squeeze out every drop of moisture. Roughly chop.',
                'Combine spinach with feta, eggs, onion, garlic, dill, and nutmeg. Season well — it should be punchy.',
                'Brush a sheet of filo with melted butter, layer 2–3 more sheets on top, brushing each.',
                'Cut layered filo into strips about 10cm wide.',
                'Place a heaped teaspoon of filling at the bottom of each strip. Fold up into triangles, like folding a flag.',
                'Brush tops with butter. Bake at 190°C for 20–25 minutes until deeply golden.',
              ],
            },
          },
          {
            name: "LoLa's Borek",
            desc: 'puff pastry with spiced lamb mince',
            recipe: {
              yield: 'Makes 12 pieces',
              ingredients: [
                '500g lamb mince',
                '1 large onion, finely diced',
                '3 cloves garlic, minced',
                '1 tsp ground cumin',
                '1 tsp ground coriander',
                '½ tsp ground cinnamon',
                '½ tsp allspice',
                'Pinch of dried chilli flakes',
                '2 tbsp pine nuts, toasted',
                '2 sheets ready-rolled puff pastry',
                '1 egg, beaten (egg wash)',
                'Sesame seeds',
                'Salt & pepper',
              ],
              steps: [
                'Fry onion in oil until soft and golden, about 8 minutes. Add garlic and all spices, cook 1 minute.',
                'Add lamb mince, break up well, and cook until browned and starting to crisp. Season generously.',
                'Stir through toasted pine nuts. Spread on a tray and cool completely.',
                'Cut each pastry sheet into 6 rectangles. Lay filling down one half, fold over and crimp edges firmly with a fork.',
                'Brush all over with egg wash and scatter sesame seeds on top.',
                'Bake at 200°C for 20–22 minutes until puffed, golden, and gloriously flaky.',
              ],
            },
          },
          {
            name: 'Fig Crostini',
            desc: 'served with goat cheese & hot honey',
            recipe: {
              yield: 'Makes about 24 pieces',
              ingredients: [
                '1 sourdough baguette or small ciabatta',
                '6 fresh figs (or good-quality fig jam as backup)',
                '200g soft fresh goat cheese',
                '3–4 tbsp runny honey',
                '½ tsp dried chilli flakes',
                '1 tbsp fresh thyme leaves',
                'Extra virgin olive oil',
                'Flaked sea salt',
              ],
              steps: [
                'Slice bread into 1cm rounds. Brush both sides with olive oil.',
                'Toast in oven at 190°C for 8–10 minutes, flipping once, until golden and crunchy.',
                'Make hot honey: warm honey gently in a small saucepan, stir in chilli flakes, and set aside.',
                'Spread each crostino generously with goat cheese. Quarter figs and nestle one piece on top.',
                'Drizzle with hot honey, scatter thyme leaves, and finish with flaked salt.',
              ],
            },
          },
        ],
      },
      {
        name: 'Dips & Things',
        note: 'served with pita, pickles & crudités',
        items: [
          {
            name: 'Charred Zucchini Dip',
            desc: '',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '4 medium zucchini',
                '3 cloves garlic, unpeeled',
                '3 tbsp tahini',
                'Juice of 1 large lemon',
                '3 tbsp extra virgin olive oil',
                '½ tsp ground cumin',
                '1 tsp za\'atar',
                'Fresh mint or dill to finish',
                'Salt & pepper',
              ],
              steps: [
                'Char zucchini and garlic directly over an open flame or under a very hot broiler, turning often, until blackened all over and completely soft inside. This takes patience — the char is the flavour.',
                'Let cool. Peel garlic. Scoop zucchini flesh, discarding the charred skins.',
                'Blend or roughly chop zucchini and garlic with tahini, lemon juice, olive oil, and cumin until slightly chunky.',
                'Season assertively. Transfer to a bowl, top with za\'atar, a drizzle of oil, and fresh herbs.',
              ],
            },
          },
          {
            name: 'Zesty Hummus & Lamb',
            desc: '',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '2 x 400g cans chickpeas, drained (reserve the liquid)',
                '4 tbsp tahini',
                '2 cloves garlic',
                'Juice of 2 lemons',
                '4 tbsp extra virgin olive oil',
                '300g lamb mince',
                '1 tsp each: ground cumin, coriander, cinnamon',
                '2 tbsp pine nuts, toasted',
                'Smoked paprika, sumac, fresh flat-leaf parsley',
                'Ice cold water',
                'Salt',
              ],
              steps: [
                'Blend chickpeas, tahini, garlic, lemon juice, 2 tbsp olive oil, and a good pinch of salt. Add ice cold water gradually, blending until completely silky — this takes 3–4 minutes.',
                'Fry lamb mince over high heat with spices until well browned and crispy in spots. Season.',
                'Stir in pine nuts. Keep warm.',
                'Spread hummus in a wide bowl, using the back of a spoon to create a well in the centre.',
                'Pile warm spiced lamb into the well. Drizzle with olive oil and scatter paprika, sumac, and parsley.',
              ],
            },
          },
          {
            name: "Roasted Red Pepper Muhammara",
            desc: '',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '4 large red peppers',
                '100g walnuts, toasted',
                '2 tbsp pomegranate molasses',
                '1 tbsp tomato paste',
                '1 clove garlic',
                '1 tsp ground cumin',
                '½ tsp Aleppo pepper or mild chilli flakes',
                '3 tbsp extra virgin olive oil',
                'Juice of ½ lemon',
                'Salt',
              ],
              steps: [
                'Char peppers directly over a gas flame or under a broiler, turning every few minutes, until completely blackened all over.',
                'Place in a bowl, cover tightly, and steam for 15 minutes.',
                'Peel, deseed, and roughly chop the peppers.',
                'Blend peppers with walnuts, pomegranate molasses, tomato paste, garlic, cumin, chilli flakes, oil, and lemon juice.',
                'Pulse until thick and slightly chunky — not completely smooth. Season well.',
                'Serve topped with extra walnuts and a drizzle of olive oil.',
              ],
            },
          },
        ],
      },
      {
        name: 'Main Event',
        items: [
          {
            name: "Za'atar Chicken & Yogurt Sauce",
            desc: '',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '1.5kg bone-in, skin-on chicken thighs',
                '3 tbsp za\'atar',
                '2 tsp sumac',
                '1 tsp ground cumin',
                '3 cloves garlic, minced',
                '4 tbsp olive oil',
                'Juice of 1 lemon',
                'Salt & pepper',
                '— For the yogurt sauce:',
                '300g thick Greek yoghurt',
                '1 clove garlic, minced',
                '1 tbsp fresh mint, finely chopped',
                '1 tbsp lemon juice',
                'Salt',
              ],
              steps: [
                'Mix za\'atar, sumac, cumin, garlic, olive oil, lemon juice, salt and pepper. Rub all over chicken — really get under the skin. Marinate overnight or minimum 2 hours.',
                'Roast skin-side up at 200°C for 35–40 minutes until the skin is deeply golden and crispy and juices run clear.',
                'For the sauce: combine yoghurt, garlic, mint, lemon, and salt. Let sit at room temperature while chicken cooks.',
                'Spread yoghurt sauce across the serving platter. Place chicken on top and drizzle everything with olive oil and a pinch of sumac.',
              ],
            },
          },
          {
            name: 'Kale & Sweet Potato Salad',
            desc: 'topped with pickled onions & tahini',
            recipe: {
              yield: 'Serves 6',
              ingredients: [
                '2 large sweet potatoes, peeled and cubed',
                '1 large bunch curly kale, stems stripped, leaves torn',
                '1 red onion, very thinly sliced',
                '100ml red wine vinegar',
                '1 tbsp sugar',
                '— Tahini dressing:',
                '3 tbsp tahini',
                'Juice of 1 large lemon',
                '1 small clove garlic, minced',
                '3–5 tbsp warm water',
                'Olive oil, ground cumin, salt',
              ],
              steps: [
                'Quick pickle the onion: combine vinegar, sugar, and a pinch of salt in a small bowl. Add sliced onion and leave for at least 30 minutes.',
                'Toss sweet potato with olive oil, cumin, and salt. Roast at 200°C for 25 minutes until caramelised.',
                'Massage kale with a drizzle of olive oil and a pinch of salt for 2 full minutes until softened and darkened.',
                'Make tahini dressing: whisk tahini, lemon juice, and garlic together. Add warm water gradually until pourable. Season.',
                'Combine kale and sweet potato on a large platter. Pile on pickled onions and drizzle generously with dressing.',
              ],
            },
          },
        ],
      },
      {
        name: 'Sweet Treat',
        items: [
          {
            name: 'Lemon Bars',
            desc: '',
            recipe: {
              yield: 'Makes about 16 bars',
              ingredients: [
                '— Shortbread base:',
                '200g plain flour',
                '60g icing sugar',
                '170g cold unsalted butter, cubed',
                '¼ tsp fine salt',
                '— Lemon curd filling:',
                '4 large eggs',
                '350g caster sugar',
                '2 tbsp plain flour',
                'Zest of 2 lemons',
                '120ml fresh lemon juice (4–5 lemons)',
                'Icing sugar to finish',
              ],
              steps: [
                'Preheat oven to 175°C. Line a 20x30cm baking tin with parchment.',
                'Pulse flour, icing sugar, salt, and cold butter in a food processor until the mixture resembles fine breadcrumbs. Press firmly and evenly into the base of the tin.',
                'Bake base for 18–20 minutes until pale golden. Remove from oven.',
                'While base is still warm, whisk together eggs, caster sugar, flour, lemon zest, and lemon juice until smooth.',
                'Pour lemon mixture over the warm base. Return to oven for 20–22 minutes until just set with the faintest wobble in the centre.',
                'Cool completely — then refrigerate for at least 1 hour before cutting.',
                'Cut into bars. Dust very generously with icing sugar just before serving.',
              ],
            },
          },
        ],
      },
    ],
  },
};
