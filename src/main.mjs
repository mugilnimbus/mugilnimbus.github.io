import { projects } from './projects.mjs';
import { hooks, groups, order, featured } from './hooks.mjs';
import { hookScene, detailScene } from './scenes.mjs';
import { walkthroughs, chapterHeader } from './walkthroughs.mjs';
import { introPlan, episodePlan, detailPlan, beatAt, progressAt, reading as readingTime, wordCount } from './timeline.mjs';
import { greeting, introLine, introCaptions, walkSteps } from './narration.mjs';
import { loadVoice, clipSeconds, speak, hush, startMusic, stopMusic } from './sound.mjs';

const byId = Object.fromEntries(projects.map(project => [project.id, project]));
const $ = selector => document.querySelector(selector);
const frame = $('#frame'), object = $('#object'), notes = $('#notes'), line = $('#line'), play = $('#play');
const sheet = $('#sheet'), about = $('#about'), reading = $('#read'), detailButton = $('#detail');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const states = ['named', 'lined', 'strands', 'burst', 'close', 'titled', 'asking', 'docked', 'built', 'see', 'act', 'proof'];
let view = 'intro', current = order[0], plan = null, elapsed = 0, shown = -2, playing = !still.matches, trailer = -1, last = performance.now();
let chapterShown = -1, focus = null;
// Sound is on unless the visitor muted it, which is remembered; each view lists the lines it speaks and when (its cues).
const soundButton = $('#sound');
let soundOn = false, cues = [], cueShown = -1, waiting = false;
try { soundOn = localStorage.getItem('sound') !== 'off'; } catch { soundOn = true; }
// With sound on, a line lasts as long as its clip, and never less than its reading time.
const timing = text => soundOn ? Math.max(readingTime(text), clipSeconds(text) + .25) : readingTime(text);
// A voice carries the pace, so the pauses between spoken lines are shorter.
const gap = () => soundOn && !still.matches ? .35 : 1;
// Words appear at the pace of the voice reading them.
function paced(element, text) {
  const seconds = soundOn && text ? clipSeconds(text) : 0;
  element.style.setProperty('--step', seconds ? `${Math.min(.45, Math.max(.16, seconds / wordCount(text))).toFixed(3)}s` : '');
}

// Words arrive one at a time, at reading pace; the whole sentence stays available to assistive technology.
function spans(text) {
  return text.split(' ').flatMap((word, i) => { const span = document.createElement('span'); span.textContent = word; span.style.setProperty('--w', i); return [span, ' ']; });
}
function say(text, big = false) {
  line.classList.add('out');
  setTimeout(() => { line.classList.toggle('big', big); paced(line, text); line.replaceChildren(...(text ? spans(text) : [])); if (text) line.classList.remove('out'); }, still.matches ? 0 : 320);
}
function wrap(text) {
  if (text.length < 20) return [text];
  const middle = text.length / 2, cut = [...text].reduce((best, char, i) => char === ' ' && Math.abs(i - middle) < Math.abs(best - middle) ? i : best, 0);
  return [text.slice(0, cut), text.slice(cut + 1)];
}
function note(text, index) {
  const left = index === 0, x = left ? 330 : 876, lines = wrap(text), y = 250 - (lines.length - 1) * 17 - (left ? 0 : 54);
  const arrow = left ? 'M342 248 C 362 236, 376 252, 394 244 M384 236 L395 244 L386 253' : 'M866 204 C 846 192, 826 216, 806 214 M816 205 L805 214 L816 224';
  return `<g class="note n${index}">${lines.map((part, i) => `<text class="hand" style="--l:${i}" x="${x}" y="${y + i * 34}" text-anchor="${left ? 'end' : 'start'}">${part}</text>`).join('')}<path pathLength="1" style="--l:${lines.length}" d="${arrow}"/></g>`;
}
function draw(markup, noteMarkup = '') {
  object.innerHTML = markup; notes.innerHTML = noteMarkup;
  object.querySelectorAll('.d0,.d1,.d2,.trail').forEach(part => part.setAttribute('pathLength', 1));
}
// On a narrow screen the drawing is cropped to the object, so it stays large enough to read.
function fit() {
  const narrow = innerWidth < 900, walk = view === 'detail' && plan?.walk;
  $('#stage').setAttribute('viewBox', !narrow ? '0 0 1200 600' : view === 'intro' ? '160 70 880 480' : walk ? '300 20 600 560' : view === 'detail' ? '250 30 700 540' : '380 120 440 350');
  // A walkthrough is wider than a phone, so on narrow screens it pans sideways to the part the current step is about.
  const pan = object.querySelector('.pan');
  if (pan) pan.style.transform = narrow && focus ? `translate(${600 - focus[0]}px, 0)` : '';
}
addEventListener('resize', fit);
function reset(next) {
  view = next; elapsed = 0; shown = -2; chapterShown = -1; focus = null; cueShown = -1; hush(); frame.dataset.view = next; fit();
  frame.classList.remove(...states); say('');
}

