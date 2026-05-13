/**
 * KN541 비밀번호 보안 정책 — 프론트 실시간 검증용
 * 백엔드 정책과 불일치하면 안 되므로 변경 시 API 스펙과 함께 검토할 것.
 */

const HANGUL_RE = /[ㄱ-ㅎㅏ-ㅣ가-힣]/

export function stripHangulFromPassword(pw: string): string {
  return pw.replace(HANGUL_RE, '')
}

export function passwordContainsHangul(pw: string): boolean {
  return HANGUL_RE.test(pw)
}

export type PasswordPolicyCheck = {
  minLength: boolean
  hasNumberOrSpecial: boolean
  notAllSame: boolean
  noHangul: boolean
}

/** 신규 정책: 8자 이상 · 숫자 또는 특수문자 · 동일문자 반복 불가 · 한글 불가 (백엔드 validate_password 와 동기화) */
export function checkPasswordPolicy(pw: string): PasswordPolicyCheck {
  const hasNumber = /\d/.test(pw)
  const hasSpecial = /[!@#$%^&*()\-_+=\[\]{}|;':",.<>?/`~\\]/.test(pw)
  return {
    minLength: pw.length >= 8,
    hasNumberOrSpecial: hasNumber || hasSpecial,
    notAllSame: pw.length > 0 && new Set(pw).size > 1,
    noHangul: !passwordContainsHangul(pw),
  }
}

export function isPasswordValid(pw: string): boolean {
  const c = checkPasswordPolicy(pw)
  return c.minLength && c.hasNumberOrSpecial && c.notAllSame && c.noHangul
}
