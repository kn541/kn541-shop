/** 로그인 후 비밀번호 강제/권고 플로우용 sessionStorage 키 */

export const PW_FORCE_TOKEN_KEY = 'kn541_pw_force_temp_token'
export const PW_FORCE_MESSAGE_KEY = 'kn541_pw_force_message'
export const PW_REMINDER_PENDING_KEY = 'kn541_pw_reminder_pending'
export const PW_REMINDER_DAYS_KEY = 'kn541_pw_reminder_days'

const AUTH_ALLOW_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/forgot-username',
  '/force-change-password',
  '/password-reminder',
]

export function isAuthExemptPath(pathname: string): boolean {
  const p = pathname.replace(/^\/(ko|en|zh)/, '') || '/'
  return AUTH_ALLOW_PREFIXES.some(prefix => p === prefix || p.startsWith(`${prefix}/`))
}

export function setForceChangeSession(tempToken: string, message?: string) {
  sessionStorage.setItem(PW_FORCE_TOKEN_KEY, tempToken)
  if (message) sessionStorage.setItem(PW_FORCE_MESSAGE_KEY, message)
  else sessionStorage.removeItem(PW_FORCE_MESSAGE_KEY)
}

export function clearForceChangeSession() {
  sessionStorage.removeItem(PW_FORCE_TOKEN_KEY)
  sessionStorage.removeItem(PW_FORCE_MESSAGE_KEY)
}

export function getForceChangeSession(): { tempToken: string; message?: string } | null {
  const tempToken = sessionStorage.getItem(PW_FORCE_TOKEN_KEY)
  if (!tempToken) return null
  return {
    tempToken,
    message: sessionStorage.getItem(PW_FORCE_MESSAGE_KEY) ?? undefined,
  }
}

export function setPasswordReminderPending(daysSinceChange: number) {
  sessionStorage.setItem(PW_REMINDER_PENDING_KEY, '1')
  sessionStorage.setItem(PW_REMINDER_DAYS_KEY, String(daysSinceChange))
}

export function clearPasswordReminderPending() {
  sessionStorage.removeItem(PW_REMINDER_PENDING_KEY)
  sessionStorage.removeItem(PW_REMINDER_DAYS_KEY)
}

export function isPasswordReminderPending(): boolean {
  return sessionStorage.getItem(PW_REMINDER_PENDING_KEY) === '1'
}

export function getPasswordReminderDays(): number {
  const n = Number(sessionStorage.getItem(PW_REMINDER_DAYS_KEY) ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function persistLoginTokens(data: {
  access_token: string
  refresh_token?: string
  user_type?: string | null
}) {
  localStorage.setItem('access_token', data.access_token)
  if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
  if (data.user_type != null && String(data.user_type) !== '') {
    localStorage.setItem('user_type', String(data.user_type))
  } else {
    localStorage.removeItem('user_type')
  }
}
