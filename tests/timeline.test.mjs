import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/projects.mjs';
import { hooks, featured } from '../src/hooks.mjs';
import { introPlan, episodePlan, detailPlan, beatAt, progressAt, pace, wordCount } from '../src/timeline.mjs';

const byId = Object.fromEntries(projects.map(p => [p.id, p]));
test('every episode gives each line time to be read word by word', () => {
  for (const project of projects) {
    const hook = hooks[project.id], plan = episodePlan(hook, project.title);
    assert.ok(plan.dock - plan.ask >= wordCount(hook.question) * pace, 'the question finishes before it leaves');
    assert.ok(plan.beats[1] - plan.beats[0] >= wordCount(hook.see) * pace + 1);
    assert.ok(plan.beats[2] - plan.beats[1] >= wordCount(hook.act) * pace + 1);
    assert.ok(plan.end > plan.beats[2] && plan.end < 60, `${project.id} stays under a minute`);
  }
});
test('beats arrive in order and playback position stays within range', () => {
  const plan = episodePlan(hooks.thursday, byId.thursday.title);
  assert.equal(beatAt(plan, 0), -1); assert.equal(beatAt(plan, plan.beats[0]), 0); assert.equal(beatAt(plan, plan.end), 2);
  assert.equal(progressAt(plan, -5), 0); assert.equal(progressAt(plan, plan.end * 2), 1);
});
test('the trailer is shorter than the full episodes and runs about a minute', () => {
  const total = featured.reduce((sum, id) => sum + episodePlan(hooks[id], byId[id].title, true).end, 0);
  const full = featured.reduce((sum, id) => sum + episodePlan(hooks[id], byId[id].title).end, 0);
  assert.ok(total < full && total > 40 && total < 80, `trailer runs ${total.toFixed(1)}s`);
});
test('intro and detail plans are ordered', () => {
  const intro = introPlan('I build AI and software systems.', ['Physics, AI and some creativity.', 'Each project starts with a problem you may have felt.']);
  assert.ok(intro.named < intro.lined && intro.lined < intro.beats[0] && intro.beats[0] < intro.beats[1] && intro.beats[1] < intro.beats[2] && intro.beats[2] < intro.end);
  const detail = detailPlan(byId['agentic-rag'].steps);
  assert.equal(detail.beats.length, 5); assert.ok(detail.beats.every((at, i) => i === 0 || at > detail.beats[i - 1]));
});
test('with sound on, a line waits for its spoken clip but never drops below reading time', () => {
  const hook = hooks.thursday, slow = text => text === hook.see ? 20 : wordCount(text) * pace;
  const quiet = episodePlan(hook, byId.thursday.title), spoken = episodePlan(hook, byId.thursday.title, false, slow);
  assert.ok(spoken.beats[1] - spoken.beats[0] >= 20 && spoken.beats[0] === quiet.beats[0]);
  assert.ok(introPlan('one two', ['a', 'b'], () => 4, 'Hi').lined > introPlan('one two', ['a', 'b']).lined);
});
