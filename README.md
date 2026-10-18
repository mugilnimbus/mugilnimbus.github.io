# Mugil's portfolio

**Watch it: [mugilnimbus.github.io](https://mugilnimbus.github.io/)**

Tired of portfolios that make you dig through pages to find out what someone actually built? This one plays itself: 15 projects, each told as a short episode that opens with a problem you may have felt and shows the one idea that answers it.

Each episode asks its question word by word, draws a single object on a black stage, and explains one idea in two short beats. Step-by-step detail, the full written story and the source are there only if you ask for them. Everything is drawn live as line art, so there is no video or 3D to download.

## Try it

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`. Node 22 or later is required.

## What it does

| Part | What the visitor gets |
| --- | --- |
| Intro | A handwritten greeting, then a handwritten sum, physics + AI with "some creativity" squeezed in above, whose answer is one point that opens into four constellations of project stars. Hovering a star shows the project's name. A short list of technical skills sits bottom right on wide windows |
| Episode | A question, one drawn object, two beats, and the project's line; about half a minute |
| Trailer | Four featured projects in shortened form, about one minute |
| Detailed view | The system itself, step by step: parts and wires drawn in order, the current step in white and data moving along the wires. Thursday (computer control, and the voice agent marked In progress) and Saturn MCP (one noisy test run) have their own walkthroughs; other projects use a ring of steps |
| Read the full story | Problem, approach, skills, steps, source and limits as plain text |
| Switching | Previous, Next, a tick for every episode, or any star in the intro |
| Navigation | A panel in the header on every view: the intro, all 15 episodes by group, and About me |
| About me | Background in physics and AI, education, publications, tools and contact links |

Keyboard: left and right change episode, space pauses, escape closes a panel. With reduced motion, nothing plays by itself and each view is shown complete. Without scripts, the full stories are shown as an ordinary page.

## Links

| Link | Opens |
| --- | --- |
| `/#thursday` | That project's episode |
| `/#story-thursday` | Its full story |
| `/#about` | About me |
| `/#intro` | The introduction |
| `/?at=12#thursday` | The episode paused at 12 seconds |
| `/?detail&at=21#thursday` | The Detailed view paused at 21 seconds |

## Commands

| Command | Purpose |
| --- | --- |
| `node scripts/render-content.mjs` | Regenerate `index.html` after changing project content, the About me text or the skills list |
| `npm.cmd run check` | Module syntax, HTML identifiers and links |
| `npm.cmd test` | Catalogue, hooks, scenes, timing and server allowlist tests |
| `node docs/architecture/viewer/check.mjs` | Architecture model check |
| `npm.cmd run build` | Package the public site into `dist/` |

## Hosting

The site is static and has no dependencies. Any static host can serve the repository root or the `dist/` folder, including from a sub-path such as a GitHub Pages project address.

## Status and limits

- Drawings are schematic explanations. The site does not run any featured project, model or tool.
- Hook questions are drafts drawn from the reviewed project descriptions.
- The skills list is shown only on windows at least 1560px wide.
- Handwriting is Ink Free on Windows and the bundled Shadows Into Light (SIL Open Font License, in `assets/fonts/`) elsewhere.
- Saturn MCP links to its planned public repository, Saturn-MCP.
- Nine projects link to public source; seven are private or currently unavailable and say so.
- Not yet checked on physical phones, other browsers or with a screen reader.

The design is recorded in the [architecture model](https://mugilnimbus.github.io/docs/architecture.html).