// The intro: a handwritten sum whose answer is one point, which opens into four constellations of projects.
const sky = [[[400, 160], [476, 222], [392, 276]], [[716, 140], [800, 196], [872, 150], [846, 262], [762, 284]], [[764, 392], [846, 432], [906, 372], [824, 512], [722, 484]], [[384, 396], [466, 446], [402, 516], [524, 500]]];
function introScene() {
  const constellations = groups.map((group, g) => {
    const points = sky[g].slice(0, group.ids.length), label = [[-8, -26, 'end'], [14, -24, 'start'], [18, 40, 'start'], [-10, 46, 'end']][g];
    return `<g class="constellation" style="--g:${g}"><path class="sight" pathLength="1" d="M${points.map(point => point.join(' ')).join('L')}"/>
      ${group.ids.map((id, i) => `<a href="#${id}" class="star" style="--tx:${points[i][0] - 600}px;--ty:${points[i][1] - 300}px;--k:${g * 4 + i}" aria-label="${byId[id].name}"><circle cx="600" cy="300" r="15" class="hit"/><circle cx="600" cy="300" r="6"/><text class="hand label" x="600" y="276" text-anchor="middle">${byId[id].name}</text></a>`).join('')}
      <text class="hand group" x="${points[0][0] + label[0]}" y="${points[0][1] + label[1]}" text-anchor="${label[2]}">${group.name.toLowerCase()}</text></g>`;
  }).join('');
  // A sum written by hand: physics + AI, with "some creativity" squeezed in above, equals the work that follows.
  return `<g class="equation"><text class="hand sum" x="524" y="322" text-anchor="end">physics + AI</text>
    <path class="caret" pathLength="1" d="M352 268l13-24 13 24"/><text class="hand extra" x="365" y="222" text-anchor="middle" transform="rotate(-5 365 222)">+ some creativity</text>
    <text class="hand sum equals" x="548" y="322">=</text></g>
    <circle class="glow" cx="600" cy="300" r="20"/>${constellations}<circle class="point" cx="600" cy="300" r="9"/>
    <g class="pick"><text class="hand" x="1000" y="322">${projects.length} projects.</text><text class="hand" x="1000" y="356">pick any star</text><path pathLength="1" d="M990 338 C 950 336, 900 318, 868 284 M870 303 L866 283 L884 292"/></g>`;
}
function showIntro() {
  reset('intro'); trailer = -1; draw(introScene());
  plan = introPlan(introLine, introCaptions, timing, greeting, gap()); paced($('#hello-line'), introLine); $('#hello-line').replaceChildren(...spans(introLine));
  cues = [[plan.named, greeting], [plan.lined, introLine], ...introCaptions.map((caption, i) => [plan.beats[i], caption])];
  if (still.matches) elapsed = plan.end - 1;
  render();
}
function showEpisode(id, asTrailer = false) {
  const project = byId[id], hook = hooks[id], number = order.indexOf(id) + 1, group = groups.find(entry => entry.ids.includes(id));
  reset('episode'); current = id; if (!asTrailer) trailer = -1;
  draw(hookScene(hook.scene), hook.notes.map(note).join(''));
  paced($('#ask'), hook.question); $('#ask').replaceChildren(...spans(hook.question));
  $('#title span').textContent = project.name;
  $('#tag').textContent = `${asTrailer ? 'Trailer' : 'Episode'} ${String(number).padStart(2, '0')} / ${order.length}  ·  ${group.name}`;
  $('#story-link').href = `#story-${id}`;
  const source = $('#source-link'); source.hidden = !project.repository; if (project.repository) source.href = project.repository;
  detailButton.textContent = 'Detailed view';
  document.querySelectorAll('[data-episode]').forEach(link => link.toggleAttribute('aria-current', link.dataset.episode === id));
  plan = episodePlan(hook, project.title, asTrailer, timing, gap());
  cues = [[plan.ask, hook.question], [plan.beats[0], hook.see], [plan.beats[1], hook.act], [plan.beats[2], project.title]];
  if (still.matches) elapsed = plan.end - .1;
  if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
  document.title = `${project.name} — Mugil`;
  render();
}
function showDetail(id) {
  const project = byId[id], walk = walkthroughs[id], steps = walkSteps(id);
  reset('detail'); trailer = -1; frame.classList.add('titled', 'docked');
  if (!walk) draw(detailScene(project.nodes.slice(0, steps.length)));
  detailButton.textContent = 'Simple view';
  plan = { ...detailPlan(steps, timing, gap()), steps, walk };
  cues = steps.map((step, i) => [plan.beats[i], step]);
  if (still.matches) elapsed = plan.end - .1;
  render();
}

