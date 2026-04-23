'use client'
import { useEffect, useState } from 'react'
import type { OrderListResponse, OrderStatus } from './types'
import { MOCK_ORDER_RESPONSE } from './mocks'
import { mypageFetch, MypageApiError } from './api'

interface Params {
  status?: OrderStatus | 'ALL'
  page?: number
  size?: number
}

function mockData(status: OrderStatus | 'ALL', page: number, size: number): OrderListResponse {
  const filtered =
    status === 'ALL' || status === 'CANCELED'
      ? status === 'ALL'
        ? MOCK_ORDER_RESPONSE.items
        : MOCK_ORDER_RESPONSE.items.filter(
            o =>
              o.status === 'CANCELED' || o.status === 'RETURNED' || o.status === 'EXCHANGED'
          )
      : MOCK_ORDER_RESPONSE.items.filter(o => o.status === status)

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
        const res = await mypageFetch<OrderListResponse>(`/mypage/orders?${qs}`)
        if (!cancelled) {
          setData(res)
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
