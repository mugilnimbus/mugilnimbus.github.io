// Every line the site says out loud, how each is pronounced, and the key that finds its voice clip.
import { projects } from './projects.mjs';
import { hooks, order, detailSteps } from './hooks.mjs';
import { walkthroughs } from './walkthroughs.mjs';

export const greeting = "Hi, I'm Mugil.";
export const introLine = 'I build AI and software systems.';
export const introCaptions = ['Physics, AI and some creativity.', 'Each project starts with a problem you may have felt.', 'Ideas, made tangible.'];

const byId = Object.fromEntries(projects.map(project => [project.id, project]));
export const walkSteps = id => walkthroughs[id] ? walkthroughs[id].chapters.flatMap(chapter => chapter.steps) : detailSteps[id] ?? byId[id].steps;

// In the order a visitor meets them: the intro, then each episode followed by its detailed view.
export function narratedLines() {
  const lines = [greeting, introLine, ...introCaptions];
  for (const id of order) lines.push(hooks[id].question, hooks[id].see, hooks[id].act, byId[id].title, ...walkSteps(id));
  return [...new Set(lines)];
}

// Words the voice would otherwise misread. Kokoro accepts [word](/phonemes/) for an exact pronunciation.
const sayings = [
  [/\bMugil\b/g, '[Mugil](/mˈuɡɪl/)'], [/\bA2A\b/g, 'A to A'], [/\bsaturn_(\w+)/g, 'saturn $1'], [/\bOmniParser\b/g, 'Omni Parser'],
  [/\bpytest\b/g, 'pie test'], [/\bGGUF\b/g, 'G G U F'], [/\bFP16\b/g, 'F P 16'], [/\bvLLM\b/g, 'V L L M'], [/\bPII\b/g, 'P I I'],
  [/\bAutoML\b/g, 'Auto M L'], [/\bHUD\b/g, 'hud'], [/\bQwen\b/g, 'Kwen'], [/\bLM Studio\b/g, 'L M Studio'], [/—/g, ','],
];
export const spoken = text => sayings.reduce((said, [pattern, replacement]) => said.replace(pattern, replacement), text);

// A short, stable name for a line's clip (32-bit FNV-1a of the text as shown).
export function voiceKey(text) {
  let hash = 0x811c9dc5;
  for (const char of text) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return hash.toString(16).padStart(8, '0');
}
