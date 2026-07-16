'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointsResponse, PointChangeType, PointLedgerItem, PointTypeBalance } from './types'
import { MOCK_POINTS } from './mocks'
import { mypageFetch, MypageApiError } from './api'

const PAGE_SIZE = 20

function mockData(filter: PointChangeType | 'ALL'): PointsResponse {
  const filtered =
    filter === 'ALL' ? MOCK_POINTS.items : MOCK_POINTS.items.filter(l => l.change_type === filter)
  return { ...MOCK_POINTS, items: filtered, total: filtered.length }
}

// 백엔드 GET /mypage/points 응답(data) 실제 구조
interface RawPointItem {
  seq?: number | string
  point_type?: string
  point_type_name?: string
  amount?: number
  balance_after?: number
  change_type?: string
  memo?: string | null
  created_at?: string | null
}
interface RawBalance {
  point_type?: string
  point_type_name?: string
  balance?: number
}
interface RawPointsData {
  balance?: number
  total_balance?: number
  balances?: RawBalance[]
  items?: RawPointItem[]
  total?: number
  page?: number
  size?: number
}

/**
 * 백엔드(flat: balance/created_at/seq/memo) → 화면 타입(PointsResponse: current_balance/occurred_at/ledger_id/reason) 매핑.
 * 매핑 불능으로 잔액 0원·Invalid Date가 발생해도 것을 어댑터로 해가.
 * 타입별 분리(QA 13): balances[]·total_balance 매핑 추가. 백엔드 미제공 시 빈 배열·balance 폴백(graceful).
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
      point_type: r.point_type,
      point_type_name: r.point_type_name,
    }
  })

  const balances: PointTypeBalance[] = (raw.balances ?? []).map(b => ({
    point_type: String(b.point_type ?? ''),
    point_type_name: b.point_type_name ?? String(b.point_type ?? ''),
    balance: Number(b.balance ?? 0),
  }))

  const currentBalance = Number(raw.balance ?? 0)

  return {
    current_balance: currentBalance,
    total_balance: Number(raw.total_balance ?? raw.balance ?? 0),
    balances,
    this_month_earned: thisMonthEarned,
    items,
    total: raw.total ?? items.length,
  }
}

export function usePoints(
  filter: PointChangeType | 'ALL' = 'ALL',
  pointType?: string,
) {
  const [data, setData] = useState<PointsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const pageRef = useRef(1)

  // filter/pointType 변경 시 page=1 리셋 + 전체 재조회
  useEffect(() => {
    let cancelled = false
    pageRef.current = 1
    setLoading(true)

    const run = async () => {
      try {
        const params = new URLSearchParams()
        if (filter !== 'ALL') params.set('change_type', filter)
        if (pointType) params.set('point_type', pointType)
        params.set('page', '1')
        params.set('size', String(PAGE_SIZE))
        const qs = params.toString()
        const res = await mypageFetch<RawPointsData>(`/mypage/points?${qs}`)
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
  }, [filter, pointType])

  const hasMore = data ? data.items.length < data.total : false

  const loadMore = useCallback(async () => {
    if (!data || loadingMore || !hasMore) return

    const nextPage = pageRef.current + 1
    setLoadingMore(true)

    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('change_type', filter)
      if (pointType) params.set('point_type', pointType)
      params.set('page', String(nextPage))
      params.set('size', String(PAGE_SIZE))
      const qs = params.toString()
      const res = await mypageFetch<RawPointsData>(`/mypage/points?${qs}`)
      const adapted = adaptPoints(res)

      pageRef.current = nextPage
      setData(prev => {
        if (!prev) return adapted
        return {
          ...prev,
          items: [...prev.items, ...adapted.items],
          total: adapted.total,
        }
      })
    } catch (e) {
      console.error('[usePoints] loadMore failed:', e)
    } finally {
      setLoadingMore(false)
    }
  }, [data, loadingMore, hasMore, filter, pointType])

  return { data, loading, hasMore, loadMore, loadingMore }
}
