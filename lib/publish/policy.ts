export type Actor = 'admin' | 'institute_admin'

export function canTogglePublish(
  current: { published: boolean; lockedByAdmin: boolean },
  actor: Actor,
  nextPublished: boolean
): boolean {
  if (actor === 'admin') return true
  if (actor === 'institute_admin') {
    if (nextPublished && current.lockedByAdmin && !current.published) return false
    return true
  }
  return false
}
