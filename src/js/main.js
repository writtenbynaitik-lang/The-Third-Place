/**
 * Entry point.
 *
 * Order of business:
 *  1. Things that must work no matter what — nav, drawer, hours, menu.
 *  2. Progressive enhancement — reveals.
 *  3. Optional spectacle — the WebGL hero, dynamically imported, last, and
 *     only when the device, the user's motion preference and the browser all
 *     agree it is a good idea.
 *
 * Every step is independently try/caught: a failure in one must not take the
 * page down with it.
 */

import { initHeader, initDrawer, initScrollSpy, initActionBar } from './nav.js';
import { renderMenu } from './menu.js';
import { initHours } from './hours.js';
import { initReveal } from './reveal.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Run a step; log and continue if it throws. */
function step(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[third-place] ${name} failed:`, err);
  }
}

/* ── 1. Core ──────────────────────────────────────────────────────────────── */

step('header', () =>
  initHeader({ header: $('.header'), hero: $('.hero') })
);

step('drawer', () =>
  initDrawer({ toggle: $('.menu-toggle'), drawer: $('#site-drawer') })
);

// Kept on window so the active-section logic can be asserted directly in
// tests without depending on frame timing.
step('scrollspy', () => {
  window.__tpSyncSpy = initScrollSpy({
    links: $$('.nav__link'),
    sections: $$('main > section[id]'),
  });
});

step('actionbar', () =>
  initActionBar({ bar: $('.actionbar'), hero: $('.hero') })
);

step('hours', () =>
  initHours({
    statusEl: $('.hero__status'),
    labelEl: $('.hero__status-label'),
    rows: $$('.hours__row'),
  })
);

step('menu', () => {
  const host = $('#menu-panels');
  if (!host) return;
  // The no-JS markup inside #menu-panels is replaced wholesale by renderMenu.
  renderMenu({
    tablist: $('#menu-cats'),
    panels: host,
    status: $('#menu-status'),
  });
  $('.menu__tabs-wrap')?.removeAttribute('hidden');
});

/* ── 2. Enhancement ───────────────────────────────────────────────────────── */

step('reveal', initReveal);

/* ── 3. The hero slats ────────────────────────────────────────────────────── */

/**
 * @returns {string|null} null to run, otherwise the reason it was skipped.
 * Returning a reason rather than a boolean means a missing hero is always
 * explainable from the console instead of being a silent nothing.
 */
function slatsBlockedBecause() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return 'prefers-reduced-motion';
  // Respect an explicit data-saver signal.
  if (navigator.connection?.saveData) return 'save-data';
  // Very low-core devices get the photograph; the turn is not worth the frame budget.
  if ((navigator.hardwareConcurrency || 4) < 4) return 'low-core-count';
  if (!window.WebGLRenderingContext) return 'no-webgl-support';
  return null;
}

async function initSlats() {
  const canvas = $('.hero__canvas');
  const hero = $('.hero');
  const stillImg = $('.hero__still img');
  if (!canvas || !hero || !stillImg) return;

  const nightSrc = canvas.dataset.night;
  if (!nightSrc) return;

  // The day face is the still image itself. Wait for it rather than fetching
  // a second copy.
  try {
    if (!stillImg.complete) {
      await new Promise((res, rej) => {
        stillImg.addEventListener('load', res, { once: true });
        stillImg.addEventListener('error', rej, { once: true });
      });
    }
    await stillImg.decode?.();
  } catch (_) {
    canvas.remove();
    return;
  }

  import('./hero-slats.js')
    .then(({ createSlats }) => {
      const slats = createSlats(canvas, {
        dayImage: stillImg,
        nightSrc,
        // Fewer, wider slats on a phone: the gesture still reads, and the
        // mobile experience is deliberate rather than a shrunken desktop one.
        slats: window.matchMedia('(min-width: 840px)').matches ? 9 : 5,
        onReady: () => {
          canvas.setAttribute('data-ready', 'true');
          mountTurnControl(slats);
        },
        onFail: (why) => {
          canvas.removeAttribute('data-ready');
          canvas.remove();
          console.info('[third-place] hero slats unavailable —', why);
        },
      });

      if (!slats) {
        canvas.remove();
        return;
      }

      /* Scroll drives the turn: the room turns from day to night as the hero
         leaves. One shared rAF-throttled listener, passive, transform-only. */
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const h = hero.offsetHeight || 1;
          const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / h));
          slats.setTarget(p * 0.85);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      let rt;
      window.addEventListener(
        'resize',
        () => {
          clearTimeout(rt);
          rt = setTimeout(() => slats.resize(), 150);
        },
        { passive: true }
      );

      // Stop rendering when the hero is off screen or the tab is hidden.
      // Both conditions are tracked here so neither can clobber the other.
      let onScreen = true;
      const sync = () => slats.setVisible(onScreen && !document.hidden);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(
          ([e]) => {
            onScreen = e.isIntersecting;
            sync();
          },
          { threshold: 0 }
        ).observe(hero);
      }
      document.addEventListener('visibilitychange', sync);

      onScroll();
    })
    .catch((err) => {
      canvas.remove();
      console.info('[third-place] hero slats module failed —', err);
    });
}

/** The pause control is only created once there is something to pause. */
function mountTurnControl(slats) {
  const host = $('.hero__meta');
  if (!host || host.querySelector('.hero__turn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hero__turn';
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML =
    '<span class="hero__turn-icon" aria-hidden="true"></span><span class="hero__turn-text">Pause</span>';

  btn.addEventListener('click', () => {
    const next = !slats.paused;
    slats.setPaused(next);
    btn.setAttribute('aria-pressed', String(next));
    btn.querySelector('.hero__turn-text').textContent = next ? 'Play' : 'Pause';
  });

  // Label describes what it controls, not just the verb.
  btn.setAttribute('aria-label', 'Pause the moving hero image');
  host.appendChild(btn);
}

const slatsBlocked = slatsBlockedBecause();

if (slatsBlocked) {
  console.info(`[third-place] hero slats skipped — ${slatsBlocked}`);
  $('.hero__canvas')?.remove();
} else {
  // After first paint, so the static hero gets the LCP uncontested.
  const start = () => {
    initSlats().catch((err) => {
      console.error('[third-place] slats failed:', err);
      $('.hero__canvas')?.remove();
    });
  };

  if (document.readyState === 'complete') {
    setTimeout(start, 200);
  } else {
    window.addEventListener('load', () => setTimeout(start, 200), { once: true });
  }
}

/* ── Housekeeping ─────────────────────────────────────────────────────────── */

// Any image that fails keeps its LQIP backdrop rather than showing a broken
// icon. The wrapper already carries the placeholder; this just hides the
// broken <img> itself.
$$('img').forEach((img) => {
  img.addEventListener(
    'error',
    () => {
      img.style.visibility = 'hidden';
      img.closest('.fig__frame')?.setAttribute('data-failed', 'true');
    },
    { once: true }
  );
});

document.documentElement.classList.add('js-ready');
