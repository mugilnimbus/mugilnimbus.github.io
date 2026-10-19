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
| Intro | A handwritten greeting, then a handwritten sum, physics + AI with "some creativity" squeezed in above, whose answer is one point that opens into four constellations of project stars. Hovering a star shows the project's name. The intro ends by inviting the visitor to pick a star or just watch, and rolls into the trailer if they do nothing. A short list of technical skills sits bottom right on wide windows |
| Episode | A question, one drawn object, two beats, and the project's line; about half a minute |
| Trailer | Four featured projects in shortened form, about one minute |
| Detailed view | The system itself, step by step: parts and wires drawn in order, the current step in white and data moving along the wires. Thursday (computer control, and the voice agent marked In progress) and Saturn MCP (one noisy test run) have their own walkthroughs; other projects use a ring of steps |
| Read the full story | Problem, approach, skills, steps, source and limits as plain text |
| Switching | Previous, Next, a tick for every episode, or any star in the intro |
| Navigation | A panel in the header on every view: the intro, all 15 episodes by group, and About me |
| About me | Background in physics and AI, education, publications, tools and contact links |
| Sound | On when the site opens, with a speaker button in the header that mutes it, remembered across reloads. A natural voice reads every line from "Hi, I'm Mugil." onward, in step with the words, over quiet ambient music; each line lasts as long as its clip. Browsers hold sound until the first click or key press, so the speaker pulses until then |

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
| `node scripts/voice.mjs` | Make voice clips for new or changed narrated lines (local Kokoro voice) |
| `npm.cmd run build` | Package the public site into `dist/` |

## Voice

Narration is pre-generated on this computer with [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), an open (Apache 2.0) text-to-speech model, using the `af_heart` voice. The clips live in `assets/voice/` with a manifest of their lengths. The music is synthesised in the browser, so no music file is shipped.

One-time setup for making clips:

```powershell
uv venv tools/voice/.venv --python 3.12
$env:VIRTUAL_ENV = "tools/voice/.venv"; uv pip install kokoro soundfile "en_core_web_sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
```

Then run `node scripts/voice.mjs` after changing any narrated text. Pronunciation fixes for names and acronyms are in `src/narration.mjs`. Set `VOICE` to try another Kokoro voice, for example `am_michael`.

## Hosting

The site is static and has no dependencies. Any static host can serve the repository root or the `dist/` folder, including from a sub-path such as a GitHub Pages project address.

## Status and limits

- Drawings are schematic explanations. The site does not run any featured project, model or tool.
- Hook questions are drafts drawn from the reviewed project descriptions.
- The skills list is shown only on windows at least 1560px wide.
- Handwriting is Ink Free on Windows and the bundled Shadows Into Light (SIL Open Font License, in `assets/fonts/`) elsewhere.
- Saturn MCP links to its planned public repository, Saturn-MCP.
- Eight of the 15 projects link to public source (Saturn-MCP once its repository is published); seven are private or currently unavailable and say so.
- Not yet checked on physical phones, other browsers or with a screen reader.

The design is recorded in the [architecture model](https://mugilnimbus.github.io/docs/architecture.html).
