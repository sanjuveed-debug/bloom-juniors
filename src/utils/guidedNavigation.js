// These launchers already choose a specific curriculum step. The daily carousel
// must not silently replace it. Account access and parent limits still apply.
export function preservesGuidedDestination(source) {
  return source === 'first-mission' || source === 'starter-path' || source === 'weekly-chapter'
}
