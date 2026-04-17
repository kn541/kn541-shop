/**
 * KN541 상품 API
 * 정책: 프론트는 API로만 데이터를 가져온다
 * 인증 불필요 (공개 API)
 * fix: product_id(UUID) 필드 추가, description/images 필드 추가
 */

const BASE = process.env.NEXT_PUBLIC_API_URL

// 실제 API 응답 구조 기반
export interface Product {
  // ★ 단건 조회 시 product_id (UUID), 목록도 동일
  product_id: string
  id?: string   // 하위호환

  product_code: string
  product_no?: string
  product_name: string
  category_id: string
  category_name?: string
  category_code?: string
  category_id_1?: string
  category_name_1?: string
  category_id_2?: string
  category_name_2?: string
  supplier_id: string | null
  supplier_name?: string | null
  supplier_username?: string | null
  brand: string | null
  summary: string | null
  // ★ description: product_content 테이블 (HTML 가능)
  description: string | null
  mobile_description?: string | null
  delivery_notice?: string | null
  thumbnail_url: string | null
  // ★ images: v_product_detail 뷰에서 JSONB 집계
  images?: Array<{ image_url: string; image_type: string; sort_order: number }> | null
  sale_price: number
  supply_price: number
  original_supply_price: number
  consumer_price?: number
  market_price?: number
  profit_amount: number
  commission_base_amount: number | null
  stock_qty: number
  min_order_qty: number
  max_order_qty: number | null
  product_type: string
  product_status: string
  approval_status?: string
  is_option: boolean
  is_display: boolean
  is_new?: boolean
  is_best?: boolean
  is_sale?: boolean
  is_soldout?: boolean
  is_discontinued?: boolean
  is_recommended?: boolean
  sale_discount_rate?: number
  sc_type?: number
  sc_price?: number
  sc_minimum?: number | null
  sc_qty?: number
  shipping_fee: number
  free_shipping_over: number | null
  return_fee?: number
  exchange_fee?: number
  delivery_days?: number
  product_round: number
  created_at: string
  updated_at: string | null
  kmc_item_id?: string | null
  kmc_serial?: string | null
  // 단건 조회 추가 필드
  options?: Array<{
    id: string
    option_name: string
    add_price: number
    stock_qty: number
    sort_order: number
    is_active: boolean
  }>
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  size: number
  has_next?: boolean
}

// 상품 목록 조회 — 공개 API (인증 불필요)
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
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('상품 조회 실패')
  const data = await res.json()
  return data.data
}

// ★ 상품 단건 조회 — product_id (UUID) 사용
export async function getProductById(productId: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${productId}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`상품 조회 실패: ${productId}`)
  const data = await res.json()
  return data.data
}

// ★ product_code로 product_id(UUID) 조회 후 단건 조회
export async function getProductByCode(productCode: string): Promise<Product | null> {
  try {
    // 목록에서 product_code로 찾기 (상태 필터 없이)
    const query = new URLSearchParams({ size: '200', keyword: productCode })
    const res = await fetch(`${BASE}/products?${query}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const data = await res.json()
    const items: Product[] = data.data?.items ?? []

    // product_code 정확 매칭
    const found = items.find(
      (p) => p.product_code === productCode || p.product_no === productCode || p.kmc_serial === productCode
    )
    if (!found) return null

    // UUID로 단건 상세 조회 (description, images 포함)
    const uuid = found.product_id || found.id
    if (!uuid) return found
    return await getProductById(uuid)
  } catch {
    return null
  }
}

// 신상품
export async function getNewProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ size })
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

export function getProductImageUrl(product: Product): string {
  return product.thumbnail_url || '/placeholder-product.jpg'
}

export function getDiscountRate(product: Product): number {
  if (!product.sale_price || !product.original_supply_price) return 0
  return Math.round((1 - product.supply_price / product.sale_price) * 100)
}
