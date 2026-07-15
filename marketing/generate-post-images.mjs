/**
 * Generates Instagram carousel slides (1080x1080 PNG) for the first-month posts.
 * Brand: warm cream bg, burnt-orange accent, dark brown ink — matches app palette.
 * Run: node marketing/generate-post-images.mjs
 * Output: marketing/images/postN-slideN.png
 */
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dir, 'images')
mkdirSync(OUT, { recursive: true })

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG = '#FFF7ED'
const INK = '#422006'
const SOFT = '#8A5B2E'
const ACCENT = '#C2410C'
const AMBER = '#F59E0B'
const GREEN = '#15803D'
const RED = '#B91C1C'
const FONT = `'Segoe UI', Arial, sans-serif`

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;')

// Small sunflower motif (mini version of the app icon)
function flower(cx, cy, r, opacity = 1) {
  const petals = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="0" cy="${-r * 0.62}" rx="${r * 0.22}" ry="${r * 0.42}" fill="#FBBF24" transform="rotate(${i * 45})"/>`
  ).join('')
  return `<g transform="translate(${cx},${cy})" opacity="${opacity}">${petals}<circle r="${r * 0.3}" fill="#FEF3C7" stroke="#D97706" stroke-width="${r * 0.04}"/></g>`
}

function header(slideNum, slideTotal) {
  return `
    ${flower(96, 96, 34)}
    <text x="150" y="108" font-family="${FONT}" font-size="27" font-weight="800" letter-spacing="7" fill="${ACCENT}">BLOOM JUNIORS</text>
    <rect x="906" y="66" rx="24" width="88" height="52" fill="none" stroke="${SOFT}" stroke-opacity=".35" stroke-width="2.5"/>
    <text x="950" y="101" font-family="${FONT}" font-size="27" font-weight="700" fill="${SOFT}" text-anchor="middle">${slideNum}/${slideTotal}</text>`
}

function chip(text, y = 214) {
  const w = text.length * 17.5 + 64
  return `
    <rect x="90" y="${y}" rx="26" width="${w}" height="56" fill="${ACCENT}"/>
    <text x="${90 + w / 2}" y="${y + 38}" font-family="${FONT}" font-size="26" font-weight="800" letter-spacing="3" fill="#fff" text-anchor="middle">${esc(text)}</text>`
}

// headline lines: strings or {t, accent:true} mixed inside arrays of segments
function headline(lines, startY = 392, size = 82, lh = 102) {
  return lines.map((line, i) => {
    const segs = Array.isArray(line) ? line : [line]
    const tspans = segs.map(seg => {
      const t = typeof seg === 'string' ? seg : seg.t
      const fill = typeof seg === 'object' && seg.accent ? ACCENT : INK
      return `<tspan fill="${fill}">${esc(t)}</tspan>`
    }).join('')
    return `<text x="90" y="${startY + i * lh}" font-family="${FONT}" font-size="${size}" font-weight="800" xml:space="preserve">${tspans}</text>`
  }).join('')
}

function body(lines, startY, size = 40, lh = 58, color = SOFT) {
  return lines.map((l, i) =>
    `<text x="90" y="${startY + i * lh}" font-family="${FONT}" font-size="${size}" font-weight="600" fill="${color}">${esc(l)}</text>`
  ).join('')
}

function footer() {
  return `
    <rect x="90" y="962" width="900" height="2.5" fill="${SOFT}" fill-opacity=".22"/>
    <text x="90" y="1016" font-family="${FONT}" font-size="29" font-weight="700" fill="${SOFT}">@bloomjuniors</text>
    <text x="990" y="1016" font-family="${FONT}" font-size="29" font-weight="700" fill="${ACCENT}" text-anchor="end">bloomjuniors.com</text>`
}

function checkRow(y, text, ok = true) {
  const c = ok ? GREEN : RED
  const mark = ok
    ? `<path d="M -11 1 l 8 9 l 15 -19" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M -10 -10 l 20 20 M 10 -10 l -20 20" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`
  return `
    <rect x="90" y="${y}" rx="26" width="900" height="112" fill="#fff" stroke="${c}" stroke-opacity=".35" stroke-width="3"/>
    <g transform="translate(160,${y + 56})"><circle r="30" fill="${c}"/>${mark}</g>
    <text x="222" y="${y + 71}" font-family="${FONT}" font-size="41" font-weight="700" fill="${INK}">${esc(text)}</text>`
}

function pillRow(words, y) {
  let x = 90
  return words.map(w => {
    const wpx = w.length * 30 + 76
    const s = `
      <rect x="${x}" y="${y}" rx="34" width="${wpx}" height="96" fill="#fff" stroke="${AMBER}" stroke-width="3.5"/>
      <text x="${x + wpx / 2}" y="${y + 63}" font-family="${FONT}" font-size="48" font-weight="800" fill="${ACCENT}" text-anchor="middle">${esc(w)}</text>`
    x += wpx + 26
    return s
  }).join('')
}

