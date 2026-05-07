/**
 * KN541 비밀번호 보안 정책 — 프론트 실시간 검증용
 * 백엔드 정책과 불일치하면 안 되므로 변경 시 API 스펙과 함께 검토할 것.
 */

export type PasswordPolicyCheck = {
  minLength: boolean
  hasNumber: boolean
  hasSpecial: boolean
  notAllSame: boolean
}

/** 신규 정책: 길이·숫자·특수문자·동일문자 반복 불가 */
export function checkPasswordPolicy(pw: string): PasswordPolicyCheck {
  return {
    minLength: pw.length >= 8,
    hasNumber: /\d/.test(pw),
    hasSpecial: /[!@#$%^&*()\-_+=\[\]{}|;':",.<>?/`~\\]/.test(pw),
    notAllSame: pw.length > 0 && new Set(pw).size > 1,
  }
}

export function isPasswordValid(pw: string): boolean {
  const c = checkPasswordPolicy(pw)
  return c.minLength && c.hasNumber && c.hasSpecial && c.notAllSame
}
