export default function ActivityVoiceControls({ voice }) {
  return <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8 }} data-activity-voice>
    <button type="button" onClick={voice.replay} aria-label="Hear the instructions">&#128266; Hear again</button>
    <button type="button" onClick={voice.toggle} aria-pressed={voice.enabled} aria-label={voice.enabled ? 'Mute automatic voice' : 'Turn on automatic voice'}>{voice.enabled ? '\uD83D\uDD0A Voice on' : '\uD83D\uDD07 Voice off'}</button>
  </span>
}
