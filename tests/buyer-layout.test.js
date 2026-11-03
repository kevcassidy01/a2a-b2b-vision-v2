import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../src/a2a/${file}`, import.meta.url), 'utf8');

test('standalone buyer bypasses device chrome while split and relay retain their paths', () => {
  const stage = read('A2AStage.tsx');
  assert.match(stage, /side === "buyer" \? "a2a-buyer-page"/);
  assert.match(stage, /<PartnerSite fullPage \/>/);
  assert.match(stage, /<IPhoneFrame>\s*<PartnerSite \/>\s*<\/IPhoneFrame>/);
  assert.match(stage, /<Relay side={side} \/>/);
  assert.match(stage, /!peer && <StandIn/);
  const safari = read('Safari.tsx');
  const browser = safari.slice(safari.indexOf('if (fullPage)'), safari.indexOf('   return (', safari.indexOf('if (fullPage)')));
  assert.match(browser, /<main key={pageKey}/);
  assert.match(browser, /inert={compact}/);
  assert.match(browser, /{overlay}/);
  assert.doesNotMatch(browser, /a2a-safari-address|GlassButton/);
});

test('buyer responsive rules are scoped and bound desktop grids and overlays', () => {
  const css = read('storefront/storefront.css').split('\n.sf-page {')[0];
  assert.match(css, /height: 100vh;\s*height: 100dvh;/);
  assert.match(css, /@media \(min-width: 768px\)/);
  assert.match(css, /repeat\(auto-fit, minmax\(220px, 1fr\)\)/);
  assert.match(css, /width: min\(600px, calc\(100% - 48px\)\)/);
  assert.match(css, /safe-area-inset-bottom/);
  const selectors = css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[{}])\s*([^{}]+)\{/g);
  for (const [, selector] of selectors) {
    if (!selector.startsWith('@media')) assert.ok(selector.includes('.a2a-buyer-page'), selector);
  }
});

test('standalone overlays handle Escape, focus cycling and restoration', () => {
  const site = read('storefront/PartnerSite.tsx');
  assert.match(site, /if \(!fullPage \|\|/);
  assert.match(site, /e.key === "Escape"/);
  assert.match(site, /e.key === "Tab"/);
  assert.match(site, /previous\?\.isConnected && !previous.closest\('\[inert\]'\)/);
  assert.match(site, /fallback && !fallback.closest\('\[inert\]'\)/);
  assert.match(site, /header button\[aria-expanded\], .a2a-buyer-page .sf-fab/);
  assert.match(read('storefront/Menu.tsx'), /aria-label={n.search}/);
});

test('standalone login can return home without signing in; phone keeps Safari Back', () => {
  assert.match(read('storefront/PartnerSite.tsx'), /onBack={fullPage \? \(\) => go\("home"\) : undefined}/);
  const login = read('storefront/Login.tsx');
  assert.match(login, /{onBack && \(/);
  assert.match(login, /type="button" onClick={onBack}/);
  assert.match(login, /Back to home/);
});
