(() => {
  'use strict';

  const dayMs = 24 * 60 * 60 * 1000;

  function fraction(day, lo, hi) {
    if (!Number.isFinite(day) || !Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) return 0.5;
    return Math.max(0, Math.min(1, (day - lo) / (hi - lo)));
  }

  // IDs stay tied to the source events; unique days describe the calendar domain.
  function makeDomain(events, indices = events.map((_, i) => i)) {
    const seen = new Set();
    const entries = [];
    for (const id of indices) {
      if (!Number.isInteger(id) || id < 0 || id >= events.length || seen.has(id)) continue;
      seen.add(id);
      const timestamp = Date.parse(events[id].date);
      if (Number.isFinite(timestamp)) entries.push({ id, day: Math.floor(timestamp / dayMs) });
    }
    entries.sort((a, b) => a.day - b.day || a.id - b.id);
    const ids = entries.map(entry => entry.id);
    const days = [...new Set(entries.map(entry => entry.day))];
    const firstDay = days.length ? days[0] : null;
    const lastDay = days.length ? days[days.length - 1] : null;
    const dayById = Object.fromEntries(entries.map(entry => [entry.id, entry.day]));
    const positions = Object.fromEntries(entries.map(entry => [entry.id, fraction(entry.day, firstDay, lastDay)]));
    return { ids, days, firstDay, lastDay, positions, dayById };
  }

  function clampRange(start, end, lo, hi, moved = 'both') {
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) return { start: null, end: null };
    const clampDay = (day, fallback) => Math.max(lo, Math.min(hi, Number.isFinite(day) ? Math.round(day) : fallback));
    start = clampDay(start, lo);
    end = clampDay(end, hi);
    if (start > end) {
      if (moved === 'start') start = end;
      else if (moved === 'end') end = start;
      else [start, end] = [end, start];
    }
    return { start, end };
  }

  function members(domain, start, end) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return [];
    return domain.ids.filter(id => domain.dayById[id] >= start && domain.dayById[id] <= end);
  }

  // Move a window only as far as needed to include an explicitly selected day.
  // Its duration stays unchanged, and a same-day window stays a same-day window.
  function includeDay(start, end, day, lo, hi) {
    const range = clampRange(start, end, lo, hi);
    if (!Number.isFinite(day) || !Number.isFinite(range.start) || day < lo || day > hi) return range;
    day = Math.round(day);
    const shift = day < range.start ? day - range.start : day > range.end ? day - range.end : 0;
    return { start: range.start + shift, end: range.end + shift };
  }

  function initialRange(domain) {
    return clampRange(Date.UTC(1896,4,1)/dayMs,Date.UTC(1896,11,31)/dayMs,domain.firstDay,domain.lastDay);
  }
  window.OWNEY_TIMELINE_MODEL = Object.freeze({ dayMs, makeDomain, clampRange, members, fraction, includeDay, initialRange });
})();
