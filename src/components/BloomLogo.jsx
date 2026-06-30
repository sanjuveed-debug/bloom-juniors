import React from 'react'

export default function BloomLogo({ size = 'md', className = '' }) {
  const scales = { sm: 0.75, md: 1, lg: 1.3 }
  const s = scales[size] || 1
  const h = Math.round(40 * s)
  const w = Math.round(168 * s)

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 168 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bloom Juniors"
      role="img"
    >
      <defs>
        <linearGradient id="bj-title" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Flower icon — 5 petals + centre */}
      <g transform="translate(18,20)">
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#FB923C" opacity="0.92" transform="rotate(0)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#FB7185" opacity="0.88" transform="rotate(72)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#F97316" opacity="0.92" transform="rotate(144)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#FB7185" opacity="0.88" transform="rotate(216)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#FB923C" opacity="0.92" transform="rotate(288)" />
        <circle cx="0" cy="0" r="6"   fill="#0F766E" />
        <circle cx="0" cy="0" r="3.5" fill="#FCD34D" />
      </g>

      {/* "Bloom" text */}
      <text
        x="36" y="27"
        fontFamily="'Fredoka One','Arial Rounded MT Bold','Arial Black',sans-serif"
        fontSize="24"
        fontWeight="400"
        fill="url(#bj-title)"
        letterSpacing="-0.5"
      >
        Bloom
      </text>

      {/* "Juniors" text */}
      <text
        x="38" y="37"
        fontFamily="'Nunito','Arial',sans-serif"
        fontSize="9"
        fontWeight="900"
        fill="#0F766E"
        letterSpacing="1.5"
      >
        JUNIORS
      </text>
    </svg>
  )
}
