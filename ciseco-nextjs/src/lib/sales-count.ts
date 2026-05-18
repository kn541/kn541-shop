/** products.sales_count / sort_sales_count → 표시 문구 */

export function readSalesCount(raw: {
  sales_count?: number | null
  sort_sales_count?: number | null
}): number {
  const n = Number(raw.sales_count ?? raw.sort_sales_count ?? 0)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

export function isPreorderProduct(productType?: string | null, title?: string | null): boolean {
  if (productType === '002') return true
  const t = (title || '').trim()
  return t.includes('[사전예약]') || t.includes('사전예약')
}

/** 카드 뱃지용 짧은 라벨 */
export function formatSalesCountBadge(
  count: number,
  opts?: { productType?: string | null; title?: string | null }
): string | null {
  if (count <= 0) return null
  const pre = isPreorderProduct(opts?.productType, opts?.title)
  return pre ? `${count.toLocaleString('ko-KR')}명 예약` : `${count.toLocaleString('ko-KR')}개 판매`
}

/** 상품 상세 가격 아래 */
export function formatSalesCountDetail(
  count: number,
  opts?: { productType?: string | null; title?: string | null }
): string | null {
  if (count <= 0) return null
  const pre = isPreorderProduct(opts?.productType, opts?.title)
  return pre ? `${count.toLocaleString('ko-KR')}명 예약됨` : `${count.toLocaleString('ko-KR')}개 판매됨`
}
