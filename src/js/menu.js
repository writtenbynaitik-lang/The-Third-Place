/**
 * Menu rendering and category switching.
 *
 * The full list for every category is rendered into the DOM up front and the
 * inactive ones are hidden with `hidden`. That means:
 *  · with JS disabled nothing is lost — main.js only ever hides what it can
 *    also show again, and the no-JS path leaves every category visible
 *    (see the `menu--nojs` fallback in main.js);
 *  · switching is instant and does no layout work beyond one reflow.
 */

import { CATEGORIES, MARKS, showPrices } from './menu-data.js';

const MARK_SHORT = {
  dairy: 'dairy',
  gluten: 'gluten',
  nuts: 'nuts',
  crustaceans: 'shellfish',
  nonveg: 'non-veg',
};

function itemEl(item) {
  const li = document.createElement('li');
  li.className = 'menu-item';

  const name = document.createElement('p');
  name.className = 'menu-item__name';

  const label = document.createElement('span');
  label.textContent = item.name;
  name.appendChild(label);

  if (showPrices && typeof item.price === 'number') {
    const price = document.createElement('span');
    price.className = 'menu-item__price';
    price.textContent = `₹${item.price}`;
    name.appendChild(price);
  }

  item.marks.forEach((m) => {
    const tag = document.createElement('span');
    tag.className = `tag${m === 'nonveg' ? ' tag--nonveg' : ''}`;
    tag.textContent = MARK_SHORT[m] || m;
    // The visible text is an abbreviation; give assistive tech the menu's
    // own full wording.
    tag.setAttribute('title', MARKS[m]);
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = ` (${MARKS[m]})`;
    name.appendChild(tag);
    name.appendChild(sr);
  });

  li.appendChild(name);

  if (item.desc) {
    const desc = document.createElement('p');
    desc.className = 'menu-item__desc';
    desc.textContent = item.desc;
    li.appendChild(desc);
  }

  return li;
}

export function renderMenu({ tablist, panels, status }) {
  if (!tablist || !panels) return;

  tablist.innerHTML = '';
  panels.innerHTML = '';

  CATEGORIES.forEach((cat, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cat';
    tab.id = `cat-${cat.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(i === 0));
    tab.setAttribute('aria-controls', `panel-${cat.id}`);
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.textContent = cat.label;
    tablist.appendChild(tab);

    const panel = document.createElement('div');
    panel.id = `panel-${cat.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `cat-${cat.id}`);
    panel.tabIndex = 0;
    if (i !== 0) panel.hidden = true;

    if (cat.note) {
      const note = document.createElement('p');
      note.className = 'menu__note';
      note.textContent = cat.note;
      note.style.marginBottom = 'var(--s-5)';
      panel.appendChild(note);
    }

    const ul = document.createElement('ul');
    ul.className = 'menu-list';
    cat.items.forEach((item) => ul.appendChild(itemEl(item)));
    panel.appendChild(ul);

    panels.appendChild(panel);
  });

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  const select = (index, { focus = true } = {}) => {
    tabs.forEach((t, i) => {
      const on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tabs[index].focus();
    tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (status) status.textContent = `${CATEGORIES[index].label} — ${CATEGORIES[index].items.length} dishes shown`;
  };

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    select(tabs.indexOf(tab), { focus: false });
  });

  // Standard tab-list keyboard model.
  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;

    const map = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in map)) return;

    e.preventDefault();
    const next = (map[e.key] + tabs.length) % tabs.length;
    select(next);
  });

  return { select };
}
