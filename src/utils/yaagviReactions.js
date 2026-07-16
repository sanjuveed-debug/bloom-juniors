const REACTIONS = {
  ready: {
    state: 'wave',
    speech: 'Pick a number adventure. I will play with you!',
    duration: 3600,
  },
  start: {
    state: 'wave',
    speech: 'Let\'s solve it together!',
    duration: 2600,
  },
  listen: {
    state: 'read',
    speech: 'I am listening too. Tap the sound, then find its word!',
    duration: 4200,
  },
  blend: {
    state: 'point',
    speech: 'Tap the sounds in order, then squash them together!',
    duration: 4200,
  },
  shape: {
    state: 'point',
    speech: 'Let\'s discover what this shape can do!',
    duration: 3600,
  },
  build: {
    state: 'point',
    speech: 'Choose flat, steady shapes for the tower base.',
    duration: 4200,
  },
  question: {
    state: 'idle',
    speech: null,
    duration: 0,
  },
  correct: {
    state: 'clap',
    speech: 'You found it!',
    duration: 2200,
  },
  streak: {
    state: 'celebrate',
    speech: 'Wow! Your number power is growing!',
    duration: 2800,
  },
  wrong: {
    state: 'think',
    speech: 'Good try. Let\'s look once more.',
    duration: 3000,
  },
  hint: {
    state: 'point',
    speech: 'Follow my clue, then try again.',
    duration: 4200,
  },
  inactive: {
    state: 'point',
    speech: 'Tap an answer when you\'re ready!',
    duration: 4200,
  },
  complete: {
    state: 'dance',
    speech: 'You did it! Treasure time!',
    duration: 0,
  },
}

/**
 * Converts a learning event into a visual Yaagvi reaction. Keeping this pure
 * makes reactions consistent across games and easy to test.
 */
export function getYaagviReaction(event, context = {}) {
  if (event === 'correct' && (context.streak >= 3 || context.isFinal)) {
    return { ...REACTIONS.streak }
  }

  if (event === 'wrong' && context.attempt >= 2) {
    return { ...REACTIONS.hint }
  }

  return { ...(REACTIONS[event] || REACTIONS.question) }
}

export const YAAGVI_REACTION_EVENTS = Object.freeze(Object.keys(REACTIONS))
