const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const W = 1200, H = 630

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0B0B2E"/>
      <stop offset="50%"  stop-color="#2D0A6B"/>
      <stop offset="100%" stop-color="#0B0B2E"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E9D5FF"/>
    </linearGradient>
    <radialGradient id="glow1" cx="75%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="85%" r="35%">
      <stop offset="0%" stop-color="#9333EA" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#9333EA" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Decorative dots (star field) -->
  <circle cx="980" cy="55"  r="2.5" fill="white" opacity="0.5"/>
  <circle cx="1060" cy="120" r="1.8" fill="white" opacity="0.35"/>
  <circle cx="1120" cy="80"  r="3"   fill="white" opacity="0.45"/>
  <circle cx="1150" cy="200" r="2"   fill="white" opacity="0.3"/>
  <circle cx="50"  cy="90"  r="2"   fill="white" opacity="0.4"/>
  <circle cx="120" cy="40"  r="3"   fill="white" opacity="0.3"/>
  <circle cx="200" cy="590" r="2.5" fill="white" opacity="0.4"/>
  <circle cx="80"  cy="560" r="2"   fill="white" opacity="0.3"/>

  <!-- Right-side mascot area (large emoji stand-in) -->
  <circle cx="920" cy="310" r="200" fill="#7C3AED" opacity="0.12"/>
  <circle cx="920" cy="310" r="155" fill="#9333EA" opacity="0.1"/>
  <text x="920" y="400" text-anchor="middle" font-size="220">🦉</text>

  <!-- Left: Brand block -->
  <!-- Flower icon (5 petals) -->
  <g transform="translate(96,92)">
    <ellipse cx="0"  cy="-22" rx="10" ry="17" fill="#C084FC" opacity="0.9" transform="rotate(0)"/>
    <ellipse cx="0"  cy="-22" rx="10" ry="17" fill="#A855F7" opacity="0.85" transform="rotate(72)"/>
    <ellipse cx="0"  cy="-22" rx="10" ry="17" fill="#9333EA" opacity="0.9" transform="rotate(144)"/>
    <ellipse cx="0"  cy="-22" rx="10" ry="17" fill="#A855F7" opacity="0.85" transform="rotate(216)"/>
    <ellipse cx="0"  cy="-22" rx="10" ry="17" fill="#C084FC" opacity="0.9" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="13" fill="#F59E0B"/>
    <circle cx="0" cy="0" r="8"  fill="#FCD34D"/>
  </g>

  <!-- "Bloom" -->
  <text x="136" y="148"
    font-family="'Fredoka One','Arial Rounded MT Bold','Arial Black',sans-serif"
    font-size="82" font-weight="400" fill="url(#titleGrad)" letter-spacing="-1">Bloom</text>

  <!-- "Juniors" -->
  <text x="140" y="212"
    font-family="'Fredoka One','Arial Rounded MT Bold','Arial Black',sans-serif"
    font-size="52" fill="#C084FC" letter-spacing="2">JUNIORS</text>

  <!-- Divider bar -->
  <rect x="96" y="232" width="72" height="5" rx="3" fill="#F59E0B"/>

  <!-- Tagline -->
  <text x="96" y="288"
    font-family="'Nunito','Arial',sans-serif"
    font-size="30" font-weight="700" fill="rgba(255,255,255,0.82)">British Learning App · Ages 3–9</text>

  <!-- Subject pills row 1 -->
  <rect x="96"  y="318" width="155" height="48" rx="24" fill="rgba(147,51,234,0.38)" stroke="rgba(196,132,252,0.5)" stroke-width="1.5"/>
  <text x="174" y="349" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="20" font-weight="800" fill="white">🎤 Phonics</text>

  <rect x="263" y="318" width="140" height="48" rx="24" fill="rgba(147,51,234,0.38)" stroke="rgba(196,132,252,0.5)" stroke-width="1.5"/>
  <text x="333" y="349" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="20" font-weight="800" fill="white">🔢 Maths</text>

  <rect x="415" y="318" width="158" height="48" rx="24" fill="rgba(147,51,234,0.38)" stroke="rgba(196,132,252,0.5)" stroke-width="1.5"/>
  <text x="494" y="349" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="20" font-weight="800" fill="white">🔬 Science</text>

  <rect x="585" y="318" width="155" height="48" rx="24" fill="rgba(147,51,234,0.38)" stroke="rgba(196,132,252,0.5)" stroke-width="1.5"/>
  <text x="663" y="349" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="20" font-weight="800" fill="white">📖 Stories</text>

  <!-- Badges row 2 -->
  <rect x="96" y="386" width="108" height="44" rx="22" fill="#F59E0B"/>
  <text x="150" y="415" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="18" font-weight="900" fill="white">✓ Free</text>

  <rect x="216" y="386" width="210" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
  <text x="321" y="415" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="18" font-weight="800" fill="rgba(255,255,255,0.85)">EYFS &amp; KS1 Aligned</text>

  <rect x="438" y="386" width="195" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
  <text x="535" y="415" text-anchor="middle" font-family="'Nunito','Arial',sans-serif" font-size="18" font-weight="800" fill="rgba(255,255,255,0.85)">No app store needed</text>

  <!-- Age group row -->
  <text x="96" y="472" font-family="'Nunito','Arial',sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.6)">Ages 3–4 · 4–6 · 7–9 · Separate profiles per child</text>

  <!-- Bottom URL -->
  <rect x="0" y="${H - 64}" width="${W}" height="64" fill="rgba(0,0,0,0.3)"/>
  <text x="96" y="${H - 22}"
    font-family="'Nunito','Arial',sans-serif"
    font-size="22" font-weight="700" fill="rgba(255,255,255,0.45)" letter-spacing="1">bloomjuniors.com</text>

  <!-- Right side URL complement -->
  <text x="${W - 96}" y="${H - 22}" text-anchor="end"
    font-family="'Nunito','Arial',sans-serif"
    font-size="22" font-weight="700" fill="rgba(255,255,255,0.45)">Free · British · Safe</text>
</svg>`

;(async () => {
  const dest = path.join(__dirname, 'public', 'og-preview.png')
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dest)
  const size = (fs.statSync(dest).size / 1024).toFixed(1)
  console.log(`✓  og-preview.png  ${size} KB  →  public/og-preview.png`)
})().catch(err => { console.error(err); process.exit(1) })
