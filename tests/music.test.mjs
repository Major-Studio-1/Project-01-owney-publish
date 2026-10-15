import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../public/music.js', import.meta.url), 'utf8');

function harness() {
  const calls = [], listeners = {}, scripts = [];
  const control = () => ({
    hidden: false, textContent: '', listeners: {}, attributes: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus() { this.focused = true; }
  });
  const nodes = Object.fromEntries(
    ['.music-toggle', '.music-panel', '.music-status', '.music-close'].map(name => [name, control()])
  );
  nodes['.music-panel'].hidden = true;
  const dock = {querySelector: name => nodes[name], addEventListener: (name, fn) => listeners[name] = fn};
  const document = {
    hidden: false, querySelector: () => dock, createElement: () => ({}),
    head: {append: script => scripts.push(script)},
    addEventListener: (name, fn) => listeners[name] = fn
  };
  let options, timeout;
  const player = {
    setVolume: value => calls.push(['volume', value]),
    playVideo: () => calls.push('play'), pauseVideo: () => calls.push('pause'),
    getIframe: () => ({})
  };
  const window = {};
  vm.runInNewContext(source, {
    document, window, location: {origin: 'https://example.test'},
    setTimeout: fn => { timeout = fn; return 1; }, clearTimeout() {}
  });
  return {
    nodes, calls, scripts, listeners, document,
    click() { nodes['.music-toggle'].listeners.click(); },
    api() {
      window.YT = {Player: function(id, opts) { options = opts; return player; }};
      window.onYouTubeIframeAPIReady();
      return options;
    },
    ready() { options.events.onReady({target: player}); },
    blocked() { options.events.onAutoplayBlocked(); },
    state(data) { options.events.onStateChange({data}); },
    expire() { timeout(); }
  };
}

test('player loads only after a click, uses minimum dimensions, and starts quietly', () => {
  const h = harness();
  assert.equal(h.scripts.length, 0);
  assert.equal(h.nodes['.music-panel'].hidden, true);
  h.click();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.nodes['.music-panel'].hidden, false);
  assert.equal(h.nodes['.music-toggle'].hidden, true);
  const config = h.api();
  assert.equal(config.width, 200);
  assert.equal(config.height, 200);
  h.ready();
  assert.deepEqual(h.calls, [['volume', 12], 'play']);
  h.blocked();
  assert.equal(h.nodes['.music-panel'].hidden, false);
  assert.match(h.nodes['.music-status'].textContent, /Press Play/);
});

test('close and Escape stop playback, restore the launcher, and reuse the player', () => {
  const h = harness();
  h.click(); h.api(); h.ready();
  h.nodes['.music-close'].listeners.click();
  assert.equal(h.calls.at(-1), 'pause');
  assert.equal(h.nodes['.music-panel'].hidden, true);
  assert.equal(h.nodes['.music-toggle'].hidden, false);
  assert.equal(h.nodes['.music-toggle'].focused, true);
  h.click();
  assert.equal(h.calls.at(-1), 'play');
  assert.equal(h.scripts.length, 1);
  h.listeners.keydown({key: 'Escape'});
  assert.equal(h.calls.at(-1), 'pause');
  assert.equal(h.nodes['.music-panel'].hidden, true);
});

test('closing while loading prevents late readiness and state events from starting music', () => {
  const h = harness();
  h.click();
  h.nodes['.music-close'].listeners.click();
  h.api(); h.ready(); h.state(1);
  assert.equal(h.calls.includes('play'), false);
  assert.equal(h.calls.at(-1), 'pause');
  assert.equal(h.nodes['.music-panel'].hidden, true);
});

test('hiding the page stops playback, including during player setup', () => {
  for (const readyFirst of [true, false]) {
    const h = harness(); h.click(); h.api();
    if (readyFirst) h.ready();
    h.document.hidden = true;
    h.listeners.visibilitychange();
    if (!readyFirst) h.ready();
    assert.equal(h.calls.at(-1), 'pause');
    assert.equal(h.nodes['.music-panel'].hidden, true);
    h.document.hidden = false;
    h.listeners.visibilitychange();
    assert.equal(h.calls.at(-1), 'pause');
  }
});

test('failed or timed-out loading keeps the close control and YouTube fallback available', () => {
  for (const timeout of [false, true]) {
    const h = harness(); h.click();
    if (timeout) h.expire(); else h.scripts[0].onerror();
    assert.equal(h.nodes['.music-panel'].hidden, false);
    assert.match(h.nodes['.music-status'].textContent, /YouTube link/);
    h.nodes['.music-close'].listeners.click();
    assert.equal(h.nodes['.music-toggle'].hidden, false);
    h.click();
    assert.equal(h.scripts.length, 1);
    assert.equal(h.nodes['.music-panel'].hidden, false);
  }
});
