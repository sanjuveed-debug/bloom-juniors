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
}) {
  return {
    stars: bonusStars,
    sessionData: {
      total: totalRounds,
      correct: correctAnswers,
      struggles: wrongSounds,
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

  if (!completedWorkout) return null

  return {
    stars: 5,
    sessionData: {
      total: totalExercises,
      correct: totalExercises,
      struggles: [],
    },
  }
}
