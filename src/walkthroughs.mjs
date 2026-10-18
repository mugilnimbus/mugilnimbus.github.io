// Detailed views: a project's real mechanism drawn as parts and wires, revealed one step at a time.
// Each part says the step it appears at (data-at) and may relight at later steps (data-lit).
// Wires that carry data at a step have a moving overlay (data-flow). Every chapter shares a 1200 by 600 canvas.
const head = (x, y, dir) => ({
  r: `M${x - 8} ${y - 6}L${x} ${y}L${x - 8} ${y + 6}`, l: `M${x + 8} ${y - 6}L${x} ${y}L${x + 8} ${y + 6}`,
  u: `M${x - 6} ${y + 8}L${x} ${y}L${x + 6} ${y + 8}`, d: `M${x - 6} ${y - 8}L${x} ${y}L${x + 6} ${y - 8}`,
})[dir];
const wire = (d, [x, y], dir) => `<path class="ln" d="${d}"/><path class="ln" d="${head(x, y, dir)}"/>`;
const flow = (d, steps) => `<path class="flow" data-flow="${steps}" d="${d}"/>`;
const part = (at, inner, { lit = '', cls = '' } = {}) => `<g data-at="${at}"${lit ? ` data-lit="${lit}"` : ''}${cls ? ` class="${cls}"` : ''}>${inner}</g>`;
const box = (x, y, w, h, title, lines = [], rx = 12) => `<rect class="ln" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>
  <text class="lbl" x="${x + 16}" y="${y + 28}">${title}</text>${lines.map((text, i) => `<text class="sub" x="${x + 16}" y="${y + 50 + i * 18}">${text}</text>`).join('')}`;
const bubble = (x, y, w, text, tail = 'down') => `<rect class="ln" x="${x}" y="${y}" width="${w}" height="44" rx="14"/>
  <path class="ln" d="${tail === 'down' ? `M${x + 26} ${y + 44}l-6 12 18-12` : `M${x + w - 26} ${y + 44}l6 12-18-12`}"/><text class="msg" x="${x + w / 2}" y="${y + 28}" text-anchor="middle">${text}</text>`;

// Computer control: capture, read, detect, decide, ground, act, and look again.
const screen = `<rect class="ln" x="160" y="150" width="310" height="230" rx="14"/><path class="ln" d="M295 380v26h40v-26M262 408h106"/>
  <g class="thin"><path d="M160 176h310"/><circle cx="176" cy="163" r="3.5"/><circle cx="190" cy="163" r="3.5"/><circle cx="204" cy="163" r="3.5"/>
    <rect x="180" y="192" width="34" height="34" rx="7"/><path d="M226 202h110M226 218h70"/><rect x="360" y="194" width="94" height="30" rx="15"/>
    <rect x="180" y="244" width="274" height="30" rx="6"/><path d="M192 259h80M180 300h250M180 320h196M180 340h226"/></g>`;
const textLines = [[226, 202, 110], [226, 218, 70], [192, 259, 80], [180, 300, 250], [180, 320, 196], [180, 340, 226]];
const found = [[175, 187, 44, 44, 9], [355, 189, 104, 40, 20], [175, 239, 284, 40, 8], [174, 290, 264, 60, 6]];
const cursor = 'M0 0v22l6-5 4 10 4-2-4-9h8z';
const toLLM = ['M740 188H810V250H880', 'M740 348H810V290H880', 'M960 146V210'];

