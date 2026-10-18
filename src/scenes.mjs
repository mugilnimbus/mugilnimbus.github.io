// One drawn object for each episode. Class names say when a part appears:
//   d0 / f0  drawn or faded in as the object is built      d1 / f1  at the first beat      d2 / f2  at the second beat
//   m2  slides from (--fx,--fy) to (--tx,--ty) at the second beat      s2  shrinks at the second beat
//   scan  sweeps once at the first beat      rip  ripples at the second beat      thin  quiet detail      solid  filled
// All drawings share a 1200 by 600 canvas with the object between x 400 and 800.
const hand = (x, y, text, cls = 'f2', anchor = 'start') => `<text class="hand ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;

const scenes = {
  screen: `
    <rect class="d0" x="400" y="150" width="400" height="260" rx="14" stroke-width="1.8"/><path class="d0" d="M560 410v34h80v-34M520 446h160"/>
    <g class="f0 thin"><path d="M400 184h400M486 214h110M486 230h70M428 328h334M428 348h280M428 368h310M442 285h120"/><circle cx="420" cy="167" r="4"/><circle cx="436" cy="167" r="4"/><circle cx="452" cy="167" r="4"/>
      <rect x="428" y="204" width="38" height="38" rx="8"/><rect x="652" y="204" width="110" height="34" rx="17"/><rect x="428" y="268" width="334" height="34" rx="6"/></g>
    <rect class="scan" x="402" y="152" width="396" height="30" style="--travel:226px"/>
    <rect class="d1" style="--n:1" x="421" y="197" width="52" height="52" rx="6"/><rect class="d1" style="--n:2" x="645" y="197" width="124" height="48" rx="6"/><rect class="d1" style="--n:3" x="421" y="261" width="348" height="48" rx="6"/>
    <rect class="f2 solid" x="652" y="204" width="110" height="34" rx="17"/><circle class="rip" cx="706" cy="216" r="16"/>
    <path class="m2 solid edge" style="--fx:560px;--fy:380px;--tx:706px;--ty:220px" d="M0 0v22l6-5 4 10 4-2-4-9h8z"/>
    <text class="tiny f1" style="--n:2" x="421" y="190">52, 40</text><text class="tiny f1" style="--n:3" x="645" y="190">1310, 42</text>
    <path class="d2" style="--n:5" d="M680 470C740 500 700 532 600 532S462 500 520 470"/><path class="d2" style="--n:6" d="M509 468l11 2-6 10"/>`,
  saturn: `
    <rect class="d0" x="410" y="150" width="110" height="290" rx="8" stroke-width="1.8"/>
    <g class="f0 thin"><path d="${Array.from({ length: 16 }, (_, i) => `M424 ${172 + i * 16}h${[70, 52, 80, 44, 66, 76, 38, 60, 80, 50, 72, 42, 64, 78, 46, 58][i]}`).join('')}"/></g>
    <rect class="scan" x="412" y="152" width="106" height="30" style="--travel:250px"/>
    <circle class="d0" cx="600" cy="295" r="30" stroke-width="1.8"/><ellipse class="d0" cx="600" cy="295" rx="58" ry="14" transform="rotate(-18 600 295)"/>
    <path class="d1" style="--n:1" d="M528 295h30m-9-8 9 8-9 8"/>
    <ellipse class="d1" style="--n:2" cx="600" cy="392" rx="30" ry="8"/><path class="d1" style="--n:3" d="M570 392v38M630 392v38M570 430a30 8 0 0 0 60 0"/>${hand(600, 470, '48 h', 'f1 small', 'middle')}
    <path class="d2" d="M666 295h22m-9-8 9 8-9 8"/><rect class="d2" style="--n:1" x="694" y="255" width="96" height="80" rx="8"/>
    ${[[0, 64], [1, 44], [2, 56]].map(([row, width], i) => `<rect class="f2 solid" style="--n:${i + 2}" x="706" y="${270 + row * 18}" width="${width}" height="8" rx="4"/>`).join('')}
    <text class="tiny f2" style="--n:5" x="706" y="352">id a1f3</text>`,
  docs: `
    <rect class="d0" x="420" y="165" width="150" height="205" rx="8" stroke-width="1.8"/>
    <g class="f0 thin"><path d="M440 195h110M440 217h110M440 239h80M440 283h110M440 305h110M440 327h60"/></g>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect class="d1" style="--n:${i + 1}" x="${650 + (i % 2) * 76}" y="${175 + Math.floor(i / 2) * 62}" width="62" height="46" rx="6"/>`).join('')}
    <path class="d1 thin" style="--n:1" d="M576 250h56m-9-8 9 8-9 8"/>
    <rect class="f2 solid" x="726" y="237" width="62" height="46" rx="6"/><circle class="d2" cx="757" cy="420" r="16"/>${hand(757, 428, '?', 'f2', 'middle')}
    <path class="d2" style="--n:2" d="M757 402v-112"/><path class="d2" style="--n:4" d="M720 260 C 660 300, 620 268, 562 261"/><rect class="f2 solid" style="--n:5" x="436" y="254" width="118" height="14" rx="3"/>`,
  ledger: `
    <rect class="d0" x="420" y="165" width="190" height="240" rx="10" stroke-width="1.8"/><path class="d0" d="M515 165v240"/>
    <g class="f0 thin"><path d="M436 205h62M436 235h62M436 265h62M436 295h62M436 325h62M532 205h62M532 235h62M532 265h62M532 295h62"/></g>
    <circle class="d0" cx="750" cy="285" r="36"/><path class="f0" d="M750 263v44M728 285h44M735 270l30 30M765 270l-30 30"/>
    <path class="d1" d="M660 150v270M668 150v270"/>
    <path class="d1" style="--n:3" d="M712 262h-96m10-8-10 8 10 8"/>${hand(690, 250, 'read', 'f1 small', 'middle')}
    <path class="d2" d="M712 312h-34"/><path class="d2" style="--n:2" d="M652 300l-14 24M638 300l14 24"/>${hand(700, 348, 'write', 'f2 small', 'middle')}`,
  sheet: `
    <rect class="d0" x="420" y="165" width="150" height="215" rx="8" stroke-width="1.8"/><g class="f0 thin"><path d="M440 190h60M440 334h110M440 354h70"/></g>
    <rect class="d1" style="--n:1" x="436" y="208" width="118" height="24" rx="4"/><rect class="d1" style="--n:2" x="436" y="244" width="118" height="24" rx="4"/><rect class="d1" style="--n:3" x="436" y="280" width="118" height="24" rx="4"/>
    <rect class="d2" x="660" y="165" width="130" height="118" rx="6"/><path class="d2 thin" style="--n:1" d="M660 195h130M660 225h130M660 255h130M725 165v118"/>
    <path class="d2" style="--n:2" d="M660 350h130v52h-130z"/>${hand(725, 430, 'review', 'f2 small', 'middle')}
    <rect class="m2 solid" style="--n:3;--fx:440px;--fy:212px;--tx:666px;--ty:202px" width="52" height="16" rx="3"/><rect class="m2 solid" style="--n:5;--fx:440px;--fy:248px;--tx:666px;--ty:232px" width="52" height="16" rx="3"/>
    <rect class="m2 solid dim" style="--n:7;--fx:440px;--fy:284px;--tx:699px;--ty:368px" width="52" height="16" rx="3"/>`,
  check: `
    <rect class="d0" x="420" y="225" width="120" height="120" rx="12" stroke-width="1.8"/><g class="f0 thin"><path d="M442 255h76M442 279h76M442 303h46"/></g>
    <rect class="d0" x="670" y="225" width="120" height="120" rx="8" stroke-width="1.8"/><path class="f0 thin" d="M690 225v-16M714 225v-16M738 225v-16M762 225v-16M690 345v16M714 345v16M738 345v16M762 345v16M698 253h64v64h-64z"/>
    ${['GPU', 'memory', 'format'].map((label, i) => `<path class="d1" style="--n:${i * 2 + 1}" d="M566 ${252 + i * 34}l8 8 14-18"/>${hand(598, 264 + i * 34, label, `f1 small" style="--n:${i * 2 + 1}`)}`).join('')}
    <path class="d2" d="M480 386h248m-10-8 10 8-10 8"/><rect class="f2 solid" style="--n:3" x="698" y="253" width="64" height="64"/>`,
  layers: `
    ${[0, 1, 2, 3, 4].map(i => `<path class="d0" style="--n:${i}" d="M470 ${196 + i * 44}l130-42 130 42-130 42z"/>`).join('')}
    <path class="d1" d="M535 175l130 42M600 154l0 84M665 175l-130 42"/><path class="d1 thin" style="--n:2" d="M470 196v176M730 196v176M600 238v176"/>
    <path class="d2" stroke-width="2.2" d="M600 120v322m-9-10 9 10 9-10"/>${[0, 1, 2, 3, 4].map(i => `<circle class="f2 solid" style="--n:${i + 1}" cx="600" cy="${196 + i * 44}" r="6"/>`).join('')}`,
  steps: `
    <rect class="d0" x="410" y="235" width="130" height="110" rx="14" stroke-width="1.8"/><g class="f0 thin"><path d="M430 262h90M430 290h90M430 318h60"/></g>
    ${[0, 1, 2, 3].map(i => `<rect class="d1" style="--n:${i * 2 + 1}" x="${584 + i * 56}" y="268" width="40" height="40" rx="8"/>`).join('')}<path class="d1 thin" d="M546 288h32M626 288h12M682 288h12M738 288h12"/>
    <path class="d2" d="M660 314v36"/>${[0, 1, 2].flatMap(r => [0, 1, 2].map(c => `<rect class="d2" style="--n:${1 + r + c}" x="${628 + c * 22}" y="${356 + r * 22}" width="18" height="18" rx="3"/>`)).join('')}${hand(708, 392, 'W · x', 'f2 small')}`,
  weights: `
    <rect class="d1" x="420" y="165" width="150" height="240" rx="10"/><path class="d1" style="--n:3" d="M430 175l130 220M560 175l-130 220"/>
    <g class="s2"><rect class="d0" x="630" y="165" width="150" height="240" rx="10" stroke-width="1.8"/><path class="f0 thin" d="M630 205h150M630 245h150M630 285h150M630 325h150M630 365h150"/></g>
    <path class="d2" d="M806 180v225m-8-10 8 10 8-10"/>`,
  tokens: `
    <path class="d0 thin" d="M430 258h246M430 362h172"/><g class="f0 type"><text x="430" y="238">by the river</text><text x="600" y="238">bank</text><text x="430" y="342">bank</text><text x="508" y="342">account</text></g>
    <rect class="d1" x="592" y="206" width="84" height="46" rx="8"/><rect class="d1" style="--n:2" x="422" y="310" width="80" height="46" rx="8"/>
    <path class="d2" d="M676 229h70"/><circle class="d2" style="--n:1" cx="760" cy="229" r="12"/><path class="d2" style="--n:2" d="M502 333 C 620 333, 660 380, 746 380"/><rect class="d2" style="--n:3" x="748" y="368" width="24" height="24" rx="4"/>
    ${hand(760, 266, 'a river’s edge', 'f2 small', 'middle')}${hand(760, 420, 'where money is kept', 'f2 small', 'middle')}`,
  search: `
    <path class="d0" stroke-width="1.8" d="M410 300 C 440 210, 470 390, 500 300 S 550 220, 570 300"/><path class="f0 thin" d="M400 400h180M400 190v210"/>
    ${[0, 1, 2].map(k => { const x = 640 + k * 62, rows = [2, 3, 4][k]; return `<g class="f1" style="--n:${k * 2 + 1}">${Array.from({ length: rows }, (_, r) => `<circle cx="${x}" cy="${300 + (r - (rows - 1) / 2) * 34}" r="6"/><path class="thin" d="M${x + 6} ${300 + (r - (rows - 1) / 2) * 34}L${x + 26} 300"/>`).join('')}<circle cx="${x + 32}" cy="300" r="6"/></g>`; }).join('')}
    <circle class="d2" cx="718" cy="300" r="74"/><path class="d2" style="--n:2" d="M576 300h60m-9-8 9 8-9 8"/>`,
  grid: `
    <rect class="d0" x="430" y="170" width="340" height="250" rx="6" stroke-width="1.8"/><path class="f0 thin" d="M430 220h340M430 270h340M430 320h340M430 370h340M498 170v250M566 170v250M634 170v250M702 170v250"/>
    ${[[0, 0, .2], [1, 0, .45], [2, 1, .8], [3, 1, .55], [1, 2, .3], [2, 2, .95], [3, 3, .4], [4, 2, .6], [0, 3, .25], [4, 4, .35], [2, 4, .5], [1, 4, .15]].map(([c, r, o], i) => `<rect class="f1 solid" style="--n:${i * .5};--o:${o}" x="${432 + c * 68}" y="${172 + r * 50}" width="64" height="46"/>`).join('')}
    <path class="d2" stroke-width="2" d="M770 130a44 44 0 1 1-30-12m-2-12 4 12-12 4"/>`,
  mask: `
    <rect class="d0" x="430" y="165" width="340" height="250" rx="8" stroke-width="1.8"/>
    <g class="f0 thin"><circle cx="520" cy="250" r="24"/><path d="M480 330a40 40 0 0 1 80 0M640 232h92v58h-92zM654 250h40M654 266h60M460 368h240M460 388h170"/></g>
    <rect class="d1" style="--n:1" x="488" y="218" width="64" height="64" rx="6"/><rect class="d1" style="--n:3" x="632" y="224" width="108" height="74" rx="6"/><rect class="d1" style="--n:5" x="452" y="356" width="256" height="42" rx="6"/>
    <rect class="f2 solid" style="--n:1" x="492" y="222" width="56" height="56" rx="4"/><rect class="f2 solid" style="--n:2" x="636" y="228" width="100" height="66" rx="4"/><rect class="f2 solid" style="--n:3" x="456" y="360" width="248" height="34" rx="4"/>`,
  plant: `
    <path class="d0" stroke-width="1.8" d="M600 410V240M600 330C558 318 536 286 544 258 580 264 598 296 600 330M600 290c40-12 62-42 56-70-36 6-54 36-56 70"/><path class="d0" d="M460 410h280"/>
    <path class="d0" style="--n:2" d="M700 410v-58h14v58"/>
    <path class="d1" d="M520 200v-18h18M680 200v-18h-18M520 330v18h18M680 330v18h-18"/><path class="d1" style="--n:3" d="M686 330a22 22 0 0 1 42 0M707 330l10-14"/>
    <path class="d2" d="M440 250h70v46"/>${[0, 1, 2].map(i => `<circle class="f2 solid" style="--n:${i + 2}" cx="510" cy="${318 + i * 26}" r="5"/>`).join('')}`,
  hud: `
    <rect class="d0" x="470" y="185" width="260" height="200" rx="18" stroke-width="1.8"/>
    <g class="f0 thin">${[0, 1, 2, 3].map(i => `<rect x="540" y="${216 + i * 40}" width="160" height="16" rx="8"/><circle cx="505" cy="${224 + i * 40}" r="8"/>`).join('')}</g>
    ${[[0, 120], [1, 72], [3, 138]].map(([row, width], i) => `<rect class="f1 solid" style="--n:${i * 2 + 1}" x="542" y="${218 + row * 40}" width="${width}" height="12" rx="6"/>`).join('')}
    <path class="f2" style="stroke-dasharray:6 8" d="M548 304h144"/><path class="d2" style="--n:3" d="M760 280l12 12 22-28"/>`,
};

