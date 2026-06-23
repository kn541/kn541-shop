/**
 * KN541 내쇼핑몰 수동주문 API
 */
import { mypageFetch } from './api'
import { fetchDownlineRows } from '@/lib/mlm/shopDownline'

const PREFIX = '/myshop'

export interface ProxyOrderMember {
  user_id: string
  member_no: string
  name: string
  phone: string
}

export interface ProxyOrderProductRow {
  id: string
  product_name: string | null
  sale_price: number | null
  stock_qty: number | null
  thumbnail_url: string | null
  shipping_fee?: number | null
}

export interface ProxyOrderSelectedItem {
  product_id: string
  product_name: string
  sale_price: number
  stock_qty: number
  thumbnail_url: string | null
  shipping_fee: number
  quantity: number
}

export interface ProxyOrderAddressForm {
  recipient_name: string
  recipient_phone: string
  zip_code: string
  address1: string
  address2: string
  delivery_memo: string
}

export interface ProxyOrderSavedAddress {
  id: string
  recipient_name: string
  recipient_phone: string
  zip_code: string
  address1: string
  address2: string | null
  delivery_memo?: string | null
  is_default: boolean
}

export interface ProxyOrderCreateBody {
  target_user_id: string
  items: { product_id: string; option_id: null; quantity: number }[]
  recipient_name: string
  recipient_phone: string
  zip_code: string
  address1: string
  address2: string | null
  delivery_memo: string | null
  admin_memo: string | null
}

export interface ProxyOrderCreateResult {
  order_id: string
  order_no: string
  total_amount: number
  payment_method: string
  payment_status: string
  items_count: number
}

/** 직접 추천 회원 목록 (downline 1단계) */
export async function fetchDirectReferrals(ownerUserId: string): Promise<ProxyOrderMember[]> {
  const rows = await fetchDownlineRows(ownerUserId)
  return rows.map(r => ({
    user_id: String(r.user_id ?? r.id ?? ''),
    member_no: String(r.member_no ?? ''),
    name: String(r.name ?? r.full_name ?? '(이름 없음)'),
    phone: String(r.phone ?? ''),
  })).filter(m => m.user_id)
}

/** 추천 회원 키워드 필터 (회원번호 / 이름 / 전화번호) */
export function filterReferrals(members: ProxyOrderMember[], keyword: string): ProxyOrderMember[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return members
  const digits = kw.replace(/\D/g, '')
  return members.filter(m => {
    if (m.member_no.toLowerCase().includes(kw)) return true
    if (m.name.toLowerCase().includes(kw)) return true
    if (digits && m.phone.replace(/\D/g, '').includes(digits)) return true
    return false
  })
}

/** 상품 검색 */
export async function searchProxyOrderProducts(keyword: string): Promise<ProxyOrderProductRow[]> {
  const q = new URLSearchParams({ page: '1', size: '10' })
  const k = keyword.trim()
  if (k) q.set('keyword', k)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await mypageFetch<{ items?: any[] }>(`/products?${q.toString()}`)
  // 백엔드 v_product_list_ext는 product_id를 반환하므로 id로 매핑
  return (data?.items ?? []).map(item => ({
    ...item,
    id: item.id || item.product_id,
  }))
}

/** 대상 회원 저장 배송지 */
export async function fetchMemberAddresses(userId: string): Promise<ProxyOrderSavedAddress[]> {
  const data = await mypageFetch<{ items?: unknown[] }>(
    `/members/${encodeURIComponent(userId)}/addresses`,
  )
  const rows = data?.items ?? []
  const out: ProxyOrderSavedAddress[] = []
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue
    const raw = r as Record<string, unknown>
    const id = String(raw.id ?? raw.address_id ?? '')
    if (!id) continue
    out.push({
      id,
      recipient_name: String(raw.recipient_name ?? ''),
      recipient_phone: String(raw.recipient_phone ?? raw.phone ?? ''),
      zip_code: String(raw.zip_code ?? raw.zipcode ?? ''),
      address1: String(raw.address1 ?? ''),
      address2: raw.address2 != null ? String(raw.address2) : null,
      delivery_memo: raw.delivery_memo != null ? String(raw.delivery_memo) : null,
      is_default: Boolean(raw.is_default),
    })
  }
  return out
}

/** 수동주문 생성 */
export async function createMyshopProxyOrder(body: ProxyOrderCreateBody): Promise<ProxyOrderCreateResult> {
  return mypageFetch<ProxyOrderCreateResult>(`${PREFIX}/proxy-orders`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function calcProxyOrderTotals(items: ProxyOrderSelectedItem[]) {
  const productSubtotal = items.reduce((s, i) => s + i.sale_price * i.quantity, 0)
  const shippingTotal = items.reduce((s, i) => s + (i.shipping_fee > 0 ? i.shipping_fee : 0), 0)
  return { productSubtotal, shippingTotal, orderTotal: productSubtotal + shippingTotal }
}
