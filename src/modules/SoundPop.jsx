import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'
import SkillHint, { getHint } from '../components/SkillHint'
import BuddyCompanion, { useBuddyMood } from '../components/BuddyCompanion'
import { buildSoundPopCompletion } from '../utils/moduleScoring'

// ── RWI-aligned phonics sound bank ────────────────────────────────────────────
// Set 1 Special Friends : sh  th  ch  qu  ng  nk
// Set 2 Vowel Sounds    : ay  ee  igh ow  oo  ar  or  air ir  ou  oy
// Set 3 Vowel Sounds    : ea  oi  ai  oa  aw  ur  er
//
// `similar` lists graphemes that make the SAME phoneme — never used as distractors
// for each other so kids aren't penalised for near-correct answers.
const SOUND_BANK = {

  // ── Set 1 Special Friends ──────────────────────────────────────────────
  sh: {
    set: 1, setLabel: 'Special Friend',
    emoji: '🐑',
    description: 'as in SHIP',
    similar: [],
    words: [
      'ship', 'shop', 'shed', 'shin', 'shelf', 'shell', 'shark', 'sheep',
      'sheet', 'shine', 'shoe', 'shoot', 'shore', 'shut',
      'fish', 'dish', 'wish', 'cash', 'rush', 'bush', 'push',
      'flash', 'fresh', 'crush', 'brush', 'dash', 'smash',
    ],
  },

  th: {
    set: 1, setLabel: 'Special Friend',
    emoji: '👍',
    description: 'as in THINK',
    similar: [],
    words: [
      'thin', 'thick', 'thumb', 'bath', 'moth',
      'path', 'cloth', 'tooth', 'thing', 'thorn',
      'thud', 'thump', 'tenth', 'width', 'thrust',
    ],
  },

  ch: {
    set: 1, setLabel: 'Special Friend',
    emoji: '🎵',
    description: 'as in CHIP',
    similar: [],
    words: [
      'chip', 'chat', 'chop', 'chin', 'chest', 'cheek', 'chain', 'chair',
      'cheese', 'chalk', 'chase', 'check', 'chew', 'child',
      'catch', 'match', 'watch', 'bench', 'bunch', 'rich', 'lunch', 'punch',
    ],
  },

  qu: {
    set: 1, setLabel: 'Special Friend',
    emoji: '👸',
    description: 'as in QUEEN',
    similar: [],
    words: [
      'queen', 'quick', 'quit', 'quiz', 'quack', 'quest',
      'quite', 'quiet', 'quill', 'quilt', 'quarter',
      'squeak', 'squash', 'squeeze',
    ],
  },

  ng: {
    set: 1, setLabel: 'Special Friend',
    emoji: '👑',
    description: 'as in RING',
    similar: ['nk'],
    words: [
      'ring', 'sing', 'king', 'wing', 'song', 'long', 'bang', 'hang',
      'rang', 'lung', 'hung', 'sang', 'rung', 'gong',
      'bring', 'sting', 'swing', 'cling', 'fling',
      'strong', 'string', 'spring', 'young', 'wrong',
    ],
  },

  nk: {
    set: 1, setLabel: 'Special Friend',
    emoji: '🦨',
    description: 'as in SINK',
    similar: ['ng'],
    words: [
      'sink', 'pink', 'link', 'rink', 'wink', 'drink', 'blink',
      'trunk', 'dunk', 'junk', 'bunk', 'sunk', 'skunk',
      'rank', 'bank', 'tank', 'sank', 'plank', 'blank',
    ],
  },

  // ── Set 2 Vowel Sounds ─────────────────────────────────────────────────
  ay: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🌞',
    description: 'as in PLAY',
    similar: ['ai'],
    words: [
      'play', 'day', 'say', 'way', 'pay', 'may', 'lay', 'ray', 'bay',
      'clay', 'pray', 'stay', 'stray', 'spray', 'tray', 'sway',
      'away', 'today', 'okay', 'hurray',
    ],
  },

  ee: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🌳',
    description: 'as in TREE',
    similar: ['ea'],
    words: [
      'tree', 'bee', 'see', 'free', 'feet', 'seed', 'meet', 'need',
      'keep', 'deep', 'sleep', 'speed', 'peel', 'feel', 'heel',
      'week', 'peek', 'deer', 'sweet', 'seen', 'green',
      'steep', 'tweet',
    ],
  },

  igh: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '💡',
    description: 'as in LIGHT',
    similar: [],
    words: [
      'light', 'night', 'right', 'fight', 'bright', 'might', 'tight',
      'sight', 'flight', 'slight', 'knight', 'high', 'sigh',
      'midnight', 'daylight', 'delight',
    ],
  },

  ow: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '☁️',
    description: 'as in SNOW',
    similar: ['oa'],
    words: [
      'snow', 'blow', 'flow', 'glow', 'grow', 'show', 'slow', 'throw',
      'low', 'row', 'know', 'own', 'bowl', 'crow',
      'elbow', 'below', 'window', 'yellow', 'pillow', 'hollow',
    ],
  },

  oo: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🌙',
    description: 'as in MOON',
    similar: ['ew', 'u-e'],
    words: [
      'moon', 'pool', 'food', 'boot', 'zoo', 'cool', 'fool', 'tool',
      'roof', 'root', 'loop', 'noon', 'boom', 'room', 'zoom', 'bloom',
      'broom', 'tooth', 'goose', 'moose', 'spoon', 'soon',
      'stool', 'school', 'hoop', 'troop',
    ],
  },

  oo_book: {
    set: 2, setLabel: 'Vowel Sound',
    display: 'oo',
    emoji: '📚',
    description: 'as in BOOK',
    similar: [],
    words: [
      'book', 'look', 'took', 'cook', 'hook', 'shook', 'foot', 'good',
      'wood', 'wool', 'hood', 'stood', 'brook', 'crook',
    ],
  },

  ar: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🚗',
    description: 'as in CAR',
    similar: [],
    words: [
      'car', 'bar', 'tar', 'far', 'jar', 'star', 'dark', 'park', 'farm',
      'arm', 'art', 'cart', 'part', 'chart', 'hard', 'yard',
      'card', 'start', 'shark', 'spark', 'scarf',
      'march', 'large', 'party',
    ],
  },

  or: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🚪',
    description: 'as in DOOR',
    similar: ['aw'],
    words: [
      'door', 'floor', 'store', 'shore', 'more', 'core', 'wore',
      'horn', 'corn', 'born', 'torn', 'fort', 'port', 'sort',
      'cord', 'fork', 'pork', 'storm', 'short', 'sport',
      'horse', 'north', 'torch',
    ],
  },

  air: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🌬️',
    description: 'as in CHAIR',
    similar: [],
    words: [
      'air', 'hair', 'fair', 'pair', 'stair', 'chair', 'flair',
      'lair', 'repair', 'affair', 'unfair', 'midair',
      'aircraft', 'airline',
    ],
  },

  ir: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🐦',
    description: 'as in BIRD',
    similar: ['ur', 'er'],
    words: [
      'bird', 'girl', 'stir', 'sir', 'firm', 'first', 'third', 'dirt',
      'shirt', 'birth', 'circle', 'circus', 'twirl', 'swirl', 'squirt',
    ],
  },

  ou: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '📢',
    description: 'as in SHOUT',
    similar: [],
    words: [
      'shout', 'out', 'loud', 'found', 'round', 'sound', 'ground', 'mouth',
      'south', 'count', 'cloud', 'proud', 'about',
      'house', 'mouse', 'couch', 'pouch', 'ouch',
      'doubt', 'trout', 'sprout', 'snout',
    ],
  },

  oy: {
    set: 2, setLabel: 'Vowel Sound',
    emoji: '🧸',
    description: 'as in TOY',
    similar: ['oi'],
    words: [
      'toy', 'boy', 'joy', 'soy', 'coy', 'ploy', 'enjoy', 'annoy',
      'destroy', 'royal', 'loyal', 'voyage', 'oyster',
      'employ', 'decoy', 'convoy', 'alloy',
    ],
  },

  // ── Set 3 Vowel Sounds ─────────────────────────────────────────────────
  ea: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '☕',
    description: 'as in TEA',
    similar: ['ee'],
    words: [
      'tea', 'sea', 'pea', 'read', 'bead', 'deal', 'heal',
      'meal', 'seal', 'beat', 'heat', 'meat', 'neat', 'seat',
      'team', 'cream', 'dream', 'stream', 'beach', 'reach',
      'peach', 'leaf', 'bean', 'lean', 'mean', 'clean',
    ],
  },

  oi: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🪙',
    description: 'as in COIN',
    similar: ['oy'],
    words: [
      'coin', 'foil', 'coil', 'soil', 'oil', 'boil', 'toil', 'join',
      'joint', 'point', 'moist', 'noise', 'voice', 'choice', 'avoid',
    ],
  },

  ai: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🚂',
    description: 'as in RAIN',
    similar: ['ay'],
    words: [
      'rain', 'tail', 'nail', 'sail', 'mail', 'main', 'pain', 'brain',
      'drain', 'grain', 'plain', 'stain', 'train', 'bait', 'wait', 'paid',
      'aim', 'waist', 'snail', 'trail',
      'fail', 'hail', 'paint', 'strain',
    ],
  },

  oa: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🚣',
    description: 'as in BOAT',
    similar: ['ow', 'o-e'],
    words: [
      'boat', 'coat', 'road', 'toad', 'foam', 'load', 'coal', 'loaf',
      'loan', 'moan', 'oak', 'oat', 'soap', 'goat', 'moat', 'toast',
      'boast', 'coast', 'roast', 'float', 'groan', 'throat',
    ],
  },

  aw: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🦁',
    description: 'as in CLAW',
    similar: ['or'],
    words: [
      'claw', 'draw', 'jaw', 'law', 'raw', 'saw', 'paw', 'thaw',
      'straw', 'crawl', 'yawn', 'dawn', 'fawn', 'drawn', 'awful',
      'hawk', 'shawl', 'squawk', 'sprawl', 'gnaw',
    ],
  },

  ur: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '👩‍⚕️',
    description: 'as in NURSE',
    similar: ['ir', 'er'],
    words: [
      'nurse', 'purse', 'fur', 'burn', 'turn', 'hurt', 'curl',
      'burst', 'curve', 'surf', 'turf', 'turkey', 'purple', 'turtle',
      'curtain', 'burger', 'blur', 'slur', 'spur', 'lurk',
    ],
  },

  er: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '📝',
    description: 'as in LETTER',
    similar: ['ir', 'ur'],
    words: [
      'letter', 'better', 'dinner', 'winter', 'summer', 'river', 'flower',
      'over', 'under', 'silver', 'finger', 'hammer', 'butter',
      'pepper', 'spider', 'tiger', 'ladder', 'sister', 'brother',
      'number', 'rubber', 'herd', 'verb', 'serve', 'nerve', 'fern',
    ],
  },

  'a-e': {
    set: 3, setLabel: 'Split Digraph',
    emoji: '🍰',
    description: 'as in CAKE',
    similar: ['ay', 'ai'],
    words: [
      'cake', 'make', 'take', 'bake', 'name', 'same', 'game', 'came',
      'lake', 'snake', 'plane', 'shape', 'grape', 'brave', 'save',
    ],
  },

  'i-e': {
    set: 3, setLabel: 'Split Digraph',
    emoji: '🪁',
    description: 'as in SMILE',
    similar: ['igh'],
    words: [
      'smile', 'time', 'like', 'bike', 'kite', 'five', 'drive', 'white',
      'shine', 'slide', 'prize', 'line', 'mine', 'quite',
    ],
  },

  'o-e': {
    set: 3, setLabel: 'Split Digraph',
    emoji: '🏠',
    description: 'as in HOME',
    similar: ['oa', 'ow'],
    words: [
      'home', 'bone', 'phone', 'stone', 'those', 'woke', 'joke', 'note',
      'rope', 'hope', 'nose', 'close', 'globe', 'smoke',
    ],
  },

  'u-e': {
    set: 3, setLabel: 'Split Digraph',
    emoji: '🦄',
    description: 'as in HUGE',
    similar: ['oo', 'ew'],
    words: [
      'huge', 'use', 'cute', 'tune', 'cube', 'flute', 'June', 'rule',
      'rude', 'dude', 'mule', 'fume', 'prune',
    ],
  },

  ew: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🌬️',
    description: 'as in CHEW',
    similar: ['oo', 'u-e'],
    words: [
      'chew', 'new', 'flew', 'blew', 'grew', 'drew', 'crew', 'stew',
      'screw', 'threw', 'jewel', 'few',
    ],
  },

  are: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🐻',
    description: 'as in CARE',
    similar: ['air'],
    words: [
      'care', 'share', 'dare', 'stare', 'scare', 'square', 'spare',
      'bare', 'flare', 'glare', 'prepare',
    ],
  },

  ire: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '🔥',
    description: 'as in FIRE',
    similar: ['igh', 'i-e'],
    words: [
      'fire', 'hire', 'wire', 'tire', 'spire', 'inspire', 'bonfire',
      'admire', 'retire', 'entire',
    ],
  },

  ear: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '👂',
    description: 'as in HEAR',
    similar: [],
    words: [
      'ear', 'hear', 'dear', 'fear', 'near', 'clear', 'year', 'beard',
      'spear', 'appear',
    ],
  },

  ure: {
    set: 3, setLabel: 'Vowel Sound',
    emoji: '💎',
    description: 'as in PURE',
    similar: [],
    words: [
      'pure', 'cure', 'sure', 'secure', 'mature', 'picture',
      'mixture', 'adventure',
    ],
  },

  ow_brown: {
    set: 3, setLabel: 'Vowel Sound',
    display: 'ow',
    emoji: '🟤',
    description: 'as in BROWN',
    similar: ['ou'],
    words: [
      'brown', 'down', 'town', 'cow', 'now', 'how', 'owl', 'crowd',
      'clown', 'flower', 'shower', 'powder',
    ],
  },
}

