'use client'
// fix: production 환경에서 API 실패 시 mock 데이터 표시 제거
// 원인: catch 블록에서 항상 mockData()를 반환 → 타인 주문처럼 보이는 데이터 노출
// 수정: NODE_ENV !== 'production' 일 때만 mock fallback, 프로덕션은 빈 상태

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

/** 프로덕션 API 실패 시 반환하는 빈 상태 */
function emptyData(page: number, size: number): OrderListResponse {
  return { ...MOCK_ORDER_RESPONSE, items: [], total: 0, page, size }
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
          if (process.env.NODE_ENV !== 'production') {
            // 개발 환경에서만 mock 데이터 사용
            console.warn('[useOrders] API fallback to mock:', e instanceof Error ? e.message : e)
            setData(mockData(status, page, size))
          } else {
            // 프로덕션: 빈 상태 표시 (타인 주문 데이터 노출 방지)
            if (e instanceof MypageApiError) {
              console.error('[useOrders] API error:', e.message)
            }
            setData(emptyData(page, size))
          }
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
