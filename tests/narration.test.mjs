import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { narratedLines, spoken, voiceKey } from '../src/narration.mjs';

test('every narrated line has its own clip key and a pronunciation the voice can read', () => {
  const lines = narratedLines();
  assert.equal(new Set(lines.map(voiceKey)).size, lines.length, 'no two lines share a clip');
  assert.equal(spoken("Hi, I'm Mugil."), "Hi, I'm [Mugil](/mˈuɡɪl/).");
  assert.equal(spoken('through A2A to saturn_query'), 'through A to A to saturn query');
});
test('the generated clips cover every narrated line', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/voice/manifest.json', import.meta.url), 'utf8'));
  for (const text of narratedLines()) {
    const clip = manifest.lines[voiceKey(text)];
    assert.ok(clip && clip.seconds > 0, `missing clip: ${text}`);
    assert.equal(clip.spoken, spoken(text), `stale clip: ${text}`);
  }
});
