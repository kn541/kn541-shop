/**
 * KN541 상품 API
 * 정책: 프론트는 API로만 데이터를 가져온다
 * 인증 불필요 (공개 API)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL

// 실제 API 응답 구조 기반
export interface Product {
  id: string
  product_code: string
  product_name: string
  category_id: string
  supplier_id: string | null
  brand: string | null
  summary: string | null
  description: string | null
  thumbnail_url: string | null
  sale_price: number
  supply_price: number
  original_supply_price: number
  profit_amount: number
  stock_qty: number
  min_order_qty: number
  max_order_qty: number | null
  product_type: string       // '001' = 일반
  product_status: string     // 'ACTIVE' | 'INACTIVE' | 'SOLDOUT' | 'DELETED'
  is_option: boolean
  is_display: boolean
  is_new?: boolean
  is_best?: boolean
  is_sale?: boolean
  sale_discount_rate?: number
  shipping_fee: number
  free_shipping_over: number | null
  product_round: number
  created_at: string
  updated_at: string | null
  // 조인된 카테고리명 (목록 API에서 포함될 수 있음)
  category_name?: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  size: number
  has_next: boolean
}

// 상품 목록 조회
export async function getProducts(params?: {
  page?: number
  size?: number
  category_id?: string
  is_new?: boolean
  is_best?: boolean
  is_sale?: boolean
  keyword?: string
  product_status?: string
}): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.size) query.set('size', String(params.size))
  if (params?.category_id) query.set('category_id', params.category_id)
  if (params?.is_new) query.set('is_new', 'true')
  if (params?.is_best) query.set('is_best', 'true')
  if (params?.is_sale) query.set('is_sale', 'true')
  if (params?.keyword) query.set('keyword', params.keyword)
  if (params?.product_status) query.set('product_status', params.product_status)

  const url = `${BASE}/products${query.toString() ? `?${query}` : ''}`
  const res = await fetch(url, {
    next: { revalidate: 60 }, // 1분 캐시
  })
  if (!res.ok) throw new Error('상품 조회 실패')
  const data = await res.json()
  return data.data
}

// 상품 단건 조회
export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('상품 조회 실패')
  const data = await res.json()
  return data.data
}

// 신상품 (product_round 기준 최신)
export async function getNewProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ size, product_status: 'ACTIVE' })
  return result.items
}

// 베스트 상품
export async function getBestProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ is_best: true, size })
  return result.items
}

// 세일 상품
export async function getSaleProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ is_sale: true, size })
  return result.items
}

// 카테고리별 상품
export async function getProductsByCategory(category_id: string, size = 20): Promise<Product[]> {
  const result = await getProducts({ category_id, size })
  return result.items
}

// 상품 이미지 URL 안전하게 가져오기 (thumbnail_url 없으면 placeholder)
export function getProductImageUrl(product: Product): string {
  return product.thumbnail_url || '/placeholder-product.jpg'
}

// 할인율 계산
export function getDiscountRate(product: Product): number {
  if (!product.sale_price || !product.original_supply_price) return 0
  return Math.round((1 - product.supply_price / product.sale_price) * 100)
}
