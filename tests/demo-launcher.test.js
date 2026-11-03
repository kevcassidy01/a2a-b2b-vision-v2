import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';

const html = readFileSync(new URL('../public/demo/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function launch(href, clipboard = { writeText: async () => {} }, crypto = { randomUUID }) {
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', disabled: true, listeners: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      focus() { this.focused = true; }, select() { this.selected = true; },
    });
    return elements.get(id);
  } };
  runInNewContext(script, { document, window: { location: { href } }, navigator: { clipboard }, crypto, URL });
  return (id) => document.getElementById(id);
}

test('load creates matching UUID rooms and preserves root and Pages base paths', () => {
  for (const prefix of ['', '/a2a-b2b-vision-v2']) {
    const get = launch(`https://example.com${prefix}/demo/?room=ignored#ignored`);
    const buyer = new URL(get('buyer-link').value);
    const seller = new URL(get('seller-link').value);
    assert.equal(buyer.pathname, `${prefix}/buyer/`);
    assert.equal(seller.pathname, `${prefix}/seller/`);
    assert.equal(buyer.search, seller.search);
    assert.match(buyer.searchParams.get('room'), /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/);
    assert.equal(buyer.hash, '');
    for (const side of ['buyer', 'seller']) {
      assert.equal(get(`${side}-open`).href, get(`${side}-link`).value);
      assert.equal(get(`${side}-copy`).disabled, false);
    }
  }
});

test('explicit reset and a new page load each create a fresh pair', () => {
  const get = launch('https://example.com/demo/');
  const first = get('buyer-link').value;
  get('new-pair').listeners.click();
  assert.notEqual(get('buyer-link').value, first);
  assert.equal(new URL(get('buyer-link').value).search, new URL(get('seller-link').value).search);
  assert.notEqual(launch('https://example.com/demo/')('buyer-link').value, first);
});

test('copies each exact URL and announces success', async () => {
  const copied = [];
  const get = launch('https://example.com/demo/', { writeText: async (value) => copied.push(value) });
  for (const side of ['buyer', 'seller']) {
    await get(`${side}-copy`).listeners.click();
    assert.equal(copied.at(-1), get(`${side}-link`).value);
    assert.match(get('status').textContent, /link copied/);
  }
});

test('missing or rejected clipboard selects and focuses the link with manual instructions', async () => {
  for (const clipboard of [undefined, { writeText: async () => { throw new Error('denied'); } }]) {
    const get = launch('https://example.com/demo/', clipboard === undefined ? null : clipboard);
    await get('buyer-copy').listeners.click();
    assert.equal(get('buyer-link').focused, true);
    assert.equal(get('buyer-link').selected, true);
    assert.match(get('status').textContent, /Ctrl\+C \(Command\+C on Mac\)/);
  }
});

test('a pending clipboard operation cannot overwrite reset feedback or select a new link', async () => {
  let reject;
  const get = launch('https://example.com/demo/', { writeText: () => new Promise((_, fail) => { reject = fail; }) });
  const pending = get('buyer-copy').listeners.click();
  get('new-pair').listeners.click();
  reject(new Error('denied'));
  await pending;
  assert.match(get('status').textContent, /New demo pair ready/);
  assert.equal(get('buyer-link').selected, undefined);
});

test('UUID failure reports recovery instructions without enabling empty links', () => {
  const get = launch('http://example.com/demo/', null, { randomUUID() { throw new Error('unavailable'); } });
  assert.match(get('status').textContent, /HTTPS or localhost/);
  assert.equal(get('buyer-open').href, undefined);
  assert.equal(get('buyer-copy').disabled, true);
});

test('markup has labeled copy fields, live feedback, and safe new-tab links', () => {
  for (const side of ['buyer', 'seller']) {
    assert.ok(html.includes(`for="${side}-link"`));
    assert.match(html, new RegExp(`id="${side}-open" target="_blank" rel="noopener noreferrer"`));
  }
  assert.ok(html.includes('role="status" aria-live="polite"'));
});
