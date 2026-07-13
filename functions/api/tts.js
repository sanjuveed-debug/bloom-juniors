function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Allow a small, known-safe SSML subset inside the outer prosody element.
function isValidSsmlInner(value) {
  const cleaned = value
    .replace(/<phoneme\b[^>]*>[\s\S]*?<\/phoneme>/g, '')
    .replace(/<say-as\b[^>]*>[\s\S]*?<\/say-as>/g, '')
    .replace(/<break\b[^>]*\/?>/g, '')
    .replace(/<prosody\b[^>]*>/g, '')
    .replace(/<\/prosody>/g, '')
  return !/</.test(cleaned)
}

const ALLOWED_VOICES = [
  'en-US-AnaNeural',
  'en-GB-LibbyNeural',
  'en-GB-SoniaNeural',
  'en-GB-RyanNeural',
  'en-US-AriaNeural',
  'en-US-GuyNeural',
]

export function normalizeAzureKey(value = '') {
  let key = String(value || '').trim()
  key = key.replace(/^AZURE_TTS_KEY\s*=\s*/i, '').trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim()
  }
  return key.replace(/[^\x20-\x7E]/g, '')
}

export function getAzureRegionCandidates(configuredRegion = '', extraRegions = '') {
  const configured = String(configuredRegion || '').trim().toLowerCase()
  const extras = String(extraRegions || '')
    .split(',')
    .map((region) => region.trim().toLowerCase())
    .filter(Boolean)

  // Speech keys only work in the region where their Azure resource was made.
  // Prefer the configured region, then try regions used by earlier Bloom setups.
  return [...new Set([configured, ...extras, 'uksouth', 'eastus', 'centralindia'].filter(Boolean))]
}

async function synthesizeWithAzure({ key, region, ssml }) {
  let response
  try {
    response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
          'User-Agent': 'BloomJuniors/1.0',
        },
        body: ssml,
      }
    )
  } catch {
    return { ok: false, region, status: 0, reason: 'unreachable' }
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    return {
      ok: false,
      region,
      status: response.status,
      reason: detail.replace(/\s+/g, ' ').trim().slice(0, 120) || 'request rejected',
    }
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('audio/')) {
    return { ok: false, region, status: response.status, reason: `non-audio ${contentType || 'response'}` }
  }

  const audio = await response.arrayBuffer()
  const bytes = new Uint8Array(audio)
  if (!bytes.length || bytes[0] === 0x3C) {
    return { ok: false, region, status: response.status, reason: 'invalid audio body' }
  }

  return { ok: true, region, audio }
}

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const key = normalizeAzureKey(env.AZURE_TTS_KEY)
  const regions = getAzureRegionCandidates(env.AZURE_TTS_REGION, env.AZURE_TTS_FALLBACK_REGIONS)

  if (!key) return textResponse('Azure speech is not configured', 503)

  const origin = request.headers.get('Origin') || ''
  const isAllowed =
    origin.includes('bloomjuniors.com') ||
    origin.includes('pages.dev') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  if (!isAllowed) return textResponse('Forbidden', 403)

  let body = {}
  try {
    body = await request.json()
  } catch {
    return textResponse('Bad request', 400)
  }

  const rawText = String(body.text || '').trim()
  const voice = ALLOWED_VOICES.includes(body.voice) ? body.voice : 'en-US-AnaNeural'
  const rate = Math.max(-30, Math.min(30, Math.round(Number(body.rate) || 0)))
  const ssmlInnerRaw = typeof body.ssmlInner === 'string' ? body.ssmlInner.slice(0, 1200) : null

  if (!rawText || rawText.length > 600) return textResponse('Invalid text length', 400)

  const prosodyBody = ssmlInnerRaw && isValidSsmlInner(ssmlInnerRaw)
    ? ssmlInnerRaw
    : escapeXml(rawText)
  const rateString = rate >= 0 ? `+${rate}%` : `${rate}%`
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody rate="${rateString}">${prosodyBody}</prosody></voice></speak>`

  const attempts = []
  for (const region of regions) {
    const result = await synthesizeWithAzure({ key, region, ssml })
    if (result.ok) {
      return new Response(result.audio, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'X-Bloom-TTS-Region': result.region,
        },
      })
    }
    attempts.push(`${result.region}:${result.status || 'network'}:${result.reason}`)
  }

  // Cloudflare replaces 502 bodies with a generic message. 424 keeps the safe,
  // key-free Azure diagnostic visible so failures can be fixed quickly.
  return textResponse(`Azure speech unavailable (${attempts.join(' | ')})`, 424)
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
