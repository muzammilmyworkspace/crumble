/* ==========================================================
   Hand-drawn style line art (thick ink outline, flat pastel fills),
   in the spirit of Crumbl's illustrations. All original drawings.
   Every moving part has a class so GSAP can animate it.
   ========================================================== */

export const INK = '#141414';
export const C = {
  pink: '#ffb9cd', pinkDeep: '#f58eab', pinkPale: '#ffe6e5', cream: '#fef9f3',
  skin: '#f4c9a4', skin2: '#c98e6b', hair: '#3a2418', hair2: '#8a5a33',
  white: '#ffffff', metal: '#dfe4ea', metal2: '#b9c2cc', blue: '#bcd3ea',
  dough: '#e9c89a', choc: '#3b1f12', wood: '#e3b98a', shadow: 'rgba(20,20,20,.12)',
};
const s = (w = 4) => `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/* ---------------- the cousins' pink convertible ---------------- */
export function car() {
  const wheel = (cx, cls) => `
    <g class="car-wheel ${cls}">
      <circle cx="${cx}" cy="190" r="34" fill="${INK}"/>
      <circle cx="${cx}" cy="190" r="22" fill="${C.white}" ${s(3)}/>
      <circle cx="${cx}" cy="190" r="7" fill="${C.pinkDeep}" ${s(3)}/>
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="${cx + Math.cos(a) * 9}" y1="${190 + Math.sin(a) * 9}" x2="${cx + Math.cos(a) * 20}" y2="${190 + Math.sin(a) * 20}" ${s(2.5)}/>`; }).join('')}
    </g>`;
  return `<svg class="ill-car" viewBox="0 0 640 240" aria-hidden="true">
    <ellipse cx="330" cy="228" rx="270" ry="9" fill="${C.shadow}"/>
    <!-- speed lines -->
    <g class="car-speed" ${s(4)} fill="none"><path d="M10 118h60M26 140h48M4 162h70"/></g>
    <!-- back-seat cookie buddy -->
    <g class="car-cookie">
      <circle cx="205" cy="92" r="42" fill="#d49a5c" ${s(4)}/>
      <g fill="${C.choc}"><ellipse cx="190" cy="78" rx="7" ry="6"/><ellipse cx="220" cy="95" rx="8" ry="6"/><ellipse cx="198" cy="112" rx="6" ry="5"/><ellipse cx="228" cy="72" rx="5" ry="4"/></g>
      <path d="M180 88c6 5 12 5 18 0" fill="none" ${s(3)}/>
    </g>
    <!-- passenger -->
    <g class="car-person p2">
      <path d="M268 150v-38c0-18 14-28 30-28s30 10 30 28v38z" fill="#3456a6" ${s(4)}/>
      <circle cx="298" cy="64" r="22" fill="${C.skin}" ${s(4)}/>
      <path d="M276 60c0-18 12-26 24-26 13 0 22 8 22 20-8-8-20-8-30-4-6 2-12 6-16 10z" fill="${C.hair2}" ${s(4)}/>
      <path d="M292 70c4 3 9 3 12 0" fill="none" ${s(3)}/>
    </g>
    <!-- driver -->
    <g class="car-person p1">
      <path d="M362 150v-36c0-17 13-26 28-26s28 9 28 26v36z" fill="#1b1b1b" ${s(4)}/>
      <circle cx="392" cy="66" r="21" fill="${C.skin}" ${s(4)}/>
      <path d="M371 62c1-16 11-24 23-24 12 0 21 8 20 20-6-6-15-7-23-5-8 2-15 5-20 9z" fill="${C.hair}" ${s(4)}/>
      <path d="M398 74c4 2 7 1 9-2" fill="none" ${s(3)}/>
      <path d="M410 112l30 10" ${s(5)}/>
    </g>
    <!-- windshield + wheel -->
    <path d="M428 150l22-66 38 4-10 62" fill="${C.blue}" fill-opacity=".45" ${s(4)}/>
    <circle cx="444" cy="122" r="13" fill="none" ${s(4)}/>
    <!-- body -->
    <path d="M40 176c0-22 14-34 40-36l120-8h330c36 0 64 12 76 32l10 18c4 8-2 16-10 16H52c-8 0-12-6-12-14z" fill="${C.pink}" ${s(4)}/>
    <path d="M58 150h520" stroke="${C.white}" stroke-width="6" stroke-linecap="round"/>
    <path d="M200 160h250" ${s(3)}/>
    <path d="M44 172h24M584 168h28" ${s(4)}/>
    <!-- tail fin + lights -->
    <path d="M40 142c10-18 30-26 46-26l10 20z" fill="${C.pinkDeep}" ${s(4)}/>
    <circle cx="600" cy="160" r="9" fill="#fff6c9" ${s(3)}/>
    <!-- plate -->
    <rect x="568" y="182" width="56" height="18" rx="3" fill="${C.white}" ${s(3)}/>
    <text x="596" y="196" font-family="Fredoka, Arial" font-weight="700" font-size="12" text-anchor="middle" fill="${INK}">CRUMBL</text>
    ${wheel(150, 'w-back')}${wheel(500, 'w-front')}
  </svg>`;
}

