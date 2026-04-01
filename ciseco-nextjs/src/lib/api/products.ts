/**
 * KN541 상품 API
 * 정책: 프론트는 API로만 데이터를 가져온다
 * 인증 불필요 (공개 API)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL

export interface ProductImage {
  id: string
  image_url: string
  sort_order: number
  is_main: boolean
}

export interface ProductOption {
  option_name: string
  option_values: string[]
}

export interface Product {
  id: string
  product_code: string
  product_name: string
  category_id: string
  category_name?: string
  sale_price: number
  supply_price?: number
  original_supply_price?: number
  product_status: string  // 'ACTIVE' | 'INACTIVE' | 'SOLDOUT'
  is_new: boolean
  is_best: boolean
  is_sale: boolean
  sale_discount_rate?: number
  stock_quantity: number
  thumbnail_url?: string
  images?: ProductImage[]
  options?: ProductOption[]
  description?: string
  created_at: string
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
}): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.size) query.set('size', String(params.size))
  if (params?.category_id) query.set('category_id', params.category_id)
  if (params?.is_new) query.set('is_new', 'true')
  if (params?.is_best) query.set('is_best', 'true')
  if (params?.is_sale) query.set('is_sale', 'true')
  if (params?.keyword) query.set('keyword', params.keyword)

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

// 신상품 조회
export async function getNewProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ is_new: true, size })
  return result.items
}

// 베스트 상품 조회
export async function getBestProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ is_best: true, size })
  return result.items
}

// 세일 상품 조회
export async function getSaleProducts(size = 8): Promise<Product[]> {
  const result = await getProducts({ is_sale: true, size })
  return result.items
}

// 카테고리별 상품 조회
export async function getProductsByCategory(category_id: string, size = 20): Promise<Product[]> {
  const result = await getProducts({ category_id, size })
  return result.items
}
