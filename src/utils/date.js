export function formatLocalDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function formatYesterdayLocalDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatLocalDate(d)
}