const SOUND_KEYS = Object.keys(SOUND_BANK)

function getActiveSoundKeys(sessionsPlayed) {
  if (sessionsPlayed >= 6) return SOUND_KEYS
  if (sessionsPlayed >= 2) return SOUND_KEYS.filter(k => SOUND_BANK[k].set <= 2)
  return SOUND_KEYS.filter(k => SOUND_BANK[k].set === 1)
}

function getSoundSetLevel(sessionsPlayed) {
  if (sessionsPlayed >= 6) return 3
  if (sessionsPlayed >= 3) return 2
  return 1
}

const SOUND_SPEECH_CUES = {
  sh:  { prompt: 'shhh, as in ship' },
  th:  { prompt: 'th, as in think' },
  ch:  { prompt: 'ch, as in chip' },
  qu:  { prompt: 'qu, as in queen' },
  ng:  { prompt: 'ng, as at the end of ring' },
  nk:  { prompt: 'nk, as at the end of sink' },
  ay:  { prompt: 'ay, as in play' },
  ee:  { prompt: 'ee, as in tree' },
  igh: { prompt: 'eye, as in light' },
  ow:  { prompt: 'oh, as in snow' },
  oo:  { prompt: 'oo, as in moon' },
  oo_book: { prompt: 'oo, as in book' },
  ar:  { prompt: 'ar, as in car' },
  or:  { prompt: 'or, as in door' },
  air: { prompt: 'air, as in chair' },
  ir:  { prompt: 'er, as in bird' },
  ou:  { prompt: 'ow, as in shout' },
  oy:  { prompt: 'oy, as in toy' },
  ea:  { prompt: 'ee, as in tea' },
  oi:  { prompt: 'oy, as in coin' },
  ai:  { prompt: 'ay, as in rain' },
  oa:  { prompt: 'oh, as in boat' },
  aw:  { prompt: 'or, as in claw' },
  ur:  { prompt: 'er, as in nurse' },
  er:  { prompt: 'er, as in letter' },
  'a-e': { prompt: 'ay, as in cake' },
  'i-e': { prompt: 'eye, as in smile' },
  'o-e': { prompt: 'oh, as in home' },
  'u-e': { prompt: 'you, as in huge' },
  ew: { prompt: 'oo, as in chew' },
  are: { prompt: 'air, as in care' },
  ire: { prompt: 'ire, as in fire' },
  ear: { prompt: 'ear, as in hear' },
  ure: { prompt: 'ure, as in pure' },
  ow_brown: { prompt: 'ow, as in brown' },
}