function base(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <rect width="1080" height="1080" fill="${BG}"/>
    <circle cx="1040" cy="30" r="330" fill="${AMBER}" opacity="0.09"/>
    <circle cx="30" cy="1060" r="260" fill="${ACCENT}" opacity="0.06"/>
    ${flower(985, 885, 44, 0.5)}
    ${content}
  </svg>`
}

// ── Slide definitions ─────────────────────────────────────────────────────────
const slides = []

// POST 2 — pure sounds
slides.push(['post2-slide1', base(`
  ${header(1, 3)} ${chip('PHONICS TIP')}
  ${headline([[`It's `, { t: 'sss', accent: true }, `…`], [`not `, { t: 'suh', accent: true }, `.`]], 430, 108, 132)}
  ${body(['The #1 phonics mistake', 'parents make — and the 10-second fix.'], 680, 44, 62)}
  ${footer()}`)])

slides.push(['post2-slide2', base(`
  ${header(2, 3)} ${chip('WHY IT MATTERS')}
  ${headline([[`Added `, { t: `'uh'`, accent: true }, ` breaks`], ['blending.']], 380, 76, 96)}
  ${checkRow(560, 'sss + a + t   →   sat', true)}
  ${checkRow(704, 'suh + a + tuh   →   suhatuh', false)}
  ${body(['Keep every sound short and clean.'], 900, 40)}
  ${footer()}`)])

slides.push(['post2-slide3', base(`
  ${header(3, 3)} ${chip('TRY IT TONIGHT')}
  ${headline([['Short. Clean.'], [`No `, { t: `'uh'.`, accent: true }]], 400, 92, 112)}
  ${pillRow(['mmm', 'sss', 'fff'], 600)}
  ${body(['Say them with your child tonight —', 'that one habit makes blending click.'], 800, 42, 60)}
  ${footer()}`)])

// POST 5 — EYFS guide
slides.push(['post5-slide1', base(`
  ${header(1, 3)} ${chip('DUBAI PARENT GUIDE')}
  ${headline([['What is your child'], [{ t: 'actually', accent: true }, ' meant to'], ['learn in FS1 & FS2?']], 420, 84, 106)}
  ${body(['No jargon. Just the milestones that matter.'], 800, 42)}
  ${footer()}`)])

slides.push(['post5-slide2', base(`
  ${header(2, 3)} ${chip('BY THE END OF FS2')}
  ${checkRow(380, 'Recognise Phase 2 + 3 sounds', true)}
  ${checkRow(524, 'Blend CVC words — cat, ship', true)}
  ${checkRow(668, 'Count confidently to 20', true)}
  ${body(['(Number bonds come next, in Year 1)'], 870, 38)}
  ${footer()}`)])

slides.push(['post5-slide3', base(`
  ${header(3, 3)} ${chip('THE GOOD NEWS')}
  ${headline([[{ t: '10 minutes', accent: true }, ' a day'], ['of play is enough.']], 430, 92, 112)}
  ${body(['Repetition beats intensity —', 'every Reception teacher will tell you the same.'], 680, 42, 60)}
  ${footer()}`)])

// POST 8 — tricky words
slides.push(['post8-slide1', base(`
  ${header(1, 3)} ${chip('PHONICS TIP')}
  ${headline([[`Why can't `, { t: `'the'`, accent: true }], ['be sounded out?']], 430, 88, 110)}
  ${body(['And what to do instead of', `saying "just sound it out" one more time.`], 680, 42, 60)}
  ${footer()}`)])

slides.push(['post8-slide2', base(`
  ${header(2, 3)} ${chip('TRICKY WORDS')}
  ${headline([['Some words'], [{ t: 'break the rules.', accent: true }]], 390, 82, 102)}
  ${pillRow(['the', 'said', 'was'], 600)}
  ${pillRow(['you', 'they'], 724)}
  ${body(['Schools call them tricky or red words.'], 900, 40)}
  ${footer()}`)])

slides.push(['post8-slide3', base(`
  ${header(3, 3)} ${chip('DO THIS INSTEAD')}
  ${headline([[`Don't sound them out.`], [{ t: 'Spot them.', accent: true }]], 420, 84, 106)}
  ${body(['Play tricky-word hunt on cereal boxes,', 'signs and menus. Recognition, not decoding.'], 660, 42, 60)}
  ${footer()}`)])

// POST 11 — 10-minute routine
slides.push(['post11-slide1', base(`
  ${header(1, 3)} ${chip('AFTER-SCHOOL ROUTINE')}
  ${headline([[{ t: '10 minutes', accent: true }, ' a day'], ['beats an hour'], ['of worksheets.']], 410, 88, 108)}
  ${footer()}`)])

slides.push(['post11-slide2', base(`
  ${header(2, 3)} ${chip('THE ROUTINE')}
  ${checkRow(380, '3 min — one phonics game', true)}
  ${checkRow(524, '4 min — one maths game', true)}
  ${checkRow(668, '3 min — read anything together', true)}
  ${body(['Set a timer. Stop when it rings. Done.'], 870, 38)}
  ${footer()}`)])

slides.push(['post11-slide3', base(`
  ${header(3, 3)} ${chip('THE SECRET')}
  ${headline([[`It's not the minutes.`], [{ t: `It's the daily.`, accent: true }]], 430, 84, 106)}
  ${body(['Little and often rewires reading brains.', 'Consistency > intensity.'], 670, 42, 60)}
  ${footer()}`)])

// ── Render ────────────────────────────────────────────────────────────────────
console.log('\nGenerating Instagram carousel slides…\n')
for (const [name, svg] of slides) {
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${name}.png`))
  console.log(`  ✓  images/${name}.png`)
}
console.log(`\nDone — ${slides.length} slides at 1080×1080, ready to upload.\n`)
