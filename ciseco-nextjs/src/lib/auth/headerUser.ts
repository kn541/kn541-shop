/** 헤더 회원명 표시 — localStorage 캐시 + /auth/me 동기화 */

export const KN541_USER_NAME_KEY = 'user_name'
export const KN541_MEMBER_NO_KEY = 'member_no'

export function formatHeaderGreeting(name?: string | null, memberNo?: string | null): string {
  const n = (name ?? '').trim()
  if (n) return `${n}님`
  const m = (memberNo ?? '').trim()
  if (m) return `${m}님`
  return '회원님'
}

export function readCachedHeaderGreeting(): string | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem(KN541_USER_NAME_KEY)?.trim()
  const memberNo = localStorage.getItem(KN541_MEMBER_NO_KEY)?.trim()
  if (!name && !memberNo) return null
  return formatHeaderGreeting(name, memberNo)
}

export function persistHeaderUserCache(name?: string | null, memberNo?: string | null) {
  if (typeof window === 'undefined') return
  const n = (name ?? '').trim()
  const m = (memberNo ?? '').trim()
  if (n) localStorage.setItem(KN541_USER_NAME_KEY, n)
  else localStorage.removeItem(KN541_USER_NAME_KEY)
  if (m) localStorage.setItem(KN541_MEMBER_NO_KEY, m)
  else localStorage.removeItem(KN541_MEMBER_NO_KEY)
}

export function clearHeaderUserCache() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KN541_USER_NAME_KEY)
  localStorage.removeItem(KN541_MEMBER_NO_KEY)
}

export function greetingFromMePayload(data: Record<string, unknown> | null | undefined): string {
  if (!data) return formatHeaderGreeting(null, null)
  const name = String(data.name ?? data.full_name ?? data.user_name ?? '').trim() || null
  const memberNo = String(data.member_no ?? '').trim() || null
  persistHeaderUserCache(name, memberNo)
  return formatHeaderGreeting(name, memberNo)
}
