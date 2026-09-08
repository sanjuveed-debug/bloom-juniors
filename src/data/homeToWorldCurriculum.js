export const HOME_TO_WORLD_ARTIFACT = {
  id: 'my-place-story-v1',
  name: 'My Place Story',
  emoji: '🗺️',
  message: 'Seven discoveries connecting home, community, place, roots, and change.',
}

const AGE_COPY = {
  toddler: {
    stageLabels: ['Look and choose', 'Tap what you notice', 'Say what connects', 'Try it together'],
    saveLabel: 'Keep my place picture',
  },
  early: {
    stageLabels: ['Make a prediction', 'Inspect the clues', 'Build the connection', 'Try it in real life'],
    saveLabel: 'Save to My Place Story',
  },
  junior: {
    stageLabels: ['Form a claim', 'Examine the evidence', 'Explain the system', 'Field task'],
    saveLabel: 'Add evidence to My Place Story',
  },
}

export const HOME_TO_WORLD_LESSONS = [
  {
    id: 'place-home-map',
    day: 1,
    title: 'My Home Has a Place',
    icon: '🏠',
    colour: '#C2410C',
    surface: '#FFF7ED',
    question: 'How can a picture help someone find their way around a home?',
    story: 'A map is a small model of a real place. It keeps useful positions and routes while leaving out details we do not need.',
    clues: [
      { id: 'door', icon: '🚪', label: 'A doorway shows where a route begins' },
      { id: 'room', icon: '🛋️', label: 'Rooms become simple shapes' },
      { id: 'path', icon: '➡️', label: 'Arrows can show a journey' },
    ],
    choices: [
      { id: 'photo', icon: '📷', label: 'It shows every detail' },
      { id: 'model', icon: '🗺️', label: 'It is a useful model' },
      { id: 'story', icon: '📖', label: 'It tells only a story' },
    ],
    age: {
      toddler: {
        question: 'Which picture can help us find a room?',
        explanation: 'A simple map uses shapes and paths to show where things are.',
        offline: 'Walk from one room to another and draw the path with one line.',
        parentPrompt: 'What landmark does your child use to find their way at home?',
      },
      early: {
        explanation: 'Maps are models. A useful map keeps position, direction, and landmarks instead of copying every detail.',
        offline: 'Draw a map from the front door to a favourite place at home. Add two landmarks.',
        parentPrompt: 'Which details made the map useful, and which details could be left out?',
      },
      junior: {
        explanation: 'A map is a selective model made for a purpose. Scale, symbols, orientation, and landmarks affect how well it communicates.',
        offline: 'Create two maps of the same room for different purposes: finding a book and leaving safely.',
        parentPrompt: 'How did changing the purpose change the information on each map?',
      },
    },
  },
  {
    id: 'place-neighbourhood-system',
    day: 2,
    title: 'A Neighbourhood Works Together',
    icon: '🏘️',
    colour: '#0F766E',
    surface: '#F0FDFA',
    question: 'What makes a neighbourhood more than a group of buildings?',
    story: 'A neighbourhood is a system of people, places, routes, and shared services. Each part helps the others work.',
    clues: [
      { id: 'people', icon: '👥', label: 'People have different roles' },
      { id: 'places', icon: '🏫', label: 'Shared places meet community needs' },
      { id: 'routes', icon: '🛣️', label: 'Routes connect people and places' },
    ],
    choices: [
      { id: 'buildings', icon: '🏢', label: 'Only its buildings' },
      { id: 'system', icon: '🔗', label: 'Connected people and places' },
      { id: 'size', icon: '📏', label: 'How large it is' },
    ],
    age: {
      toddler: {
        question: 'Who and what help near our home?',
        explanation: 'People and places near our home help one another.',
        offline: 'Spot one helper and one shared place on your next walk.',
        parentPrompt: 'Who helps your family in the neighbourhood?',
      },
      early: {
        explanation: 'A neighbourhood works because people, shared places, services, and routes are connected.',
        offline: 'Notice one place that helps people and trace how your family reaches it.',
        parentPrompt: 'What would become harder if that place or route disappeared?',
      },
      junior: {
        explanation: 'Neighbourhoods are systems. Access, transport, services, work, and decisions shape who can meet their needs.',
        offline: 'Audit one local route for shade, safety, access, and usefulness. Record one improvement.',
        parentPrompt: 'Who would benefit most from the proposed improvement, and why?',
      },
    },
  },
  {
    id: 'place-city-water',
    day: 3,
    title: 'A City Is a Living System',
    icon: '🏙️',
    colour: '#0369A1',
    surface: '#F0F9FF',
    question: 'How does water reach a tap in a dry city?',
    story: 'Cities depend on hidden systems. In the UAE, much drinking water begins as seawater, is cleaned in desalination plants, and travels through storage and pipes.',
    clues: [
      { id: 'source', icon: '🌊', label: 'Water begins at a source' },
      { id: 'clean', icon: '💧', label: 'Treatment makes water usable' },
      { id: 'network', icon: '🚰', label: 'A network carries it to homes' },
    ],
    choices: [
      { id: 'tap', icon: '🚰', label: 'It begins inside the tap' },
      { id: 'rain', icon: '🌧️', label: 'It always comes from rain' },
      { id: 'system', icon: '⚙️', label: 'A city system moves it' },
    ],
    age: {
      toddler: {
        question: 'What helps water reach our tap?',
        explanation: 'Water travels through a long chain before it reaches us.',
        offline: 'Follow water safely from a tap to one job it does at home.',
        parentPrompt: 'What is one way your family can use water carefully?',
      },
      early: {
        explanation: 'In a dry city, water can move from sea to treatment plant, storage, pipes, and tap. Every step uses people, energy, and equipment.',
        offline: 'Draw the water journey as four connected pictures.',
        parentPrompt: 'Which step would stop the whole journey if it failed?',
      },
      junior: {
        explanation: 'Dubai and other UAE cities combine desalination, storage, distribution, energy, maintenance, and conservation in one interdependent water system.',
        offline: 'Track three uses of water at home and identify one realistic conservation change.',
        parentPrompt: 'What trade-off does a dry city face when producing safe water?',
      },
    },
  },
  {
    id: 'place-uae-story',
    day: 4,
    title: 'Places Carry Many Stories',
    icon: '🇦🇪',
    colour: '#047857',
    surface: '#F0FDF4',
    question: 'Can one symbol tell the whole story of a country?',
    story: 'A flag or landmark can open a story, but a country is also landscapes, languages, work, families, memories, decisions, and change over time.',
    clues: [
      { id: 'land', icon: '🏜️', label: 'Land and climate shape life' },
      { id: 'people', icon: '🧑‍🤝‍🧑', label: 'People carry different experiences' },
      { id: 'time', icon: '⏳', label: 'Places change through time' },
    ],
    choices: [
      { id: 'yes', icon: '1️⃣', label: 'One symbol tells everything' },
      { id: 'start', icon: '🚪', label: 'A symbol is only a doorway' },
      { id: 'none', icon: '❌', label: 'Symbols tell us nothing' },
    ],
    age: {
      toddler: {
        question: 'What different things can belong to one place?',
        explanation: 'One place can have many people, landscapes, sounds, and stories.',
        offline: 'Find one symbol and one everyday object that connect to where you live.',
        parentPrompt: 'What story does each object help your child remember?',
      },
      early: {
        explanation: 'Symbols help us begin, but understanding a country requires stories about land, people, everyday life, and change.',
        offline: 'Choose one UAE symbol and add two facts about ordinary life that it does not show.',
        parentPrompt: 'Whose daily life could add another perspective to this story?',
      },
      junior: {
        explanation: 'National stories are constructed from selected symbols and sources. Strong history asks what is included, what is missing, and whose perspective we hear.',
        offline: 'Compare what a public symbol communicates with one photograph of everyday UAE life.',
        parentPrompt: 'What different claim does each source support?',
      },
    },
  },
  {
    id: 'place-family-roots',
    day: 5,
    title: 'Families Connect Places',
    icon: '🧭',
    colour: '#7C3AED',
    surface: '#FAF5FF',
    question: 'Can a family belong to more than one place?',
    story: 'Families carry languages, memories, recipes, songs, beliefs, objects, and relationships between places. Roots can grow while new connections form.',
    clues: [
      { id: 'memory', icon: '💭', label: 'Memories connect people and places' },
      { id: 'language', icon: '🗣️', label: 'Languages carry ways of speaking and thinking' },
      { id: 'object', icon: '🎁', label: 'Objects can hold family stories' },
    ],
    choices: [
      { id: 'one', icon: '1️⃣', label: 'Only one place' },
      { id: 'many', icon: '🌍', label: 'Several places can matter' },
      { id: 'none', icon: '❌', label: 'Place never matters' },
    ],
    age: {
      toddler: {
        question: 'Which places are special to your family?',
        explanation: 'Families can love and remember more than one place.',
        offline: 'Choose a family object and ask where its story began.',
        parentPrompt: 'What place name, language, or memory would you like your child to carry?',
      },
      early: {
        explanation: 'Belonging can connect home now, family roots, languages, memories, and people in several places.',
        offline: 'Add two meaningful places to a family map and draw what connects them.',
        parentPrompt: 'What changed when your family moved or formed a new connection?',
      },
      junior: {
        explanation: 'Identity and migration are not single lines. People maintain, adapt, and combine connections across places and generations.',
        offline: 'Interview a family member about one move or meaningful place. Record what changed and what continued.',
        parentPrompt: 'Which parts are memory, which are evidence, and where might another person remember differently?',
      },
    },
  },
  {
    id: 'place-then-now',
    day: 6,
    title: 'Objects Are Clues to Change',
    icon: '📻',
    colour: '#B45309',
    surface: '#FFFBEB',
    question: 'How can an old object help us understand the past?',
    story: 'Historians treat objects, photographs, maps, documents, and memories as sources. Each source offers evidence, but no source answers every question.',
    clues: [
      { id: 'material', icon: '🧱', label: 'Materials show how something was made' },
      { id: 'use', icon: '👐', label: 'Wear can suggest how it was used' },
      { id: 'context', icon: '📝', label: 'Labels and memories add context' },
    ],
    choices: [
      { id: 'proof', icon: '✅', label: 'It proves every detail' },
      { id: 'clue', icon: '🔎', label: 'It gives evidence and questions' },
      { id: 'nothing', icon: '🚫', label: 'It cannot tell us anything' },
    ],
    age: {
      toddler: {
        question: 'What can an old thing help us notice?',
        explanation: 'Old things can show how life was different before.',
        offline: 'Compare one older household object with something used today.',
        parentPrompt: 'What does your child notice is the same and different?',
      },
      early: {
        explanation: 'An object is a source. Its material, shape, wear, and story provide clues, but we still need questions and other evidence.',
        offline: 'Choose an old object or photograph. Record three observations and one question.',
        parentPrompt: 'Which statement is an observation, and which is a guess?',
      },
      junior: {
        explanation: 'Sources were created in particular contexts and have limits. Corroborating objects, documents, images, and testimony builds a stronger account.',
        offline: 'Write one claim about an old object, then list evidence that supports it and evidence still needed.',
        parentPrompt: 'How could the source mislead us if we ignored its context?',
      },
    },
  },
  {
    id: 'place-world-project',
    day: 7,
    title: 'My Place Story',
    icon: '🌍',
    colour: '#BE123C',
    surface: '#FFF1F2',
    question: 'What story connects your home to the wider world?',
    story: 'Places are connected through people, water, food, work, language, movement, memory, and choices. Your story can show several connections at once.',
    clues: [
      { id: 'home', icon: '🏠', label: 'Begin with a place you know' },
      { id: 'connection', icon: '🧵', label: 'Trace one connection outward' },
      { id: 'change', icon: '🌱', label: 'Show what changed or could improve' },
    ],
    choices: [
      { id: 'map', icon: '🗺️', label: 'A map of connections' },
      { id: 'timeline', icon: '⏳', label: 'A then-and-now timeline' },
      { id: 'story', icon: '📖', label: 'A family place story' },
    ],
    age: {
      toddler: {
        question: 'What places belong in your story?',
        explanation: 'Your place story can show home, people, and somewhere else that matters.',
        offline: 'Make a three-picture place story with a grown-up.',
        parentPrompt: 'What does your child choose first when explaining where they belong?',
      },
      early: {
        explanation: 'A strong place story uses a map, sequence, or family connection to explain how places and people are linked.',
        offline: 'Create your chosen map, timeline, or story with three labelled connections.',
        parentPrompt: 'What connection surprised your child most?',
      },
      junior: {
        explanation: 'A place account can combine spatial, historical, family, and systems evidence while acknowledging perspective and missing information.',
        offline: 'Create the chosen artifact with one claim, three pieces of evidence, and one next question.',
        parentPrompt: 'What evidence makes the account convincing, and whose perspective could deepen it?',
      },
    },
  },
]

export const HOME_TO_WORLD_ORDER = HOME_TO_WORLD_LESSONS.map(lesson => lesson.id)

export function getHomeToWorldLesson(lessonId, ageGroup = 'early') {
  const lesson = HOME_TO_WORLD_LESSONS.find(item => item.id === lessonId)
  if (!lesson) return null
  const age = lesson.age[ageGroup] || lesson.age.early
  return {
    ...lesson,
    ...age,
    ageGroup,
    stageLabels: AGE_COPY[ageGroup]?.stageLabels || AGE_COPY.early.stageLabels,
    saveLabel: AGE_COPY[ageGroup]?.saveLabel || AGE_COPY.early.saveLabel,
    strands: ['people-place-time', ...(lesson.id === 'place-family-roots' ? ['roots-culture-meaning'] : [])],
    arcs: [
      lesson.id === 'place-family-roots' ? 'family-roots-belonging' : 'home-to-world',
      ...(lesson.id === 'place-then-now' ? ['how-life-changed'] : []),
    ],
  }
}