// Everything on screen follows from the elapsed time, so playback can pause, replay or jump cleanly.
function render() {
  const t = elapsed, beat = plan ? beatAt(plan, t) : -1;
  if (view === 'intro') {
    frame.classList.toggle('named', t >= plan.named); frame.classList.toggle('lined', t >= plan.lined);
    ['strands', 'burst', 'close'].forEach((name, i) => frame.classList.toggle(name, i <= beat));
    if (beat !== shown) { shown = beat; say(introCaptions[beat] ?? '', beat === 2); }
  } else if (view === 'episode') {
    const hook = hooks[current];
    frame.classList.toggle('titled', t >= plan.title); frame.classList.toggle('asking', t >= plan.ask && t < plan.dock);
    frame.classList.toggle('docked', t >= plan.dock); frame.classList.toggle('built', t >= plan.build);
    ['see', 'act', 'proof'].forEach((name, i) => frame.classList.toggle(name, i <= beat));
    if (beat !== shown) { shown = beat; say([hook.see, hook.act, byId[current].title][beat] ?? '', beat === 2); }
  } else if (plan.walk) {
    frame.classList.toggle('built', t >= plan.build);
    if (beat !== shown) { shown = beat; walkTo(beat); say(plan.steps[beat] ?? ''); }
  } else {
    frame.classList.toggle('built', t >= plan.build);
    if (beat !== shown) {
      shown = beat;
      object.querySelectorAll('.stop').forEach((stop, i) => { stop.classList.toggle('on', i === beat); stop.classList.toggle('past', i < beat); });
      object.querySelector('.count').textContent = beat < 0 ? '' : `${beat + 1} / ${plan.steps.length}`;
      say(plan.steps[beat] ?? '');
    }
  }
  frame.style.setProperty('--done', plan ? progressAt(plan, t) : 0);
  if (soundOn && playing && !still.matches) voiceCue(t);
}
// Speak the line whose cue was passed last, starting as far into its clip as the clock is.
function voiceCue(t) {
  const index = cues.findLastIndex(([at]) => t >= at);
  if (index === cueShown) return;
  cueShown = index;
  if (index < 0) { hush(); return; }
  const [at, text] = cues[index];
  speak(text, t - at).then(played => { if (!played && soundOn) { waiting = true; showSound(); } });
}
// Show one step of a walkthrough: draw its chapter if it changed, then light the parts that step is about.
function walkTo(beat) {
  let chapter = 0, local = beat;
  while (chapter < plan.walk.chapters.length - 1 && local >= plan.walk.chapters[chapter].steps.length) local -= plan.walk.chapters[chapter++].steps.length;
  const shownChapter = plan.walk.chapters[chapter];
  if (chapter !== chapterShown) {
    chapterShown = chapter;
    draw(`<g class="walk"><g class="pan">${shownChapter.markup}</g>${chapterHeader(shownChapter)}</g>`);
    object.querySelectorAll('.ln').forEach(part => part.setAttribute('pathLength', 1));
  }
  const step = String(local);
  object.querySelectorAll('[data-at]').forEach(part => {
    const at = Number(part.dataset.at), now = at === local || (part.dataset.lit ?? '').split(' ').includes(step);
    part.classList.toggle('shown', at <= local); part.classList.toggle('now', now); part.classList.toggle('past', at < local && !now);
  });
  object.querySelectorAll('[data-flow]').forEach(wire => wire.classList.toggle('flowing', wire.dataset.flow.split(' ').includes(step)));
  object.querySelector('.tally').textContent = local < 0 ? '' : `${local + 1} / ${shownChapter.steps.length}`;
  focus = shownChapter.focus[Math.max(local, 0)]; fit();
}
function finished() {
  // A visitor who has not picked anything by the end of the intro is taken into the trailer.
  if (view === 'intro') { startTrailer(); return; }
  if (view === 'detail') { elapsed = plan.end; setPlaying(false); return; }
  if (trailer >= 0) {
    trailer++;
    if (trailer < featured.length) showEpisode(featured[trailer], true);
    else { trailer = -1; setPlaying(false); toggle(sheet, true); }
    return;
  }
  step(1);
}
function tick(now) {
  if (playing && plan && !document.hidden && !still.matches) {
    elapsed += Math.min(.1, (now - last) / 1000);
    if (elapsed >= plan.end) finished(); else render();
  }
  last = now; requestAnimationFrame(tick);
}
function setPlaying(value) {
  playing = value; cueShown = -1;
  if (!playing) hush();
  if (soundOn) playing ? startMusic() : stopMusic(); play.textContent = playing ? '❚❚' : '▶'; play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}
