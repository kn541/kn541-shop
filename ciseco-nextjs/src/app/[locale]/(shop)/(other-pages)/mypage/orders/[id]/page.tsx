'use client'
// KN541 마이페이지 주문 상세
// GET /mypage/orders/{id} — admin orders 테이블 기반, 해당 회원 검증

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBagIcon, MapPinIcon, CreditCardIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

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
  recipient_phone?: string
  zip_code?: string
  address1: string
  address2?: string
  delivery_memo?: string
  tracking_no?: string
  tracking_company?: string
  payment_method?: string
  paid_at?: string
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
  consult_notices?: { id: number; message: string; posted_at?: string | null }[]
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  PAID:      'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
  REFUNDED:  'bg-red-100 text-red-600',
}

const METHOD_LABEL: Record<string, string> = {
  CARD: '신용카드', VIRTUAL_ACCOUNT: '가상계좌', TRANSFER: '계좌이체',
  TOSS: '토스페이먼츠', KAKAO: '카카오페이',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-bold text-neutral-500 uppercase tracking-wide dark:text-neutral-400">{children}</h2>
}

export default function OrderDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const orderId = params?.id as string

  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/ko/login'); return }
    if (!orderId) { setLoading(false); return }

    fetch(`${BASE}/mypage/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) throw new Error('주문을 찾을 수 없습니다')
        return r.json()
      })
      .then(data => setOrder(data?.data ?? null))
      .catch(e => setError(e.message ?? '오류가 발생했습니다'))
      .finally(() => setLoading(false))
  }, [orderId, router])

  const formatDate = (iso?: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-500">{error || '주문 정보를 불러올 수 없습니다.'}</p>
        <button onClick={() => router.push('/ko/mypage/orders')}
          className="mt-4 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white">
          목록으로
        </button>
      </div>
    )
  }

  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push('/ko/mypage/orders')}
          className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">주문 상세</h1>
          <p className="text-xs text-neutral-400">주문번호 {order.order_no}</p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.order_status] ?? STATUS_COLOR['PENDING']}`}>
          {order.status_label}
        </span>
      </div>

      <div className="space-y-6">
        {order.consult_notices && order.consult_notices.length > 0 && (
          <section className="rounded-3xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-900/50 dark:bg-sky-950/30">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-sky-900 dark:text-sky-100">
              <span aria-hidden>📋</span> 섭외 안내
            </h2>
            <ul className="space-y-3">
              {order.consult_notices.map(entry => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-sky-100 bg-white p-4 text-sm shadow-sm dark:border-sky-900/40 dark:bg-neutral-900/80"
                >
                  <p className="text-xs text-sky-700/80 dark:text-sky-300/90">{formatDate(entry.posted_at)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-neutral-800 dark:text-neutral-100">{entry.message || '—'}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* 주문 상품 */}
        <section className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
          <SectionTitle>주문 상품</SectionTitle>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items.map(item => (
              <div key={item.item_id} className="flex gap-3 py-3">
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
                    <p className="line-clamp-1 text-sm font-medium">{item.product_name}</p>
                    {item.option_name && <p className="text-xs text-neutral-400">{item.option_name}</p>}
                    <p className="text-xs text-neutral-400">
                      {item.sale_price.toLocaleString('ko-KR')}원 × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{item.subtotal.toLocaleString('ko-KR')}원</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 결제 요약 */}
        <section className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
          <SectionTitle>결제 정보</SectionTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>상품금액</span><span>{subtotal.toLocaleString('ko-KR')}원</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>배송비</span>
              <span className={order.shipping_fee === 0 ? 'text-green-600 font-medium' : ''}>
                {order.shipping_fee === 0 ? '무료' : `${order.shipping_fee.toLocaleString('ko-KR')}원`}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold dark:border-neutral-800">
              <span>총 결제금액</span>
              <span className="text-primary-600">{order.total_amount.toLocaleString('ko-KR')}원</span>
            </div>
            {order.payment_method && (
              <div className="flex items-center gap-2 pt-1 text-neutral-500">
                <CreditCardIcon className="h-4 w-4" />
                <span>{METHOD_LABEL[order.payment_method] ?? order.payment_method}</span>
                {order.paid_at && <span className="ml-auto text-xs">{formatDate(order.paid_at)}</span>}
              </div>
            )}
          </div>
        </section>

        {/* 배송지 */}
        <section className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
          <SectionTitle>배송지</SectionTitle>
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <div className="text-neutral-700 dark:text-neutral-300">
              <p className="font-medium">{order.recipient_name} {order.recipient_phone && `· ${order.recipient_phone}`}</p>
              <p>{order.address1} {order.address2}</p>
              {order.delivery_memo && <p className="text-neutral-400">메모: {order.delivery_memo}</p>}
            </div>
          </div>
        </section>

        {/* 배송 추적 */}
        {order.tracking_no && (
          <section className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
            <SectionTitle>배송 추적</SectionTitle>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p>택배사: {order.tracking_company ?? '-'}</p>
              <p>운송장 번호: {order.tracking_no}</p>
            </div>
          </section>
        )}

        {/* 주문 일시 */}
        <p className="text-center text-xs text-neutral-400">
          주문일시: {formatDate(order.created_at)}
        </p>
      </div>
    </div>
  )
}