/* ---------------- the baker ---------------- */
export function chef() {
  return `<svg class="ill-chef" viewBox="0 0 320 400" aria-hidden="true">
    <g class="chef-body">
      <!-- torso / jacket -->
      <path d="M78 400V300c0-44 36-74 82-74s82 30 82 74v100z" fill="${C.white}" ${s(5)}/>
      <!-- pink apron -->
      <path d="M112 400V296c0-10 8-16 18-16h60c10 0 18 6 18 16v104z" fill="${C.pink}" ${s(5)}/>
      <path d="M130 300h60v26h-60z" fill="${C.pinkPale}" ${s(4)}/>
      <text x="160" y="319" font-family="Fredoka, Arial" font-weight="700" font-size="15" text-anchor="middle" fill="${INK}">crumbl</text>
      <circle cx="146" cy="262" r="4" fill="${INK}"/><circle cx="174" cy="262" r="4" fill="${INK}"/>
      <!-- neck + head -->
      <path d="M144 214h32v20c0 8-32 8-32 0z" fill="${C.skin}" ${s(5)}/>
      <g class="chef-head">
        <circle cx="160" cy="176" r="44" fill="${C.skin}" ${s(5)}/>
        <path d="M118 168c4-14 16-22 26-22-2 10 4 16 16 16s20-8 22-16c10 2 22 10 24 22" fill="${C.hair}" ${s(5)}/>
        <g class="chef-eyes"><ellipse cx="144" cy="180" rx="4.5" ry="6" fill="${INK}"/><ellipse cx="176" cy="180" rx="4.5" ry="6" fill="${INK}"/></g>
        <circle cx="134" cy="196" r="7" fill="${C.pink}" opacity=".8"/><circle cx="186" cy="196" r="7" fill="${C.pink}" opacity=".8"/>
        <path class="chef-mouth" d="M148 198c7 8 17 8 24 0" fill="none" ${s(4)}/>
        <!-- toque -->
        <path d="M118 150c-18-6-22-34-2-44 4-22 28-30 44-18 16-12 40-4 44 18 20 10 16 38-2 44z" fill="${C.white}" ${s(5)}/>
        <path d="M120 138h80v18h-80z" fill="${C.white}" ${s(5)}/>
      </g>
    </g>
    <!-- arms pivot at the shoulders -->
    <g class="chef-arm arm-l">
      <path d="M96 262c-26 12-42 40-40 70l4 12c6 4 18 4 24-2l2-14c0-18 10-34 24-44z" fill="${C.white}" ${s(5)}/>
      <circle class="chef-hand" cx="70" cy="346" r="15" fill="${C.skin}" ${s(5)}/>
    </g>
    <g class="chef-arm arm-r">
      <path d="M224 262c26 12 42 40 40 70l-4 12c-6 4-18 4-24-2l-2-14c0-18-10-34-24-44z" fill="${C.white}" ${s(5)}/>
      <circle class="chef-hand" cx="250" cy="346" r="15" fill="${C.skin}" ${s(5)}/>
    </g>
  </svg>`;
}

/* ---------------- kitchen props ---------------- */
export const bowl = (cls = '') => `<svg class="ill-bowl ${cls}" viewBox="0 0 260 150" aria-hidden="true">
  <ellipse cx="130" cy="140" rx="96" ry="8" fill="${C.shadow}"/>
  <path d="M20 40h220c0 56-46 96-110 96S20 96 20 40z" fill="${C.pinkPale}" ${s(5)}/>
  <ellipse cx="130" cy="40" rx="110" ry="18" fill="${C.white}" ${s(5)}/>
  <ellipse class="bowl-fill" cx="130" cy="42" rx="92" ry="12" fill="${C.dough}" opacity="0"/>
  <path d="M50 70c10 30 34 48 66 54" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>
</svg>`;

export const flourBag = () => `<svg class="ill-flour" viewBox="0 0 150 190" aria-hidden="true">
  <path d="M28 40l10-28h74l10 28v130c0 8-6 12-12 12H40c-6 0-12-4-12-12z" fill="${C.cream}" ${s(5)}/>
  <path d="M38 12l12 18 12-18 12 18 12-18 12 18 12-18" fill="none" ${s(4)}/>
  <rect x="46" y="84" width="58" height="46" rx="8" fill="${C.pink}" ${s(4)}/>
  <text x="75" y="113" font-family="Fredoka, Arial" font-weight="700" font-size="17" text-anchor="middle" fill="${INK}">flour</text>
</svg>`;

