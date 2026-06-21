const GUEST_AI_LIMIT = 8
const WINDOW_MS = 60 * 60 * 1000

const callsByUser = new Map<string, number[]>()

export function isGuestAiLimitExceeded(userId: string): boolean {
  const now = Date.now()
  const calls = (callsByUser.get(userId) ?? []).filter((t) => now - t < WINDOW_MS)

  if (calls.length >= GUEST_AI_LIMIT) {
    callsByUser.set(userId, calls)
    return true
  }

  calls.push(now)
  callsByUser.set(userId, calls)
  return false
}
