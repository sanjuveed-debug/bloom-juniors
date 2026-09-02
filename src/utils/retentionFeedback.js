import { formatLocalDate } from './date.js'

export const RETENTION_FEEDBACK_PROMPTS = {
  d3: {
    day: 3,
    title: 'A quick check-in',
    question: 'What has made it hardest to return to Bloom Juniors?',
    options: [
      { id: 'time', label: 'Finding time' },
      { id: 'child_interest', label: 'Child lost interest' },
      { id: 'too_much_choice', label: 'Too many choices' },
      { id: 'technical', label: 'A technical problem' },
      { id: 'nothing', label: 'Nothing so far' },
    ],
  },
  d7: {
    day: 7,
    title: 'One-week check-in',
    question: 'What has most encouraged your child to return?',
    options: [
      { id: 'story', label: 'The continuing story' },
      { id: 'learning', label: 'The learning activities' },
      { id: 'wonder', label: 'Wonder questions' },
      { id: 'rewards', label: 'Treasures and rewards' },
      { id: 'not_returning', label: 'They are not returning yet' },
    ],
  },
}

function validRecord(value, prompt) {
  if (!value || typeof value !== 'object') return null
  const validAnswer = prompt.options.some(option => option.id === value.answer)
  const status = value.status === 'answered'
    ? 'answered'
    : value.status === 'dismissed'
      ? 'dismissed'
      : ''
  if (!status || (status === 'answered' && !validAnswer)) return null
  return {
    status,
    answer: status === 'answered' ? String(value.answer) : '',
    at: Math.max(0, Number(value.at) || 0),
    date: String(value.date || '').slice(0, 10),
  }
}

export function normalizeRetentionFeedback(value = {}) {
  return {
    version: 1,
    d3: validRecord(value?.d3, RETENTION_FEEDBACK_PROMPTS.d3),
    d7: validRecord(value?.d7, RETENTION_FEEDBACK_PROMPTS.d7),
  }
}

function parseDate(value) {
  const [year, month, day] = String(value || '').split('-').map(Number)
  return Date.UTC(year || 1970, (month || 1) - 1, day || 1)
}

function dayDiff(from, to) {
  return Math.max(0, Math.round((parseDate(to) - parseDate(from)) / 86400000))
}

export function getFirstLearningDate(progress = {}) {
  const dates = (progress.sessions || [])
    .map(session => Number(session?.date))
    .filter(Boolean)
    .sort((a, b) => a - b)
  return dates[0] ? formatLocalDate(new Date(dates[0])) : ''
}

export function getRetentionFeedbackPrompt(progress = {}, now = new Date()) {
  const firstDate = getFirstLearningDate(progress)
  if (!firstDate) return null
  const today = formatLocalDate(now)
  const age = dayDiff(firstDate, today)
  const state = normalizeRetentionFeedback(progress.retentionFeedback)
  if (age >= 3 && !state.d3) return { id: 'd3', ...RETENTION_FEEDBACK_PROMPTS.d3, firstDate, age }
  if (age >= 7 && !state.d7) return { id: 'd7', ...RETENTION_FEEDBACK_PROMPTS.d7, firstDate, age }
  return null
}

export function answerRetentionFeedback(value, promptId, answer, now = Date.now()) {
  const prompt = RETENTION_FEEDBACK_PROMPTS[promptId]
  const current = normalizeRetentionFeedback(value)
  if (!prompt || !prompt.options.some(option => option.id === answer)) return current
  return {
    ...current,
    [promptId]: {
      status: 'answered',
      answer,
      at: now,
      date: formatLocalDate(new Date(now)),
    },
  }
}

export function dismissRetentionFeedback(value, promptId, now = Date.now()) {
  if (!RETENTION_FEEDBACK_PROMPTS[promptId]) return normalizeRetentionFeedback(value)
  const current = normalizeRetentionFeedback(value)
  return {
    ...current,
    [promptId]: {
      status: 'dismissed',
      answer: '',
      at: now,
      date: formatLocalDate(new Date(now)),
    },
  }
}

export function mergeRetentionFeedback(localValue = {}, cloudValue = {}) {
  const local = normalizeRetentionFeedback(localValue)
  const cloud = normalizeRetentionFeedback(cloudValue)
  const newest = key => {
    const values = [local[key], cloud[key]].filter(Boolean).sort((a, b) => b.at - a.at)
    return values[0] || null
  }
  return { version: 1, d3: newest('d3'), d7: newest('d7') }
}
