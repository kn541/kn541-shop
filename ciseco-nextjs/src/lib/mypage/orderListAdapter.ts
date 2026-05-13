/**
 * GET /mypage/orders 응답 정규화 — 백엔드 필드명·상태코드 차이 흡수
 */
import type { OrderListItem, OrderListResponse, OrderStatus } from './types'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

/** API order_status → OrderListItem.status */
export function normalizeOrderItemStatus(code: string | undefined | null): OrderStatus {
  const c = String(code || '')
    .trim()
    .toUpperCase()
  if (c === 'SHIPPED' || c === 'SHIPPING') return 'SHIPPING'
  if (c === 'CANCELLED' || c === 'CANCELED') return 'CANCELED'
  if (c === 'RETURN_REQUESTED' || c === 'RETURN_IN_PROGRESS') return 'RETURNED'
  if (
    c === 'PAID' ||
    c === 'PREPARING' ||
    c === 'DELIVERED' ||
    c === 'RETURNED' ||
    c === 'EXCHANGED'
  ) {
    return c as OrderStatus
  }
  if (c === 'PENDING') return 'PAID'
  return 'PREPARING'
}

export function mapRawOrderListItem(raw: Record<string, unknown>): OrderListItem {
  const orderId = String(raw.order_id ?? raw.id ?? '')
  const orderNo = String(raw.order_no ?? raw.order_number ?? '')
  const orderedAt = String(raw.ordered_at ?? raw.created_at ?? raw.orderedAt ?? '')
  const statusRaw = (raw.order_status ?? raw.status ?? '') as string
  const status = normalizeOrderItemStatus(statusRaw)
  const statusLabel =
    typeof raw.status_label === 'string' && raw.status_label.trim()
      ? raw.status_label
      : statusRaw || '—'
  const totalAmount = Number(raw.total_amount ?? raw.amount ?? 0) || 0
  const mainItemName = String(
    raw.main_item_name ?? raw.first_product_name ?? raw.product_name ?? '상품'
  )
  const mainItemThumbnail =
    (raw.main_item_thumbnail as string | null | undefined) ??
    (raw.first_thumbnail_url as string | null | undefined) ??
    null
  const itemCount = Number(raw.item_count ?? raw.line_count ?? 1) || 1

  return {
    order_id: orderId,
    order_no: orderNo,
    ordered_at: orderedAt,
    status,
    status_label: statusLabel,
    total_amount: totalAmount,
    main_item_name: mainItemName,
    main_item_thumbnail: mainItemThumbnail,
    item_count: itemCount,
  }
}

function parseItems(raw: unknown): OrderListItem[] {
  const o = asRecord(raw)
  if (!o) return []
  const arr = o.items
  if (!Array.isArray(arr)) return []
  return arr.map((row) => mapRawOrderListItem(asRecord(row) ?? {}))
}

function parseTotal(raw: unknown, itemsLen: number): number {
  const o = asRecord(raw)
  if (!o) return itemsLen
  const t = o.total
  if (typeof t === 'number' && Number.isFinite(t)) return t
  if (typeof t === 'string' && t.trim() !== '') {
    const n = Number(t)
    if (Number.isFinite(n)) return n
  }
  return itemsLen
}

function emptyCounts(total: number): Record<OrderStatus | 'ALL', number> {
  return {
    ALL: total,
    PAID: 0,
    PREPARING: 0,
    SHIPPING: 0,
    DELIVERED: 0,
    CANCELED: 0,
    RETURNED: 0,
    EXCHANGED: 0,
  }
}

/** API가 보낸 status_counts 키를 탭/내부 상태에 맞게 보정 (없으면 현재 페이지 items 기준) */
function normalizeStatusCounts(
  raw: unknown,
  items: OrderListItem[],
  total: number
): OrderListResponse['status_counts'] {
  const o = asRecord(raw)
  const sc = o?.status_counts ?? o?.statusCounts ?? o?.counts

  if (sc && typeof sc === 'object' && !Array.isArray(sc)) {
    const m = sc as Record<string, unknown>
    const out = emptyCounts(total)
    for (const [k, v] of Object.entries(m)) {
      const key = k.toUpperCase()
      const n = typeof v === 'number' ? v : Number(v)
      const num = Number.isFinite(n) ? n : 0
      if (key === 'ALL') out.ALL = num
      else if (key === 'SHIPPED' || key === 'SHIPPING') out.SHIPPING += num
      else if (key === 'PAID' || key === 'PENDING') out.PAID += num
      else if (key === 'PREPARING') out.PREPARING += num
      else if (key === 'DELIVERED') out.DELIVERED += num
      else if (key === 'CANCELLED' || key === 'CANCELED') out.CANCELED += num
      else if (key === 'RETURNED' || key === 'RETURN_REQUESTED' || key === 'RETURN_IN_PROGRESS')
        out.RETURNED += num
      else if (key === 'EXCHANGED') out.EXCHANGED += num
    }
    if (!('ALL' in m) && !('all' in m)) out.ALL = total
    return out
  }

  const out = emptyCounts(total)
  for (const it of items) {
    const s = it.status
    if (s === 'PAID') out.PAID += 1
    else if (s === 'PREPARING') out.PREPARING += 1
    else if (s === 'SHIPPING') out.SHIPPING += 1
    else if (s === 'DELIVERED') out.DELIVERED += 1
    else if (s === 'CANCELED') out.CANCELED += 1
    else if (s === 'RETURNED') out.RETURNED += 1
    else if (s === 'EXCHANGED') out.EXCHANGED += 1
  }
  out.ALL = total
  return out
}

export function normalizeOrderListResponse(raw: unknown): OrderListResponse {
  const o = asRecord(raw) ?? {}
  const items = parseItems(raw)
  const total = parseTotal(raw, items.length)
  const page = Number(o.page ?? 1) || 1
  const size = Number(o.size ?? o.limit ?? (items.length || 20)) || 20
  const status_counts = normalizeStatusCounts(raw, items, total)

  return {
    items,
    total,
    page,
    size,
    status_counts,
  }
}