const computer = `
  ${part(0, screen, { cls: 'keep' })}
  ${part(0, `${bubble(880, 96, 160, 'Reply to Sam’s email')}<text class="sub" x="880" y="86">your task</text>`, { lit: '9' })}
  ${part(1, `<rect class="area" x="148" y="138" width="334" height="254" rx="18"/><rect class="flash" x="160" y="150" width="310" height="230" rx="14"/><text class="sub" x="148" y="128">captured area</text>`, { lit: '8' })}
  ${part(2, `${textLines.map(([x, y, w], i) => `<path class="ln hl" style="--n:${i}" d="M${x} ${y}h${w}"/>`).join('')}
    ${wire('M482 188H540', [540, 188], 'r')}${box(540, 140, 200, 96, 'Line OCR')}
    ${[[192, 140], [206, 96], [220, 150]].map(([y, w], i) => `<path class="ln" style="--n:${i + 3}" d="M556 ${y}h${w}"/>`).join('')}`, { lit: '8' })}
  ${part(3, `${found.map(([x, y, w, h, r], i) => `<rect class="ln" style="--n:${i}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`).join('')}
    ${wire('M482 348H540', [540, 348], 'r')}${box(540, 300, 200, 96, 'OmniParser')}
    ${[['button', '1310, 42'], ['input', '760, 118'], ['icon', '52, 40']].map(([name, at], i) => `<text class="code" x="556" y="${348 + i * 17}">${name}</text><text class="code" x="724" y="${348 + i * 17}" text-anchor="end">${at}</text>`).join('')}`, { lit: '8' })}
  ${part(4, `${wire(toLLM[0], [880, 250], 'r')}${wire(toLLM[1], [880, 290], 'r')}${wire(toLLM[2], [960, 210], 'd')}
    <rect class="ln" x="880" y="210" width="160" height="110" rx="16"/><text class="lbl big" x="960" y="262" text-anchor="middle">LLM</text>
    <text class="sub" x="960" y="288" text-anchor="middle">decides the next step</text>`, { lit: '8' })}
  ${part(5, `${wire('M960 320V352', [960, 352], 'd')}<rect class="ln" x="880" y="352" width="160" height="40" rx="20"/><text class="code" x="960" y="377" text-anchor="middle">click → button</text>`, { lit: '8' })}
  ${part(6, `${wire('M960 392V430', [960, 430], 'd')}${box(880, 430, 160, 70, 'Tool', ['ground → 1310, 42'])}
    <circle class="ln" cx="407" cy="209" r="27"/><path class="ln" d="M407 174v12M407 232v12M372 209h12M430 209h12"/>`, { lit: '8' })}
  ${part(7, `${wire('M880 465H500V209H466', [466, 209], 'l')}<circle class="rip" cx="407" cy="209" r="16"/>
    <path class="cursor solid edge" style="--fx:300px;--fy:345px;--tx:409px;--ty:212px" d="${cursor}"/>`, { lit: '8' })}
  ${part(8, `${wire('M960 500V545H120V265H148', [148, 265], 'r')}<text class="hand" x="540" y="532" text-anchor="middle">and look again</text>`)}
  ${part(9, `${wire('M880 232H856V100H846', [846, 100], 'l')}${bubble(640, 76, 200, 'Done. Reply sent.', 'up')}<text class="sub" x="740" y="146" text-anchor="middle">or it asks you</text>`, { cls: 'gone' })}
  ${flow('M482 188H540', '2 8')}${flow('M482 348H540', '3 8')}${toLLM.map(d => flow(d, '4 8')).join('')}
  ${flow('M960 320V352', '5 8')}${flow('M960 392V430', '6 8')}${flow('M880 465H500V209H466', '7 8')}${flow('M960 500V545H120V265H148', '8')}${flow('M880 232H856V100H846', '9')}`;

// Voice agent: a fast voice model in front, the main agent behind, joined by A2A.
const phone = `<rect class="ln" x="170" y="150" width="120" height="240" rx="22"/><path class="ln" d="M215 168h30M222 372h16"/>
  <g class="wave">${[14, 30, 46, 30, 14].map((h, i) => `<path class="ln" style="--n:${i}" d="M${206 + i * 12} ${270 - h / 2}v${h}"/>`).join('')}</g>`;