function step(direction) { showEpisode(order[(order.indexOf(current) + direction + order.length) % order.length]); setPlaying(!still.matches); }
function startTrailer() { closeAll(); trailer = 0; setPlaying(!still.matches); showEpisode(featured[0], true); }
function toggle(panel, open) {
  panel.classList.toggle('open', open);
  if (panel === sheet) $('#all').setAttribute('aria-expanded', String(open));
  if (open) panel.querySelector('a,button')?.focus({ preventScroll: true });
}
function closeAll() { toggle(sheet, false); toggle(about, false); document.documentElement.classList.remove('reading-open'); }

function route() {
  const target = location.hash.slice(1);
  closeAll();
  if (target === 'about') { toggle(about, true); if (!plan) showIntro(); return; }
  if (target === 'read' || target.startsWith('story-')) {
    document.documentElement.classList.add('reading-open'); if (!plan) showIntro();
    const article = document.getElementById(target); article?.scrollIntoView(); (article ?? reading).focus({ preventScroll: true }); return;
  }
  if (byId[target]) { setPlaying(!still.matches); showEpisode(target); return; }
  showIntro();
}
addEventListener('hashchange', route);
addEventListener('resize', fit);
play.addEventListener('click', () => {
  if (plan && elapsed >= plan.end - .2) { elapsed = 0; shown = -2; cueShown = -1; frame.classList.remove(...states); if (view === 'detail') frame.classList.add('titled', 'docked'); setPlaying(true); return; }
  setPlaying(!playing);
});
$('#next').addEventListener('click', () => step(1));
$('#previous').addEventListener('click', () => step(-1));
$('#all').addEventListener('click', () => { const open = !sheet.classList.contains('open'); closeAll(); toggle(sheet, open); });
$('#trailer').addEventListener('click', startTrailer);
$('#start-trailer').addEventListener('click', startTrailer);
$('#start-first').addEventListener('click', () => { location.hash = order[0]; });
$('#skip').addEventListener('click', () => { elapsed = plan.beats[2]; shown = -2; cueShown = -1; render(); });
// The header button mutes or unmutes. Unmuting replays the current view from its start, so every line is heard.
function showSound() {
  soundButton.setAttribute('aria-pressed', String(!soundOn)); soundButton.classList.toggle('waiting', waiting);
  const label = !soundOn ? 'Unmute' : waiting ? 'Tap for sound' : 'Mute';
  soundButton.setAttribute('aria-label', label); soundButton.title = label;
}
function replayView() {
  if (view === 'intro') showIntro(); else if (view === 'detail') showDetail(current); else showEpisode(current, trailer >= 0);
  setPlaying(!still.matches);
}
// Browsers play sound only after the visitor clicks or presses a key; the first one starts it, and the intro starts over.
function unlock() {
  waiting = false; showSound();
  if (view === 'intro') replayView(); else { cueShown = -1; if (playing) startMusic(); }
}
soundButton.addEventListener('click', () => {
  if (waiting) { unlock(); return; }
  soundOn = !soundOn;
  try { localStorage.setItem('sound', soundOn ? 'on' : 'off'); } catch { /* not remembered */ }
  showSound();
  if (!soundOn) { hush(); stopMusic(); return; }
  replayView();
});
for (const type of ['pointerdown', 'keydown']) addEventListener(type, event => { if (waiting && event.target !== soundButton) unlock(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hush(); stopMusic(); }
  else if (soundOn && playing) { cueShown = -1; startMusic(); }
});
detailButton.addEventListener('click', () => { setPlaying(!still.matches); if (view === 'detail') showEpisode(current); else showDetail(current); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
  history.replaceState(null, '', view === 'intro' ? '#intro' : `#${current}`); closeAll();
}));
addEventListener('keydown', event => {
  if (event.key === 'Escape') { if (document.documentElement.classList.contains('reading-open') || about.classList.contains('open')) history.replaceState(null, '', view === 'intro' ? '#intro' : `#${current}`); closeAll(); return; }
  if (event.target.closest('a,button,input') && event.key === ' ') return;
  if (document.documentElement.classList.contains('reading-open') || view === 'intro') return;
  if (event.key === 'ArrowRight') step(1);
  else if (event.key === 'ArrowLeft') step(-1);
  else if (event.key === ' ') { event.preventDefault(); setPlaying(!playing); }
});
addEventListener('pointermove', event => { frame.style.setProperty('--px', (event.clientX / innerWidth - .5).toFixed(3)); frame.style.setProperty('--py', (event.clientY / innerHeight - .5).toFixed(3)); });
still.addEventListener('change', route);

