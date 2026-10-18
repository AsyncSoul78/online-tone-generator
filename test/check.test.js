// Run: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { frequency, table, toCsv } = require('../scripts/note-frequencies');
const { sineWav, RATE } = require('../scripts/make-test-tone');

test('A4 is 440 Hz and an octave doubles the frequency', () => {
  assert.strictEqual(frequency(69), 440);
  assert.ok(Math.abs(frequency(81) - 880) < 1e-9);
  assert.ok(Math.abs(frequency(60) - 261.626) < 0.001); // middle C
});

test('table covers C0..B8', () => {
  const rows = table();
  assert.strictEqual(rows.length, 108);
  assert.strictEqual(rows[0].note, 'C0');
  assert.strictEqual(rows[rows.length - 1].note, 'B8');
});

test('published CSV matches the generator', () => {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'note-frequencies.csv'), 'utf8').replace(/\r/g, '');
  assert.strictEqual(csv, toCsv(table()));
});

test('WAV has the right length and frequency', () => {
  const wav = sineWav(1000, 1);
  assert.strictEqual(wav.toString('ascii', 0, 4), 'RIFF');
  assert.strictEqual(wav.length, 44 + RATE * 2);
  let crossings = 0;
  for (let i = 1; i < RATE; i++) {
    const a = wav.readInt16LE(44 + (i - 1) * 2), b = wav.readInt16LE(44 + i * 2);
    if (a < 0 && b >= 0) crossings++;
  }
  assert.ok(Math.abs(crossings - 1000) <= 1);
});
