'use client'
import { useCallback, useEffect, useState } from 'react'
import type { InquiryItem, InquiryListResponse, InquiryStatus } from './types'
import { MOCK_INQUIRY_RESPONSE } from './mocks'
import { mypageFetch, MypageApiError } from './api'

function filterByStatus(items: InquiryItem[], status: InquiryStatus | 'ALL') {
  if (status === 'ALL') return items
  return items.filter(i => i.status === status)
}

function normalizeList(raw: unknown): InquiryItem[] {
  if (!raw || typeof raw !== 'object') return []
  const o = raw as Record<string, unknown>
  const items = o.items
  if (!Array.isArray(items)) return []
  return items.filter(Boolean) as InquiryItem[]
}

export function useInquiries(status: InquiryStatus | 'ALL' = 'ALL') {
  const [data, setData] = useState<InquiryListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const raw = await mypageFetch<InquiryListResponse | { items?: InquiryItem[] }>('/cs/inquiries')
        const all = normalizeList(raw)
        const filtered = filterByStatus(all, status)
        const status_counts = (raw as InquiryListResponse)?.status_counts ?? {
          ALL: all.length,
          WAITING: all.filter(i => i.status === 'WAITING').length,
          ANSWERED: all.filter(i => i.status === 'ANSWERED').length,
        }
        if (!cancelled) {
          setData({ items: filtered, total: filtered.length, status_counts })
        }
      } catch (e) {
        if (e instanceof MypageApiError && e.status === 401) {
          if (!cancelled) setData(null)
        } else {
          const filtered = filterByStatus(MOCK_INQUIRY_RESPONSE.items, status)
          if (!cancelled) {
            setData({
              ...MOCK_INQUIRY_RESPONSE,
              items: filtered,
              total: filtered.length,
            })
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [status, tick])

  return { data, loading, refetch }
}
