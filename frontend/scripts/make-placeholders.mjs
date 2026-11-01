// Generates the illustrated SAMPLE images in public/placeholders/.
// They are drawings, not photographs of any real property. Replace them with your own photos
// (see README). Run:  node scripts/make-placeholders.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'placeholders');
mkdirSync(out, { recursive: true });

const C = { navy: '#12304A', blue: '#1769AA', accent: '#48A9E6', sky: '#EAF5FF', sky2: '#CFE6F8', sky3: '#A9D2F0', white: '#FFFFFF', wood: '#D8C4A8', wood2: '#C2AC8C', leaf: '#2F7D6B', leaf2: '#4FA08B' };

const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Sample illustration">` +
  `<defs>${defs}<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky}"/><stop offset="1" stop-color="#DCEBF8"/></linearGradient>` +
  `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky3}"/><stop offset="1" stop-color="${C.accent}"/></linearGradient>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0F7"/><stop offset="1" stop-color="#F4FAFF"/></linearGradient>` +
  `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${C.navy}" flood-opacity="0.16"/></filter></defs>` +
  body + `</svg>`;

const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circ = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const palm = (x, y, s = 1, col = C.leaf) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C6 -90 4 -170 -6 -250" stroke="${C.wood2}" stroke-width="12" fill="none" stroke-linecap="round"/>` +
  [-150, -115, -75, -30, 20, 60, 100].map((a) => `<path d="M-6 -250 C${Math.cos((a * Math.PI) / 180) * 60} ${-250 + Math.sin((a * Math.PI) / 180) * 30 - 40} ${Math.cos((a * Math.PI) / 180) * 120} ${-250 + Math.sin((a * Math.PI) / 180) * 70 + 10} ${Math.cos((a * Math.PI) / 180) * 150} ${-250 + Math.sin((a * Math.PI) / 180) * 110 + 50}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('') + `</g>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${rect(-28, 0, 56, 62, C.white, 10)}${rect(-28, 0, 56, 10, C.sky2, 5)}<path d="M0 0 C-30 -50 -50 -70 -46 -110 M0 0 C0 -60 -6 -90 8 -130 M0 0 C30 -40 56 -60 52 -100" stroke="${C.leaf}" stroke-width="9" fill="none" stroke-linecap="round"/>${circ(-46, -110, 16, C.leaf2)}${circ(8, -132, 18, C.leaf)}${circ(52, -100, 16, C.leaf2)}</g>`;
const window_ = (x, y, w, h, view = 'url(#sea)') => `<g filter="url(#soft)">${rect(x - 14, y - 14, w + 28, h + 28, C.white, 18)}</g>${rect(x, y, w, h, 'url(#sky)', 8)}${rect(x, y + h * 0.58, w, h * 0.42, view, 0)}${palm(x + w * 0.8, y + h, 0.5)}${rect(x + w / 2 - 5, y, 10, h, C.white)}${rect(x, y + h / 2 - 5, w, 10, C.white)}`;
const lamp = (x, y) => `${rect(x - 3, y, 6, 60, C.navy, 3)}<path d="M${x - 30} ${y} L${x - 18} ${y - 44} H${x + 18} L${x + 30} ${y} Z" fill="${C.white}" stroke="${C.sky3}" stroke-width="3"/>`;

const scenes = {
  hero: () => svg(1000, 1250,
    rect(0, 0, 1000, 1250, 'url(#wall)') + window_(140, 150, 720, 560) + rect(0, 980, 1000, 270, C.wood) + rect(0, 970, 1000, 14, C.wood2) +
    `<g filter="url(#soft)">${rect(150, 760, 520, 210, C.blue, 36)}${rect(150, 700, 520, 120, '#2A80C2', 40)}${rect(190, 745, 200, 90, C.white, 26)}${rect(420, 745, 200, 90, C.white, 26)}</g>${rect(180, 965, 14, 40, C.navy)}${rect(626, 965, 14, 40, C.navy)}` +
    plant(790, 960, 1.5) + `<g filter="url(#soft)">${rect(300, 900, 240, 18, C.white, 8)}${rect(320, 918, 10, 60, C.navy)}${rect(510, 918, 10, 60, C.navy)}</g>` +
    `<path d="M-20 1100 Q500 1030 1020 1100 V1250 H-20Z" fill="${C.sky}" opacity=".6"/>`),
  bedroom: () => svg(1200, 900,
    rect(0, 0, 1200, 900, 'url(#wall)') + window_(780, 120, 300, 340) + rect(0, 700, 1200, 200, C.wood) + rect(0, 690, 1200, 12, C.wood2) +
    `<g filter="url(#soft)">${rect(170, 380, 520, 150, C.navy, 28)}${rect(190, 470, 480, 210, C.white, 30)}${rect(190, 540, 480, 140, C.accent, 26)}${rect(220, 430, 190, 80, C.sky, 24)}${rect(450, 430, 190, 80, C.sky, 24)}</g>` +
    rect(750, 560, 120, 130, C.white, 12) + lamp(810, 505) + rect(100, 560, 90, 130, C.white, 12) + lamp(145, 505) +
    `<ellipse cx="430" cy="790" rx="360" ry="46" fill="${C.sky2}"/>` + plant(1090, 700, 1)),
  living: () => svg(900, 1200,
    rect(0, 0, 900, 1200, 'url(#wall)') + window_(130, 110, 640, 380) + rect(0, 900, 900, 300, C.wood) + rect(0, 890, 900, 14, C.wood2) +
    `<g filter="url(#soft)">${rect(110, 600, 520, 200, C.blue, 40)}${rect(110, 540, 520, 120, '#2A80C2', 44)}${rect(150, 585, 190, 90, C.sky, 28)}${rect(400, 585, 190, 90, C.sky, 28)}${rect(90, 660, 60, 150, C.blue, 26)}${rect(590, 660, 60, 150, C.blue, 26)}</g>` +
    `<g filter="url(#soft)">${rect(200, 850, 340, 26, C.white, 12)}${rect(220, 876, 12, 60, C.navy)}${rect(508, 876, 12, 60, C.navy)}</g>` +
    `<ellipse cx="370" cy="1010" rx="300" ry="50" fill="${C.sky2}"/>` + plant(780, 880, 1.4) + rect(690, 520, 130, 170, C.white, 8, `stroke="${C.sky3}" stroke-width="6"`) + rect(710, 540, 90, 130, C.sky3, 4)),
  kitchen: () => svg(1000, 1000,
    rect(0, 0, 1000, 1000, 'url(#wall)') + rect(0, 740, 1000, 260, C.wood) +
    `<g filter="url(#soft)">${rect(70, 250, 360, 120, C.white, 14)}${rect(480, 250, 300, 120, C.white, 14)}${rect(60, 560, 880, 200, C.white, 16)}${rect(60, 540, 880, 34, C.sky2, 10)}</g>` +
    rect(110, 600, 200, 130, C.sky, 10) + rect(340, 600, 200, 130, C.sky, 10) + rect(570, 600, 200, 130, C.sky, 10) + circ(300, 665, 8, C.blue) + circ(530, 665, 8, C.blue) +
    rect(100, 400, 80, 140, C.blue, 12) + rect(200, 430, 70, 110, C.accent, 12) + `<path d="M320 540 Q320 460 380 460 H430 Q460 460 460 500 V540Z" fill="${C.navy}"/>` +
    rect(780, 250, 160, 290, C.white, 14, 'filter="url(#soft)"') + rect(800, 270, 120, 90, C.sky, 8) + rect(800, 380, 120, 140, C.sky, 8) + plant(700, 540, 0.7)),
  bathroom: () => svg(900, 1200,
    rect(0, 0, 900, 1200, 'url(#wall)') + rect(0, 940, 900, 260, C.sky2) +
    Array.from({ length: 8 }, (_, i) => rect(0, 120 + i * 100, 900, 3, C.sky3, 0, 'opacity=".45"')).join('') +
    window_(560, 150, 220, 300) +
    `<g filter="url(#soft)">${rect(110, 700, 560, 220, C.white, 70)}${rect(150, 740, 480, 150, C.sky, 56)}${rect(250, 640, 20, 70, C.navy, 6)}${rect(180, 640, 130, 20, C.navy, 10)}</g>` +
    `<g filter="url(#soft)">${rect(110, 440, 260, 120, C.white, 50)}${rect(140, 470, 200, 70, C.sky, 34)}${rect(110, 560, 260, 200, C.white, 12)}</g>` +
    rect(560, 560, 200, 300, C.white, 14, 'filter="url(#soft)"') + rect(580, 580, 160, 20, C.sky3, 8) + rect(580, 620, 160, 20, C.sky3, 8)),
  exterior: () => svg(1200, 800,
    rect(0, 0, 1200, 800, 'url(#sky)') + circ(980, 160, 70, '#FFFFFF', 'opacity=".9"') + `<path d="M0 560 Q300 500 600 540 T1200 520 V800 H0Z" fill="${C.leaf2}" opacity=".5"/>` +
    rect(0, 640, 1200, 160, '#DDEBDD') + `<g filter="url(#soft)">${rect(260, 330, 560, 310, C.white, 14)}</g>` + `<path d="M230 340 L540 210 L850 340Z" fill="${C.blue}"/>` +
    rect(330, 400, 120, 130, C.sky2, 8) + rect(630, 400, 120, 130, C.sky2, 8) + rect(500, 470, 82, 170, C.navy, 8) + rect(310, 560, 460, 10, C.sky3) +
    palm(150, 680, 0.9) + palm(1020, 700, 1) + plant(900, 650, 0.9) + `<path d="M540 640 L560 800 H400Z" fill="${C.wood}" opacity=".7"/>`),
  surroundings: () => svg(1200, 800,
    rect(0, 0, 1200, 800, 'url(#sky)') + circ(220, 170, 64, '#FFFFFF', 'opacity=".95"') +
    `<path d="M0 470 Q200 380 380 450 T760 430 T1200 450 V560 H0Z" fill="${C.sky3}"/>` + `<path d="M0 520 Q300 450 600 510 T1200 500 V800 H0Z" fill="url(#sea)"/>` +
    `<path d="M0 640 Q300 590 600 650 T1200 630 V800 H0Z" fill="${C.leaf2}" opacity=".85"/>` + palm(250, 700, 1.3) + palm(480, 720, 1.0, C.leaf2) + palm(980, 720, 1.4) +
    `<path d="M80 560 Q300 540 520 565" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`),
  nearby: () => svg(1000, 1250,
    rect(0, 0, 1000, 1250, 'url(#sky)') + circ(760, 220, 80, '#FFFFFF', 'opacity=".95"') +
    `<path d="M0 640 Q250 600 500 640 T1000 620 V1250 H0Z" fill="url(#sea)"/>` +
    [0, 1, 2, 3, 4].map((i) => `<path d="M${-40 + i * 260} ${760 + i * 55} q60 -30 120 0 t120 0 t120 0" stroke="#fff" stroke-width="6" fill="none" opacity=".55"/>`).join('') +
    `<path d="M0 900 Q250 840 520 900 T1000 880 V1250 H0Z" fill="#EFE3CF"/>` + `<path d="M0 960 Q300 920 560 970 T1000 950 V1250 H0Z" fill="#E6D6BA"/>` +
    `<path d="M600 640 L690 450 L780 640Z" fill="${C.blue}"/>` + rect(660, 600, 60, 40, C.navy) + palm(160, 960, 1.4) + palm(870, 1010, 1.2, C.leaf2)),
  owner: () => svg(1000, 1250,
    rect(0, 0, 1000, 1250, 'url(#wall)') + `<ellipse cx="500" cy="1250" rx="440" ry="380" fill="${C.sky3}"/>` + circ(500, 470, 150, C.sky2) + `<path d="M180 1250 Q180 800 500 790 Q820 800 820 1250Z" fill="${C.blue}"/>` + circ(500, 470, 150, C.white, 'opacity=".55"') +
    circ(500, 470, 140, C.sky2) + `<path d="M440 800 Q500 880 560 800Z" fill="${C.white}"/>`),
  story: () => svg(1000, 1250,
    rect(0, 0, 1000, 1250, 'url(#wall)') + window_(220, 190, 560, 420) + rect(0, 1000, 1000, 250, C.wood) + rect(0, 990, 1000, 12, C.wood2) +
    `<g filter="url(#soft)">${rect(320, 770, 360, 230, C.white, 24)}${rect(350, 720, 300, 80, C.sky, 24)}${rect(370, 800, 40, 190, C.navy, 6)}${rect(590, 800, 40, 190, C.navy, 6)}</g>` +
    `<g filter="url(#soft)">${rect(380, 690, 90, 80, C.accent, 10)}${rect(480, 700, 110, 70, C.blue, 40)}</g>` + `<path d="M470 700 q10 -60 25 0" stroke="${C.navy}" stroke-width="6" fill="none"/>` + plant(150, 990, 1.6) + lamp(840, 880)),
};

for (const [name, make] of Object.entries(scenes)) writeFileSync(join(out, `${name}.svg`), make());
console.log(`Wrote ${Object.keys(scenes).length} placeholder illustrations to ${out}`);