// IPA representations for pure-sound SSP phonics (SSML phoneme tags)
const PHONEME_IPA = {
  sh: 'ʃ', th: 'θ', ch: 'tʃ', qu: 'kw', ng: 'ŋ', nk: 'ŋk',
  ay: 'eɪ', ee: 'iː', igh: 'aɪ', ow: 'əʊ', oo: 'uː', oo_book: 'ʊ',
  ar: 'ɑː', or: 'ɔː', air: 'eə', ir: 'ɜː', ou: 'aʊ', oy: 'ɔɪ',
  ea: 'iː', oi: 'ɔɪ', ai: 'eɪ', oa: 'əʊ', aw: 'ɔː', ur: 'ɜː', er: 'ə',
  'a-e': 'eɪ', 'i-e': 'aɪ', 'o-e': 'əʊ', 'u-e': 'juː',
  ew: 'juː', are: 'eə', ire: 'aɪə', ear: 'ɪə', ure: 'jʊə', ow_brown: 'aʊ',
}

function getSoundSpeechCue(key) {
  return SOUND_SPEECH_CUES[key] || { prompt: key }
}

function buildSoundInstruction(key) {
  // Text fallback: phoneme cue first (SSP methodology), then the task
  return `${getSoundSpeechCue(key).prompt}. Find a word with this sound.`
}

