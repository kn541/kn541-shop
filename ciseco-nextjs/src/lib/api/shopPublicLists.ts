/**
 * Shop 5 pages — 공개 목록 API (/public/products/*)
 * 클라이언트 컴포넌트에서 도청하므로 CORS 우회를 위해 Next.js API Route 프록시 사용
 * 클라이언트 → /api/shop-list/{kind} → Railway API (server-to-server)
 */

import type { Product } from '@/lib/api/products'
import { readSalesCount } from '@/lib/sales-count'

// API Route 프록시 경로 (same-origin, CORS 무관)
const PROXY = '/api/shop-list'

export type ShopListKind = 'best' | 'new' | 'recommend' | 'preorder' | 'value-up'

export interface ShopPublicListItem {
  product_id: string
  product_name: string
  brand: string | null
  summary: string | null
  thumbnail_url: string | null
  product_type: string
  product_status: string
  sale_price: number
  consumer_price?: number | null
  market_price?: number | null
  discount_price?: number | null
  stock_qty: number
  is_recommended?: boolean | null
  category_id?: string | null
  category_name?: string | null
  category_id_1?: string | null
  category_name_1?: string | null
  category_id_2?: string | null
  category_name_2?: string | null
  supplier_id?: string | null
  supplier_name?: string | null
  round_status?: string | null
  round_start_at?: string | null
  round_end_at?: string | null
  created_at: string
  best_source?: '14d' | 'all'
  /** v_product_list_ext — 정렬·표시용 (없으면 0 취급) */
  sales_count?: number | null
  sort_sales_count?: number | null
  sort_review_count?: number | null
  sort_review_avg?: number | null
}

export interface ShopPublicListResponse {
  items: ShopPublicListItem[]
  total: number
  page: number
  size: number
  weight?: { qty: number; order: number; sales: number }
  window_days?: number
}

