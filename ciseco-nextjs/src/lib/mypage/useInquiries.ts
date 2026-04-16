'use client'
import { useEffect, useState } from 'react'
import type { InquiryListResponse, InquiryStatus } from './types'
import { MOCK_INQUIRY_RESPONSE } from './mocks'

export function useInquiries(status: InquiryStatus | 'ALL' = 'ALL') {
  const [data, setData] = useState<InquiryListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const filtered = status === 'ALL'
        ? MOCK_INQUIRY_RESPONSE.items
        : MOCK_INQUIRY_RESPONSE.items.filter(i => i.status === status)
      setData({
        ...MOCK_INQUIRY_RESPONSE,
        items: filtered,
        total: filtered.length,
      })
      setLoading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [status])

  return { data, loading }
}
