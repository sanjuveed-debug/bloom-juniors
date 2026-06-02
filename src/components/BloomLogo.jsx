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
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
      </defs>

      {/* Flower icon — 5 petals + centre */}
      <g transform="translate(18,20)">
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#C084FC" opacity="0.92" transform="rotate(0)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#A855F7" opacity="0.88" transform="rotate(72)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#9333EA" opacity="0.92" transform="rotate(144)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#A855F7" opacity="0.88" transform="rotate(216)" />
        <ellipse cx="0" cy="-10" rx="4.5" ry="7.5" fill="#C084FC" opacity="0.92" transform="rotate(288)" />
        <circle cx="0" cy="0" r="6"   fill="#F59E0B" />
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
        fill="#C084FC"
        letterSpacing="1.5"
      >
        JUNIORS
      </text>
    </svg>
  )
}
