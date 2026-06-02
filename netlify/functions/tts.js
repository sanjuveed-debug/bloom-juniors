/**
 * TTS proxy — currently disabled (no paid API configured).
 * Returns 503 so useSpeech.js falls back to the browser's Web Speech API.
 * To enable OpenAI TTS in future: add OPENAI_API_KEY to Netlify env vars.
 */
exports.handler = async () => ({
  statusCode: 503,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: 'Cloud TTS not configured — using browser TTS' }),
})
