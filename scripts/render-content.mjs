import { writeFile } from 'node:fs/promises';
import { projects } from '../src/projects.mjs';
import { groups, hooks } from '../src/hooks.mjs';

const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = Object.fromEntries(projects.map(project => [project.id, project]));
let number = 0;
const list = `<a class="plain" href="#intro"><i>↺</i>Intro</a>` + groups.map(group => `<h3>${escape(group.name)}</h3>${group.ids.map(id => `<a href="#${id}" data-episode="${id}"><i>${String(++number).padStart(2, '0')}</i>${escape(byId[id].name)}</a>`).join('')}`).join('') + `<h3>About</h3><a class="plain" href="#about"><i>→</i>About me</a>`;
const ticks = groups.map(group => `<div>${group.ids.map(id => `<a href="#${id}" data-episode="${id}" title="${escape(byId[id].name)}" aria-label="${escape(byId[id].name)}"></a>`).join('')}</div>`).join('');
const sourceLink = p => p.repository ? `<a href="${p.repository}" target="_blank" rel="noopener noreferrer">View source on GitHub</a>` : '<span class="private">Private project or source unavailable</span>';
const stories = groups.flatMap(group => group.ids).map(id => byId[id]).map(p => `<article id="story-${p.id}" tabindex="-1"><p class="kicker">${escape(hooks[p.id].question)}</p><h2>${escape(p.name)}</h2><p class="lead">${escape(p.title)}</p>
<h3>The problem</h3><p>${escape(p.problem)}</p><h3>The approach</h3><p>${escape(p.approach)}</p><h3>Skills in practice</h3><p>${p.skills.map(escape).join(' · ')}</p>
<h3>How it works</h3><ol>${p.steps.map(s => `<li>${escape(s)}</li>`).join('')}</ol>
<p class="fine">${escape(p.source)} Built independently by Mugil. ${escape(p.limit)} Drawings are schematic explanations, not recordings of a live run.</p><p class="actions">${sourceLink(p)}<a href="#${p.id}">Watch this episode</a></p></article>`).join('\n');

const about = `<p class="hand big">Physics, AI <em>and some creativity.</em></p>
<p>I'm Mugil Sivasamy Kalamani, an AI and machine learning engineer and published computational researcher based in Dublin, Ireland. I build local-first LLM and multi-agent systems end to end: model inference and quantization, retrieval and evaluation, agent orchestration, and the data pipelines underneath.</p>
<h3>Physics</h3><p>I started in physics: a first-class BSc, postgraduate physics coursework, and research at the Indian Institute of Astrophysics, where I wrote simulations and data pipelines for about 40 years of satellite and ground climate observations and cut computation time by roughly 90% through parallel processing.</p>
<h3>AI</h3><p>An MSc in Artificial Intelligence with First Class Honours from the National College of Ireland, on the Dean's Honour List, followed by the projects in this series: agents, retrieval, model internals, data and vision.</p>
<h3>And some creativity</h3><p>I like making ideas tangible. That is why every project here is drawn and told as a short story instead of listed.</p>
<h3>Education</h3><ul><li>MSc Artificial Intelligence, First Class Honours · National College of Ireland, Dublin · 2023 to 2024</li><li>Postgraduate coursework, MSc Physics · St. Joseph's College, Bengaluru · 2018 to 2020</li><li>BSc Physics, First Class · Karpagam Academy of Higher Education · 2015 to 2018</li></ul>
<h3>Publications</h3><ul><li>Impacts of Aerosol Loading in the Hindu Kush Himalayan Region Based on MERRA-2 Reanalysis Data · Atmosphere (MDPI), 2021</li><li>Evaluation of Fractional Clear Sky Over Potential Astronomical Sites · Monthly Notices of the Royal Astronomical Society, 2021</li></ul>
<h3>Works with</h3><p>Python, SQL, R and C++ · PyTorch, TensorFlow and Hugging Face Transformers · vLLM and llama.cpp · MCP, tool use and multi-agent orchestration · Qdrant, Neo4j, PostgreSQL and SQLite · FastAPI, Docker and Apache Airflow</p>
<p class="actions"><a href="mailto:mugil_sk@outlook.com">Email</a><a href="https://www.linkedin.com/in/mugilsk/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/mugilnimbus" target="_blank" rel="noopener noreferrer">GitHub</a></p>`;

