export const FOUNDATION_AGE_BANDS = {
  toddler: {
    ages: '3-4',
    developmentalGoal: 'Notice, name, imitate, compare, and feel secure enough to ask.',
    thinkingLevel: 'Concrete experiences and familiar people, places, objects, and stories.',
  },
  early: {
    ages: '5-6',
    developmentalGoal: 'Find patterns, describe simple causes, sequence events, and explain choices.',
    thinkingLevel: 'Visible relationships between everyday experiences and foundational ideas.',
  },
  junior: {
    ages: '7-9',
    developmentalGoal: 'Use evidence, connect systems, compare perspectives, and apply ideas independently.',
    thinkingLevel: 'Models, timelines, multiple causes, scale, uncertainty, and reasoned conclusions.',
  },
}

export const FOUNDATION_STRANDS = [
  {
    id: 'thinking-communication',
    name: 'Thinking and Communication',
    purpose: 'Give children the language, number sense, logic, and habits needed to learn everything else.',
    existingModules: ['phonics', 'story', 'math', 'logic', 'reading', 'spelling', 'grammar', 'timestables', 'fractions', 'wordproblems'],
  },
  {
    id: 'world-systems',
    name: 'The Living and Physical World',
    purpose: 'Build accurate mental models of bodies, living things, materials, forces, light, sound, Earth, and space.',
    existingModules: ['science', 'anatomy', 'planets', 'ks2science'],
  },
  {
    id: 'people-place-time',
    name: 'People, Place, and Time',
    purpose: 'Help children understand home, community, geography, chronology, history, change, and cause.',
    existingModules: ['worldgk', 'worldmap'],
  },
  {
    id: 'roots-culture-meaning',
    name: 'Roots, Culture, and Meaning',
    purpose: 'Connect children to family heritage, languages, arts, traditions, faith, values, and respectful differences.',
    existingModules: ['sacred', 'spirituality', 'davinci'],
  },
  {
    id: 'self-relationships-agency',
    name: 'Self, Relationships, and Agency',
    purpose: 'Develop emotional understanding, health, safety, responsibility, practical judgment, and contribution.',
    existingModules: ['exercise', 'bodyparts', 'shop', 'piggybank'],
  },
]

export const FOUNDATION_BIG_IDEAS = [
  'patterns',
  'cause-and-effect',
  'systems',
  'change-over-time',
  'evidence',
  'scale',
  'interdependence',
  'place',
  'identity',
  'perspective',
  'fairness',
  'stewardship',
]

