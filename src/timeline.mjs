// When things happen in the intro, an episode and a detail walkthrough. Pure timing: no page access.
export const pace = .28; // seconds for each word, close to a relaxed reading speed
export const wordCount = text => text.trim().split(/\s+/).length;
const reading = text => wordCount(text) * pace;

export function introPlan(line, captions) {
  const lined = 3, strands = lined + reading(line) + 1.6;
  const burst = strands + 4.4 + reading(captions[0]) + 1.4;
  const close = burst + 2.6 + reading(captions[1]) + 1.6;
  return { named: .5, lined, beats: [strands, burst, close], end: close + 12 };
}
// An episode: the question holds the stage, then the object appears and two beats explain one idea.
export function episodePlan(hook, tagline, trailer = false) {
  const hold = trailer ? .5 : 1.6, rest = trailer ? 1.4 : 3;
  const dock = 1 + reading(hook.question) + hold, build = dock + .4;
  const see = build + (trailer ? 1.2 : 2);
  const act = see + reading(hook.see) + rest;
  const proof = act + reading(hook.act) + rest;
  return { title: .3, ask: 1, dock, build, beats: [see, act, proof], end: proof + reading(tagline) + (trailer ? 1.6 : 5) };
}
export function detailPlan(steps) {
  const beats = []; let at = 2.4;
  for (const step of steps) { beats.push(at); at += Math.max(4.2, reading(step) + 3); }
  return { build: .3, beats, end: at + 2 };
}
// Index of the latest beat reached, or -1 before the first.
export const beatAt = (plan, seconds) => plan.beats.findLastIndex(start => seconds >= start);
export const progressAt = (plan, seconds) => Math.max(0, Math.min(1, seconds / plan.end));