export const sugarJar = () => `<svg class="ill-sugar" viewBox="0 0 130 170" aria-hidden="true">
  <rect x="22" y="14" width="86" height="22" rx="8" fill="${C.pinkDeep}" ${s(5)}/>
  <path d="M18 40h94v108c0 10-8 16-16 16H34c-8 0-16-6-16-16z" fill="${C.blue}" fill-opacity=".5" ${s(5)}/>
  <path d="M24 92h82v54c0 8-6 12-12 12H36c-6 0-12-4-12-12z" fill="${C.white}"/>
  <text x="65" y="128" font-family="Fredoka, Arial" font-weight="700" font-size="17" text-anchor="middle" fill="${INK}">sugar</text>
</svg>`;

export const butter = () => `<svg class="ill-butter" viewBox="0 0 170 90" aria-hidden="true">
  <path d="M14 38l30-24h112l-30 24z" fill="#fff3b0" ${s(5)}/>
  <path d="M14 38h112v38H14z" fill="#ffe680" ${s(5)}/>
  <path d="M126 38l30-24v38l-30 24z" fill="#f5d259" ${s(5)}/>
  <path d="M40 48v18M62 48v18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
</svg>`;

export const egg = () => `<svg class="ill-egg" viewBox="0 0 70 90" aria-hidden="true">
  <path d="M35 6c16 0 30 28 30 50 0 18-13 28-30 28S5 74 5 56C5 34 19 6 35 6z" fill="#fff8ee" ${s(5)}/>
  <path d="M22 30c4-8 8-12 12-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export const chipBag = () => `<svg class="ill-chips" viewBox="0 0 140 170" aria-hidden="true">
  <path d="M20 26h100l-8 136H28z" fill="#6b3a24" ${s(5)}/>
  <path d="M20 26l12-14h76l12 14" fill="#8a4d31" ${s(5)}/>
  <circle cx="70" cy="98" r="30" fill="${C.cream}" ${s(4)}/>
  <g fill="${C.choc}"><path d="M58 94l6-10 6 10z"/><path d="M72 108l6-10 6 10z"/><path d="M66 82l5-8 5 8z"/></g>
</svg>`;

export const chip = () => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16C3 9 7 3 10 2c3 1 7 7 7 14z" fill="${C.choc}" ${s(2)}/></svg>`;

export function mixer() {
  return `<svg class="ill-mixer" viewBox="0 0 300 330" aria-hidden="true">
    <ellipse cx="150" cy="320" rx="120" ry="8" fill="${C.shadow}"/>
    <!-- base + column -->
    <path d="M60 300h190c8 0 12 6 12 12v6H48v-6c0-6 4-12 12-12z" fill="${C.pinkDeep}" ${s(5)}/>
    <path d="M200 300V130c0-30 20-44 40-44s26 20 22 40l-18 174z" fill="${C.pink}" ${s(5)}/>
    <!-- bowl -->
    <path d="M70 196h130c0 48-28 84-65 84s-65-36-65-84z" fill="${C.metal}" ${s(5)}/>
    <ellipse cx="135" cy="196" rx="66" ry="12" fill="${C.white}" ${s(5)}/>
    <ellipse class="mixer-dough" cx="135" cy="200" rx="54" ry="9" fill="${C.dough}"/>
    <path d="M86 214c6 30 22 50 44 56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <!-- head (tilts) -->
    <g class="mixer-head">
      <path d="M44 82c0-30 40-44 110-44h86c26 0 38 18 38 40s-12 40-38 40H110c-40 0-66-10-66-36z" fill="${C.pink}" ${s(5)}/>
      <path d="M70 70h120" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
      <circle cx="256" cy="78" r="9" fill="${C.white}" ${s(4)}/>
      <!-- beater -->
      <g class="mixer-beater">
        <path d="M120 116v22" ${s(6)}/>
        <path d="M120 138c-22 0-26 26-14 46 6 10 22 10 28 0 12-20 8-46-14-46z" fill="${C.metal2}" fill-opacity=".6" ${s(5)}/>
        <path d="M120 140v54" ${s(4)}/>
      </g>
    </g>
  </svg>`;
}

export const tray = () => `<svg class="ill-tray" viewBox="0 0 420 70" aria-hidden="true">
  <path d="M10 20h400l-14 36H24z" fill="${C.metal}" ${s(5)}/>
  <path d="M10 20h400" ${s(5)}/>
  <path d="M30 34h360" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
</svg>`;