export const FOUNDATION_ARCS = [
  {
    id: 'me-and-my-mind',
    name: 'Me and My Mind',
    strands: ['thinking-communication', 'self-relationships-agency'],
    bigIdeas: ['patterns', 'identity', 'evidence'],
    toddler: ['Name feelings and senses', 'Notice same and different', 'Ask for help and take turns'],
    early: ['Connect senses to information', 'Explain a choice', 'Recognise that thoughts and feelings can change'],
    junior: ['Distinguish observation from inference', 'Use strategies for attention and memory', 'Reflect on how evidence can change a belief'],
  },
  {
    id: 'family-roots-belonging',
    name: 'Family, Roots, and Belonging',
    strands: ['people-place-time', 'roots-culture-meaning', 'self-relationships-agency'],
    bigIdeas: ['identity', 'place', 'change-over-time', 'perspective'],
    toddler: ['Name important people and home traditions', 'Notice family similarities and differences'],
    early: ['Build a simple family or community timeline', 'Share the meaning of a family custom or object'],
    junior: ['Trace one family or local story through time', 'Compare sources and explain why memories can differ'],
  },
  {
    id: 'language-stories-ideas',
    name: 'Language, Stories, and Ideas',
    strands: ['thinking-communication', 'roots-culture-meaning'],
    bigIdeas: ['patterns', 'perspective', 'identity'],
    toddler: ['Hear sounds, rhythm, and repeated story patterns', 'Retell with pictures or actions'],
    early: ['Use phonics and vocabulary to express an idea', 'Compare characters and lessons'],
    junior: ['Explain how language shapes meaning', 'Compare a theme across cultures and genres'],
  },
  {
    id: 'number-pattern-measure',
    name: 'Number, Pattern, and Measure',
    strands: ['thinking-communication'],
    bigIdeas: ['patterns', 'scale', 'evidence'],
    toddler: ['Match quantities, shapes, and simple patterns', 'Compare more, less, longer, and shorter'],
    early: ['Use number relationships to solve everyday problems', 'Measure and explain a pattern'],
    junior: ['Represent relationships with fractions and operations', 'Choose and justify a mathematical strategy'],
  },
  {
    id: 'living-things',
    name: 'Living Things and Interdependence',
    strands: ['world-systems', 'self-relationships-agency'],
    bigIdeas: ['systems', 'interdependence', 'change-over-time', 'stewardship'],
    toddler: ['Name common plants, animals, and body parts', 'Notice what living things need'],
    early: ['Describe simple life cycles and habitats', 'Connect plant, animal, air, water, and sunlight needs'],
    junior: ['Model food chains and ecosystems', 'Use evidence to explain how a change affects a living system'],
  },
  {
    id: 'matter-force-energy',
    name: 'Matter, Force, Light, and Sound',
    strands: ['world-systems', 'thinking-communication'],
    bigIdeas: ['cause-and-effect', 'systems', 'evidence', 'scale'],
    toddler: ['Explore push, pull, light, sound, texture, and temperature safely'],
    early: ['Predict and observe simple changes', 'Explain a visible cause using a basic model'],
    junior: ['Plan fair comparisons', 'Use particle, force, light, or sound models to explain results'],
  },
  {
    id: 'earth-sky-time',
    name: 'Earth, Sky, and Deep Time',
    strands: ['world-systems', 'people-place-time'],
    bigIdeas: ['systems', 'scale', 'change-over-time', 'place'],
    toddler: ['Notice day, night, weather, and seasons'],
    early: ['Connect Earth, Sun, shadows, weather, and seasonal patterns'],
    junior: ['Use models for rotation, orbit, climate, rocks, and deep time', 'Recognise the limits of scale models'],
  },
  {
    id: 'home-to-world',
    name: 'From Home to the World',
    strands: ['people-place-time', 'self-relationships-agency'],
    bigIdeas: ['place', 'systems', 'interdependence', 'stewardship'],
    toddler: ['Recognise home, school, neighbourhood, and simple maps'],
    early: ['Compare physical and human features of places', 'Follow how food or an object travels to us'],
    junior: ['Connect geography, resources, trade, migration, and environment', 'Evaluate a local improvement'],
  },
  {
    id: 'how-life-changed',
    name: 'How Life Changed',
    strands: ['people-place-time', 'thinking-communication'],
    bigIdeas: ['change-over-time', 'cause-and-effect', 'evidence', 'perspective'],
    toddler: ['Sequence now, before, and long ago using familiar life'],
    early: ['Use objects, pictures, and stories to compare past and present'],
    junior: ['Build timelines', 'Use primary and secondary sources', 'Explain that historical change has multiple causes and viewpoints'],
  },
  {
    id: 'belief-values-traditions',
    name: 'Belief, Values, and Traditions',
    strands: ['roots-culture-meaning', 'self-relationships-agency'],
    bigIdeas: ['identity', 'perspective', 'fairness', 'stewardship'],
    toddler: ['Meet stories, celebrations, symbols, music, and acts of kindness from family life'],
    early: ['Explain what a tradition means to people who practise it', 'Notice shared values and respectful differences'],
    junior: ['Compare beliefs using tradition-specific language', 'Discuss ethical questions with reasons while separating belief, history, and evidence'],
  },
  {
    id: 'making-serving-creating',
    name: 'Making, Serving, and Creating',
    strands: ['roots-culture-meaning', 'self-relationships-agency', 'thinking-communication'],
    bigIdeas: ['systems', 'cause-and-effect', 'identity', 'stewardship'],
    toddler: ['Make, move, draw, build, and help with a small task'],
    early: ['Plan and improve a creation', 'Connect jobs and tools to community needs'],
    junior: ['Research, design, test, revise, and share a project that helps someone'],
  },
]

