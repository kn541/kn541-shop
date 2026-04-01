/**
 * KN541 상품/카테고리 API 함수
 * - API 성공 시 실제 데이터 반환
 * - API 실패(환경변수 미설정 포함) 시 null 반환 → 호출부에서 더미데이터 폴백
 */

import { apiFetch } from './api'

// ─── 타입 정의 ───────────────────────────────────────────────

export interface ApiProduct {
  id: number
  name: string
  handle: string // URL slug
  price: number
  sale_price?: number
  description?: string
  featured_image_url?: string
  images?: { url: string; alt?: string }[]
  stock: number
  is_active: boolean
  category_id?: number
  category_name?: string
  rating?: number
  review_count?: number
  status?: string // 'New in' | 'Best Seller' | 'Limited Edition' 등
  options?: {
    name: string
    values: { name: string; color?: string }[]
  }[]
  created_at: string
}

export interface ApiCategory {
  id: number
  name: string
  handle: string
  description?: string
  image_url?: string
  parent_id?: number
  product_count?: number
  sort_order?: number
  is_active: boolean
}

export interface ApiListResponse<T> {
  items: T[]
  total: number
  page?: number
  size?: number
}

// ─── 상품 API ────────────────────────────────────────────────

/** 상품 목록 조회 */
export async function fetchProducts(params?: {
  page?: number
  size?: number
  category_handle?: string
  sort?: string
  q?: string
}): Promise<ApiListResponse<ApiProduct> | null> {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.size) qs.set('size', String(params.size))
  if (params?.category_handle) qs.set('category', params.category_handle)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.q) qs.set('q', params.q)

  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch<ApiListResponse<ApiProduct>>(`/products${query}`)
}

/** 상품 단건 조회 (handle) */
export async function fetchProductByHandle(
  handle: string,
): Promise<ApiProduct | null> {
  return apiFetch<ApiProduct>(`/products/${handle}`)
}

/** 베스트셀러 상품 조회 */
export async function fetchBestSellers(size = 8): Promise<ApiListResponse<ApiProduct> | null> {
  return fetchProducts({ sort: 'best_seller', size })
}

/** 신상품 조회 */
export async function fetchNewArrivals(size = 8): Promise<ApiListResponse<ApiProduct> | null> {
  return fetchProducts({ sort: 'newest', size })
}

// ─── 카테고리 API ─────────────────────────────────────────────

/** 카테고리 목록 조회 */
export async function fetchCategories(): Promise<ApiListResponse<ApiCategory> | null> {
  return apiFetch<ApiListResponse<ApiCategory>>('/products/categories')
}

/** 카테고리 단건 조회 (handle) */
export async function fetchCategoryByHandle(
  handle: string,
): Promise<ApiCategory | null> {
  if (handle === 'all') {
    // 'all'은 가상 카테고리 → API 호출 불필요
    return null
  }
  return apiFetch<ApiCategory>(`/products/categories/${handle}`)
}
