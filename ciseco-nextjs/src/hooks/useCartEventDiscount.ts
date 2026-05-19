'use client'

import { useEffect, useState } from 'react'
import type { CartItem } from '@/lib/cart-context'
import {
  calculateEventDiscount,
  type EventDiscountLine,
} from '@/lib/api/events'

export function useCartEventDiscount(items: CartItem[], selectedIds: Set<string>) {
  const [byProductId, setByProductId] = useState<Record<string, EventDiscountLine>>({})
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const selected = items.filter(i => selectedIds.has(i.id))
    if (selected.length === 0) {
      setByProductId({})
      setTotalDiscount(0)
      return
    }

    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        const memberId =
          typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
        const res = await calculateEventDiscount(
          selected.map(i => i.productId),
          selected.map(i => i.quantity),
          memberId,
        )
        if (cancelled) return
        const map: Record<string, EventDiscountLine> = {}
        for (const row of res.items) {
          if (row.event_id) map[row.product_id] = row
        }
        setByProductId(map)
        setTotalDiscount(res.total_discount ?? 0)
      } catch {
        if (!cancelled) {
          setByProductId({})
          setTotalDiscount(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [items, selectedIds])

  return { byProductId, totalDiscount, loading }
}
