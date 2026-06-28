/**
 * KN541 한국어 가격 포맷 (예: "88,888원")
 *
 * 모든 가격 표시에 이 함수를 사용합니다.
 * - NaN/undefined 방어: Number(amount) || 0
 * - 소수점 반올림: Math.round
 * - 천단위 구분: Intl.NumberFormat('ko-KR')
 * - 원 접미사 자동 추가
 */
export function formatPrice(amount: number): string {
  const n = Math.round(Number(amount) || 0)
  return `${new Intl.NumberFormat('ko-KR').format(n)}원`
}

/** @deprecated formatPrice를 사용하세요 */
export const formatPriceKo = formatPrice