const skills = ['Agentic AI & multi-agent systems', 'Advanced RAG, hybrid search & reranking', 'LLM & RAG evaluation', 'AI observability & tracing', 'Fine-tuning & quantization', 'LLM inference & optimization'];
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#000000"><meta name="description" content="Mugil Sivasamy Kalamani: physics, AI and some creativity. Sixteen projects, each told as a short episode that starts with a problem you may have felt."><title>Mugil — Ideas, made tangible</title><link rel="icon" href="./assets/mark.svg" type="image/svg+xml"><link rel="stylesheet" href="./src/styles.css"></head><body>
<a class="skip-link" href="#read">Read all projects as plain text</a>
<div class="frame" id="frame" data-view="intro">
  <header><a class="mark" href="#intro" aria-label="Mugil Sivasamy Kalamani, replay the introduction"><strong>MUGIL<b> SIVASAMY KALAMANI</b></strong><span>Physics, AI <em>and some creativity</em></span></a>
    <nav aria-label="Main"><button class="chip glass" id="trailer">Watch the trailer</button><button class="chip glass sound" id="sound" aria-pressed="false" aria-label="Mute" title="Mute"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="waves" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="cross" d="M16 9.5l5 5M21 9.5l-5 5"/></svg></button><button class="chip glass" id="all" aria-expanded="false" aria-controls="sheet">Navigation</button><a class="chip glass about-chip" href="#about">About</a><a class="chip glass" href="mailto:mugil_sk@outlook.com">Contact</a></nav></header>
  <section class="scene" aria-hidden="true"><svg id="stage" viewBox="0 0 1200 600"><defs>
    <radialGradient id="halo"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset=".55" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <g class="dust" id="dust"></g><circle class="halo" cx="600" cy="300" r="320" fill="url(#halo)"/><g id="object" class="object"></g><g id="notes"></g></svg></section>
  <div class="hello" aria-hidden="true"><h1>Hi, I'm Mugil.</h1><svg viewBox="0 0 520 26"><path pathLength="1" d="M6 16 C 120 2, 230 26, 330 12 S 480 8, 514 14"/></svg><p id="hello-line"></p></div>
  <div class="ask" aria-hidden="true"><p id="ask"></p></div>
  <div class="story"><span class="tag" id="tag"></span><h1 id="title"><span></span></h1></div>
  <div class="narration" aria-live="polite"><p id="line" class="out"></p></div>
  <div class="start"><button class="primary" id="start-trailer">Watch the trailer</button><button class="glass" id="start-first">Start with episode 1</button></div>
  <ul class="skills" aria-label="Technical skills">${skills.map((skill, i) => `<li style="--i:${i}">${escape(skill)}</li>`).join('')}</ul>
  <button class="skip" id="skip">Skip intro</button>
  <div class="dock glass"><button id="previous" aria-label="Previous episode">◀</button><button class="play" id="play" aria-label="Pause">❚❚</button><button id="next" aria-label="Next episode">▶</button><div class="meter" aria-hidden="true"><i></i></div><div class="ticks" id="ticks">${ticks}</div></div>
  <div class="more"><button class="detail glass" id="detail">Detailed view</button><a id="story-link" href="#read">Read the full story</a><a id="source-link" target="_blank" rel="noopener noreferrer" hidden>View source</a></div>
  <aside class="sheet glass" id="sheet" aria-label="Navigation"><h2>Navigation</h2><nav>${list}</nav></aside>
  <aside class="sheet glass about" id="about" aria-label="About Mugil"><h2>About me</h2>${about}<button class="chip glass" data-close>Close</button></aside>
</div>
<main id="read" class="reading" tabindex="-1" aria-label="All project stories"><button class="chip glass close-reading" data-close>Back to the episodes</button>${stories}<article id="about-me"><h2>About me</h2>${about}</article><footer><span>Mugil Sivasamy Kalamani · Dublin, Ireland</span><a href="mailto:mugil_sk@outlook.com">Get in touch</a><a href="https://www.linkedin.com/in/mugilsk/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/mugilnimbus" target="_blank" rel="noopener noreferrer">GitHub</a></footer></main>
<noscript><style>.frame{display:none}.reading{position:static!important;display:block!important;opacity:1!important}.close-reading{display:none}</style></noscript>
<script type="module" src="./src/main.mjs"></script></body></html>`;
await writeFile(new URL('../index.html', import.meta.url), html);
console.log(`Rendered ${projects.length} episodes and complete reading stories.`);
