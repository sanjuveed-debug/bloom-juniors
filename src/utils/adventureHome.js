import { ENDLESS_MODULES, getNeverFinishedAdventure } from './adventureDirector.js'
import { getActiveTreasure, getTreasureQuest } from './treasureLoadout.js'
import { getInterestRecommendations } from './childInterest.js'

export const ADVENTURE_HOME_COPY = {
  toddler: {
    eyebrow: 'YAAGVI KNOWS THE WAY',
    heading: 'Where shall we go?',
    continueLabel: 'GO!',
    playLabel: 'Pick a game',
    worldLabel: 'My magic world',
    playHint: 'See every game',
    worldHint: 'Plants, treasures & friends',
  },
  early: {
    eyebrow: 'YOUR ADVENTURE IS READY',
    heading: 'What shall we discover?',
    continueLabel: 'Continue my adventure',
    playLabel: 'Play anything',
    worldLabel: 'My world',
    playHint: 'Choose from every game',
    worldHint: 'Visit what you have grown',
  },
  junior: {
    eyebrow: 'YOUR NEXT MISSION',
    heading: 'Ready, explorer?',
    continueLabel: 'Continue mission',
    playLabel: 'Choose a mission',
    worldLabel: 'My living world',
    playHint: 'Open the expedition atlas',
    worldHint: 'Projects, treasures & discoveries',
  },
}

function findModule(ageGroup, moduleId) {
  return (ENDLESS_MODULES[ageGroup] || ENDLESS_MODULES.early).find(module => module.id === moduleId)
}

export function getAdventureHomeNext({ progress = {}, ageGroup = 'early', dailyNext, dailyDone = 0, dailyRequired = 2, dailyClaimed = false } = {}) {
  const age = ADVENTURE_HOME_COPY[ageGroup] ? ageGroup : 'early'
  const interest = getInterestRecommendations(progress, age)
  if (interest.continue) {
    return {
      source: 'interest-continue', action: 'navigate', moduleId: interest.continue.id, emoji: interest.continue.emoji,
      title: `Continue ${interest.continue.label}`,
      subtitle: age === 'toddler' ? 'Your game is still waiting for you!' : 'You stopped here last time. Your place is safe.',
      reward: 'Pick up exactly where your adventure paused',
    }
  }
  const launched = progress?.adventureDirector?.launched
  if (launched?.moduleId) {
    const module = findModule(age, launched.moduleId) || { id: launched.moduleId, label: launched.moduleId, emoji: '🗺️' }
    return {
      source: 'unfinished', action: 'navigate', moduleId: module.id, emoji: module.emoji,
      title: `Continue ${module.label}`,
      subtitle: age === 'toddler' ? 'Your little adventure is waiting!' : 'You stopped here last time. Your progress is safe.',
      reward: 'Finish the trail and reveal what comes next',
    }
  }

  const collection = progress?.treasureCollection || { items: [] }
  const active = getActiveTreasure(collection)
  const quest = active ? getTreasureQuest(collection, active.item.id, age) : null
  if (quest && !quest.locked && quest.nextModule) {
    return {
      source: 'treasure-quest', action: 'navigate', moduleId: quest.nextModule, emoji: active.item.emoji || active.item.icon || '🎁',
      title: age === 'toddler' ? `Help ${active.item.name || 'your treasure'}!` : `${active.item.name || 'Your treasure'} needs ${quest.nextName}`,
      subtitle: `${quest.completed.length}/${quest.required} quest stops complete`,
      reward: `${quest.reward?.icon || '✨'} Win ${quest.reward?.name || 'a permanent treasure power'}`,
    }
  }

  if (!dailyClaimed && dailyDone >= dailyRequired) {
    return {
      source: 'daily-reward', action: 'claim', moduleId: null, emoji: '🎁',
      title: age === 'toddler' ? 'Your treasure is ready!' : 'Open today’s real treasure',
      subtitle: 'You earned it by completing your adventures.',
      reward: 'Tap to reveal what is inside',
    }
  }

  if (dailyNext?.id) {
    return {
      source: 'daily', action: 'navigate', moduleId: dailyNext.id, emoji: dailyNext.emoji || '⭐',
      title: age === 'toddler' ? `Let’s play ${dailyNext.label}` : `Next: ${dailyNext.label}`,
      subtitle: dailyDone > 0 ? `${dailyDone}/${dailyRequired} adventures complete` : 'A fresh challenge chosen for you',
      reward: dailyClaimed ? 'Keep playing—questions continue to grow' : 'Complete the path to open today’s treasure',
    }
  }

  const endless = getNeverFinishedAdventure(progress, age)
  return {
    source: 'endless', action: 'navigate', moduleId: endless.module.id, emoji: endless.module.emoji,
    title: endless.mission.title,
    subtitle: `${endless.module.label} · ${endless.difficultyLabel}`,
    reward: 'A new route appears every time you play',
  }
}
