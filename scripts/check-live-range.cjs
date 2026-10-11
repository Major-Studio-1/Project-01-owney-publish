const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const site = path.resolve(__dirname, '..');
const data = { events: JSON.parse(fs.readFileSync(path.join(site, 'events-source.json'), 'utf8')).events };
const allIds = data.events.map((_, i) => i);

class Event {
  constructor(type, options = {}) { this.type = type; Object.assign(this, options); }
}
class Target {
  constructor(id = '') {
    this.id = id;
    this.tagName = /range-(start|end)$/.test(id) ? 'INPUT' : 'DIV';
    this.listeners = new Map();
    this.dataset = {};
    this.children = [];
    this.value = '';
    this.captures = new Set();
    this.classes = new Set();
    this.classList = {
      toggle: (name, on) => {
        if (on === undefined) on = !this.classes.has(name);
        if (on) this.classes.add(name); else this.classes.delete(name);
        return on;
      },
      contains: name => this.classes.has(name),
    };
    const styles = new Map();
    this.style = { setProperty: (name, value) => styles.set(name, String(value)), getPropertyValue: name => styles.get(name) || '' };
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    for (const listener of this.listeners.get(event.type) || []) listener(event);
    return true;
  }
  setAttribute(name, value) { this[name] = String(value); }
  set innerHTML(html) {
    this.html = html;
    this.children = [...html.matchAll(/data-day="(-?\d+)"/g)].map(match => {
      const child = new Target(); child.dataset.day = match[1]; return child;
    });
  }
  get innerHTML() { return this.html || ''; }
  querySelectorAll() { return this.children; }
  closest(selector) { return selector === 'input' && this.tagName === 'INPUT' ? this : null; }
  getBoundingClientRect() { return { left: 100, width: 1000 }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}

const nodes = new Map(), document = new Target(), window = new Target(), frames = new Map();
let serial = 0, selected = 0, selectionSource = 'select', sourceIds = [...allIds], mapHighlighted = [], timerCalls = 0;
const selections = [], mapUpdates = [];
document.querySelector = selector => {
  if (!nodes.has(selector)) nodes.set(selector, new Target(selector));
  return nodes.get(selector);
};
const $ = document.querySelector;
$('#journey-scope').value = 'all';
window.owney = {
  data,
  get selected() { return selected; },
  get visibleIndices() { return sourceIds; },
  setHighlightedIndices(ids) { mapHighlighted = [...ids]; mapUpdates.push([...ids]); },
  selectEvent(id, force = false, source = 'select') {
    assert.ok(Number.isInteger(id) && id >= 0 && id < data.events.length);
    if (id === selected && !force && (source === 'hover' || selectionSource === source)) return;
    selected = id; selectionSource = source;
    selections.push({ id, source });
    window.dispatchEvent(new Event('owney:selection', { detail: { index: id, source } }));
  },
};
const context = {
  window, document, Event, CustomEvent: Event, Date, Set, Map, console,
  requestAnimationFrame: callback => { frames.set(++serial, callback); return serial; },
  cancelAnimationFrame: id => frames.delete(id),
  setTimeout: () => { timerCalls++; throw Error('Range controls must not schedule a playback timer.'); },
  clearTimeout: () => { timerCalls++; throw Error('Range controls must not manage playback timers.'); },
  setInterval: () => { timerCalls++; throw Error('Range controls must not schedule playback intervals.'); },
};
vm.createContext(context);
for (const filename of ['timeline-model.js', 'range-controls.js']) {
  vm.runInContext(fs.readFileSync(path.join(site, 'public', filename), 'utf8'), context, { filename });
}

// Mirror app.js scope changes: update the source, rebuild the range, then select.
$('#journey-scope').addEventListener('change', () => {
  const scope = $('#journey-scope').value;
  sourceIds = allIds.filter(id => scope === 'all' || (scope === 'highlights' ? data.events[id].highlight : data.events[id].date.startsWith(scope)));
  if(!sourceIds.includes(selected))selected=sourceIds[0]??null;
  window.dispatchEvent(new Event('owney:scope'));
  if(selected!==null)window.owney.selectEvent(selected,true,'scope');
});
const model = window.OWNEY_TIMELINE_MODEL, full = model.makeDomain(data.events, allIds);
const day = date => Math.floor(Date.parse(date) / model.dayMs);
const snapshot = () => ({ start: window.owneyRange.start, end: window.owneyRange.end, selected, members: [...window.owneyRange.members] });
const flushFrames = () => {
  let passes = 0;
  while (frames.size) {
    assert.ok(++passes < 5, 'Range updates must settle without a rendering loop.');
    const pending = [...frames]; frames.clear();
    for (const [, callback] of pending) callback();
  }
};
const dispatch = (selector, type, options = {}) => $(selector).dispatchEvent(new Event(type, options));
const input = (selector, value) => {
  const priorMapUpdates = mapUpdates.length;
  $(selector).value = String(value);
  dispatch(selector, 'input');
  assert.equal(window.owneyRange.editing, true);
  assert.equal(frames.size, 1, 'Input must schedule a live update before change.');
  flushFrames();
  assert.ok(mapUpdates.length > priorMapUpdates, 'The map must receive membership while dragging.');
  assert.deepEqual(mapHighlighted, [...window.owneyRange.members]);
};
const commitPreserves = selector => {
  const before = snapshot();
  dispatch(selector, 'change');
  assert.deepEqual(snapshot(), before, 'Releasing the handle must preserve live dates and selection.');
  assert.equal(window.owneyRange.editing, false);
  assert.equal(frames.size, 0);
};
const allDates = () => dispatch('#range-all', 'click');
const expectMembers = expected => {
  assert.deepEqual([...window.owneyRange.members], expected);
  assert.deepEqual(mapHighlighted, expected);
};

// Moving the start handle changes both membership and selected map tag before change.
const tiedDay = day('1892-04-09');
const initialEnd = window.owneyRange.end;
input('#range-start', tiedDay);
expectMembers([...model.members(full, tiedDay, initialEnd)]);
assert.equal(selected, 3);
assert.deepEqual(selections.at(-1), { id: 3, source: 'range' });
commitPreserves('#range-start');

// Moving the end handle likewise replaces a late selected tag before release.
allDates();
window.owney.selectEvent(allIds.at(-1));
input('#range-end', tiedDay);
expectMembers([...model.members(full, full.firstDay, tiedDay)]);
assert.equal(selected, 0);
assert.deepEqual(selections.at(-1), { id: 0, source: 'range' });
commitPreserves('#range-end');

// A period between real catalog dates clears every highlighted map tag.
allDates();
const gapDay = full.firstDay + 1;
assert.ok(full.days[1] > gapDay);
input('#range-end', gapDay);
input('#range-start', gapDay);
expectMembers([]);
assert.equal($('#range-count').textContent, '0 tags highlighted');
assert.ok($('#range-distribution').children.every(bar => !bar.classList.contains('in-range')));
commitPreserves('#range-start');

// Exact-day ranges retain all tied objects, and hover never moves the brush.
allDates();
input('#range-end', tiedDay);
input('#range-start', tiedDay);
expectMembers([3, 4]);
assert.ok([3, 4].includes(selected));
commitPreserves('#range-start');
const tiedBrush = { start: window.owneyRange.start, end: window.owneyRange.end };
window.owney.selectEvent(allIds.at(-1), false, 'hover');
assert.deepEqual({ start: window.owneyRange.start, end: window.owneyRange.end }, tiedBrush);
expectMembers([3, 4]);
window.owneyRange.refresh();
assert.deepEqual({ start: window.owneyRange.start, end: window.owneyRange.end }, tiedBrush);
expectMembers([3, 4]);

// Pointer brushing publishes membership and selection before pointerup.
allDates();
const track = $('#range-track'), bounds = track.getBoundingClientRect(), pointerId = 7;
const xAt = d => bounds.left + (d - full.firstDay) / (full.lastDay - full.firstDay) * bounds.width;
dispatch('#range-track', 'pointerdown', { button: 0, pointerId, clientX: xAt(tiedDay) });
flushFrames();
expectMembers([3, 4]);
assert.ok(window.owneyRange.members.includes(selected));
assert.equal(window.owneyRange.editing, true);
assert.equal(track.hasPointerCapture(pointerId), true);
const targetDay = day('1892-04-13'), beforeMoveUpdates = mapUpdates.length;
dispatch('#range-track', 'pointermove', { pointerId, clientX: xAt(targetDay) });
flushFrames();
assert.ok(mapUpdates.length > beforeMoveUpdates);
expectMembers([...model.members(full, tiedDay, targetDay)]);
assert.ok(window.owneyRange.members.includes(selected));
assert.equal(window.owneyRange.end, targetDay);
assert.equal(window.owneyRange.editing, true);
const midDrag = snapshot();
dispatch('#range-track', 'pointermove', { pointerId: 99, clientX: xAt(full.lastDay) });
assert.deepEqual(snapshot(), midDrag, 'A different pointer must not alter the active brush.');
dispatch('#range-track', 'pointerup', { pointerId });
assert.deepEqual(snapshot(), midDrag);
assert.equal(window.owneyRange.editing, false);
assert.equal(track.hasPointerCapture(pointerId), false);

// A source filter rebuilds the domain and handles, including a single-day year.
$('#journey-scope').value = '1894'; dispatch('#journey-scope', 'change');
const yearIds = allIds.filter(id => data.events[id].date.startsWith('1894'));
expectMembers(yearIds);
assert.ok(yearIds.includes(selected));
const yearDomain = model.makeDomain(data.events, yearIds);
assert.equal($('#range-start').min, yearDomain.firstDay);
assert.equal($('#range-end').max, yearDomain.lastDay);
$('#journey-scope').value = '1897'; dispatch('#journey-scope', 'change');
expectMembers([66]);
assert.equal(window.owneyRange.start, window.owneyRange.end);
assert.equal($('#range-start').disabled, true);
assert.equal($('#range-end').disabled, true);
assert.equal($('#range-track').style.getPropertyValue('--range-start'), '0.5');
$('#journey-scope').value = 'all'; dispatch('#journey-scope', 'change');
assert.equal($('#range-start').min, full.firstDay);
assert.equal($('#range-end').max, full.lastDay);
assert.equal($('#range-start').disabled, false);
assert.ok(window.owneyRange.members.includes(selected));
assert.equal(timerCalls, 0);
assert.equal(frames.size, 0);

// A shape/year combination with no objects must stay empty, never show all tags.
sourceIds=[];selected=null;
window.dispatchEvent(new Event('owney:scope'));
expectMembers([]);
assert.equal(window.owneyRange.start,null);assert.equal(window.owneyRange.end,null);
assert.equal($('#range-start').disabled,true);assert.equal($('#range-end').disabled,true);
assert.equal($('#range-all').disabled,true);assert.equal($('#range-track').hidden,true);
assert.equal($('#range-ticks').innerHTML,'');assert.equal($('#range-distribution').innerHTML,'');
assert.equal($('#range-dates').textContent,'No dated tags match these filters');
assert.equal($('#range-count').textContent,'0 tags highlighted');
assert.ok(!$('#range-dates').textContent.includes('1970'));
// Recover to a one-object shape and then the complete domain.
sourceIds=[3];selected=3;window.dispatchEvent(new Event('owney:scope'));
expectMembers([3]);assert.equal($('#range-start').disabled,true);assert.equal($('#range-track').hidden,false);
$('#journey-scope').value='all';dispatch('#journey-scope','change');
assert.equal($('#range-start').disabled,false);assert.equal($('#range-all').disabled,false);
assert.equal($('#range-start')['aria-valuemin'],String(full.firstDay));assert.equal($('#range-end')['aria-valuemax'],String(full.lastDay));
assert.equal(timerCalls,0);assert.equal(frames.size,0);

// Scan the active integration files for removed playback hooks and controls.
const obsoletePlayback = /\bplayback\b|\bplayButton\b|\brestartButton\b|\bplayTimer\b|\bplaybackPrefix\b|journey-play|journey-restart|owney:playback|setTrailActive|Play journey|Replay journey|Resume journey/i;
for (const filename of ['range-controls.js', 'timeline-model.js', 'app.js', 'experience.js', 'index.html', 'journey.css']) {
  const source = fs.readFileSync(path.join(site, 'public', filename), 'utf8');
  assert.equal(obsoletePlayback.test(source), false, `${filename} must contain no removed playback references.`);
}

console.log('Live range checks passed: both handles update membership and map selection before change; empty periods; tied dates; fixed hover brush; pointer updates before pointerup; stable commits; source rebuilds; no playback hooks or timers.');
