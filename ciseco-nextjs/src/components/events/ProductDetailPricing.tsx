'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Prices from '@/components/Prices'
import { calculateEventDiscount, type EventDiscountLine } from '@/lib/api/events'

interface Props {
  productId: string
  salePrice: number
  consumerPrice: number
  discountRate: number
  fallback: ReactNode
}

function formatCountdown(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now()
  if (diff <= 0) return '종료됨'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d}일 ${h}시간 ${m}분`
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분`
}

export default function ProductDetailPricing({
  productId,
  salePrice,
  consumerPrice,
  discountRate,
  fallback,
}: Props) {
  const [line, setLine] = useState<EventDiscountLine | null>(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const memberId =
          typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
        const res = await calculateEventDiscount([productId], [1], memberId)
        const hit = res.items.find(i => i.product_id === productId && i.event_id)
        if (!cancelled) setLine(hit ?? null)
      } catch {
        if (!cancelled) setLine(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    if (!line?.end_at) return
    const tick = () => setCountdown(formatCountdown(line.end_at!))
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [line?.end_at])

  const eventDiscount = line?.discount_amount ?? 0
  const finalPrice = eventDiscount > 0 ? line!.final_price : salePrice

  const eventRate = useMemo(() => {
    const base = consumerPrice > salePrice ? consumerPrice : salePrice
    if (base <= 0 || finalPrice >= base) return 0
    return Math.round(((base - finalPrice) / base) * 100)
  }, [consumerPrice, salePrice, finalPrice])

  if (!line?.event_id) {
    return <>{fallback}</>
  }

  return (
    <div className="space-y-2">
      <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200">
        {line.event_name}
      </span>
      <div className="flex items-end gap-3 flex-wrap">
        {(eventRate > 0 || discountRate > 0) && (
          <span className="text-2xl font-bold text-red-500">{eventRate || discountRate}%</span>
        )}
        <Prices contentClass="text-3xl font-bold text-red-600" price={finalPrice} />
        <span className="text-base text-neutral-400 line-through mb-0.5">
          {salePrice.toLocaleString('ko-KR')}원
        </span>
      </div>
      {line.end_at && (
        <p className="text-xs text-neutral-500">
          이벤트 종료: {countdown || new Date(line.end_at).toLocaleString('ko-KR')}
        </p>
      )}
    </div>
  )
}
