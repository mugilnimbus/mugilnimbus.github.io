# Design

## Theme

| Token | Value | Use |
| --- | --- | --- |
| Background | `#000000` | Whole stage |
| White | `#ffffff` | Current drawing, current note, titles, primary button |
| Silver | `#c9cdd2` | Secondary text and quiet lines |
| Grey | `#74787d` | Detail lines, labels, past notes |
| Dim | `#3a3c3f` | Tracks and inactive ticks |
| Hairline | white at 14% | Borders |
| Glass | white at 6%, 22px blur | Dock, chips, Navigation and About panels |

No other colours are used. Emphasis comes from brightness: the current step is white and everything earlier falls back to grey.

## Type

| Role | Face | Size |
| --- | --- | --- |
| Question, notes, closing line | Ink Free where installed, otherwise the bundled Shadows Into Light, then Bradley Hand ITC | 26px notes; question up to 58px |
| Project title | System sans, bold | up to 52px |
| Narration | System sans, light | up to 24px |
| Labels | System sans, capitals, wide tracking | 10 to 12px |
| Skills list | System sans, light, capitals, wide tracking, dimmed silver | 14px |

Windows shows Ink Free. Devices without it load Shadows Into Light from `assets/fonts/`, so phones, tablets and other computers share one handwriting face.

## Layout

- One object at the centre of a 1200 by 600 drawing, with a soft white halo behind it.
- Title and episode tag bottom left; narration centred above the dock; detail actions bottom right.
- Dock: previous, play or pause, next, progress line, one tick per episode in four groups. Navigation sits in the header on every view and opens a panel top right.
- Intro: skills list bottom right, right-aligned, on windows at least 1560px wide.
- Under 900px the drawing is cropped to the object, side notes and ticks are hidden, and the title and actions move above the narration.

## Motion

Every movement carries meaning.

| Movement | Meaning |
| --- | --- |
| Words appearing one at a time, 0.28s each | Reading pace |
| Lines drawing themselves | Something being built or found |
| A handwritten note with a drawn arrow | What is being explained now |
| A beam, a moving mark or a ripple | Where data or action goes |
| Earlier notes fading to grey | Attention moves on |
| Drifting specks and a breathing halo | The stage is alive; nothing more |

Transitions use one easing curve, `cubic-bezier(.2,.7,.2,1)`. Reduced motion removes all animation and shows each view complete.

## Components

- **Intro.** Greeting written with a drawn underline; a handwritten sum, physics + AI, with "+ some creativity" inserted above by a caret; an equals sign answered by one point; four constellations of project stars that are links, each writing its project name above itself on hover or keyboard focus while its group label dims; a skills list that fades in line by line with the closing line.
- **Episode.** Question, object, two beats with two notes, project line. The detail button turns white at the closing line.
- **Detailed view.** For a project with its own walkthrough: the system as boxes and wires in one chapter per mode, the chapter name and step count at the top, an In progress badge for an unfinished mode, earlier parts dimmed, the current step white, and moving dashes on the wires carrying data. On phones the drawing pans sideways to the current step. Otherwise, a ring with one numbered stop per step, a bright arc tracing progress, the step name written beside its stop, and the step count in the centre.
- **Navigation.** A glass panel listing the intro, every episode numbered under its group, and About me last.
- **About me.** A wider glass panel: handwritten tagline, a short introduction, then physics, AI, creativity, education, publications, tools and links.
- **Full stories.** Plain reading column over the stage, one article per project, ending with About me.
