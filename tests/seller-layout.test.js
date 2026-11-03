import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../src/a2a/${file}`, import.meta.url), 'utf8');

test('standalone seller uses the page shell without changing split shell or relay', () => {
  const stage = read('A2AStage.tsx');
  assert.match(stage, /<CommandCenterShell fullPage>/);
  assert.match(stage, /<CommandCenterShell>/);
  assert.match(stage, /<Relay side={side} \/>/);
  assert.match(stage, /!peer && <StandIn/);
  const shell = read('CommandCenterShell.tsx');
  assert.match(shell, /margin: fullPage \? 0/);
  assert.match(shell, /borderRadius: fullPage \? 0/);
  assert.doesNotMatch(shell, /Lights|#ff5f57/);
  assert.match(shell, /return fullPage \?/);
});

test('seller funnel measures a minimum-width plot inside a bounded keyboard-accessible scroller', () => {
  const funnel = read('command-center/CheckoutFunnelCard.tsx');
  assert.ok(funnel.includes('className="a2a-funnel-scroll mt-5" tabIndex={0} role="region" aria-label={t.title}'));
  assert.match(funnel, /ref={wrap} className="a2a-funnel-plot relative"/);
  const css = read('a2a.css');
  assert.match(css, /\.a2a-seller-page \.a2a-funnel-scroll \{\s*overflow-x: auto;\s*max-width: 100%;/);
  assert.match(css, /\.a2a-seller-page \.a2a-funnel-plot \{\s*min-width: 720px;/);
});

test('seller viewport and mobile overrides are scoped to standalone', () => {
  const css = read('a2a.css');
  assert.match(css, /\.a2a-seller-page \{[^}]*width: 100%;[^}]*height: 100dvh;/);
  assert.match(css, /\.a2a-seller-page \.a2a-white-layer \{\s*box-shadow: none;/);
  assert.match(css, /\.a2a-seller-page \.a2a-campaign-row \{\s*grid-template-columns: minmax\(0, 1fr\)/);
});
