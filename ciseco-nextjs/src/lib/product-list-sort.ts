/** URL ?sort= 값과 GET /products 쿼리 파라미터 매핑 (상품 목록 공통) */

export const PRODUCT_SORT_VALUES = [
  'newest',
  'sales_count',
  'review_count',
  'price_asc',
  'price_desc',
] as const

export type ProductSortValue = (typeof PRODUCT_SORT_VALUES)[number]

export function isProductSortValue(v: string | null | undefined): v is ProductSortValue {
  return v != null && (PRODUCT_SORT_VALUES as readonly string[]).includes(v)
}

export function normalizeProductSortParam(v: string | null | undefined): ProductSortValue {
  if (isProductSortValue(v)) return v
  return 'newest'
}

export function productSortToApiQuery(sort: ProductSortValue): { sort_by: string; sort_order: string } {
  switch (sort) {
    case 'newest':
      return { sort_by: 'created_at', sort_order: 'desc' }
    case 'sales_count':
      return { sort_by: 'sales_count', sort_order: 'desc' }
    case 'review_count':
      return { sort_by: 'review_count', sort_order: 'desc' }
    case 'price_asc':
      return { sort_by: 'sale_price', sort_order: 'asc' }
    case 'price_desc':
      return { sort_by: 'sale_price', sort_order: 'desc' }
    default:
      return { sort_by: 'created_at', sort_order: 'desc' }
  }
}

export function applyProductSortToSearchParams(qs: URLSearchParams, sort: ProductSortValue): void {
  const { sort_by, sort_order } = productSortToApiQuery(sort)
  qs.set('sort_by', sort_by)
  qs.set('sort_order', sort_order)
}
