const safeName = name => String(name || 'Explorer').trim().split(/\s+/)[0] || 'Explorer'

function weakestSkill(progress = {}, candidates = []) {
  const skills = progress.learningJourney?.skills || {}
  const practised = candidates.filter(skill => Number(skills[skill]?.attempts) > 0)
  return [...(practised.length ? practised : candidates)].sort((a, b) => {
    const left = skills[a]?.mastery || 0
    const right = skills[b]?.mastery || 0
    return left - right
  })[0] || candidates[0]
}

const EARLY_STORIES = {
  phonics: name => ({
    title: `${name} and the Shiny Shell`, emoji: '🐚', cover: '✨', difficulty: 1,
    pages: [
      { text: `${name} had a little ship.`, emoji: '⛵', bg: 'from-sky-400 to-blue-600' },
      { text: `The ship went swish, swish, swish.`, emoji: '🌊', bg: 'from-cyan-400 to-teal-600' },
      { text: `${name} saw a shiny shell.`, emoji: '🐚', bg: 'from-amber-300 to-orange-500' },
      { text: `A fish hid by the shell.`, emoji: '🐠', bg: 'from-blue-400 to-violet-500' },
      { text: `${name} and the fish shared a wish. The End!`, emoji: '🌟', bg: 'from-purple-400 to-pink-500' },
    ],
  }),
  math: name => ({
    title: `${name} and the Five Star Keys`, emoji: '🔢', cover: '⭐', difficulty: 2,
    pages: [
      { text: `${name} found one bright star key.`, emoji: '1️⃣', bg: 'from-indigo-400 to-blue-600' },
      { text: `Two more keys fell beside a tree.`, emoji: '2️⃣', bg: 'from-emerald-400 to-teal-600' },
      { text: `${name} counted one, two, three.`, emoji: '3️⃣', bg: 'from-amber-300 to-orange-500' },
      { text: `Then two tiny keys came free.`, emoji: '🔑', bg: 'from-rose-400 to-pink-600' },
      { text: `Five keys opened the treasure for ${name}. The End!`, emoji: '🧰', bg: 'from-purple-400 to-indigo-600' },
    ],
  }),
  shapes: name => ({
    title: `${name} Builds a Moon House`, emoji: '🔷', cover: '🏠', difficulty: 2,
    pages: [
      { text: `${name} found a round moon rock.`, emoji: '⚪', bg: 'from-slate-400 to-indigo-600' },
      { text: `A square made a strong little wall.`, emoji: '🟦', bg: 'from-blue-400 to-cyan-600' },
      { text: `A triangle made the roof stand tall.`, emoji: '🔺', bg: 'from-orange-400 to-rose-500' },
      { text: `${name} added a long rectangle door.`, emoji: '🚪', bg: 'from-amber-400 to-orange-600' },
      { text: `The shape house glowed on the moon. The End!`, emoji: '🌙', bg: 'from-violet-400 to-purple-700' },
    ],
  }),
  story: name => ({
    title: `${name} and the Brave Little Map`, emoji: '🗺️', cover: '🧭', difficulty: 2,
    pages: [
      { text: `${name} found a map under the bed.`, emoji: '🗺️', bg: 'from-amber-300 to-orange-500' },
      { text: `The map said, “Go past the red shed.”`, emoji: '🏠', bg: 'from-red-400 to-rose-600' },
      { text: `${name} met a small fox on the way.`, emoji: '🦊', bg: 'from-orange-400 to-amber-600' },
      { text: `Together they found a bright cave.`, emoji: '💎', bg: 'from-cyan-400 to-blue-600' },
      { text: `Inside was a badge for being brave. The End!`, emoji: '🏅', bg: 'from-purple-400 to-pink-600' },
    ],
  }),
}

export function buildEarlyPersonalisedStory(progress = {}, profileName = 'Explorer') {
  const name = safeName(profileName)
  const skill = weakestSkill(progress, ['phonics', 'math', 'shapes', 'story'])
  const story = (EARLY_STORIES[skill] || EARLY_STORIES.story)(name)
  return { ...story, id: `personal-${skill}`, personalised: true, frontierSkill: skill }
}

const JUNIOR_PASSAGES = {
  reading: name => ({
    title: `${name} and the Midnight Library`, level: 'Made for you',
    text: `${name} noticed a thin line of golden light beneath the library door. The building had been locked for hours, yet a page was turning somewhere inside.\n\nWhen ${name} pushed the door, a tiny paper bird rose from an open atlas. It circled the room, then landed on a map marked with a silver star.\n\n${name} understood that the bird was not escaping. It was inviting a new reader to begin the map's unfinished adventure.`,
    questions: [
      { type: 'literal', q: 'What rose from the open atlas?', opts: ['A paper bird', 'A silver key', 'A small dragon'], ans: 'A paper bird' },
      { type: 'inference', q: 'Why did the bird land on the map?', opts: ['To hide from the light', 'To invite the reader into an adventure', 'To close the library'], ans: 'To invite the reader into an adventure' },
      { type: 'vocabulary', q: 'What does “unfinished” mean here?', opts: ['Not yet completed', 'Very old', 'Impossible to read'], ans: 'Not yet completed' },
    ],
  }),
  spelling: name => ({
    title: `${name} Repairs the Word Machine`, level: 'Made for you',
    text: `The Word Machine had lost three important labels: separate, surprise and strength. ${name} read each word slowly, noticing every syllable and unusual letter.\n\nAfter the final label clicked into place, the machine printed a message: “Careful readers make powerful spellers.”`,
    questions: [
      { type: 'literal', q: 'Which word was one of the missing labels?', opts: ['Separate', 'Silent', 'Simple'], ans: 'Separate' },
      { type: 'inference', q: 'What helped repair the machine?', opts: ['Reading each word carefully', 'Shaking every label', 'Turning off the lights'], ans: 'Reading each word carefully' },
      { type: 'vocabulary', q: 'What is a syllable?', opts: ['A beat in a spoken word', 'A punctuation mark', 'A type of sentence'], ans: 'A beat in a spoken word' },
    ],
  }),
  math: name => ({
    title: `${name} and the Fraction Feast`, level: 'Made for you',
    text: `${name} prepared twelve moon cakes for four explorers. Each explorer needed an equal share. ${name} arranged the cakes into four groups and checked that every group had the same number.\n\nThen one explorer invited a friend, so the team discussed how the shares would change if five people shared the cakes.`,
    questions: [
      { type: 'literal', q: 'How many cakes did each of four explorers receive?', opts: ['2', '3', '4'], ans: '3' },
      { type: 'inference', q: 'Why did the team arrange equal groups?', opts: ['To make sharing fair', 'To hide the cakes', 'To count the plates'], ans: 'To make sharing fair' },
      { type: 'vocabulary', q: 'What does an equal share mean?', opts: ['Everyone receives the same amount', 'One person receives everything', 'The cakes are different sizes'], ans: 'Everyone receives the same amount' },
    ],
  }),
}

export function buildJuniorPersonalisedPassage(progress = {}, profileName = 'Explorer') {
  const name = safeName(profileName)
  const weakest = weakestSkill(progress, ['reading', 'spelling', 'grammar', 'fractions', 'wordproblems'])
  const family = ['fractions', 'wordproblems'].includes(weakest) ? 'math' : weakest === 'spelling' ? 'spelling' : 'reading'
  const passage = JUNIOR_PASSAGES[family](name)
  return { ...passage, id: `personal-${family}`, personalised: true, frontierSkill: weakest }
}
