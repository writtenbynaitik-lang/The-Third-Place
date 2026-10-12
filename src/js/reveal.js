/**
 * Scroll reveal.
 *
 * The `.reveal` class is added HERE, at runtime, rather than in the HTML.
 * If JavaScript is disabled, fails to parse, or this module never runs, the
 * elements are simply visible — there is no state in which content is hidden
 * with no way to reveal it.
 */

const REVEAL_SELECTOR = '[data-reveal]';

export function initReveal() {
  const nodes = [...document.querySelectorAll(REVEAL_SELECTOR)];
  if (!nodes.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  nodes.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        // Stagger siblings that opt in, capped so a long list never crawls.
        const group = el.dataset.reveal;
        if (group && group !== 'true') {
          const i = Number(group) || 0;
          el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 60}ms`);
        }

        el.classList.add('is-in');
        io.unobserve(el); // one-shot: no work after the first reveal
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  nodes.forEach((el) => io.observe(el));

  // Anything already on screen at load should not wait for a scroll event.
  requestAnimationFrame(() => {
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  });
}
