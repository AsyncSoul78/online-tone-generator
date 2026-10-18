// Writes a test tone as a 16-bit mono WAV file.
// Usage: node scripts/make-test-tone.js <frequency Hz> [seconds=5] [out.wav]
// Example: node scripts/make-test-tone.js 1000 10 tone-1khz.wav
const fs = require('fs');

const RATE = 44100;

function sineWav(freq, seconds, volume = 0.5) {
  const samples = Math.round(RATE * seconds);
  const fade = Math.min(Math.round(RATE * 0.01), samples >> 1); // 10 ms fade in/out, no clicks
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const env = Math.min(1, i / fade, (samples - 1 - i) / fade);
    const v = Math.sin(2 * Math.PI * freq * i / RATE) * volume * env;
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

if (require.main === module) {
  const freq = Number(process.argv[2]);
  const seconds = Number(process.argv[3] || 5);
  if (!(freq > 0 && freq < RATE / 2) || !(seconds > 0)) {
    console.error('usage: make-test-tone.js <frequency 1..22049 Hz> [seconds] [out.wav]');
    process.exit(1);
  }
  const out = process.argv[4] || `tone-${freq}hz.wav`;
  fs.writeFileSync(out, sineWav(freq, seconds));
  console.log(`${freq} Hz, ${seconds} s -> ${out}`);
}

module.exports = { sineWav, RATE };
