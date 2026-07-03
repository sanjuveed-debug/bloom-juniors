/**
 * Generates all Bloom Juniors PWA icons from an SVG using sharp.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dir, '..', 'public')

// ── New warm-palette Bloom Juniors icon SVG ───────────────────────────────────
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <!-- Warm orange background gradient -->
    <radialGradient id="bg" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#B45309"/>
    </radialGradient>
    <!-- Golden petal gradient -->
    <radialGradient id="petalA" cx="50%" cy="10%" r="90%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="55%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#D97706"/>
    </radialGradient>
    <!-- Slightly warmer petal variant -->
    <radialGradient id="petalB" cx="50%" cy="10%" r="90%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="55%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#B45309"/>
    </radialGradient>
    <!-- Cream centre -->
    <radialGradient id="centre" cx="38%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="60%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#7C2D12" flood-opacity="0.35"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Warm background -->
  <rect width="512" height="512" rx="115" fill="url(#bg)"/>

  <!-- Subtle inner stroke -->
  <rect x="14" y="14" width="484" height="484" rx="102" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2.5"/>

  <!-- 8 outer petals -->
  <g transform="translate(256,256)" filter="url(#shadow)">
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalA)" opacity="0.97" transform="rotate(0)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalB)" opacity="0.92" transform="rotate(45)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalA)" opacity="0.97" transform="rotate(90)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalB)" opacity="0.92" transform="rotate(135)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalA)" opacity="0.97" transform="rotate(180)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalB)" opacity="0.92" transform="rotate(225)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalA)" opacity="0.97" transform="rotate(270)"/>
    <ellipse cx="0" cy="-118" rx="40" ry="80" fill="url(#petalB)" opacity="0.92" transform="rotate(315)"/>
  </g>

  <!-- 8 inner petals (offset 22.5°, shorter) -->
  <g transform="translate(256,256)">
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FEF3C7" opacity="0.78" transform="rotate(22.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FDE68A" opacity="0.78" transform="rotate(67.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FEF3C7" opacity="0.78" transform="rotate(112.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FDE68A" opacity="0.78" transform="rotate(157.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FEF3C7" opacity="0.78" transform="rotate(202.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FDE68A" opacity="0.78" transform="rotate(247.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FEF3C7" opacity="0.78" transform="rotate(292.5)"/>
    <ellipse cx="0" cy="-82" rx="26" ry="52" fill="#FDE68A" opacity="0.78" transform="rotate(337.5)"/>
  </g>

  <!-- Centre circle -->
  <circle cx="256" cy="256" r="66" fill="url(#centre)" filter="url(#glow)"/>
  <!-- Centre highlight -->
  <circle cx="240" cy="240" r="20" fill="rgba(255,255,255,0.45)"/>
  <!-- Warm brown centre dot -->
  <circle cx="256" cy="256" r="11" fill="#92400E" opacity="0.55"/>

  <!-- Sparkles (white-gold) -->
  <path d="M398 98 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6z" fill="#FEF3C7" opacity="0.95"/>
  <path d="M115 388 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" fill="#FDE68A" opacity="0.80"/>
  <path d="M415 365 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#FEF3C7" opacity="0.70"/>
</svg>`

const SVG_BUF = Buffer.from(SVG)

async function exportPng(destFile, size, background = undefined) {
  let img = sharp(SVG_BUF).resize(size, size)
  if (background) img = img.flatten({ background })
  await img.png().toFile(join(PUBLIC, destFile))
  console.log(`  ✓  ${destFile}  (${size}×${size})`)
}

console.log('\nGenerating Bloom Juniors warm-palette icons…\n')

await exportPng('bm-icon-192.png',              192)
await exportPng('bm-icon-512.png',              512)
await exportPng('bm-maskable-512.png',          512)   // same design works as maskable (safe-zone centred)
await exportPng('bm-apple-touch-icon.png',      180)
await exportPng('bm-apple-touch-icon-180.png',  180)
await exportPng('apple-touch-icon.png',         180)
await exportPng('apple-touch-icon-180x180.png', 180)
await exportPng('pwa-192x192.png',              192)
await exportPng('pwa-512x512.png',              512)
await exportPng('pwa-64x64.png',                 64)

// Write the updated SVG source too
writeFileSync(join(PUBLIC, 'bloom-icon.svg'), SVG)
console.log('  ✓  bloom-icon.svg  (source)\n')
console.log('Done. Commit the public/ folder and push to deploy.\n')
