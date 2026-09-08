function hashSeed(value = '') {
  return String(value).split('').reduce((hash, char) => ((hash * 33) ^ char.charCodeAt(0)) >>> 0, 2166136261)
}

function randomFrom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function shuffled(items, random) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function numberOptions(answer, random, spread = 4, count = 4) {
  const values = new Set([Math.max(0, answer)])
  while (values.size < count) {
    const direction = random() > .5 ? 1 : -1
    const offset = 1 + Math.floor(random() * spread)
    values.add(Math.max(0, answer + direction * offset))
  }
  return shuffled([...values].map(String), random)
}

const TODDLER_ICONS = ['⭐', '🍎', '🦋', '🐥', '🌸', '🎈']
const EARLY_WORDS = [
  { prompt: 'Which word begins with the sound “sh”?', answer: 'ship', options: ['ship', 'cat', 'moon', 'fish'], hint: 'Make the quiet sound: shhh.' },
  { prompt: 'Which word rhymes with “sun”?', answer: 'fun', options: ['fun', 'sit', 'map', 'red'], hint: 'Listen for the same ending sound.' },
  { prompt: 'Which word has the “ee” sound?', answer: 'tree', options: ['tree', 'top', 'train', 'tap'], hint: 'Stretch the middle sound.' },
  { prompt: 'Which is a shape with three sides?', answer: 'triangle', options: ['triangle', 'circle', 'square', 'oval'], hint: 'Count the sides in your mind.' },
]
const JUNIOR_KNOWLEDGE = [
  { prompt: 'Which planet is known as the Red Planet?', answer: 'Mars', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'], hint: 'Its surface contains rusty iron minerals.' },
  { prompt: 'Which word is an adjective?', answer: 'brilliant', options: ['brilliant', 'quickly', 'jumped', 'garden'], hint: 'An adjective describes a noun.' },
  { prompt: 'What is the capital of France?', answer: 'Paris', options: ['Paris', 'Rome', 'Madrid', 'Lisbon'], hint: 'Think of the Eiffel Tower.' },
  { prompt: 'Which force pulls objects towards Earth?', answer: 'gravity', options: ['gravity', 'friction', 'magnetism', 'electricity'], hint: 'It keeps your feet on the ground.' },
  { prompt: 'Which fraction is equal to one half?', answer: '3/6', options: ['3/6', '2/6', '4/6', '5/6'], hint: 'The numerator must be half the denominator.' },
]

function toddlerQuestion(index, level, random) {
  const max = Math.min(9, 4 + level + Math.floor(index / 2))
  const answer = 1 + Math.floor(random() * max)
  const icon = TODDLER_ICONS[Math.floor(random() * TODDLER_ICONS.length)]
  return {
    id: `count-${index}-${answer}-${icon}`,
    category: 'Picture counting',
    prompt: 'How many can you see?',
    visual: Array.from({ length: answer }, () => icon).join(' '),
    answer: String(answer),
    options: numberOptions(answer, random, 3, 3),
    hint: 'Point to each picture once while you count.',
  }
}

function earlyQuestion(index, level, random) {
  if (index === 1 || index === 4) {
    const word = EARLY_WORDS[(level + index + Math.floor(random() * EARLY_WORDS.length)) % EARLY_WORDS.length]
    return { id: `word-${index}-${word.answer}`, category: 'Word spotlight', ...word, options: shuffled(word.options, random) }
  }
  const range = Math.min(30, 8 + level * 3 + index * 2)
  const left = 1 + Math.floor(random() * range)
  const subtract = index >= 2 && random() > .55
  const right = 1 + Math.floor(random() * (subtract ? left : Math.max(2, Math.min(10, range - left + 1))))
  const answer = subtract ? left - right : left + right
  return {
    id: `math-${index}-${left}-${subtract ? 'minus' : 'plus'}-${right}`,
    category: index < 2 ? 'Warm-up numbers' : 'Number challenge',
    prompt: `What is ${left} ${subtract ? '−' : '+'} ${right}?`,
    visual: index < 2 ? '🔢 ✨' : '',
    answer: String(answer),
    options: numberOptions(answer, random, Math.max(3, level + 3)),
    hint: subtract ? 'Start with the first number and count backwards.' : 'Start with the bigger number and count on.',
  }
}

function juniorQuestion(index, level, random) {
  if (index === 2 || index === 5) {
    const item = JUNIOR_KNOWLEDGE[(level + index + Math.floor(random() * JUNIOR_KNOWLEDGE.length)) % JUNIOR_KNOWLEDGE.length]
    return { id: `knowledge-${index}-${item.answer}`, category: 'Knowledge spotlight', ...item, options: shuffled(item.options, random) }
  }
  const table = Math.min(12, 2 + level + Math.floor(random() * (4 + index)))
  const multiplier = 2 + Math.floor(random() * Math.min(11, 4 + level + index))
  const division = index >= 3 && random() > .58
  const answer = division ? multiplier : table * multiplier
  return {
    id: `fluency-${index}-${table}-${multiplier}-${division ? 'divide' : 'multiply'}`,
    category: index < 2 ? 'Fast start' : 'Power question',
    prompt: division ? `What is ${table * multiplier} ÷ ${table}?` : `What is ${table} × ${multiplier}?`,
    answer: String(answer),
    options: numberOptions(answer, random, Math.max(5, table)),
    hint: division ? `How many groups of ${table} fit exactly?` : `Build ${multiplier} groups of ${table}.`,
  }
}

export function createBloomQuiz(ageGroup = 'early', { played = 0, seed = new Date().toISOString().slice(0, 10) } = {}) {
  const normalizedAge = ageGroup === 'toddler' || ageGroup === 'junior' ? ageGroup : 'early'
  const level = Math.max(1, Math.min(8, 1 + Math.floor((Number(played) || 0) / 2)))
  const total = normalizedAge === 'toddler' ? 5 : 7
  const random = randomFrom(hashSeed(`${normalizedAge}:${seed}:${played}`))
  const factory = normalizedAge === 'toddler' ? toddlerQuestion : normalizedAge === 'junior' ? juniorQuestion : earlyQuestion
  return Array.from({ length: total }, (_, index) => factory(index, level, random)).map(question => ({
    ...question,
    options: [...new Set(question.options.map(String))],
    answer: String(question.answer),
  }))
}

export function getBloomQuizPrize(correct, total, ageGroup = 'early') {
  const safeTotal = Math.max(1, Number(total) || 1)
  const safeCorrect = Math.max(0, Math.min(safeTotal, Number(correct) || 0))
  const ratio = safeCorrect / safeTotal
  const stars = ratio >= .85 ? 5 : ratio >= .65 ? 4 : ratio >= .4 ? 3 : 2
  const title = ratio >= .85 ? 'Golden Spotlight Chest' : ratio >= .65 ? 'Silver Spotlight Chest' : 'Brave Contestant Chest'
  const message = ageGroup === 'toddler' ? 'A happy prize for brave thinking!' : `${safeCorrect} clues powered this prize.`
  return { stars, title, message }
}