export function oven() {
  return `<svg class="ill-oven" viewBox="0 0 420 420" aria-hidden="true">
    <rect x="16" y="16" width="388" height="390" rx="26" fill="${C.pink}" ${s(6)}/>
    <!-- control panel -->
    <rect x="40" y="36" width="340" height="56" rx="14" fill="${C.pinkPale}" ${s(5)}/>
    <g class="oven-dial"><circle cx="90" cy="64" r="16" fill="${C.white}" ${s(5)}/><path d="M90 64V52" ${s(5)}/></g>
    <circle cx="140" cy="64" r="16" fill="${C.white}" ${s(5)}/>
    <rect x="200" y="50" width="150" height="28" rx="8" fill="${INK}"/>
    <text class="oven-temp" x="275" y="70" font-family="Fredoka, Arial" font-weight="600" font-size="18" text-anchor="middle" fill="#ff9fbd">350°F</text>
    <!-- door -->
    <rect x="40" y="114" width="340" height="266" rx="18" fill="${C.pinkDeep}" ${s(6)}/>
    <rect x="70" y="112" width="280" height="14" rx="7" fill="${C.metal}" ${s(5)}/>
    <!-- window -->
    <rect class="oven-window" x="70" y="150" width="280" height="200" rx="14" fill="#2a1410" ${s(5)}/>
    <rect class="oven-glow" x="72" y="152" width="276" height="196" rx="12" fill="url(#ovenGlow)" opacity="0"/>
    <defs>
      <radialGradient id="ovenGlow" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#ffb347"/><stop offset=".6" stop-color="#ff6a2b" stop-opacity=".7"/><stop offset="1" stop-color="#7a1d0a" stop-opacity=".2"/></radialGradient>
    </defs>
    <path d="M90 170c20-8 40-10 60-8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".35"/>
  </svg>`;
}

export const pipingBag = () => `<svg class="ill-piping" viewBox="0 0 160 240" aria-hidden="true">
  <path d="M30 20c30-10 70-10 100 0L92 206H68z" fill="${C.cream}" ${s(5)}/>
  <path d="M40 60c20 30 30 70 34 120" fill="none" stroke="${C.pink}" stroke-width="18" stroke-linecap="round" opacity=".8"/>
  <path d="M68 206h24l-6 22h-12z" fill="${C.metal}" ${s(5)}/>
  <path d="M30 20c30-10 70-10 100 0" fill="none" ${s(5)}/>
</svg>`;

/** long pink 4-pack box, top-down, with lid that folds up */
export function box() {
  return `<svg class="ill-box" viewBox="0 0 560 220" aria-hidden="true">
    <ellipse cx="280" cy="206" rx="250" ry="10" fill="${C.shadow}"/>
    <rect x="20" y="40" width="520" height="150" rx="18" fill="${C.pink}" ${s(6)}/>
    <rect x="36" y="56" width="488" height="118" rx="12" fill="${C.pinkPale}" ${s(4)}/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${100 + i * 120}" cy="115" r="50" fill="${C.pink}" opacity=".45" ${s(3)}/>`).join('')}
  </svg>`;
}

/** little storefront with an open kitchen window */
export function store() {
  return `<svg class="ill-store" viewBox="0 0 360 300" aria-hidden="true">
    <rect x="20" y="70" width="320" height="210" rx="10" fill="${C.cream}" ${s(5)}/>
    <path d="M10 70h340l-20-50H30z" fill="${C.pink}" ${s(5)}/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${30 + i * 50} 70c0 18 25 18 25 0" fill="${i % 2 ? C.white : C.pinkDeep}" ${s(4)}/>`).join('')}
    <text x="180" y="54" font-family="Fredoka, Arial" font-weight="700" font-size="30" text-anchor="middle" fill="${INK}">crumbl</text>
    <rect x="44" y="110" width="170" height="120" rx="8" fill="${C.blue}" fill-opacity=".5" ${s(5)}/>
    <path d="M60 212h140" ${s(4)}/>
    <circle cx="96" cy="176" r="16" fill="${C.skin}" ${s(4)}/><path d="M82 164c4-12 24-12 28 0z" fill="${C.white}" ${s(4)}/>
    <circle cx="156" cy="182" r="14" fill="#d49a5c" ${s(4)}/>
    <rect x="236" y="120" width="80" height="160" rx="6" fill="${C.pinkDeep}" ${s(5)}/>
    <circle cx="300" cy="200" r="5" fill="${INK}"/>
    <text x="276" y="150" font-family="Fredoka, Arial" font-weight="600" font-size="13" text-anchor="middle" fill="${INK}">OPEN</text>
  </svg>`;
}
