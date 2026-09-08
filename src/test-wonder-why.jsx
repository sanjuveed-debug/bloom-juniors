import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WonderWhy from './modules/WonderWhy.jsx'
import {
  completeWonderDiscovery,
  completeWonderWhyDiscovery,
  SUNSET_RED_ID,
  WONDER_LESSONS,
} from './utils/wonderWhy.js'
import { FOUNDATION_SEASON_ORDER } from './data/foundationSeasonCurriculum.js'
import { formatLocalDate } from './utils/date.js'
import './index.css'

const params = new URLSearchParams(window.location.search)
const scenario = params.get('scenario') || 'first'
const ageGroup = params.get('age') || 'early'
const leavesResult = completeWonderWhyDiscovery({}, {
  prediction: 'reflects',
  testedColours: ['red', 'blue', 'green'],
}).state
const leavesComplete = { ...leavesResult, dailyAssignments: {} }
const todayDone = completeWonderWhyDiscovery({}, {
  prediction: 'reflects',
  testedColours: ['red', 'blue', 'green'],
  completedDate: formatLocalDate(),
}).state
const completedBook = WONDER_LESSONS.reduce((state, lesson) =>
  completeWonderDiscovery(state, lesson.id, {
    prediction: 'uat',
    testedColours: lesson.clues?.map(clue => clue.id) || [],
  }).state, {})
const firstWeekComplete = FOUNDATION_SEASON_ORDER.slice(0, 7).reduce((state, lessonId) =>
  completeWonderDiscovery(state, lessonId, {
    prediction: 'uat',
    testedColours: WONDER_LESSONS.find(lesson => lesson.id === lessonId)?.clues.map(clue => clue.id) || [],
  }).state, {})
const initialProgress = scenario === 'second'
  ? { wonderWhy: leavesComplete }
  : scenario === 'todaydone'
    ? { wonderWhy: todayDone }
  : scenario === 'book'
    ? { wonderWhy: completedBook }
    : scenario === 'generic'
      ? {
          wonderWhy: {
            ...firstWeekComplete,
            dailyAssignments: {},
          },
          foundationProfile: {
            roots: ['Kerala'],
            languages: ['Malayalam'],
            priorities: ['roots-culture-meaning'],
            interests: ['how-life-changed'],
            updatedAt: 100,
          },
        }
    : {}

function WonderWhyHarness() {
  const [progress, setProgress] = useState(initialProgress)

  return (
    <WonderWhy
      ageGroup={ageGroup}
      profileName="UAT Bloom"
      progress={progress}
      onUpdateProgress={patch => {
        setProgress(current => ({ ...current, ...patch }))
        window.__wonderWhyProgress = { ...progress, ...patch }
      }}
      onAddStars={(module, stars, sessionData) => {
        window.__wonderWhyReward = { module, stars, sessionData }
      }}
      onBack={() => {
        document.title = 'back'
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(<WonderWhyHarness />)
