/**
 * Opening-hours logic.
 *
 * Hours are a VERIFIED business fact (research/RESEARCH.md §3) and live here
 * as the single source of truth. The HTML already contains the full week in
 * static markup; this module only adds the live "open now / opens at" line and
 * marks today's row. If it throws or never runs, the static table stands.
 *
 * All comparisons are done in Asia/Kolkata regardless of the visitor's clock —
 * a visitor in London asking "are they open?" means open *there*.
 */

export const TZ = 'Asia/Kolkata';

/**
 * 0 = Sunday … 6 = Saturday. Minutes from midnight.
 * Source: the restaurant's own Google Business profile, read 12 Oct 2026 —
 * the most authoritative accessible source (the owner posts to it). Monday
 * both opens later and closes earlier than the rest of the week.
 */
export const HOURS = [
  { day: 0, open: 12 * 60, close: 23 * 60 + 30 }, // Sun
  { day: 1, open: 15 * 60, close: 23 * 60 },      // Mon — opens late, closes early
  { day: 2, open: 12 * 60, close: 23 * 60 + 30 },
  { day: 3, open: 12 * 60, close: 23 * 60 + 30 },
  { day: 4, open: 12 * 60, close: 23 * 60 + 30 },
  { day: 5, open: 12 * 60, close: 23 * 60 + 30 },
  { day: 6, open: 12 * 60, close: 23 * 60 + 30 },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Current weekday + minutes-since-midnight in Asia/Kolkata. */
export function nowInKolkata(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (t) => parts.find((p) => p.type === t)?.value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
  const hour = parseInt(get('hour'), 10) % 24;
  const minute = parseInt(get('minute'), 10);

  return { day: wd, minutes: hour * 60 + minute };
}

export function fmtTime(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 < 12 ? 'am' : 'pm';
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${suffix}`;
}

/** @returns {{open:boolean, label:string, today:number}} */
export function getStatus(date = new Date()) {
  const { day, minutes } = nowInKolkata(date);
  const today = HOURS[day];

  if (minutes >= today.open && minutes < today.close) {
    const left = today.close - minutes;
    const label = left <= 60
      ? `Open — last orders soon, until ${fmtTime(today.close)}`
      : `Open now until ${fmtTime(today.close)}`;
    return { open: true, label, today: day };
  }

  // Before opening today?
  if (minutes < today.open) {
    return { open: false, label: `Opens today at ${fmtTime(today.open)}`, today: day };
  }

  // Otherwise the next opening is tomorrow.
  const next = HOURS[(day + 1) % 7];
  return {
    open: false,
    label: `Opens ${DAY_NAMES[(day + 1) % 7]} at ${fmtTime(next.open)}`,
    today: day,
  };
}

export function initHours({ statusEl, labelEl, rows }) {
  const apply = () => {
    let s;
    try {
      s = getStatus();
    } catch (_) {
      return; // leave the static markup exactly as authored
    }

    if (statusEl && labelEl) {
      statusEl.setAttribute('data-open', String(s.open));
      labelEl.textContent = s.label;
    }

    if (rows) {
      rows.forEach((row) => {
        const d = Number(row.dataset.day);
        const isToday = d === s.today;
        row.setAttribute('data-today', String(isToday));
        const badge = row.querySelector('.hours__today');
        if (badge) badge.hidden = !isToday;
      });
    }
  };

  apply();
  // Re-check every minute so a page left open does not go stale.
  setInterval(apply, 60_000);
}
