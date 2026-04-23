'use client'
import { useEffect, useState } from 'react'
import type { PointsResponse, PointChangeType } from './types'
import { MOCK_POINTS } from './mocks'
import { mypageFetch, MypageApiError } from './api'

function mockData(filter: PointChangeType | 'ALL'): PointsResponse {
  const filtered =
    filter === 'ALL' ? MOCK_POINTS.items : MOCK_POINTS.items.filter(l => l.change_type === filter)
  return { ...MOCK_POINTS, items: filtered, total: filtered.length }
}

export function usePoints(filter: PointChangeType | 'ALL' = 'ALL') {
  const [data, setData] = useState<PointsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        const q = filter === 'ALL' ? '' : `?change_type=${filter}`
        const res = await mypageFetch<PointsResponse>(`/mypage/points${q}`)
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof MypageApiError && process.env.NODE_ENV === 'development') {
            console.warn('[usePoints] API fallback to mock:', e.message)
          }
          setData(mockData(filter))
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [filter])

  return { data, loading }
}
