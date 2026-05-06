/** 페이지네이션에 표시할 페이지 번호 (··· 구간은 'gap') */

export type PaginationItem = number | 'gap'

/**
 * 규칙: 5페이지 이하 전체 표시, 6+ 는 1·끝·현재±2 + 필요 시 gap
 */
export function getPaginationItems(current: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 1) return []
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const set = new Set<number>()
  set.add(1)
  set.add(totalPages)
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= totalPages) set.add(p)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: PaginationItem[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}