export async function fetchShopPublicList(
  kind: ShopListKind,
  page: number,
  size: number,
): Promise<ShopPublicListResponse> {
  const q = new URLSearchParams({
    page: String(Math.max(1, page)),
    size: String(Math.min(60, Math.max(1, size))),
  })
  const res = await fetch(`${PROXY}/${kind}?${q}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`shop list ${kind} 로드 실패: ${res.status}`)
  }
  const json = (await res.json()) as {
    status?: string
    data?: ShopPublicListResponse
  }
  const d = json.data
  if (!d) {
    return { items: [], total: 0, page: 1, size }
  }
  return {
    items: d.items ?? [],
    total: d.total ?? 0,
    page: d.page ?? page,
    size: d.size ?? size,
    weight: d.weight,
    window_days: d.window_days,
  }
}

/** 전체 정렬용 — size 60으로 페이지 순회 */
export async function fetchAllShopPublicItems(kind: ShopListKind): Promise<ShopPublicListResponse> {
  const size = 60
  let page = 1
  const all: ShopPublicListItem[] = []
  let total = 0
  let weight: ShopPublicListResponse['weight']
  let window_days: ShopPublicListResponse['window_days']

  while (true) {
    const chunk = await fetchShopPublicList(kind, page, size)
    total = chunk.total
    weight = chunk.weight ?? weight
    window_days = chunk.window_days ?? window_days
    all.push(...chunk.items)
    if (chunk.items.length === 0 || all.length >= total) break
    page += 1
    if (page > 500) break
  }

  return { items: all, total, page: 1, size: all.length, weight, window_days }
}

/** GET /public/main-products — v_active_main_page_products 행 */
export interface MainPageProductItem {
  id?: string
  section_code?: string
  product_id: string
  sort_order?: number
  product_name: string
  thumbnail_url: string | null
  sale_price: number
  discount_price?: number | null
  product_status: string
  product_no?: string | null
  is_display?: boolean
}

/** 메인 진열 API 응답 → Product (단건 /products/{id} fetch 없이 카드 렌더링) */
export function mapMainPageProductToProduct(row: MainPageProductItem): Product {
  const listPrice = Number(row.sale_price) || 0
  const eventPrice =
    row.discount_price != null && Number(row.discount_price) > 0
      ? Number(row.discount_price)
      : listPrice
  const sale = eventPrice
  const retail = listPrice > sale ? listPrice : sale
  const ps = String(row.product_status ?? '').toUpperCase()
  const soldOut = ps === 'SOLDOUT' || ps === 'SOLD_OUT'

  return {
    product_id: row.product_id,
    product_code: row.product_no ?? '',
    product_no: row.product_no ?? undefined,
    product_name: row.product_name,
    category_id: '',
    supplier_id: null,
    brand: null,
    summary: null,
    description: null,
    mobile_description: null,
    delivery_notice: null,
    thumbnail_url: row.thumbnail_url,
    sale_price: sale,
    supply_price: 0,
    original_supply_price: 0,
    consumer_price: retail > sale ? retail : undefined,
    market_price: retail > sale ? retail : undefined,
    profit_amount: 0,
    commission_base_amount: null,
    stock_qty: soldOut ? 0 : 99999,
    min_order_qty: 1,
    max_order_qty: null,
    product_type: '001',
    product_status: row.product_status,
    is_option: false,
    is_display: row.is_display ?? true,
    is_soldout: soldOut,
    is_discontinued: false,
    is_recommended: false,
    sc_type: 2,
    sc_price: 0,
    sc_minimum: null,
    sc_qty: 0,
    shipping_fee: 0,
    free_shipping_over: null,
    return_fee: 0,
    exchange_fee: 0,
    delivery_days: 3,
    product_round: 0,
    created_at: '',
    updated_at: null,
    kmc_item_id: null,
    kmc_serial: null,
    images: null,
    options: undefined,
    sales_count: 0,
    sort_sales_count: 0,
  }
}

export function mapShopListItemToProduct(row: ShopPublicListItem): Product {
  const categoryId = String(row.category_id_1 || row.category_id_2 || row.category_id || '')
  const stock = Number(row.stock_qty) || 0
  return {
    product_id: row.product_id,
    product_code: '',
    product_no: undefined,
    product_name: row.product_name,
    category_id: categoryId,
    category_name: row.category_name ?? undefined,
    category_id_1: row.category_id_1 ?? undefined,
    category_name_1: row.category_name_1 ?? undefined,
    category_id_2: row.category_id_2 ?? undefined,
    category_name_2: row.category_name_2 ?? undefined,
    supplier_id: row.supplier_id ?? null,
    supplier_name: row.supplier_name ?? null,
    supplier_username: null,
    brand: row.brand,
    summary: row.summary,
    description: null,
    mobile_description: null,
    delivery_notice: null,
    thumbnail_url: row.thumbnail_url,
    sale_price: Number(row.sale_price) || 0,
    supply_price: 0,
    original_supply_price: 0,
    consumer_price: row.consumer_price != null ? Number(row.consumer_price) : undefined,
    market_price: row.market_price != null ? Number(row.market_price) : undefined,
    profit_amount: 0,
    commission_base_amount: null,
    stock_qty: stock,
    min_order_qty: 1,
    max_order_qty: null,
    product_type: row.product_type,
    product_status: row.product_status,
    approval_status: 'APPROVED',
    is_option: false,
    is_display: true,
    is_new: false,
    is_best: false,
    is_sale: false,
    is_soldout: stock <= 0,
    is_discontinued: false,
    is_recommended: !!row.is_recommended,
    sale_discount_rate: undefined,
    sc_type: 2,
    sc_price: 0,
    sc_minimum: null,
    sc_qty: 0,
    shipping_fee: 0,
    free_shipping_over: null,
    return_fee: 0,
    exchange_fee: 0,
    delivery_days: 3,
    product_round: 0,
    created_at: row.created_at,
    updated_at: null,
    kmc_item_id: null,
    kmc_serial: null,
    images: null,
    options: undefined,
    sales_count: readSalesCount(row),
    sort_sales_count: readSalesCount(row),
  }
}
