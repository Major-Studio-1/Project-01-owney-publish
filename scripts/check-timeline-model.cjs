const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'public/timeline-model.js'), 'utf8'), context);
const { dayMs, makeDomain, clampRange, members, fraction, includeDay } = context.window.OWNEY_TIMELINE_MODEL;
const { events } = JSON.parse(fs.readFileSync(path.join(root, 'events-source.json'), 'utf8'));
const ids = events.map((_, i) => i);
const domain = makeDomain(events, ids);
const day = date => Math.floor(Date.parse(date) / dayMs);
const plain = value => JSON.parse(JSON.stringify(value));

assert.equal(dayMs, 86400000);
assert.equal(domain.ids.length, events.length);
assert.equal(domain.days.length, new Set(events.map(event => event.date)).size);
assert.ok(domain.days.every(Number.isInteger));
assert.deepEqual(plain(members(domain, domain.firstDay, domain.lastDay)), plain(domain.ids));

// An exact-date range must keep every object on that date.
const byDate = new Map();
events.forEach((event, id) => {
  if (!byDate.has(event.date)) byDate.set(event.date, []);
  byDate.get(event.date).push(id);
});
const duplicateDates = [...byDate].filter(([, dateIds]) => dateIds.length > 1);
assert.ok(duplicateDates.length > 0, 'The fixture must exercise duplicate dates.');
for (const [date, dateIds] of duplicateDates) {
  assert.deepEqual(plain(members(domain, day(date), day(date))), dateIds);
  assert.ok(dateIds.every(id => domain.positions[id] === domain.positions[dateIds[0]]));
}

// Both calendar boundaries are inclusive, including the final day's objects.
const boundaryStart = day('1892-04-09');
const boundaryEnd = day('1892-04-13');
const boundaryExpected = ids.filter(id => day(events[id].date) >= boundaryStart && day(events[id].date) <= boundaryEnd);
assert.deepEqual(plain(members(domain, boundaryStart, boundaryEnd)), boundaryExpected);
assert.ok(members(domain, boundaryStart, boundaryEnd).some(id => day(events[id].date) === boundaryStart));
assert.ok(members(domain, boundaryStart, boundaryEnd).some(id => day(events[id].date) === boundaryEnd));
assert.deepEqual(plain(members(domain, domain.lastDay, domain.lastDay)), ids.filter(id => day(events[id].date) === domain.lastDay));

// A real single-object year yields a centered position and usable handles.
const singleYearIds = ids.filter(id => events[id].date.startsWith('1897-'));
assert.equal(singleYearIds.length, 1, 'The 1897 fixture must contain one object.');
const singleYear = makeDomain(events, singleYearIds);
assert.equal(singleYear.firstDay, singleYear.lastDay);
assert.equal(singleYear.positions[singleYearIds[0]], 0.5);
assert.equal(fraction(singleYear.firstDay, singleYear.firstDay, singleYear.lastDay), 0.5);
assert.deepEqual(plain(clampRange(singleYear.firstDay - 100, singleYear.lastDay + 100, singleYear.firstDay, singleYear.lastDay)), { start: singleYear.firstDay, end: singleYear.lastDay });
assert.deepEqual(plain(members(singleYear, singleYear.firstDay, singleYear.lastDay)), singleYearIds);

// Calendar periods between objects legitimately contain no objects.
let gap;
for (let i = 1; i < domain.days.length; i++) {
  if (domain.days[i] - domain.days[i - 1] > 1) {
    gap = [domain.days[i - 1] + 1, domain.days[i] - 1];
    break;
  }
}
assert.ok(gap, 'The fixture must include a period between dated objects.');
assert.deepEqual(plain(members(domain, ...gap)), []);
assert.deepEqual(plain(members(domain, domain.lastDay + 1, domain.lastDay + 10)), []);
assert.deepEqual(plain(members(domain, domain.lastDay, domain.firstDay)), []);

// Crossing either handle holds the other handle in place, without inversion.
assert.deepEqual(plain(clampRange(18, 12, 10, 20, 'start')), { start: 12, end: 12 });
assert.deepEqual(plain(clampRange(18, 12, 10, 20, 'end')), { start: 18, end: 18 });
assert.deepEqual(plain(clampRange(18, 12, 10, 20)), { start: 12, end: 18 });
assert.deepEqual(plain(clampRange(1, 25, 10, 20)), { start: 10, end: 20 });
assert.deepEqual(plain(clampRange(NaN, NaN, 10, 20)), { start: 10, end: 20 });
assert.deepEqual(plain(clampRange(10.4, 19.6, 10, 20)), { start: 10, end: 20 });

// Subsets retain source IDs and sort by date, with no mutation of inputs.
const subsetIds = [ids.at(-1), 0, 0, -1, events.length];
const subsetBefore = [...subsetIds];
const subset = makeDomain(events, subsetIds);
assert.deepEqual(plain(subset.ids), [0, ids.at(-1)]);
assert.deepEqual(subsetIds, subsetBefore);
assert.equal(subset.positions[0], 0);
assert.equal(subset.positions[ids.at(-1)], 1);
const empty = makeDomain(events, []);
assert.deepEqual(plain(empty), { ids: [], days: [], firstDay: null, lastDay: null, positions: {}, dayById: {} });
assert.deepEqual(plain(members(empty, domain.firstDay, domain.lastDay)), []);
assert.deepEqual(plain(clampRange(1, 2, empty.firstDay, empty.lastDay)), { start: null, end: null });

// Selecting an outside object moves the range without changing its duration.
const initialStart = domain.firstDay;
const initialEnd = day('1892-12-31');
for (const id of ids) {
  const target = domain.dayById[id];
  const movedRange = includeDay(initialStart, initialEnd, target, domain.firstDay, domain.lastDay);
  assert.equal(movedRange.end - movedRange.start, initialEnd - initialStart);
  assert.ok(movedRange.start >= domain.firstDay && movedRange.end <= domain.lastDay);
  assert.ok(members(domain, movedRange.start, movedRange.end).includes(id));
  if (target >= initialStart && target <= initialEnd) assert.deepEqual(plain(movedRange), { start: initialStart, end: initialEnd });
}
assert.deepEqual(plain(includeDay(12, 16, 10, 10, 20)), { start: 10, end: 14 });
assert.deepEqual(plain(includeDay(12, 16, 20, 10, 20)), { start: 16, end: 20 });
assert.deepEqual(plain(includeDay(12, 12, 20, 10, 20)), { start: 20, end: 20 });
assert.deepEqual(plain(includeDay(12, 16, 25, 10, 20)), { start: 12, end: 16 }, 'A selection outside the current scope must wait for scope recovery.');
const repeatedDay = day(duplicateDates[0][0]);
const sameDayRange = includeDay(domain.firstDay, domain.firstDay, repeatedDay, domain.firstDay, domain.lastDay);
assert.deepEqual(plain(members(domain, sameDayRange.start, sameDayRange.end)), byDate.get(duplicateDates[0][0]));

console.log(`Timeline model checks passed: ${events.length} objects, duplicate dates, empty periods, crossed handles, and selection shifts preserving duration.`);