export function hookScene(name) { return scenes[name] ?? scenes.screen; }

// The detail walkthrough: every step of the mechanism as a point on one ring, visited in order.
export function detailScene(nodes) {
  const centre = [600, 300], radius = 188, points = nodes.map((_, i) => { const angle = i / nodes.length * Math.PI * 2 - Math.PI / 2; return [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius, angle]; });
  const arc = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}A${radius} ${radius} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  return `<circle class="d0 thin" cx="600" cy="300" r="${radius}"/><circle class="d0" cx="600" cy="300" r="74" stroke-width="1.6"/><text class="count" x="600" y="318" text-anchor="middle"></text>
    ${points.map((point, i) => {
      const [x, y, angle] = point, right = Math.cos(angle) > .3, left = Math.cos(angle) < -.3, anchor = right ? 'start' : left ? 'end' : 'middle';
      const lx = x + Math.cos(angle) * 44, ly = y + Math.sin(angle) * 44 + (Math.sin(angle) > .3 ? 22 : Math.sin(angle) < -.3 ? -6 : 8);
      return `<g class="stop" data-stop="${i}">${i ? `<path class="trail" pathLength="1" d="${arc(points[i - 1], point)}"/>` : ''}
        <circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22"/><text class="index" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${i + 1}</text>
        <text class="hand name" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}">${nodes[i]}</text></g>`;
    }).join('')}`;
}
