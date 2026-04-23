'use client'
import { useEffect, useState } from 'react'
import type { CouponListResponse, CouponStatus } from './types'
import { MOCK_COUPONS } from './mocks'
import { mypageFetch, MypageApiError } from './api'

function mockData(status: CouponStatus | 'ALL'): CouponListResponse {
  const filtered =
    status === 'ALL' ? MOCK_COUPONS.items : MOCK_COUPONS.items.filter(c => c.status === status)
  return { ...MOCK_COUPONS, items: filtered }
}

export function useCoupons(status: CouponStatus | 'ALL' = 'AVAILABLE') {
  const [data, setData] = useState<CouponListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        const q = status === 'ALL' ? '' : `?status=${status}`
        const res = await mypageFetch<CouponListResponse>(`/mypage/coupons${q}`)
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof MypageApiError && process.env.NODE_ENV === 'development') {
            console.warn('[useCoupons] API fallback to mock:', e.message)
          }
          setData(mockData(status))
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [status])

  return { data, loading }
}
