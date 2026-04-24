'use client'
// KN541 주문완료 페이지 — 실 주문 데이터 연동
// URL: /ko/order-successful?order_id={uuid}

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { CheckCircleIcon, HomeIcon, ShoppingBagIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

interface OrderDetail {
  order_id: string
  order_no: string
  order_status: string
  status_label: string
  total_amount: number
  shipping_fee: number
  recipient_name: string
  address1: string
  address2?: string
  payment_method?: string
  created_at: string
  items: {
    item_id: string
    product_name: string
    option_name?: string
    quantity: number
    sale_price: number
    subtotal: number
    thumbnail_url?: string
  }[]
}

const METHOD_LABEL: Record<string, string> = {
  CARD: '신용카드', VIRTUAL_ACCOUNT: '가상계좌', TRANSFER: '계좌이체',
  TOSS: '토스페이먼츠', KAKAO: '카카오페이',
}

function OrderContent() {
  const params  = useSearchParams()
  const orderId = params.get('order_id')
  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow]       = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
    if (!orderId) { setLoading(false); return }
    const token = getToken()
    if (!token)   { setLoading(false); return }

    fetch(`${BASE}/mypage/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setOrder(data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const subtotal = order?.items.reduce((s, i) => s + i.subtotal, 0) ?? 0
  const shipping = order?.shipping_fee ?? 0
  const total    = order?.total_amount ?? (subtotal + shipping)

  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">
        {/* 성공 아이콘 */}
        <div className={`text-center transition-all duration-700 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-14 w-14 text-green-500" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">결제 완료</p>
          <h1 className="mt-3 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">주문이 접수됐습니다!</h1>
          <p className="mt-3 text-neutral-500">주문해 주셔서 감사합니다.</p>
        </div>

        {/* 주문번호 */}
        <div className={`mt-8 rounded-3xl border border-green-200 bg-green-50 p-5 text-center transition-all duration-700 delay-150 ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } dark:border-green-800 dark:bg-green-900/20`}>
          <p className="text-sm text-neutral-500">주문번호</p>
          {loading ? (
            <div className="mt-2 h-8 w-48 animate-pulse rounded-lg bg-green-200 mx-auto dark:bg-green-800" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-wider text-green-700 dark:text-green-400">
              {order?.order_no ?? '처리 중...'}
            </p>
          )}
        </div>

        {/* 주문 상품 */}
        <div className={`mt-8 transition-all duration-700 delay-200 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="mb-4 font-semibold">주문 상품</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="h-14 w-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : order?.items && order.items.length > 0 ? (
            <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
              {order.items.map((item, idx) => (
                <div key={item.item_id}
                  className={`flex gap-4 p-4 ${
                    idx === 0 ? 'rounded-t-3xl' : ''
                  } ${idx === order.items.length - 1 ? 'rounded-b-3xl' : ''}`}>
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.thumbnail_url ? (
                      <Image src={item.thumbnail_url} alt={item.product_name} fill
                        className="object-cover" sizes="56px" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBagIcon className="h-6 w-6 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="font-medium line-clamp-1">{item.product_name}</p>
                      {item.option_name && <p className="text-xs text-neutral-400">{item.option_name}</p>}
                      <p className="text-sm text-neutral-400">×{item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.subtotal.toLocaleString('ko-KR')}원</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">상품 정보를 불러오는 중입니다.</p>
          )}
        </div>

        {/* 결제 요약 */}
        <div className={`mt-6 space-y-3 text-sm transition-all duration-700 delay-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex justify-between text-neutral-600"><span>상품금액</span><span>{subtotal.toLocaleString('ko-KR')}원</span></div>
          <div className="flex justify-between text-neutral-600">
            <span>배송비</span>
            <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? '무료' : `${shipping.toLocaleString('ko-KR')}원`}</span>
          </div>
          {order?.payment_method && (
            <div className="flex justify-between text-neutral-600">
              <span>결제수단</span>
              <span>{METHOD_LABEL[order.payment_method] ?? order.payment_method}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold dark:border-neutral-700">
            <span>실결제금액</span><span className="text-primary-600">{total.toLocaleString('ko-KR')}원</span>
          </div>
        </div>

        {/* 배송지 */}
        {order?.recipient_name && (
          <div className={`mt-6 rounded-2xl border border-neutral-200 p-4 text-sm transition-all duration-700 delay-[350ms] ${
            show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          } dark:border-neutral-700`}>
            <p className="mb-2 font-semibold">배송지</p>
            <p className="text-neutral-600 dark:text-neutral-400">{order.recipient_name}</p>
            <p className="text-neutral-500">{order.address1} {order.address2}</p>
          </div>
        )}

        {/* 배송 안내 */}
        <div className={`mt-4 rounded-2xl bg-neutral-50 p-5 text-sm transition-all duration-700 delay-[400ms] ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } dark:bg-neutral-800`}>
          <p className="mb-2 font-semibold">배송 안내</p>
          <ul className="space-y-1 text-neutral-500">
            <li>• 결제 확인 후 영업일 2~3일 내 출고 예정</li>
            <li>• 출고 시 등록하신 연락처로 송장번호 안내</li>
            <li>• 배송 문의: 1588-0000</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className={`mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700 delay-500 ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <ButtonPrimary href="/ko" className="flex-1">
            <HomeIcon className="mr-2 h-5 w-5" />홈으로 가기
          </ButtonPrimary>
          {orderId && (
            <Link href={`/ko/mypage/orders/${orderId}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300">
              <ClipboardDocumentListIcon className="h-5 w-5" />주문 상세 보기
            </Link>
          )}
          <Link href="/ko/products"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300">
            <ShoppingBagIcon className="h-5 w-5" />쇼핑 계속하기
          </Link>
        </div>

        <p className={`mt-10 text-center text-sm text-neutral-400 transition-all duration-700 delay-[600ms] ${show ? 'opacity-100' : 'opacity-0'}`}>
          KN541을 이용해 주셔서 감사합니다 🙏
        </p>
      </div>
    </main>
  )
}

export default function OrderSuccessfulPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <OrderContent />
    </Suspense>
  )
}
