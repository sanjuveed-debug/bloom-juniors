import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('./public/bloom-icon.svg')

const sizes = [
  { file: 'bm-icon-64.png',            size: 64  },
  { file: 'bm-icon-192.png',           size: 192 },
  { file: 'bm-icon-512.png',           size: 512 },
  { file: 'bm-maskable-512.png',       size: 512 },
  { file: 'bm-apple-touch-icon.png',   size: 180 },
  { file: 'bm-apple-touch-icon-180.png', size: 180 },
  { file: 'apple-touch-icon.png',      size: 180 },
  { file: 'apple-touch-icon-180x180.png', size: 180 },
  { file: 'pwa-64x64.png',             size: 64  },
  { file: 'pwa-192x192.png',           size: 192 },
  { file: 'pwa-512x512.png',           size: 512 },
  { file: 'maskable-icon-512x512.png', size: 512 },
]

for (const { file, size } of sizes) {
  await sharp(svg, { density: Math.ceil(size * 2.5) })
    .resize(size, size)
    .png()
    .toFile(`./public/${file}`)
  console.log(`✓ ${file}`)
}
console.log('All icons generated.')
