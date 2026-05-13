'use client'

import { useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'

/** 계정 주문내역 페이지 탭과 동일 */
export type OrderTabBadgeKey = 'ALL' | 'SHIPPING' | 'DELIVERED' | 'CANCELED'

async function fetchListTotal(path: string): Promise<number> {
  try {
    const res = await mypageFetch<{ total?: number; items?: unknown[] }>(path)
    if (typeof res?.total === 'number' && Number.isFinite(res.total)) return res.total
    if (Array.isArray(res?.items)) return res.items.length
    return 0
  } catch {
    return 0
  }
}

/**
 * 탭 뱃지용 건수 — size=1로 total만 조회 (백엔드가 status 필터별 total 제공 가정)
 * status_counts 미포함·필드 불일치 시에도 실제 건수 표시
 */
export function useOrderTabBadges(refetchKey?: string | number) {
  const [badges, setBadges] = useState<Record<OrderTabBadgeKey, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      try {
        const [
          all,
          shipShipped,
          shipShipping,
          delivered,
          cancelDoubleL,
          cancelSingleL,
          retReq,
          retProg,
        ] = await Promise.all([
          fetchListTotal('/mypage/orders?page=1&size=1'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=SHIPPED'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=SHIPPING'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=DELIVERED'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=CANCELLED'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=CANCELED'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=RETURN_REQUESTED'),
          fetchListTotal('/mypage/orders?page=1&size=1&status=RETURN_IN_PROGRESS'),
        ])

        if (cancelled) return

        const shipping = Math.max(shipShipped, shipShipping)
        const canceledBase = Math.max(cancelDoubleL, cancelSingleL)
        const canceled = canceledBase + retReq + retProg

        setBadges({
          ALL: all,
          SHIPPING: shipping,
          DELIVERED: delivered,
          CANCELED: canceled,
        })
      } catch (e) {
        if (!cancelled) {
          if (e instanceof MypageApiError && e.status === 401) setBadges(null)
          else setBadges({ ALL: 0, SHIPPING: 0, DELIVERED: 0, CANCELED: 0 })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [refetchKey])

  return { badges, loading }
}
