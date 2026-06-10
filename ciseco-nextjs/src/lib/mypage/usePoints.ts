'use client'
import { useEffect, useState } from 'react'
import type { PointsResponse, PointChangeType, PointLedgerItem } from './types'
import { MOCK_POINTS } from './mocks'
import { mypageFetch, MypageApiError } from './api'

function mockData(filter: PointChangeType | 'ALL'): PointsResponse {
  const filtered =
    filter === 'ALL' ? MOCK_POINTS.items : MOCK_POINTS.items.filter(l => l.change_type === filter)
  return { ...MOCK_POINTS, items: filtered, total: filtered.length }
}

// 백엔드 GET /mypage/points 응답(data) 실제 구조
interface RawPointItem {
  seq?: number | string
  point_type?: string
  amount?: number
  balance_after?: number
  change_type?: string
  memo?: string | null
  created_at?: string | null
}
interface RawPointsData {
  balance?: number
  items?: RawPointItem[]
  total?: number
}

/**
 * 백엔드(flat: balance/created_at/seq/memo) → 화면 타입(PointsResponse: current_balance/occurred_at/ledger_id/reason) 매핑.
 * 매핑 부재로 잔액 0원·Invalid Date가 발생하던 것을 어댑터로 해결.
 */
function adaptPoints(raw: RawPointsData): PointsResponse {
  const rawItems = raw.items ?? []
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let thisMonthEarned = 0
  const items: PointLedgerItem[] = rawItems.map((r, idx) => {
    const amount = Number(r.amount ?? 0)
    const ct = (r.change_type as PointChangeType) ?? (amount > 0 ? 'EARN' : 'USE')
    const occurredAt = r.created_at ?? ''
    if (ct === 'EARN' && occurredAt) {
      const d = new Date(occurredAt)
      if (!isNaN(d.getTime()) && d >= monthStart) thisMonthEarned += amount
    }
    return {
      ledger_id: String(r.seq ?? `row-${idx}`),
      occurred_at: occurredAt,
      change_type: ct,
      amount: Math.abs(amount),
      reason: r.memo ?? '',
      balance_after: Number(r.balance_after ?? 0),
    }
  })

  return {
    current_balance: Number(raw.balance ?? 0),
    this_month_earned: thisMonthEarned,
    items,
    total: raw.total ?? items.length,
  }
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
        const res = await mypageFetch<RawPointsData>(`/mypage/points${q}`)
        if (!cancelled) {
          setData(adaptPoints(res))
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
