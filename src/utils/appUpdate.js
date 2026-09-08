let available = false
let applyUpdate = null
const listeners = new Set()
export const subscribeUpdate = listener => { listeners.add(listener); return () => listeners.delete(listener) }
export const hasAppUpdate = () => available
export function offerAppUpdate(apply) {
  applyUpdate = apply
  available = true
  listeners.forEach(listener => listener())
}
export const installAppUpdate = () => applyUpdate?.(true)