// Slow drifting specks keep the stage alive without pulling focus.
const dust = $('#dust');
for (let i = 0; i < 46; i++) {
  const speck = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  speck.setAttribute('cx', (i * 173) % 1200); speck.setAttribute('cy', (i * 97) % 600); speck.setAttribute('r', .6 + (i % 3) * .5);
  speck.style.cssText = `--d:${9 + i % 7}s;--o:${-(i % 11)}s;--a:${.15 + (i % 4) * .1};--x:${(i % 5 - 2) * 14}px`;
  dust.append(speck);
}
document.documentElement.classList.add('ready');
showSound();
setPlaying(playing);
route();
// Clip lengths arrive after the first view starts; with sound remembered as on, replay that view with them.
loadVoice().then(ready => { if (ready && soundOn && !still.matches && !new URLSearchParams(location.search).has('at')) { if (view === 'intro') showIntro(); else if (view === 'detail') showDetail(current); else showEpisode(current); } });
// A link may open a moment of an episode or its walkthrough, paused: for example ?at=12#thursday or ?detail&at=9#thursday.
const query = new URLSearchParams(location.search), moment = Number(query.get('at'));
if (query.has('detail') && byId[location.hash.slice(1)]) showDetail(current);
if (moment > 0 && plan) { setPlaying(false); elapsed = Math.min(moment, plan.end - .05); shown = -2; render(); }
requestAnimationFrame(tick);
