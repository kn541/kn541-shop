'use client'
import { useEffect, useState } from 'react'
import type { CouponListResponse, CouponStatus } from './types'
import { MOCK_COUPONS } from './mocks'

export function useCoupons(status: CouponStatus | 'ALL' = 'AVAILABLE') {
  const [data, setData] = useState<CouponListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const filtered = status === 'ALL'
        ? MOCK_COUPONS.items
        : MOCK_COUPONS.items.filter(c => c.status === status)
      setData({ ...MOCK_COUPONS, items: filtered })
      setLoading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [status])

  return { data, loading }
}
