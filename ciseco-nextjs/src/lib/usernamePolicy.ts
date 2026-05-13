/** 아이디 입력: 영문·숫자만 (백엔드 validate_username과 동기화) */

export const HANGUL_CHARS_RE = /[ㄱ-ㅎㅏ-ㅣ가-힣]/

/** 허용 문자만 남김 (실시간 입력용) */
export function sanitizeUsernameInput(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '')
}

export const USERNAME_OK_RE = /^[a-zA-Z0-9]{4,20}$/

export function isUsernameFormatValid(u: string): boolean {
  if (!u.trim()) return true
  return USERNAME_OK_RE.test(u)
}
