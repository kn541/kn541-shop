'use client'
// KN541 토스페이 결제 완료 페이지 (retUrl)
// 결제 처리는 resultCallback에서 백엔드가 이미 완료함.
// 이 페이지는 사용자에게 완료를 알리고 주문 확인 페이지로 이동하는 역할만 한다.

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/lib/cart-context'

function TossPaySuccessContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    // 결제는 resultCallback에서 이미 처리됨 — 장바구니만 비우고 이동
    clearCart()

    const orderId = searchParams.get('internal_order_id') ?? ''
    setTimeout(() => {
      const qs = orderId ? `?order_id=${encodeURIComponent(orderId)}` : ''
      router.replace(`/order-successful${qs}`)
    }, 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <CheckCircleIcon className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        결제가 완료됐습니다
      </h2>
      <p className="text-sm text-neutral-500">
        잠시 후 주문 확인 페이지로 이동합니다.
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )
}

export default function TossPaySuccessPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <TossPaySuccessContent />
    </Suspense>
  )
}
