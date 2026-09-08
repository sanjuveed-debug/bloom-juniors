export const HIGH_FIVE_STICKERS = [
  { id: 'star', emoji: '⭐', label: 'Proud star' },
  { id: 'heart', emoji: '💖', label: 'Love heart' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'trophy', emoji: '🏆', label: 'Champion trophy' },
  { id: 'butterfly', emoji: '🦋', label: 'Magic butterfly' },
  { id: 'unicorn', emoji: '🦄', label: 'Brave unicorn' },
]

export function normalizeParentHighFives(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const messages = Array.isArray(source.messages) ? source.messages : []
  return {
    version: 1,
    messages: messages
      .filter(item => item?.id && item?.message)
      .map(item => ({
        id: String(item.id),
        message: String(item.message).replace(/<[^>]*>/g, '').trim().slice(0, 120),
        stickerId: String(item.stickerId || 'star'),
        sticker: String(item.sticker || '⭐').slice(0, 8),
        createdAt: Math.max(0, Number(item.createdAt) || 0),
        deliveredAt: Math.max(0, Number(item.deliveredAt) || 0),
      }))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-30),
  }
}

export function getPendingHighFive(progress = {}) {
  return normalizeParentHighFives(progress.parentHighFives).messages.find(item => !item.deliveredAt) || null
}

export function queueParentHighFive(value, { message, stickerId = 'star', now = Date.now(), id } = {}) {
  const current = normalizeParentHighFives(value)
  if (current.messages.some(item => !item.deliveredAt)) return current
  const cleanMessage = String(message || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
  if (!cleanMessage) return current
  const sticker = HIGH_FIVE_STICKERS.find(item => item.id === stickerId) || HIGH_FIVE_STICKERS[0]
  const messageId = id || `high-five:${Math.max(0, Number(now) || Date.now())}:${Math.random().toString(36).slice(2, 8)}`
  return {
    version: 1,
    messages: [...current.messages, {
      id: messageId,
      message: cleanMessage,
      stickerId: sticker.id,
      sticker: sticker.emoji,
      createdAt: Math.max(0, Number(now) || Date.now()),
      deliveredAt: 0,
    }].slice(-30),
  }
}

export function deliverParentHighFive(progress = {}, messageId, now = Date.now()) {
  const current = normalizeParentHighFives(progress.parentHighFives)
  const target = current.messages.find(item => item.id === messageId)
  if (!target || target.deliveredAt) return progress
  const deliveredAt = Math.max(0, Number(now) || Date.now())
  const stickerExists = (progress.stickers || []).some(item => item.highFiveId === target.id)
  return {
    ...progress,
    parentHighFives: {
      version: 1,
      messages: current.messages.map(item => item.id === target.id ? { ...item, deliveredAt } : item),
    },
    stickers: stickerExists ? (progress.stickers || []) : [...(progress.stickers || []), {
      type: 'parent-high-five',
      emoji: target.sticker,
      label: 'Parent High-Five',
      message: target.message,
      highFiveId: target.id,
      date: deliveredAt,
    }],
  }
}

export function mergeParentHighFives(localValue = {}, cloudValue = {}) {
  const local = normalizeParentHighFives(localValue)
  const cloud = normalizeParentHighFives(cloudValue)
  const byId = new Map()
  for (const item of [...cloud.messages, ...local.messages]) {
    const previous = byId.get(item.id)
    if (!previous) byId.set(item.id, item)
    else byId.set(item.id, {
      ...(previous.createdAt <= item.createdAt ? previous : item),
      ...item,
      createdAt: [previous.createdAt, item.createdAt].filter(value => value > 0).sort((a, b) => a - b)[0] || 0,
      deliveredAt: Math.max(previous.deliveredAt || 0, item.deliveredAt || 0),
    })
  }
  return { version: 1, messages: [...byId.values()].sort((a, b) => a.createdAt - b.createdAt).slice(-30) }
}
