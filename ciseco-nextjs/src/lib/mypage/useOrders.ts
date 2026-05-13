'use client'
import { useEffect, useState } from 'react'
import type { OrderListResponse } from './types'
import { MOCK_ORDER_RESPONSE } from './mocks'
import { mypageFetch, MypageApiError } from './api'
import { normalizeOrderListResponse } from './orderListAdapter'

interface Params {
  /** API status 쿼리 (예: SHIPPED, CANCELLED) — 백엔드와 동일 문자열 */
  status?: string | 'ALL'
  page?: number
  size?: number
}

function mockData(filterStatus: string | 'ALL', page: number, size: number): OrderListResponse {
  let filtered: typeof MOCK_ORDER_RESPONSE.items
  if (filterStatus === 'ALL') {
    filtered = MOCK_ORDER_RESPONSE.items
  } else if (filterStatus === 'CANCELED' || filterStatus === 'CANCELLED') {
    filtered = MOCK_ORDER_RESPONSE.items.filter(
      (o) => o.status === 'CANCELED' || o.status === 'RETURNED' || o.status === 'EXCHANGED'
    )
  } else if (filterStatus === 'SHIPPING' || filterStatus === 'SHIPPED') {
    filtered = MOCK_ORDER_RESPONSE.items.filter((o) => o.status === 'SHIPPING')
  } else {
    filtered = MOCK_ORDER_RESPONSE.items.filter((o) => o.status === filterStatus)
  }

  return {
    ...MOCK_ORDER_RESPONSE,
    items: filtered,
    total: filtered.length,
    page,
    size,
  }
}

export function useOrders({ status = 'ALL', page = 1, size = 20 }: Params = {}) {
  const [data, setData] = useState<OrderListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (status !== 'ALL') qs.set('status', status)
        const raw = await mypageFetch<unknown>(`/mypage/orders?${qs}`)
        if (!cancelled) {
          setData(normalizeOrderListResponse(raw))
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof MypageApiError && process.env.NODE_ENV === 'development') {
            console.warn('[useOrders] API fallback to mock:', e.message)
          }
          setData(mockData(status, page, size))
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [status, page, size])

  return { data, loading }
}
