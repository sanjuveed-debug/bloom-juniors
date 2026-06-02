export const ASSISTANTS = {
  yaagvi: {
    key: 'yaagvi',
    name: 'Yaagvi',
    title: 'Learning buddy',
    tagline: 'A cheerful mascot who guides every child through one clear learning adventure.',
    sample: 'I am here with you. Let us try one small step together.',
    focus: 'Friendly prompts, gentle encouragement, and a consistent face across every age group.',
    image: '/yaagvi-mascot-single.webp',
    imagePosition: 'center',
    emoji: '⭐',
  },
  bloom: {
    key: 'bloom',
    name: 'Bloom',
    title: 'Playful phonics guide',
    tagline: 'Keeps early practice light, warm, and easy to follow.',
    sample: 'We can take it one sound at a time.',
    focus: 'Short prompts and gentle encouragement for younger learners.',
    image: null,
    emoji: '🐷',
  },
  rumi: {
    key: 'rumi',
    name: 'Rumi',
    title: 'Calm confidence coach',
    tagline: 'Balances praise, focus, and a steady learning rhythm.',
    sample: 'Let us build confidence one small win at a time.',
    focus: 'Best for a calm, supportive pace across reading and maths.',
    image: '/rumi-avatar.png',
    emoji: '⭐',
  },
  aurora: {
    key: 'aurora',
    name: 'Snow',
    title: 'Clear step-by-step coach',
    tagline: 'Explains activities clearly and celebrates progress quickly.',
    sample: 'I will help you through each step, clearly and calmly.',
    focus: 'Great for children who like structure and visible progress.',
    image: null,
    emoji: '❄️',
  },
  marina: {
    key: 'marina',
    name: 'Marina',
    title: 'Adventure learning guide',
    tagline: 'Turns each lesson into a guided journey with momentum.',
    sample: 'We can explore one challenge at a time and keep moving.',
    focus: 'A strong fit for curious learners who like variety and movement.',
    image: null,
    emoji: '🌊',
  },
}

export function getAssistant(key) {
  return ASSISTANTS.yaagvi
}

export const MODULE_TITLES = {
  phonics: 'Sound Pop',
  math: 'Number World',
  tricky: 'Star Catch',
  story: 'Story Room',
  logic: 'Puzzle Quest',
  shop: 'Coin Shop',
  shapes: 'Shape World',
  davinci: 'Da Vinci Studio',
  anatomy: 'My Body',
  science: 'Wonder Lab',
  worldgk: 'World Explorer',
  exercise: 'Fun Exercise',
  planets: 'Planet World',
}
