'use client'
import { useEffect, useState } from 'react'
import type { PointsResponse, PointChangeType } from './types'
import { MOCK_POINTS } from './mocks'

export function usePoints(filter: PointChangeType | 'ALL' = 'ALL') {
  const [data, setData] = useState<PointsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const filtered = filter === 'ALL'
        ? MOCK_POINTS.items
        : MOCK_POINTS.items.filter(l => l.change_type === filter)
      setData({ ...MOCK_POINTS, items: filtered, total: filtered.length })
      setLoading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [filter])

  return { data, loading }
}
