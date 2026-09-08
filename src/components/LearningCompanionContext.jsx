import { createContext, useContext } from 'react'
export const LearningCompanionContext = createContext('yaagvi')
export const useLearningCompanion = () => useContext(LearningCompanionContext)
