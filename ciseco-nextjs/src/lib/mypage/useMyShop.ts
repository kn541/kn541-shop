'use client'
/**
 * KN541 /myshop API — 훅 + 페치 함수
 * Bearer access_token (localStorage) — mypageFetch와 동일 패턴
 */
import { useCallback, useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'
import type { ShopTemplateCode } from './types'

const PREFIX = '/myshop'

// ─── 템플릿 코드 (UI ↔ system_codes.shop_template) ─────────────────────
export const SHOP_TEMPLATE_TO_API: Record<ShopTemplateCode, string> = {
  CLASSIC: '001',
  MODERN:  '002',
  WARM:    '003',
  COOL:    '004',
  ELEGANT: '005',
}

export function uiTemplateToApi(code: ShopTemplateCode): string {
  return SHOP_TEMPLATE_TO_API[code] ?? '001'
}

export function apiTemplateToUi(code: string): ShopTemplateCode {
  const entry = Object.entries(SHOP_TEMPLATE_TO_API).find(([, v]) => v === code)
  return (entry?.[0] as ShopTemplateCode) ?? 'CLASSIC'
}

// ─── API 원본 타입 ───────────────────────────────────────────────────────
export interface MyShopApiRecord {
  id: string
  user_id?: string
  shop_name: string
  shop_url_code: string
  shop_url?: string
  template_code?: string
  shop_description?: string | null
  logo_url?: string | null
  visit_count?: number
  share_count?: number
  product_count?: number
  shop_status?: string | null
  is_active?: boolean
  [key: string]: unknown
}

export interface MyShopDashboardData {
  today_visits: number
  month_orders: number
  month_sales: string
  pending_commission: string
  product_count: number
  active_product_count: number
  shop_url: string
  share_links: Record<string, string>
}

export interface MyShopProductApiItem {
  product_id: string
  product_name?: string | null
  thumbnail_url?: string | null
  effective_price?: string
  base_sale_price?: string
  custom_price?: string | null
  is_active?: boolean
  sort_order?: number
  added_at?: string | null
}

export interface MyShopProductsListPayload {
  items: MyShopProductApiItem[]
  total: number
}

export interface ProductFindRow {
  product_id?: string
  product_name?: string
  sale_price?: number
  thumbnail_url?: string | null
  category_id?: string | null
  is_in_my_shop?: boolean
  [key: string]: unknown
}

// ─── 페치 함수 ───────────────────────────────────────────────────────────
export async function fetchMyShop(): Promise<MyShopApiRecord | null> {
  return mypageFetch<MyShopApiRecord | null>(PREFIX)
}

export async function fetchMyShopDashboard(): Promise<MyShopDashboardData> {
  return mypageFetch<MyShopDashboardData>(`${PREFIX}/dashboard`)
}

export async function createMyShop(body: {
  shop_name: string
  shop_url_code?: string
  template_code: string
  shop_description?: string
}): Promise<{ message?: string; shop?: MyShopApiRecord }> {
  return mypageFetch<{ message?: string; shop?: MyShopApiRecord }>(PREFIX, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function patchMyShop(body: {
  shop_name?: string
  shop_url_code?: string
  template_code?: string
  shop_description?: string | null
}): Promise<{ message?: string }> {
  return mypageFetch<{ message?: string }>(PREFIX, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function checkShopUrlCode(code: string): Promise<{ available: boolean; reason?: string }> {
  const q = encodeURIComponent(code)
  return mypageFetch<{ available: boolean; reason?: string }>(`${PREFIX}/check-url?code=${q}`)
}

export async function fetchMyShopProducts(page = 1, size = 100): Promise<MyShopProductsListPayload> {
  const data = await mypageFetch<MyShopProductsListPayload>(
    `${PREFIX}/products?page=${page}&size=${size}`
  )
  return data
}

export async function fetchMyShopProductsFind(params: {
  keyword?: string
  page?: number
  size?: number
  is_added?: boolean
}): Promise<{ items: ProductFindRow[]; total: number; page: number; size: number }> {
  const sp = new URLSearchParams()
  if (params.keyword) sp.set('keyword', params.keyword)
  sp.set('page', String(params.page ?? 1))
  sp.set('size', String(params.size ?? 50))
  if (params.is_added !== undefined) sp.set('is_added', params.is_added ? 'true' : 'false')
  return mypageFetch(`${PREFIX}/products/find?${sp.toString()}`)
}

export async function addMyShopProduct(productId: string, sortOrder = 0): Promise<unknown> {
  return mypageFetch(`${PREFIX}/products`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, sort_order: sortOrder }),
  })
}

export async function removeMyShopProduct(productId: string): Promise<unknown> {
  return mypageFetch(`${PREFIX}/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
}

export async function patchMyShopProduct(
  productId: string,
  body: { is_active?: boolean; custom_price?: string | null; sort_order?: number }
): Promise<unknown> {
  return mypageFetch(`${PREFIX}/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function postMyShopLogoInfo(): Promise<{ message?: string; upload_path?: string }> {
  return mypageFetch(`${PREFIX}/logo`, { method: 'POST' })
}

export async function deleteMyShopLogo(): Promise<unknown> {
  return mypageFetch(`${PREFIX}/logo`, { method: 'DELETE' })
}

export async function patchMyShopDesign(templateCode: string): Promise<{ message?: string }> {
  return mypageFetch<{ message?: string }>(`${PREFIX}/design`, {
    method: 'PATCH',
    body: JSON.stringify({ template_code: templateCode }),
  })
}

/** POST /upload/file — shop 로고용 (bucket=members) */
export async function uploadMemberImage(file: File, folder = 'shop-logos'): Promise<string> {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const qs = new URLSearchParams({ bucket: 'members', folder })
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE}/upload/file?${qs.toString()}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = body?.detail
    throw new MypageApiError(
      res.status,
      null,
      typeof detail === 'string' ? detail : '업로드에 실패했습니다'
    )
  }
  const url = body?.data?.url as string | undefined
  if (!url) throw new MypageApiError(500, null, '업로드 응답에 URL이 없습니다')
  return url
}

// ─── 훅 ─────────────────────────────────────────────────────────────────
export function useMyShop(enabled: boolean) {
  const [shop, setShop] = useState<MyShopApiRecord | null>(null)
  const [dashboard, setDashboard] = useState<MyShopDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<MypageApiError | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const s = await fetchMyShop()
      setShop(s)
      if (s?.id) {
        const d = await fetchMyShopDashboard()
        setDashboard(d)
      } else {
        setDashboard(null)
      }
    } catch (e) {
      setError(
        e instanceof MypageApiError
          ? e
          : new MypageApiError(0, null, '알 수 없는 오류가 발생했습니다')
      )
      setShop(null)
      setDashboard(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return { shop, dashboard, loading, error, refetch: load }
}
