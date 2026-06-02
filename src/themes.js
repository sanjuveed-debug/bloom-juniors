export const THEMES = {
  yaagvi: {
    name: 'Yaagvi',
    emoji: '⭐',
    primary:   '#F59E0B',
    secondary: '#FDE68A',
    accent:    '#EC4899',
    bg:        '#FFF7ED',
    card:      '#FFEDD5',
    text:      '#7C2D12',
    glow:      'rgba(245,158,11,0.5)',
    gradient:  'from-amber-400 via-pink-400 to-sky-400',
    particles: ['⭐','✨','🌈','🎨','📚','💫','🌟','🎵','💛','🎉'],
    cssVars: {
      '--theme-primary':   '#F59E0B',
      '--theme-secondary': '#FDE68A',
      '--theme-accent':    '#EC4899',
      '--theme-bg':        '#FFF7ED',
      '--theme-card':      '#FFEDD5',
      '--theme-text':      '#7C2D12',
      '--theme-glow':      'rgba(245,158,11,0.5)',
    }
  },
  bloom: {
    name: 'Bloom',
    emoji: '🐷',
    primary:   '#E91E8C',
    secondary: '#FF7DC0',
    accent:    '#FF6B00',
    bg:        '#FFF0F6',
    card:      '#FFD6EB',
    text:      '#7A003D',
    glow:      'rgba(233,30,140,0.5)',
    gradient:  'from-pink-500 via-rose-400 to-fuchsia-400',
    particles: ['🐷','💕','🌸','🎀','🐸','⭐','🦋','🌺','💝','🎊'],
    cssVars: {
      '--theme-primary':   '#E91E8C',
      '--theme-secondary': '#FF7DC0',
      '--theme-accent':    '#FF6B00',
      '--theme-bg':        '#FFF0F6',
      '--theme-card':      '#FFD6EB',
      '--theme-text':      '#7A003D',
      '--theme-glow':      'rgba(233,30,140,0.5)',
    }
  },
  rumi: {
    name: 'Star Explorer',
    emoji: '⭐',
    primary:   '#7C3AED',
    secondary: '#A78BFA',
    accent:    '#F59E0B',
    bg:        '#F5F3FF',
    card:      '#EDE9FE',
    text:      '#3B006B',
    glow:      'rgba(124,58,237,0.5)',
    particles: ['⭐','💜','🎤','✨','💫','🌙','🎵','🦄','🌟','🎶'],
    cssVars: {
      '--theme-primary':   '#7C3AED',
      '--theme-secondary': '#A78BFA',
      '--theme-accent':    '#F59E0B',
      '--theme-bg':        '#F5F3FF',
      '--theme-card':      '#EDE9FE',
      '--theme-text':      '#3B006B',
      '--theme-glow':      'rgba(124,58,237,0.5)',
    }
  },
  aurora: {
    name: 'Snow Explorer',
    emoji: '❄️',
    primary:   '#0284C7',
    secondary: '#38BDF8',
    accent:    '#A855F7',
    bg:        '#F0F9FF',
    card:      '#E0F2FE',
    text:      '#0C4A6E',
    glow:      'rgba(2,132,199,0.5)',
    particles: ['❄️','⛄','🌨️','💙','🔮','✨','🫧','🏔️','💎','🌬️'],
    cssVars: {
      '--theme-primary':   '#0284C7',
      '--theme-secondary': '#38BDF8',
      '--theme-accent':    '#A855F7',
      '--theme-bg':        '#F0F9FF',
      '--theme-card':      '#E0F2FE',
      '--theme-text':      '#0C4A6E',
      '--theme-glow':      'rgba(2,132,199,0.5)',
    }
  },
  marina: {
    name: 'Ocean Explorer',
    emoji: '🌊',
    primary:   '#059669',
    secondary: '#34D399',
    accent:    '#F97316',
    bg:        '#ECFDF5',
    card:      '#D1FAE5',
    text:      '#064E3B',
    glow:      'rgba(5,150,105,0.5)',
    particles: ['🌊','🐚','🌺','⛵','🐬','🌴','🦀','🐠','🌅','🏄'],
    cssVars: {
      '--theme-primary':   '#059669',
      '--theme-secondary': '#34D399',
      '--theme-accent':    '#F97316',
      '--theme-bg':        '#ECFDF5',
      '--theme-card':      '#D1FAE5',
      '--theme-text':      '#064E3B',
      '--theme-glow':      'rgba(5,150,105,0.5)',
    }
  }
}

export const applyTheme = (themeKey) => {
  const theme = THEMES[themeKey]
  if (!theme) return
  const root = document.documentElement
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
