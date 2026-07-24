export function getWorldExplorerStars(correctAnswers) {
  if (correctAnswers >= 6) return 3
  if (correctAnswers >= 4) return 2
  return 1
}

export function buildSoundPopCompletion({
  totalRounds,
  correctAnswers,
  bonusStars,
  wrongSounds,
  questionSignatures = [],
}) {
  return {
    stars: bonusStars,
    sessionData: {
      total: totalRounds,
      correct: correctAnswers,
      struggles: wrongSounds,
      ...(questionSignatures.length ? { questionSignatures } : {}),
    },
  }
}

export function getExerciseCompletionReward({
  sessionMode,
  exerciseIndex,
  totalExercises,
}) {
  const completedWorkout =
    sessionMode === 'full' && exerciseIndex + 1 >= totalExercises

  if (completedWorkout) {
    return {
      stars: 5,
      sessionData: {
        total: totalExercises,
        correct: totalExercises,
        struggles: [],
      },
    }
  }

  if (sessionMode === 'single') {
    return {
      stars: 1,
      sessionData: { total: 1, correct: 1, struggles: [] },
    }
  }

  return null
}
