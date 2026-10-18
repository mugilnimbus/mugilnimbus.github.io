// Narration clips made by the local voice model, and a quiet ambient pad made live with Web Audio.
import { voiceKey } from './narration.mjs';

let clips = null;
const voice = new Audio();
voice.preload = 'auto';

export async function loadVoice() {
  try {
    const response = await fetch(new URL('../assets/voice/manifest.json', import.meta.url));
    if (response.ok) clips = (await response.json()).lines;
  } catch { clips = null; }
  return Boolean(clips);
}
// Length of a line's clip in seconds, or 0 when there is none.
export const clipSeconds = text => clips?.[voiceKey(text)]?.seconds ?? 0;

// Start a line's clip `offset` seconds in; resolves false when the browser refuses to play sound yet.
export async function speak(text, offset = 0) {
  const clip = clips?.[voiceKey(text)];
  if (!clip || offset >= clip.seconds) { voice.pause(); return true; }
  const src = new URL(`../assets/voice/${clip.file}`, import.meta.url).href;
  if (voice.src !== src) voice.src = src;
  try { voice.currentTime = offset; } catch { /* not seekable until metadata loads */ }
  try { await voice.play(); duck(true); return true; } catch { return false; }
}
export function hush() { voice.pause(); duck(false); }
voice.addEventListener('ended', () => duck(false));
voice.addEventListener('pause', () => duck(false));

// Two soft chords that slowly trade places, filtered and far below the voice.
let context = null, master = null, filter = null, chordTimer = 0;
const chords = [[110, 164.81, 246.94, 261.63], [87.31, 130.81, 220, 329.63], [130.81, 196, 246.94, 329.63], [98, 146.83, 246.94, 293.66]];
const level = .045, ducked = .018;

export function startMusic() {
  if (!context) {
    context = new AudioContext();
    master = context.createGain(); master.gain.value = 0;
    filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = .3;
    const sweep = context.createOscillator(), depth = context.createGain();
    sweep.frequency.value = .05; depth.gain.value = 300; sweep.connect(depth).connect(filter.frequency); sweep.start();
    filter.connect(master).connect(context.destination);
  }
  context.resume();
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(voice.paused ? level : ducked, context.currentTime, 1.5);
  if (!chordTimer) { let index = 0; playChord(chords[index]); chordTimer = setInterval(() => playChord(chords[++index % chords.length]), 11000); }
}
export function stopMusic() {
  if (!context) return;
  master.gain.setTargetAtTime(0, context.currentTime, .6);
  clearInterval(chordTimer); chordTimer = 0;
  setTimeout(() => { if (!chordTimer) context.suspend(); }, 2500);
}
function playChord(notes) {
  const now = context.currentTime;
  for (const [i, frequency] of notes.entries()) {
    const tone = context.createOscillator(), gain = context.createGain();
    tone.type = i ? 'sine' : 'triangle'; tone.frequency.value = frequency; tone.detune.value = (i % 2 ? 1 : -1) * 4;
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.22 / notes.length, now + 4); gain.gain.setValueAtTime(.22 / notes.length, now + 9); gain.gain.linearRampToValueAtTime(0, now + 15);
    tone.connect(gain).connect(filter); tone.start(now); tone.stop(now + 15.2);
  }
}
function duck(speaking) {
  if (!context || !chordTimer) return;
  master.gain.setTargetAtTime(speaking ? ducked : level, context.currentTime, .4);
}
