'use client'
// KN541 결제 페이지 — 토스페이먼츠 결제위젯 v2 연동 (Redirect 방식)
// 흐름: 실 장바구니 → 배송지 입력 → 주문 생성 → 사전등록 → 토스 결제창 → success/fail

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import KakaoAddressInput, { AddressValue } from '@/components/common/KakaoAddressSearch'
import { useCart } from '@/lib/cart-context'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, totalShipping, clearCart } = useCart()
  const total = totalPrice + totalShipping

  const [form, setForm] = useState({ name: '', phone: '', email: '', memo: '' })
  const [address, setAddress] = useState<AddressValue>({ zipcode: '', address1: '', address2: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)
  const widgetRef = useRef<any>(null)

  // 장바구니 비어있으면 cart로 redirect
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/ko/cart')
    }
  }, [items.length, router])

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (items.length === 0) return
    let mounted = true

    async function initWidget() {
      try {
        // 1. clientKey 조회 (GET /payments/config)
        const token = getToken()
        const configRes = await fetch(`${BASE}/payments/config`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!configRes.ok) throw new Error('결제 설정을 불러올 수 없습니다')
        const { data: { client_key } } = await configRes.json()

        // 2. SDK 동적 임포트 (패키지명: @tosspayments/tosspayments-sdk)
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
        const tossPayments = await loadTossPayments(client_key)

        // 3. customerKey = userId(UUID) — 유추 불가 고유값 요구사항 충족
        let customerKey = 'ANONYMOUS'
        if (token) {
          try {
            const meRes = await fetch(`${BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (meRes.ok) {
              const meData = await meRes.json()
              customerKey = meData.data?.user_id ?? 'ANONYMOUS'
            }
          } catch {}
        }

        // 4. 위젯 초기화
        const widgets = tossPayments.widgets({ customerKey })
        if (!mounted) return
        widgetRef.current = widgets

        // 5. 금액 설정 — renderPaymentMethods 호출 전 반드시 먼저
        await widgets.setAmount({ value: Math.round(total), currency: 'KRW' })

        // 6. 결제 UI + 약관 UI 동시 렌더링
        await Promise.all([
          widgets.renderPaymentMethods({ selector: '#toss-payment-method' }),
          widgets.renderAgreement({ selector: '#toss-agreement' }),
        ])

        if (mounted) setWidgetReady(true)
      } catch (err: any) {
        if (mounted) toast.error(err.message ?? '결제 초기화에 실패했습니다')
      }
    }

    initWidget()
    return () => {
      mounted = false
      widgetRef.current = null
      setWidgetReady(false)
    }
  }, [items.length, total])

  // 결제 버튼 클릭 핸들러
  const handlePay = async () => {
    if (isSubmitting) return

    // 폼 검증
    if (!form.name.trim())   { toast.error('수령자 이름을 입력해 주세요.'); return }
    if (!form.phone.trim())  { toast.error('휴대폰 번호를 입력해 주세요.'); return }
    if (!address.address1)   { toast.error('배송지 주소를 입력해 주세요.'); return }
    if (!widgetRef.current)  { toast.error('결제 위젯이 준비 중입니다. 잠시 후 다시 시도해 주세요.'); return }

    setIsSubmitting(true)

    try {
      const token = getToken()
      if (!token) {
        toast.error('로그인이 필요합니다.')
        router.push('/ko/login')
        return
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // STEP 1: 주문 생성 (POST /orders)
      const orderBody = {
        items: items.map(i => ({
          product_id: i.productId,
          option_id: null,
          quantity: i.quantity,
        })),
        recipient_name:  form.name.trim(),
        recipient_phone: form.phone.trim(),
        zip_code:        address.zipcode,
        address1:        address.address1,
        address2:        address.address2 ?? '',
        delivery_memo:   form.memo,
        payment_method:  'TOSS',
      }
      const orderRes = await fetch(`${BASE}/orders`, {
        method: 'POST', headers, body: JSON.stringify(orderBody),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.detail ?? '주문 생성에 실패했습니다')
      const { order_id, order_no, total_amount } = orderData.data

      // STEP 2: 결제 사전등록 (POST /payments/prepare) — 금액 조작 방지 핵심
      const orderName = items.length === 1
        ? items[0].name
        : `${items[0].name} 외 ${items.length - 1}건`

      const prepareRes = await fetch(`${BASE}/payments/prepare`, {
        method: 'POST', headers,
        body: JSON.stringify({
          order_id,
          amount:     Math.round(total_amount),
          order_name: orderName,
        }),
      })
      const prepareData = await prepareRes.json()
      if (!prepareRes.ok) throw new Error(prepareData.detail ?? '결제 사전등록에 실패했습니다')

      // STEP 3: 토스 결제 요청 (Redirect 방식 — PC/모바일 모두 지원)
      // successUrl에 internal_order_id(UUID) 포함 → confirm 시 payment_orders 조회에 사용
      const origin = window.location.origin
      await widgetRef.current.requestPayment({
        orderId:             order_no,   // 12자리 숫자 (토스 요건: 6~64자 충족)
        orderName,
        customerName:        form.name.trim(),
        customerEmail:       form.email.trim() || undefined,
        customerMobilePhone: form.phone.replace(/[^0-9]/g, ''),  // 숫자만 (하이픈 제거)
        successUrl: `${origin}/ko/payment/success?internal_order_id=${order_id}`,
        failUrl:    `${origin}/ko/payment/fail`,
      })
      // requestPayment 이후 페이지가 이동하므로 아래 코드는 실행되지 않음

    } catch (err: any) {
      const msg = err?.message ?? '결제 요청 중 오류가 발생했습니다.'
      if (!msg.includes('취소')) toast.error(msg)
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100'
  const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

  if (items.length === 0) return null

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">결제</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
          <span className="text-neutral-400">장바구니</span>
          <span>›</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">결제</span>
          <span>›</span>
          <span className="text-neutral-400">완료</span>
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* 왼쪽: 배송정보 + 결제위젯 */}
        <div className="flex-1 space-y-8">

          {/* STEP 1 — 배송 정보 */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">1</span>
              배송 정보
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>수령자 이름 *</label>
                <input className={inputCls} placeholder="홍길동" type="text"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>휴대폰 *</label>
                <input className={inputCls} placeholder="010-0000-0000" type="tel"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>이메일 (선택)</label>
                <input className={inputCls} placeholder="example@email.com" type="email"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <KakaoAddressInput
                  value={address}
                  onChange={setAddress}
                  label="주소 *"
                  inputClassName={inputCls}
                  labelClassName={labelCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>배송 메모 (선택)</label>
                <select className={inputCls} value={form.memo}
                  onChange={e => setForm({ ...form, memo: e.target.value })}>
                  <option value="">선택해 주세요</option>
                  <option>문앞에 두고 가주세요</option>
                  <option>경비실에 맡겨주세요</option>
                  <option>택배함에 넣어주세요</option>
                  <option>직접 수령하겠습니다</option>
                </select>
              </div>
            </div>
          </section>

          {/* STEP 2 — 결제 수단 (토스페이먼츠 위젯 마운트 포인트) */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">2</span>
              결제 수단
            </h2>
            {!widgetReady && (
              <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                결제 수단 불러오는 중...
              </div>
            )}
            <div id="toss-payment-method" />
          </section>

          {/* STEP 3 — 약관 동의 (토스 위젯 자동 렌더링) */}
          <div id="toss-agreement" />

        </div>

        <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

        {/* 오른쪽: 주문 요약 + 결제 버튼 */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-5 font-bold text-neutral-900 dark:text-neutral-100">주문 상품</h3>

            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" unoptimized />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                      {item.option && <p className="text-xs text-neutral-400">{item.option}</p>}
                      <p className="text-xs text-neutral-400">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-neutral-200 dark:border-neutral-700" />

            <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>상품금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={totalShipping === 0 ? 'font-medium text-green-600' : ''}>
                  {totalShipping === 0 ? '무료' : `${totalShipping.toLocaleString()}원`}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

            <div className="flex items-center justify-between">
              <span className="font-bold">총 결제금액</span>
              <span className="text-xl font-bold text-primary-600">
                {total.toLocaleString()}원
              </span>
            </div>

            <ButtonPrimary
              className="mt-6 w-full"
              onClick={handlePay}
              disabled={isSubmitting || !widgetReady}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  처리 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LockClosedIcon className="h-4 w-4" />
                  {total.toLocaleString()}원 결제하기
                </span>
              )}
            </ButtonPrimary>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <LockClosedIcon className="h-3.5 w-3.5" />
              <span>SSL 암호화 보호</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
