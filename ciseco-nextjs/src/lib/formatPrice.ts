/**
 * KN541 한국어 가격 문자열 (예: 88,888원)
 * — en/zh 등 다른 로케일 포맷은 이 파일의 `formatPriceKo`만 사용하고,
 *   별도 분기가 필요하면 다른 모듈에서 처리한다.
 */
export function formatPriceKo(amount: number): string {
  const n = Math.round(Number(amount) || 0)
  return `${new Intl.NumberFormat('ko-KR').format(n)}원`
}
