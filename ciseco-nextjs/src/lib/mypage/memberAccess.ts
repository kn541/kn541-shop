/** 마이페이지 메뉴·페이지 접근 — user_type 기준 */

export const USER_TYPE_GENERAL = '002'
export const USER_TYPE_PAID = '006'

/** 유료회원(006) 전용 경로
 * withdraw 제거: 현금출금 기능 폐지 (배당→포인트 직접 적립으로 변경)
 */
export const PAID_MEMBER_PATHS = [
  '/commission',
  '/dividends',
  '/tree',
  '/myshop',
] as const

export const UPGRADE_PAID_PATH = '/upgrade-paid'

export function isPaidMember(userType: string | null | undefined): boolean {
  return String(userType ?? '').trim() === USER_TYPE_PAID
}

export function isGeneralMember(userType: string | null | undefined): boolean {
  return String(userType ?? '').trim() === USER_TYPE_GENERAL
}

export function isPaidOnlyPath(path: string): boolean {
  const base = path.split('?')[0]
  if (PAID_MEMBER_PATHS.includes(base as (typeof PAID_MEMBER_PATHS)[number])) return true
  if (base.startsWith('/dividends/')) return true
  if (base.startsWith('/myshop/')) return true
  return false
}
