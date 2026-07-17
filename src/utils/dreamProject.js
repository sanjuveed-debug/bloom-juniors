import { getCompanionLearningPoints } from './companionBond.js'

export const DREAM_PROJECT_VERSION = 1
export const DREAM_BUNDLE_POINTS = 12

const recipes = [1, 1, 2, 2, 3, 3]

export const DREAM_PROJECTS = {
  toddler: {
    id: 'rainbow-treehouse',
    name: 'Rainbow Treehouse',
    eyebrow: 'My companion dream project',
    description: 'Build a colourful home where every little friend can play.',
    materials: [['🪵','Magic wood'],['🎨','Rainbow paint'],['🌸','Garden seeds'],['✨','Friendship sparkle']],
    stages: [
      { name: 'Strong magic tree', detail: 'Give the treehouse a strong beginning.' },
      { name: 'Cosy play room', detail: 'Choose a special window.', choices: [{id:'heart',label:'Heart window',icon:'💗'},{id:'star',label:'Star window',icon:'⭐'}] },
      { name: 'Cloud ladder', detail: 'Add steps little feet can climb.' },
      { name: 'Secret garden', detail: 'Choose what grows beside the tree.', choices: [{id:'flowers',label:'Flower garden',icon:'🌷'},{id:'moon',label:'Moon garden',icon:'🌙'}] },
      { name: 'Companion bedroom', detail: 'Make a cosy room for your buddy.' },
      { name: 'Rainbow slide', detail: 'Finish with a magical way to play.' },
    ],
  },
  early: {
    id: 'magic-skyship',
    name: 'Magical Skyship',
    eyebrow: 'My companion dream project',
    description: 'Build a flying home that can discover a new world every day.',
    materials: [['⚙️','Magic gears'],['🎨','Sky paint'],['💎','Moon crystal'],['⚡','Flight energy']],
    stages: [
      { name: 'Moonlight engine', detail: 'Start the engine that remembers learning.' },
      { name: 'Explorer cabin', detail: 'Choose the shape of your skyship.', choices: [{id:'round',label:'Bubble cabin',icon:'🔵'},{id:'star',label:'Star cabin',icon:'⭐'}] },
      { name: 'Cloud wings', detail: 'Add wings for the first flight.' },
      { name: 'Adventure deck', detail: 'Choose a tool for the top deck.', choices: [{id:'telescope',label:'Telescope',icon:'🔭'},{id:'garden',label:'Sky garden',icon:'🌱'}] },
      { name: 'Companion room', detail: 'Make a place for your buddy to travel.' },
      { name: 'Rainbow flight trail', detail: 'Complete the ship and light the sky.' },
    ],
  },
  junior: {
    id: 'explorer-headquarters',
    name: 'Explorer Headquarters',
    eyebrow: 'Long-term expedition project',
    description: 'Construct a permanent base for discoveries, missions and companions.',
    materials: [['🧱','Build blocks'],['🔩','Tech parts'],['💎','Power crystal'],['📐','Explorer plans']],
    stages: [
      { name: 'Expedition foundation', detail: 'Establish a strong base for future missions.' },
      { name: 'Research wing', detail: 'Choose the first specialist laboratory.', choices: [{id:'science',label:'Science lab',icon:'🧪'},{id:'maps',label:'Map archive',icon:'🗺️'}] },
      { name: 'Strategy room', detail: 'Add a room for decoding difficult clues.' },
      { name: 'Observation tower', detail: 'Choose how the base explores.', choices: [{id:'telescope',label:'Space telescope',icon:'🔭'},{id:'drone',label:'Explorer drone',icon:'🛸'}] },
      { name: 'Companion command centre', detail: 'Give every companion an expedition role.' },
      { name: 'World beacon', detail: 'Activate the completed headquarters.' },
    ],
  },
}

export function normalizeDreamProject(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    version: DREAM_PROJECT_VERSION,
    projectId: typeof source.projectId === 'string' ? source.projectId : '',
    stage: Math.max(0, Math.min(6, Math.round(Number(source.stage) || 0))),
    choices: source.choices && typeof source.choices === 'object' ? source.choices : {},
    spentBundles: Math.max(0, Math.round(Number(source.spentBundles) || 0)),
    history: Array.isArray(source.history) ? source.history.filter(Boolean).slice(-30) : [],
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function getDreamProjectState(progress = {}, ageGroup = 'early') {
  const age = DREAM_PROJECTS[ageGroup] ? ageGroup : 'early'
  const project = DREAM_PROJECTS[age]
  const saved = normalizeDreamProject(progress.dreamProject)
  const compatible = !saved.projectId || saved.projectId === project.id
  const state = compatible ? saved : normalizeDreamProject()
  const learningPoints = getCompanionLearningPoints(progress)
  const totalBundles = 1 + Math.floor(learningPoints / DREAM_BUNDLE_POINTS)
  const availableBundles = Math.max(0, totalBundles - state.spentBundles)
  const nextStage = state.stage < project.stages.length ? project.stages[state.stage] : null
  const nextCost = nextStage ? recipes[state.stage] : 0
  const pointsIntoBundle = learningPoints % DREAM_BUNDLE_POINTS
  return {
    ageGroup: age,
    project,
    state: { ...state, projectId: project.id },
    learningPoints,
    totalBundles,
    availableBundles,
    nextStage,
    nextCost,
    canBuild: Boolean(nextStage) && availableBundles >= nextCost,
    completed: state.stage >= project.stages.length,
    progressPercent: Math.round((state.stage / project.stages.length) * 100),
    pointsToNextBundle: DREAM_BUNDLE_POINTS - pointsIntoBundle,
  }
}

export function buildDreamProjectStage(progress = {}, ageGroup = 'early', choiceId = '', now = Date.now()) {
  const current = getDreamProjectState(progress, ageGroup)
  if (!current.canBuild || !current.nextStage) return progress
  const stageNumber = current.state.stage + 1
  const choices = current.nextStage.choices || []
  const selected = choices.find(choice => choice.id === choiceId) || choices[0] || null
  const historyEntry = {
    id: `${current.project.id}:${stageNumber}`,
    stage: stageNumber,
    name: current.nextStage.name,
    choiceId: selected?.id || '',
    builtAt: now,
    cost: current.nextCost,
  }
  return {
    ...progress,
    dreamProject: {
      version: DREAM_PROJECT_VERSION,
      projectId: current.project.id,
      stage: stageNumber,
      choices: selected ? { ...current.state.choices, [stageNumber]: selected.id } : current.state.choices,
      spentBundles: current.state.spentBundles + current.nextCost,
      history: [...current.state.history.filter(entry => entry.id !== historyEntry.id), historyEntry].slice(-30),
      updatedAt: now,
    },
  }
}

export function mergeDreamProject(localValue = {}, cloudValue = {}) {
  const local = normalizeDreamProject(localValue)
  const cloud = normalizeDreamProject(cloudValue)
  const preferred = local.stage > cloud.stage ? local : cloud.stage > local.stage ? cloud : local.updatedAt >= cloud.updatedAt ? local : cloud
  const seen = new Set()
  const history = []
  for (const entry of [...cloud.history, ...local.history]) {
    const key = entry?.id || `${entry?.stage}:${entry?.builtAt || 0}`
    if (!key || seen.has(key)) continue
    seen.add(key); history.push(entry)
  }
  history.sort((a,b)=>(a.builtAt||0)-(b.builtAt||0))
  return {
    ...preferred,
    choices: { ...cloud.choices, ...local.choices, ...preferred.choices },
    spentBundles: Math.max(local.spentBundles, cloud.spentBundles),
    history: history.slice(-30),
  }
}