export const CULTURE_AND_FAITH_GUARDRAILS = [
  'Let families identify the traditions, languages, places, and stories that form their roots.',
  'Describe beliefs as beliefs held within a named tradition; do not present one family belief as a universal fact.',
  'Separate devotional meaning, historical claim, and scientific explanation when they answer different kinds of questions.',
  'Use reviewed sources and tradition-specific advisers for sacred stories, symbols, practices, and pronunciation.',
  'Represent living cultures through ordinary family and community life, not festivals, costumes, or ancient history alone.',
  'Never rank religions, cultures, languages, family structures, or identities.',
  'Give parents visibility and age-appropriate controls without making a child feel that their family is unusual.',
]

export const MODULE_FOUNDATION_TAGS = {
  colours: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas', 'making-serving-creating'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  shapes: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure'],
    bigIdeas: ['patterns', 'scale'],
    formats: ['practice'],
  },
  numbers: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure'],
    bigIdeas: ['patterns', 'scale'],
    formats: ['practice'],
  },
  animals: {
    strands: ['world-systems'],
    arcs: ['living-things'],
    bigIdeas: ['patterns', 'interdependence'],
    formats: ['practice', 'inquiry'],
  },
  fruits: {
    strands: ['world-systems', 'self-relationships-agency'],
    arcs: ['living-things', 'me-and-my-mind'],
    bigIdeas: ['patterns', 'interdependence'],
    formats: ['practice'],
  },
  bodyparts: {
    strands: ['world-systems', 'self-relationships-agency'],
    arcs: ['me-and-my-mind', 'living-things'],
    bigIdeas: ['systems', 'identity'],
    formats: ['practice'],
  },
  alphabet: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  quizshow: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas', 'number-pattern-measure'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  phonics: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  math: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure'],
    bigIdeas: ['patterns', 'scale'],
    formats: ['practice'],
  },
  tricky: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  story: {
    strands: ['thinking-communication', 'roots-culture-meaning'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['perspective', 'identity'],
    formats: ['story', 'conversation'],
  },
  worldgk: {
    strands: ['people-place-time', 'roots-culture-meaning'],
    arcs: ['home-to-world', 'how-life-changed'],
    bigIdeas: ['place', 'change-over-time', 'perspective'],
    formats: ['story', 'practice'],
  },
  science: {
    strands: ['world-systems', 'thinking-communication'],
    arcs: ['living-things', 'matter-force-energy', 'earth-sky-time'],
    bigIdeas: ['cause-and-effect', 'systems', 'evidence'],
    formats: ['inquiry', 'practice'],
  },
  planets: {
    strands: ['world-systems'],
    arcs: ['earth-sky-time'],
    bigIdeas: ['systems', 'scale', 'change-over-time'],
    formats: ['inquiry', 'practice'],
  },
  anatomy: {
    strands: ['world-systems', 'self-relationships-agency'],
    arcs: ['me-and-my-mind', 'living-things'],
    bigIdeas: ['systems', 'interdependence'],
    formats: ['inquiry', 'practice'],
  },
  shop: {
    strands: ['thinking-communication', 'self-relationships-agency'],
    arcs: ['number-pattern-measure', 'making-serving-creating'],
    bigIdeas: ['systems', 'fairness'],
    formats: ['practice', 'project'],
  },
  logic: {
    strands: ['thinking-communication'],
    arcs: ['me-and-my-mind', 'number-pattern-measure'],
    bigIdeas: ['patterns', 'cause-and-effect', 'evidence'],
    formats: ['practice'],
  },
  arcade: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas', 'number-pattern-measure'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  davinci: {
    strands: ['roots-culture-meaning', 'self-relationships-agency'],
    arcs: ['making-serving-creating', 'language-stories-ideas'],
    bigIdeas: ['identity', 'perspective'],
    formats: ['project'],
  },
  exercise: {
    strands: ['self-relationships-agency'],
    arcs: ['me-and-my-mind'],
    bigIdeas: ['systems', 'cause-and-effect'],
    formats: ['practice'],
  },
  sacred: {
    strands: ['roots-culture-meaning', 'self-relationships-agency'],
    arcs: ['belief-values-traditions', 'family-roots-belonging'],
    bigIdeas: ['identity', 'perspective', 'fairness'],
    formats: ['story', 'conversation'],
  },
  piggybank: {
    strands: ['self-relationships-agency', 'thinking-communication'],
    arcs: ['number-pattern-measure', 'making-serving-creating'],
    bigIdeas: ['systems', 'fairness', 'stewardship'],
    formats: ['practice', 'project'],
  },
  wonderwhy: {
    strands: ['world-systems', 'thinking-communication'],
    arcs: ['living-things', 'matter-force-energy', 'earth-sky-time'],
    bigIdeas: ['cause-and-effect', 'evidence', 'systems'],
    formats: ['inquiry'],
  },
  timestables: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure'],
    bigIdeas: ['patterns', 'scale'],
    formats: ['practice'],
  },
  fractions: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure'],
    bigIdeas: ['patterns', 'scale'],
    formats: ['practice'],
  },
  wordproblems: {
    strands: ['thinking-communication'],
    arcs: ['number-pattern-measure', 'me-and-my-mind'],
    bigIdeas: ['cause-and-effect', 'evidence', 'scale'],
    formats: ['practice'],
  },
  reading: {
    strands: ['thinking-communication', 'roots-culture-meaning'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['perspective', 'evidence'],
    formats: ['story', 'practice'],
  },
  spelling: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
  grammar: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas'],
    bigIdeas: ['patterns', 'systems'],
    formats: ['practice'],
  },
  worldmap: {
    strands: ['people-place-time'],
    arcs: ['home-to-world', 'how-life-changed'],
    bigIdeas: ['place', 'scale', 'interdependence'],
    formats: ['practice', 'inquiry'],
  },
  spirituality: {
    strands: ['roots-culture-meaning', 'self-relationships-agency'],
    arcs: ['belief-values-traditions', 'family-roots-belonging'],
    bigIdeas: ['identity', 'perspective', 'fairness'],
    formats: ['story', 'conversation'],
  },
  games: {
    strands: ['thinking-communication'],
    arcs: ['language-stories-ideas', 'number-pattern-measure'],
    bigIdeas: ['patterns'],
    formats: ['practice'],
  },
}

export const FOUNDATION_FORMATS = ['inquiry', 'story', 'practice', 'project', 'conversation']

export function getModuleFoundationTags(moduleId) {
  return MODULE_FOUNDATION_TAGS[moduleId] || null
}

export function getFoundationArc(arcId) {
  return FOUNDATION_ARCS.find(arc => arc.id === arcId) || null
}

export function getFoundationOutcomes(arcId, ageGroup = 'early') {
  const arc = getFoundationArc(arcId)
  const age = FOUNDATION_AGE_BANDS[ageGroup] ? ageGroup : 'early'
  return arc?.[age] || []
}

export function getFoundationCoverage() {
  return FOUNDATION_STRANDS.map(strand => ({
    ...strand,
    arcs: FOUNDATION_ARCS.filter(arc => arc.strands.includes(strand.id)).map(arc => arc.id),
  }))
}
