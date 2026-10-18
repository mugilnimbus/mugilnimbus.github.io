import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projects } from '../src/projects.mjs';
import { hooks, groups, order, featured, detailSteps } from '../src/hooks.mjs';
import { hookScene, detailScene } from '../src/scenes.mjs';
import { walkthroughs } from '../src/walkthroughs.mjs';
import { resolvePublicPath } from '../scripts/server.mjs';

test('every project has one episode, one hook and a complete reading story', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
  assert.deepEqual([...order].sort(), projects.map(p => p.id).sort());
  for (const project of projects) {
    const hook = hooks[project.id];
    assert.ok(hook.question.endsWith('?') && hook.see && hook.act && hook.notes.length === 2);
    assert.ok(hookScene(hook.scene).includes('d0'), `${project.id} has a drawn object`);
    assert.ok(html.includes(`id="story-${project.id}"`) && html.includes(`data-episode="${project.id}"`));
    assert.ok(project.problem && project.approach && project.source && project.skills.length && project.title);
    assert.equal(new URL(project.repository || 'https://github.com').protocol, 'https:');
  }
});
test('every project gets equal access: one group, one place in the order', () => {
  assert.equal(groups.length, 4);
  assert.equal(groups.reduce((total, group) => total + group.ids.length, 0), projects.length);
  assert.ok(featured.every(id => order.includes(id)));
});
test('each detail walkthrough has one named step for each explanation', () => {
  for (const project of projects.filter(p => !walkthroughs[p.id])) {
    const steps = detailSteps[project.id] ?? project.steps;
    assert.ok(steps.length >= 4 && steps.length <= project.nodes.length, project.id);
    assert.equal((detailScene(project.nodes.slice(0, steps.length)).match(/class="stop"/g) || []).length, steps.length);
  }
});
test('every walkthrough step has a part to show and a point to pan to', () => {
  for (const [id, walk] of Object.entries(walkthroughs)) {
    assert.ok(projects.some(p => p.id === id), id);
    for (const chapter of walk.chapters) {
      assert.equal(chapter.focus.length, chapter.steps.length, `${id} ${chapter.name}`);
      chapter.steps.forEach((_, i) => assert.ok(chapter.markup.includes(`data-at="${i}"`), `${id} ${chapter.name} step ${i + 1}`));
    }
  }
  const thursday = walkthroughs.thursday.chapters;
  assert.deepEqual(thursday.map(c => c.name), ['Computer control', 'Voice agent']);
  assert.equal(thursday[1].badge, 'In progress');
});
test('public sources and unavailable sources remain distinct', () => {
  assert.equal(projects.filter(p => p.repository).length, 8);
  for (const id of ['invoice', 'quantization', 'llm-gui', 'image-privacy', 'automl', 'tokenization', 'irrigation']) assert.equal(projects.find(p => p.id === id).repository, null);
  assert.match(projects.find(p => p.id === 'thursday').limit, /in progress/);
});
test('local server does not expose private documents or traversal', () => {
  for (const path of ['/docs/private/portfolio/HIGHLIGHTS.md', '/.gitignore', '/package.json', '/src/../docs/private/test', '/assets/%2e%2e/docs/private/test', '/assets/%5c..%5cdocs/test', '/%zz']) assert.equal(resolvePublicPath(path), null);
  assert.ok(resolvePublicPath('/src/main.mjs')); assert.ok(resolvePublicPath('/'));
});
