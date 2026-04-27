'use client'

import { useCallback, useEffect, useState } from 'react'
import type { OrderDetail } from './types'
import { mypageFetch, MypageApiError } from './api'

export function useOrderDetail(orderId: string | undefined) {
  const [data, setData] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!orderId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await mypageFetch<OrderDetail>(`/mypage/orders/${encodeURIComponent(orderId)}`)
      setData(res)
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '주문 정보를 불러오지 못했습니다.'
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