function buildPhonemeOnlySSML(key) {
  const ipa = PHONEME_IPA[key]
  if (!ipa) return null
  const display = getSoundDisplay(key)
  // Pure isolated phoneme at -25% — for tapping the phoneme card
  return `<prosody rate="-25%"><phoneme alphabet="ipa" ph="${ipa}">${display}</phoneme></prosody>`
}

function buildSoundInstructionSSML(key) {
  const ipa = PHONEME_IPA[key]
  if (!ipa) return null
  const display = getSoundDisplay(key)
  // SSP methodology: say the sound in isolation first, pause, then give the task, repeat the sound
  return `<prosody rate="-25%"><phoneme alphabet="ipa" ph="${ipa}">${display}</phoneme></prosody><break time="450ms"/>Find a word with this sound.<break time="300ms"/><prosody rate="-25%"><phoneme alphabet="ipa" ph="${ipa}">${display}</phoneme></prosody>.`
}

function buildRetrySSML(key) {
  const ipa = PHONEME_IPA[key]
  if (!ipa) return null
  const display = getSoundDisplay(key)
  return `Not quite. The sound is<break time="200ms"/><prosody rate="-25%"><phoneme alphabet="ipa" ph="${ipa}">${display}</phoneme></prosody>.<break time="300ms"/>Try again.`
}

