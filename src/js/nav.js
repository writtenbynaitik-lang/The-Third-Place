/**
 * Header state, mobile drawer and scroll-spy.
 * No dependency on the hero or WebGL — navigation must work regardless.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initHeader({ header, hero }) {
  if (!header) return;

  // "Stuck" once the hero is mostly behind us, so the bar swaps from
  // transparent-over-photo to opaque paper.
  const setStuck = (v) => header.setAttribute('data-stuck', String(v));

  if (hero && 'IntersectionObserver' in window) {
    // Observe the hero itself, not a sentinel at its bottom edge. A 1px
    // sentinel only intersects for a short stretch of scroll, so an anchor
    // jump straight to #visit skips the crossing entirely and the header keeps
    // whatever style it had. The hero spans the whole region, so "is any of it
    // still behind the bar?" is always answerable.
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: 0 }
    );

    io.observe(hero);
  } else {
    setStuck(true);
  }
}

export function initDrawer({ toggle, drawer }) {
  if (!toggle || !drawer) return;

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.setAttribute('data-drawer-open', 'true');
    // Hide the rest of the page from assistive tech and pointer input.
    document.querySelectorAll('main, footer').forEach((el) => (el.inert = true));
    const first = drawer.querySelector(FOCUSABLE);
    first?.focus();
  };

  const close = ({ restore = true } = {}) => {
    drawer.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.removeAttribute('data-drawer-open');
    document.querySelectorAll('main, footer').forEach((el) => (el.inert = false));

    if (restore) {
      // `document.activeElement` is <body> when the toggle was activated by a
      // pointer, so restoring it blindly drops focus to the top of the page.
      // Only restore a real, still-connected element; otherwise the toggle.
      const ok =
        lastFocused instanceof HTMLElement &&
        lastFocused !== document.body &&
        lastFocused.isConnected;
      (ok ? lastFocused : toggle).focus();
    }
  };

  const isOpen = () => drawer.getAttribute('data-open') === 'true';

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));

  // Any link inside the drawer dismisses it. Focus is not restored to the
  // toggle here — it should follow the anchor the user just chose.
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) close({ restore: false });
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab') return;

    const items = [...drawer.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Leaving mobile width with the drawer open would strand focus in a hidden
  // element, so close it on the breakpoint change.
  const mq = window.matchMedia('(min-width: 840px)');
  const onChange = (e) => {
    if (e.matches && isOpen()) close({ restore: false });
  };
  mq.addEventListener?.('change', onChange);
}

/**
 * Marks the nav link for the section currently crossing a reading line set a
 * third of the way down the viewport.
 *
 * Deliberately not IntersectionObserver. Ranking sections by
 * `intersectionRatio` compares each section against its OWN area, so a short
 * section that is barely on screen outranks a tall one filling the viewport —
 * the highlight jumps to the wrong entry. A single line test is unambiguous,
 * is correct for sections of any height, and costs one rAF-throttled read.
 */
export function initScrollSpy({ links, sections }) {
  if (!links.length || !sections.length) return;

  const byId = new Map(links.map((a) => [a.getAttribute('href')?.slice(1), a]));
  let current = null;
  let ticking = false;

  const update = () => {
    const line = window.innerHeight * 0.35;
    let found = null;

    // Sections are in document order, so the last one starting above the line
    // is the one we are reading.
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top > line) break;
      if (r.bottom > line) found = s;
    }

    const id = found && byId.has(found.id) ? found.id : null;
    if (id === current) return;

    current = id;
    links.forEach((a) => a.removeAttribute('aria-current'));
    if (id) byId.get(id).setAttribute('aria-current', 'true');
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  // Exposed so the state can be asserted directly in testing without having
  // to wait on a frame.
  return update;
}

/** Shows the fixed phone/book bar once the hero's actions are out of reach. */
export function initActionBar({ bar, hero }) {
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    ([entry]) => bar.setAttribute('data-shown', String(!entry.isIntersecting)),
    { threshold: 0 }
  );
  io.observe(hero);
}
