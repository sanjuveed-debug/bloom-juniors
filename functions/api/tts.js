function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Allow <phoneme>, <say-as>, <break>, <prosody> SSML elements inside the outer prosody
function isValidSsmlInner(s) {
  const cleaned = s
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

async function getAzureToken(key, region) {
  const resp = await fetch(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0',
      },
      body: '',
    }
  )
  if (!resp.ok) {
    const msg = await resp.text().catch(() => '')
    throw new Error(`token:${resp.status}:${msg}`)
  }
  return resp.text()
}

export async function onRequestPost(context) {
  const { request, env } = context

  const key = (env.AZURE_TTS_KEY || '').trim().replace(/[^\x20-\x7E]/g, '')
  const region = (env.AZURE_TTS_REGION || 'eastus').trim()

  if (!key) {
    return new Response('TTS not configured', { status: 503 })
  }

  // Basic origin check — only allow our own domain and Cloudflare preview URLs
  const origin = request.headers.get('Origin') || ''
  const isAllowed =
    origin.includes('bloomjuniors.com') ||
    origin.includes('pages.dev') ||
    origin.includes('localhost')
  if (!isAllowed) {
    return new Response('Forbidden', { status: 403 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const rawText = String(body.text || '').trim()
  const voice = ALLOWED_VOICES.includes(body.voice) ? body.voice : 'en-US-AnaNeural'
  const rate = Math.max(-30, Math.min(30, Math.round(Number(body.rate) || 0)))
  const ssmlInnerRaw = typeof body.ssmlInner === 'string' ? body.ssmlInner.slice(0, 1200) : null

  if (!rawText || rawText.length > 600) {
    return new Response('Invalid text length', { status: 400 })
  }

  const prosodyBody = (ssmlInnerRaw && isValidSsmlInner(ssmlInnerRaw))
    ? ssmlInnerRaw
    : escapeXml(rawText)
  const rateStr = rate >= 0 ? `+${rate}%` : `${rate}%`
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody rate="${rateStr}">${prosodyBody}</prosody></voice></speak>`

  // Get a short-lived Bearer token — avoids any edge-network filtering of the
  // Ocp-Apim-Subscription-Key header that some Azure front-ends apply.
  let token
  try {
    token = await getAzureToken(key, region)
  } catch (err) {
    return new Response(`Token error: ${err.message}`, { status: 502 })
  }

  let azureResp
  try {
    azureResp = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
          'User-Agent': 'Mozilla/5.0 (compatible; BloomJuniors/1.0)',
        },
        body: ssml,
      }
    )
  } catch (err) {
    return new Response('Azure unreachable', { status: 502 })
  }

  if (!azureResp.ok) {
    return new Response('Azure TTS error', { status: 502 })
  }

  const audio = await azureResp.arrayBuffer()

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800',
      'Access-Control-Allow-Origin': '*',
    },
  })
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