function getSoundDisplay(key) {
  return SOUND_BANK[key]?.display || key
}

// ── Avatar-specific themes ─────────────────────────────────────────────────────
const AVATAR_THEMES = {
  yaagvi: {
    intro: 'Sound Pop with Yaagvi.',
    correct: ['Great listening!', 'Yes, that is it!', 'Brilliant sound work!', 'You found it!'],
    wrong:   ['Try again, listen carefully.', 'Not quite. I am here with you.'],
  },
  rumi: {
    intro: 'Sound Pop — Pop Star Edition! 🎤',
    correct: ['⭐ Pop star move!', '🎵 Hit it!', '🎤 Superstar!', '🌟 You are on fire!'],
    wrong:   ['Keep going, you have got this! 🎵', 'Listen again! 🎤'],
  },
  bloom: {
    intro: 'Sound Pop — Muddy Puddles! 🐷',
    correct: ['🐷 Oink-credible!', '🌸 Brilliant!', '💕 Well done!', '🎀 You are amazing!'],
    wrong:   ['Try again, you are nearly there! 🐷', 'Listen carefully! 🌸'],
  },
  aurora: {
    intro: 'Sound Pop — Ice Crystal Sounds! ❄️',
    correct: ['❄️ Ice cold correct!', '⛄ Frozen fantastic!', '💙 Brilliant!', '🔮 Magic!'],
    wrong:   ['You can do it, ice queen! ❄️', 'Listen again! 💙'],
  },
  marina: {
    intro: 'Sound Pop — Ocean Wave Sounds! 🌊',
    correct: ['🌊 Wave rider!', '🐚 Shell-tastic!', '🌺 Brilliant!', '⛵ Sailing through!'],
    wrong:   ['Ride the wave again! 🌊', 'Listen once more! 🐚'],
  },
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function makeQuestion(targetKey, usedMap, activeSoundKeys) {
  const bank = SOUND_BANK[targetKey]
  const similar = bank.similar || []

  // Build pool excluding already-used words for this sound this session
  const used = usedMap[targetKey] || new Set()
  let pool = bank.words.filter(w => !used.has(w))
  if (pool.length === 0) {
    usedMap[targetKey] = new Set()
    pool = [...bank.words]
  }

  const targetWord = pool[Math.floor(Math.random() * pool.length)]

  // Distractors from OTHER active sounds — exclude similar-phoneme sounds to avoid
  // unfair near-misses (e.g. don't use an 'ea' word as distractor for 'ee')
  const keys = activeSoundKeys || SOUND_KEYS
  const otherKeys = keys.filter(k => k !== targetKey && !similar.includes(k))
  const distractors = shuffle(otherKeys)
    .slice(0, 3)
    .map(k => {
      const dPool = SOUND_BANK[k].words
      return dPool[Math.floor(Math.random() * dPool.length)]
    })

  return { targetKey, targetWord, choices: shuffle([targetWord, ...distractors]) }
}

export default function SoundPop({ avatar, progress, onAddStars, onBack, profileName }) {
  const theme       = THEMES[avatar] || THEMES.rumi
  const avatarTheme = AVATAR_THEMES[avatar] || AVATAR_THEMES.rumi
  const { speak }   = useSpeech()
  const usedMapRef  = useRef({})

  const sessionsPlayed = progress?.phonics?.sessionsPlayed || 0
  const activeSoundKeys = useRef(getActiveSoundKeys(sessionsPlayed)).current
  const soundSetLevel = getSoundSetLevel(sessionsPlayed)

  const [question,    setQuestion]    = useState(null)
  const [selected,    setSelected]    = useState(null)
  const [score,            setScore]            = useState(0)
  const [correctAnswers,   setCorrectAnswers]   = useState(0)
  const [streak,           setStreak]           = useState(0)
  const [feedback,         setFeedback]         = useState(null)
  const [round,            setRound]            = useState(1)
  const [wrongSounds,      setWrongSounds]      = useState([])
  const [consecutiveWrong, setConsecutiveWrong] = useState(0)
  const [showHint,         setShowHint]         = useState(false)
  const totalRounds = 10
  const buddy = useBuddyMood()
  const timersRef = useRef(new Set())

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
  }, [])

  const defer = useCallback((fn, ms) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id)
      fn()
    }, ms)
    timersRef.current.add(id)
  }, [])

  const pickNextSound = useCallback(() =>
    activeSoundKeys[Math.floor(Math.random() * activeSoundKeys.length)], [activeSoundKeys])

  const nextRound = useCallback((forceKey) => {
    const key = forceKey || pickNextSound()
    const q   = makeQuestion(key, usedMapRef.current, activeSoundKeys)
    if (!usedMapRef.current[key]) usedMapRef.current[key] = new Set()
    usedMapRef.current[key].add(q.targetWord)
    setQuestion(q)
    setSelected(null)
    setFeedback(null)
  }, [pickNextSound])

  useEffect(() => {
    nextRound(pickNextSound())
    speak(avatarTheme.intro + ' Listen for the sound and tap the right word!', { mood: 'instruct', voice: 'gb' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!question) return
    defer(() => {
      speak(buildSoundInstruction(question.targetKey), { mood: 'phonics', voice: 'gb', ssmlInner: buildSoundInstructionSSML(question.targetKey) })
    }, 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.targetKey, question?.targetWord])

  const handleChoice = useCallback((word) => {
    if (selected !== null) return
    setSelected(word)
    speak(word, { rate: 0.85, voice: 'gb' })

    const correct = word === question.targetWord

    if (correct) {
      const bonus = streak >= 2 ? 2 : 1
      const newScore = score + bonus
      const newCorrectAnswers = correctAnswers + 1
      setScore(newScore)
      setCorrectAnswers(newCorrectAnswers)
      setStreak(s => s + 1)
      setConsecutiveWrong(0)
      const msg = avatarTheme.correct[Math.floor(Math.random() * avatarTheme.correct.length)]
      setFeedback({ type: 'correct', msg: streak >= 2 ? `🔥 ${streak + 1} streak! ${msg}` : msg })
      confetti({ particleCount: 70, spread: 90, origin: { x: 0.5, y: 0.5 }, colors: ['#FFD700', '#FF6B9D', '#38BDF8'] })
      streak >= 2 ? buddy.onWow() : buddy.onCorrect()

      if (round >= totalRounds) {
        defer(() => {
          setRound(totalRounds + 1)
          const name = profileName || 'Superstar'
          const completion = buildSoundPopCompletion({
            totalRounds,
            correctAnswers: newCorrectAnswers,
            bonusStars: newScore,
            wrongSounds,
          })
          speak(`Amazing ${name}! You scored ${newScore} stars! You are a phonics superstar!`, { mood: 'celebrate' })
          onAddStars('phonics', completion.stars, completion.sessionData)
          buddy.onGameEnd()
        }, 700)
      } else {
        defer(() => { setRound(r => r + 1); nextRound() }, 1400)
      }
    } else {
      const newWrong = consecutiveWrong + 1
      setStreak(0)
      setConsecutiveWrong(newWrong)
      setWrongSounds(prev => [...prev, question.targetKey])
      const msg = avatarTheme.wrong[Math.floor(Math.random() * avatarTheme.wrong.length)]
      setFeedback({ type: 'wrong', msg })
      speak(`Not quite. The sound is ${getSoundSpeechCue(question.targetKey).prompt}. Try again.`, { mood: 'phonics', voice: 'gb', ssmlInner: buildRetrySSML(question.targetKey) })
      buddy.onWrong(newWrong >= 2)
      if (newWrong >= 2) {
        defer(() => setShowHint(true), 1600)
      } else {
        defer(() => { setSelected(null); setFeedback(null) }, 1800)
      }
    }
  }, [selected, question, streak, score, correctAnswers, round, totalRounds, wrongSounds,
      speak, nextRound, onAddStars, avatarTheme, profileName, defer])

  const playInstruction = () => {
    if (!question) return
    speak(buildSoundInstruction(question.targetKey), { mood: 'phonics', voice: 'gb', ssmlInner: buildSoundInstructionSSML(question.targetKey) })
  }

  const playPhonemeOnly = () => {
    if (!question) return
    speak(getSoundDisplay(question.targetKey), { voice: 'gb', ssmlInner: buildPhonemeOnlySSML(question.targetKey) })
  }

  if (round > totalRounds) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="font-bubble text-4xl shimmer-text mb-2">
            {profileName ? `Amazing ${profileName}!` : 'Amazing!'}
          </h2>
          <p className="font-round text-xl mb-4" style={{ color: theme.text }}>
            You scored <span className="font-bold text-yellow-500">{score} ⭐</span> stars!
          </p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="bubble-btn px-8 py-4 text-xl"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          >
            Back to Home 🏠
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (!question) return null

  const info = SOUND_BANK[question.targetKey]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>
          ←
        </motion.button>
        <div className="text-center">
          <p className="font-round text-xs font-bold opacity-60" style={{ color: theme.text }}>
            Round {round}/{totalRounds}
          </p>
          <div className="flex gap-1 justify-center mt-1">
            {Array.from({ length: Math.min(score, 10) }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm">⭐</motion.span>
            ))}
          </div>
        </div>
        <div className="font-bubble text-2xl" style={{ color: theme.primary }}>🎤</div>
      </div>

      {/* Scrollable content — pb-32 ensures answer buttons clear the fixed avatar on all phones */}
      <div className="flex-1 overflow-y-auto scroll-ios pb-32">

      {/* Sound instruction card */}
      <motion.div
        key={question.targetKey + question.targetWord}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-1 rounded-3xl p-5 text-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
      >
        <p className="font-round text-white/80 text-sm">Tap the word that has the sound</p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={playPhonemeOnly}
          className="font-bubble text-6xl text-white tracking-widest my-1 cursor-pointer"
          aria-label={`Hear the sound ${getSoundDisplay(question.targetKey)}`}
        >
          {getSoundDisplay(question.targetKey).toUpperCase()}
        </motion.button>
        {/* RWI set label + progression level */}
        <p className="font-round text-white/60 text-xs mb-1 flex items-center justify-center gap-2">
          <span>Set {info.set} · {info.setLabel}</span>
          {soundSetLevel > 1 && (
            <span className="bg-white/30 rounded-full px-2 py-0.5 font-bubble text-white text-xs leading-none">
              Lv.{soundSetLevel}
            </span>
          )}
        </p>
        <p className="font-round text-white/90 text-sm">{info.description}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-2xl">{info.emoji}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={playInstruction}
            className="bg-white/20 rounded-full px-4 py-1.5 text-white font-round text-sm"
          >
            🔊 Hear it again
          </motion.button>
        </div>
      </motion.div>

      {/* Answer grid — 2×2, large tap targets */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {question.choices.map((word) => {
          const isSelected = selected === word
          const isCorrect  = word === question.targetWord
          let bg        = theme.card
          let border    = theme.secondary
          let textColor = theme.text

          if (isSelected && isCorrect)  { bg = '#22C55E'; border = '#16A34A'; textColor = 'white' }
          if (isSelected && !isCorrect) { bg = '#EF4444'; border = '#DC2626'; textColor = 'white' }
          if (!isSelected && selected !== null && isCorrect) { bg = '#22C55E'; border = '#16A34A'; textColor = 'white' }

          return (
            <motion.button
              key={word}
              whileTap={{ scale: selected === null ? 0.92 : 1 }}
              onClick={() => handleChoice(word)}
              disabled={selected !== null}
              className="rounded-3xl flex flex-col items-center justify-center shadow-lg"
              style={{
                background: bg,
                border: `3px solid ${border}`,
                minHeight: 130,
                transition: 'background 0.25s, border-color 0.25s',
              }}
              animate={{ scale: isSelected && isCorrect ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-bubble text-3xl" style={{ color: textColor }}>{word}</span>
              {isSelected && isCorrect  && <span className="text-2xl mt-1">✅</span>}
              {isSelected && !isCorrect && <span className="text-2xl mt-1">❌</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Streak badge */}
      {streak >= 2 && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="flex items-center justify-center gap-1 mt-2 mb-1"
        >
          <span className="text-xl">🔥</span>
          <span className="font-bubble text-lg" style={{ color: theme.primary }}>{streak} in a row!</span>
        </motion.div>
      )}

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-safe-toast left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 ${
              feedback.type === 'correct' ? 'bg-green-400' : 'bg-orange-400'
            }`}
          >
            <p className="font-bubble text-white text-lg text-center">{feedback.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      </div>{/* end scrollable content */}

      {/* ── Avatar buddy ── */}
      <div className="fixed bottom-safe-buddy left-2 z-30 pointer-events-none">
        <BuddyCompanion
          avatar={avatar}
          mood={buddy.mood}
          speak={buddy.speak}
          size={80}
          side="right"
          autoSpeak
        />
      </div>

      {showHint && (
        <SkillHint
          hint={getHint('phonics', question?.targetKey)}
          onClose={() => setShowHint(false)}
          onTryAgain={() => {
            setShowHint(false)
            setConsecutiveWrong(0)
            setSelected(null)
            setFeedback(null)
          }}
        />
      )}
    </div>
  )
}
