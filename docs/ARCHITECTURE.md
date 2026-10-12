# Architecture

The portfolio is a static browser experience. It presents project information and schematic drawings; it cannot execute desktop tools, run models, access confidential project data, or alter repositories.

The [architecture model](architecture.html) records responsibilities, dependencies, rules and flows. Its source is `architecture/model.js`.

| Boundary | Responsibility |
| --- | --- |
| Series player | `src/main.mjs` owns the current view, the playback clock, navigation, overlays and links |
| Timing plan | `src/timeline.mjs` turns the words of an intro, episode or walkthrough into start times; pure functions |
| Catalogue and hooks | `src/projects.mjs` holds reviewed project facts; `src/hooks.mjs` holds each episode's hook, the groups, the order and the trailer selection |
| Scene library | `src/scenes.mjs` supplies the line drawing for each hook and the ring diagram for each walkthrough |
| Page generator | `scripts/render-content.mjs` writes `index.html`: the header, the Navigation list, the About me text, the skills list and every full story as static text |
| Static host | `scripts/server.mjs` serves an allowlist of public paths on 127.0.0.1; `scripts/build.mjs` packages `dist/` |

## How playback works

Everything on screen is derived from elapsed time. The player keeps one clock; the timing plan says when each line and beat starts; the page applies state classes and the stylesheet animates between them. Pausing, replaying and jumping to a moment therefore always give a consistent picture. The clock stops when the page is hidden, and does not run under reduced motion.

## Content rules

Edit project facts in `src/projects.mjs`, hooks in `src/hooks.mjs`, and the About me text or skills list in `scripts/render-content.mjs`, then regenerate the page. Do not edit `index.html` by hand.