const voice = `
  ${part(0, phone, { cls: 'keep' })}
  ${part(1, `${wire('M292 252H420', [420, 252], 'r')}${wire('M420 290H292', [292, 290], 'l')}
    ${box(420, 210, 200, 110, 'Voice model', ['speech in, speech out', 'full duplex'], 16)}`, { cls: 'keep' })}
  ${part(2, `${wire('M620 236H650V136H690', [690, 136], 'r')}<rect class="ln" x="690" y="116" width="170" height="40" rx="20"/>
    <text class="code" x="775" y="141" text-anchor="middle">answer directly</text>`)}
  ${part(3, `${wire('M620 280H880', [880, 280], 'r')}<text class="code" x="750" y="268" text-anchor="middle">A2A · delegate</text>
    ${box(880, 225, 170, 110, 'Main agent', ['does the work'], 16)}${[896, 926, 956].map(x => `<rect class="ln" x="${x}" y="296" width="22" height="22" rx="5"/>`).join('')}`, { cls: 'keep' })}
  ${part(4, `${wire('M965 335V410', [965, 410], 'd')}${box(880, 410, 170, 56, 'Tool server')}
    ${wire('M880 438H520V320', [520, 320], 'u')}<text class="code" x="700" y="428" text-anchor="middle">permission?</text>`)}
  ${part(4, bubble(150, 82, 170, 'Allow sending?'), { cls: 'gone' })}
  ${part(5, `${bubble(175, 410, 110, '“Yes.”', 'up')}${wire('M560 320V495H965V466', [965, 466], 'u')}<text class="code" x="760" y="486" text-anchor="middle">your yes</text>`)}
  ${part(6, `${wire('M880 304H622', [622, 304], 'l')}<text class="code" x="750" y="324" text-anchor="middle">result</text>${bubble(150, 82, 170, 'Done. It’s sent.')}`)}
  ${flow('M292 252H420', '1 5')}${flow('M420 290H292', '1 4 6')}${flow('M620 236H650V136H690', '2')}${flow('M620 280H880', '3')}
  ${flow('M965 335V410', '4')}${flow('M880 438H520V320', '4')}${flow('M560 320V495H965V466', '5')}${flow('M880 304H622', '6')}`;

export const walkthroughs = Object.freeze({
  thursday: {
    chapters: [
      {
        name: 'Computer control', markup: computer,
        steps: [
          'You give Thursday a task.',
          'It captures the screen, or only the area that matters.',
          'A line OCR model reads every line of text on the screen.',
          'OmniParser finds every button, icon and input box, with its exact position.',
          'The text, the objects and your task go to the LLM together.',
          'The LLM chooses the next action and the object to act on.',
          'A tool grounds that object to exact coordinates on the real screen.',
          'The tool performs the action: the cursor moves there and clicks.',
          'Then Thursday looks again. The loop repeats until the job is done.',
          'When the job is done, it replies. If it needs something, it asks you.',
        ],
        focus: [[960, 140], [315, 265], [450, 220], [450, 320], [820, 260], [960, 330], [700, 380], [640, 340], [600, 330], [820, 180]],
      },
      {
        name: 'Voice agent', badge: 'In progress', markup: voice,
        steps: [
          'Voice mode: you just talk to your phone. No screen, no tapping.',
          'A speech-to-speech voice model listens and replies, even while you are still speaking.',
          'For every request it decides: answer now, or hand the work on.',
          'Real tasks go to the main agent through the A2A protocol.',
          'Before a sensitive step, the tool server asks for permission, and the phone asks you out loud.',
          'Your spoken yes goes straight back to the tool server.',
          'The main agent reports back, and the voice model tells you.',
        ],
        focus: [[300, 270], [420, 270], [640, 210], [760, 280], [700, 360], [600, 420], [480, 250]],
      },
    ],
  },
});

// The header above a chapter: its name, the step count, and a badge for a mode still being built.
export function chapterHeader(chapter) {
  return `<g class="chapter"><text class="cap" x="600" y="56" text-anchor="middle">${chapter.name.toUpperCase()}<tspan class="tally" dx="16"></tspan></text>
    ${chapter.badge ? `<g class="badge"><rect x="544" y="70" width="112" height="24" rx="12"/><text x="600" y="86" text-anchor="middle">${chapter.badge.toUpperCase()}</text></g>` : ''}</g>`;
}
