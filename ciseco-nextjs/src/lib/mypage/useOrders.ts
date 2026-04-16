'use client'
import { useEffect, useState } from 'react'
import type { OrderListResponse, OrderStatus } from './types'
import { MOCK_ORDER_RESPONSE } from './mocks'

interface Params {
  status?: OrderStatus | 'ALL'
  page?: number
  size?: number
}

export function useOrders({ status = 'ALL', page = 1, size = 20 }: Params = {}) {
  const [data, setData] = useState<OrderListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      // Mock. Phase 2 주문 API 완성 후 실 API로 스왓.
      const filtered = status === 'ALL' || status === 'CANCELED'
        ? status === 'ALL'
          ? MOCK_ORDER_RESPONSE.items
          : MOCK_ORDER_RESPONSE.items.filter(o =>
              o.status === 'CANCELED' || o.status === 'RETURNED' || o.status === 'EXCHANGED'
            )
        : MOCK_ORDER_RESPONSE.items.filter(o => o.status === status)

      setData({
        ...MOCK_ORDER_RESPONSE,
        items: filtered,
        total: filtered.length,
        page,
        size,
      })
      setLoading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [status, page, size])

  return { data, loading }
}
