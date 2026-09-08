const MAX_FIELD = 120

function clean(value, max = MAX_FIELD) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

function cleanKey(value, fallback = '') {
  return clean(value, 80).toLowerCase().replace(/[^a-z0-9._-]+/g, '-') || fallback
}

function safeUrl(value) {
  try { return new URL(String(value || ''), 'https://bloomjuniors.com') } catch { return null }
}

export function normalizeAttribution(value = {}) {
  const source = cleanKey(value.source, 'unknown')
  return {
    version: 1,
    source,
    medium: cleanKey(value.medium),
    campaign: cleanKey(value.campaign),
    content: cleanKey(value.content),
    landingPath: clean(value.landingPath, 160) || '/',
    referrerHost: cleanKey(value.referrerHost),
    timezone: clean(value.timezone, 80),
    language: clean(value.language, 24),
    capturedAt: clean(value.capturedAt, 40),
  }
}

export function buildFirstTouchAttribution({
  pageUrl = '',
  referrer = '',
  timezone = '',
  language = '',
  storedUtm = {},
  capturedAt = new Date().toISOString(),
} = {}) {
  const landing = safeUrl(pageUrl)
  const referrerUrl = safeUrl(referrer)
  const landingHost = cleanKey(landing?.hostname)
  const referrerHost = cleanKey(referrerUrl?.hostname)
  const externalReferrer = referrerHost && referrerHost !== landingHost ? referrerHost : ''
  const params = landing?.searchParams
  const source = params?.get('utm_source') || storedUtm.source || externalReferrer || 'direct'
  const medium = params?.get('utm_medium') || storedUtm.medium || (externalReferrer ? 'referral' : '')

  return normalizeAttribution({
    source,
    medium,
    campaign: params?.get('utm_campaign') || storedUtm.campaign,
    content: params?.get('utm_content') || storedUtm.content,
    landingPath: landing?.pathname || '/',
    referrerHost: externalReferrer,
    timezone,
    language,
    capturedAt: storedUtm.capturedAt || capturedAt,
  })
}

export function attributionLabel(source) {
  const key = cleanKey(source, 'unknown')
  if (key === 'chatgpt.com' || key === 'chatgpt') return 'ChatGPT'
  if (key === 'direct') return 'Direct / untagged'
  if (key === 'unknown') return 'Pre-tracking / unknown'
  if (key === 'google' || key === 'google.com' || key === 'www.google.com') return 'Google'
  if (key === 'instagram' || key === 'instagram.com') return 'Instagram'
  if (key === 'tiktok' || key === 'tiktok.com') return 'TikTok'
  if (key === 'youtube' || key === 'youtube.com') return 'YouTube'
  if (key === 'reddit' || key === 'reddit.com') return 'Reddit'
  return key.replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}
