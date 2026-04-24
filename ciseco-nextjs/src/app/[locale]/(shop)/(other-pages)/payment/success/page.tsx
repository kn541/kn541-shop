'use client'
// KN541 결제 성공 페이지
// 토스 successUrl 도착 → POST /payments/confirm → clearCart → order-successful?order_id=

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/lib/cart-context'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const paymentKey      = searchParams.get('paymentKey')
    const orderId         = searchParams.get('orderId')
    const amount          = searchParams.get('amount')
    const internalOrderId = searchParams.get('internal_order_id') // UUID

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMsg('결제 파라미터가 올바르지 않습니다.')
      return
    }

    async function confirm() {
      try {
        const token = localStorage.getItem('access_token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${BASE}/payments/confirm`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            payment_key: paymentKey,
            order_id:    internalOrderId ?? orderId,
            amount:      Number(amount),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail ?? '결제 승인에 실패했습니다')

        clearCart()
        setStatus('success')

        // 주문완료 페이지로 이동 — order_id(UUID) 전달
        const targetOrderId = internalOrderId ?? data?.data?.order_id ?? ''
        setTimeout(() => {
          router.replace(`/ko/order-successful${targetOrderId ? `?order_id=${targetOrderId}` : ''}`)
        }, 2000)
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message ?? '결제 승인 중 오류가 발생했습니다.')
      }
    }

    confirm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20">
        <Spinner />
        <p className="text-sm text-neutral-600">결제를 승인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">결제 승인 실패</h2>
        <p className="max-w-sm text-sm text-neutral-500">{errorMsg}</p>
        <button onClick={() => router.push('/ko/checkout')}
          className="mt-4 rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">
          다시 시도하기
        </button>
      </div>
    )
  }

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <CheckCircleIcon className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">결제가 완료됐습니다!</h2>
      <p className="text-sm text-neutral-500">주문 완료 페이지로 이동합니다...</p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
