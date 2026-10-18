// Builds note-frequencies.csv: every note from C0 to B8 in 12-tone equal temperament.
// Usage: node scripts/note-frequencies.js [out.csv]
const fs = require('fs');

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequency(midi, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

function table() {
  const rows = [];
  for (let octave = 0; octave <= 8; octave++) {
    NAMES.forEach((name, i) => {
      const midi = 12 * (octave + 1) + i;
      rows.push({ note: name + octave, octave, midi, hz440: frequency(midi, 440), hz432: frequency(midi, 432) });
    });
  }
  return rows;
}

function toCsv(rows) {
  const lines = ['note,octave,midi,frequency_hz,frequency_hz_a432'];
  for (const r of rows) lines.push(`${r.note},${r.octave},${r.midi},${r.hz440.toFixed(3)},${r.hz432.toFixed(3)}`);
  return lines.join('\n') + '\n';
}

if (require.main === module) {
  const out = process.argv[2] || 'note-frequencies.csv';
  const rows = table();
  fs.writeFileSync(out, toCsv(rows));
  console.log(`${rows.length} notes written to ${out}`);
}

module.exports = { frequency, table, toCsv };
