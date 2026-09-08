const TODDLER_COPY = {
  'leaves-green-v1': {
    question: 'Why are so many leaves green?',
    story: 'Sunlight touches a leaf. A green helper inside catches some colours and sends green light back to our eyes.',
    explanation: 'The green helper is called chlorophyll. It helps the plant use sunlight, and the green light bounces back for us to see.',
    offline: 'Find two leaves with a grown-up. Point to every colour you can see. Do not pick a leaf unless your grown-up says it is okay.',
    predictions: [
      { id: 'reflects', label: 'Green light bounces back', symbol: '↗' },
      { id: 'painted', label: 'The leaf is painted green', symbol: '🎨' },
    ],
  },
  'sunset-red-v1': {
    question: 'Why does the sunset look orange?',
    story: 'When the Sun is low, its light has a longer trip through the air. Blue light spreads around and warm colours keep coming to us.',
    explanation: 'The Sun did not change colour. Its light travelled through more air, so we saw more red and orange.',
    offline: 'With a grown-up, watch the sky colours change. Never look straight at the Sun.',
    predictions: [
      { id: 'air', label: 'The light travels through more air', symbol: '↗' },
      { id: 'painted', label: 'The clouds paint the Sun', symbol: '🎨' },
    ],
  },
  'bridge-strong-v1': {
    question: 'What helps a bridge stay strong?',
    story: 'Cars push down on a bridge. Triangles, arches, and long beams share that push so one little spot does not carry everything.',
    explanation: 'Strong shapes help spread a push through the bridge and down to the ground.',
    offline: 'Lay paper between two books. Fold another paper into ridges. Ask a grown-up to help you test which one holds more blocks.',
    predictions: [
      { id: 'shape', label: 'Strong shapes help', symbol: '🔺' },
      { id: 'colour', label: 'The bridge colour helps', symbol: '🎨' },
    ],
  },
  'family-story-time-v1': {
    question: 'How can we keep a family story?',
    story: 'A grown-up remembers something from long ago. They can tell it, draw it, write it, or record their voice so a child can remember too.',
    explanation: 'Stories, pictures, recipes, and voices help family memories travel from one person to another.',
    offline: 'Ask a grown-up about a game, food, or song they loved as a child. Draw one thing you heard.',
    predictions: [
      { id: 'people', label: 'People tell and record it', symbol: '🗣️' },
      { id: 'hides', label: 'The story hides by itself', symbol: '🙈' },
    ],
  },
  'maps-choices-v1': {
    question: 'How does a map help us?',
    story: 'A map uses lines, pictures, and arrows to show a place. A road map and a train map show different clues because they have different jobs.',
    explanation: 'Map makers choose the clues we need. No small map can show everything.',
    offline: 'Draw a tiny map from your bed to the front door. Add one picture to help someone follow it.',
    predictions: [
      { id: 'purpose', label: 'It shows helpful clues', symbol: '🎯' },
      { id: 'decoration', label: 'It is only a pretty picture', symbol: '🖼️' },
    ],
  },
  'languages-words-v1': {
    question: 'Why do people use different words?',
    story: 'Families and communities make and share words over a very long time. Words help people share ideas, jokes, songs, and love.',
    explanation: 'Every language belongs to people. Different words are different ways people learned to communicate together.',
    offline: 'Ask someone you know to teach you one friendly greeting in a language they use.',
    predictions: [
      { id: 'communities', label: 'People made words together', symbol: '👥' },
      { id: 'mistake', label: 'Different words are mistakes', symbol: '✕' },
    ],
  },
  'fair-rules-v1': {
    question: 'Does fair always mean the same?',
    story: 'Two children want to reach a shelf. One can reach and one needs a step. Giving help where it is needed can be fair.',
    explanation: 'Fair can mean listening and helping each person get a fair chance, even when the help is not exactly the same.',
    offline: 'Choose one little family job. Talk about a fair way everyone can help.',
    predictions: [
      { id: 'needs', label: 'Fair can mean different help', symbol: '🤝' },
      { id: 'same', label: 'Fair must always be the same', symbol: '=' },
    ],
  },
  'money-journey-v1': {
    question: 'Where does money go at a shop?',
    story: 'A family buys bread. The shop pays the baker, and the baker buys flour. Money moves as people make, carry, and sell things.',
    explanation: 'Money does not vanish at the shop. It can move to workers and businesses that helped make what we bought.',
    offline: 'Pick one thing at home. Ask a grown-up who may have helped make it and bring it to you.',
    predictions: [
      { id: 'moves', label: 'It moves to other people', symbol: '🔄' },
      { id: 'vanish', label: 'It disappears', symbol: '✨' },
    ],
  },
}

export function getAgeFoundationLesson(lesson, ageGroup = 'early') {
  if (!lesson) return lesson
  if (ageGroup === 'junior') {
    return {
      ...lesson,
      activityPrompt: `Evidence check: ${lesson.activityPrompt}`,
      modeLabel: 'Evidence mission',
    }
  }
  if (ageGroup !== 'toddler') return { ...lesson, modeLabel: 'Foundation adventure' }
  const copy = TODDLER_COPY[lesson.id] || lesson.toddler || {}
  return {
    ...lesson,
    ...copy,
    shortQuestion: copy.question || lesson.shortQuestion,
    activityPrompt: 'Tap each picture and find the connection',
    parentQuestion: lesson.parentQuestion,
    modeLabel: 'Little wonder',
  }
}
