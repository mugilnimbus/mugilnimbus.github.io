// When things happen in the intro, an episode and a detail walkthrough. Pure timing: no page access.
export const pace = .28; // seconds for each word, close to a relaxed reading speed
export const wordCount = text => text.trim().split(/\s+/).length;
// How long a line needs on screen; with sound on the player passes a version that waits for each spoken clip.
export const reading = text => wordCount(text) * pace;
// Pauses between lines are scaled by `gap`: 1 for silent reading, shorter when a voice carries the pace.

export function introPlan(line, captions, read = reading, greeting = '', gap = 1) {
  const lined = Math.max(3 * gap, .5 + (greeting ? read(greeting) : 0) + .4), strands = lined + read(line) + 1.6 * gap;
  // The sum is written while the first caption is read; the stars open while the second is read.
  const burst = strands + Math.max(4.4, read(captions[0])) + 1.4 * gap;
  const close = burst + Math.max(2.6, read(captions[1])) + 1.6 * gap;
  return { named: .5, lined, beats: [strands, burst, close], end: close + read(captions[2]) + 8 };
}
// An episode: the question holds the stage, then the object appears and two beats explain one idea.
export function episodePlan(hook, tagline, trailer = false, read = reading, gap = 1) {
  const hold = (trailer ? .5 : 1.6) * gap, rest = (trailer ? 1.4 : 3) * gap;
  const dock = 1 + read(hook.question) + hold, build = dock + .4;
  const see = build + (trailer ? 1.2 : 2) * Math.max(gap, .6);
  const act = see + read(hook.see) + rest;
  const proof = act + read(hook.act) + rest;
  return { title: .3, ask: 1, dock, build, beats: [see, act, proof], end: proof + read(tagline) + (trailer ? 1.6 : 5) * gap };
}
export function detailPlan(steps, read = reading, gap = 1) {
  const beats = []; let at = 2.4 * Math.max(gap, .6);
  for (const step of steps) { beats.push(at); at += Math.max(4.2 * Math.max(gap, .7), read(step) + 3 * gap); }
  return { build: .3, beats, end: at + 2 };
}
// Index of the latest beat reached, or -1 before the first.
export const beatAt = (plan, seconds) => plan.beats.findLastIndex(start => seconds >= start);
export const progressAt = (plan, seconds) => Math.max(0, Math.min(1, seconds / plan.end));
