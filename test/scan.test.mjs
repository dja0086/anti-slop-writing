// Run with: npm test   (or: node --test "test/*.test.mjs")
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scan = fileURLToPath(new URL('../scan.mjs', import.meta.url));
const run = (text, mode = 'marketing', ...extra) => {
  const r = spawnSync(process.execPath, [scan, '-', '--mode', mode, '--json', ...extra], { input: text, encoding: 'utf8' });
  return { code: r.status, rules: JSON.parse(r.stdout).findings.map(f => `${f.severity}:${f.rule}`) };
};

test('marketing slop is banned', () => {
  const r = run('Unlock seamless growth with our all-in-one platform — get started →');
  assert.equal(r.code, 1);
  for (const id of ['BAN:hype-phrase', 'BAN:em-dash', 'BAN:arrow-glyph']) assert.ok(r.rules.includes(id), id);
  assert.ok(r.rules.includes('WARN:weak-cta'));
});

test('plain, specific copy passes', () => {
  const r = run('Query customers, transactions and employees in one grid, then export the rows on screen.');
  assert.equal(r.code, 0);
  assert.deepEqual(r.rules, []);
});

test('fiction cliches are banned in creative mode only', () => {
  const text = 'She let out a breath. The air was thick with smoke, a tapestry of noise.';
  assert.ok(run(text, 'creative').rules.includes('BAN:fiction-cliche'));
  assert.ok(!run(text, 'marketing').rules.includes('BAN:fiction-cliche'));
});

test('hedges and assistant openers are banned in every mode', () => {
  for (const mode of ['marketing', 'creative', 'docs']) {
    const r = run('Certainly! It is worth noting that this works.', mode);
    assert.ok(r.rules.includes('BAN:sycophant-opener') && r.rules.includes('BAN:hedge-stack'), mode);
  }
});

test('table placeholders and factual "the only" are not flagged', () => {
  const r = run('| 7 | Rename | — | — |\nThe vault holds the only copy.', 'marketing');
  assert.deepEqual(r.rules, []);
});

test('emoji are a WARN in docs and a BAN in marketing', () => {
  assert.ok(run('Status: ✅ done', 'docs').rules.includes('WARN:emoji-docs'));
  assert.ok(run('Ship faster \u{1F680}', 'marketing').rules.includes('BAN:emoji'));
});

test('code spans and fences are skipped', () => {
  const r = run('Run `unlock --seamless` now.\n```\nleverage robust synergy\n```\n', 'marketing');
  assert.deepEqual(r.rules, []);
});

test('--strict fails on WARN', () => {
  assert.equal(run('Learn more about the grid.', 'marketing').code, 0);
  assert.equal(run('Learn more about the grid.', 'marketing', '--strict').code, 1);
});
