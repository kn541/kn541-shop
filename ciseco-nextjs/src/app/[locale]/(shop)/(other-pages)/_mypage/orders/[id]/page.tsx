'use client'
// KN541 마이페이지 주문 상세 — DEBUG 버전
// 실제 요청 URL/메서드/응답을 toast에 표시

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBagIcon, MapPinIcon, CreditCardIcon, ChevronLeftIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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
    product_code?: string | null
    product_name: string
    option_name?: string
    quantity: number
    sale_price: number
    subtotal: number
    thumbnail_url?: string
  }[]
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

function CancelModal({
  orderNo,
  totalAmount,
  onConfirm,
  onClose,
  loading,
}: {
  orderNo: string
  totalAmount: number
  onConfirm: (reason: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center gap-3">
          <XCircleIcon className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">주문 취소</h3>
        </div>

        <div className="mb-5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">주문번호</p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{orderNo}</p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">취소 금액</p>
          <p className="text-lg font-bold text-red-600">{totalAmount.toLocaleString('ko-KR')}원 환불</p>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            취소 사유 (선택)
          </label>
          <textarea
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
            rows={3}
            placeholder="취소 사유를 입력해 주세요 (선택사항)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={200}
          />
        </div>

        <p className="mb-5 text-xs text-neutral-400">
          결제 취소 후 환불은 결제 수단에 따라 3~5 영업일 소요될 수 있습니다.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-2xl border border-neutral-200 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400"
          >
            돌아가기
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                처리 중...
              </span>
            ) : '주문 취소'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const orderId = params?.id as string

  const [order, setOrder]                     = useState<OrderDetail | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading]     = useState(false)

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

  const handleCancel = async (reason: string) => {
    const token = getToken()
    if (!token || !order) return

    // ─── DEBUG: 실제 요청 정보 표시 ───────────────────────────────────
    const cancelUrl = `${BASE}/orders/${orderId}/cancel`
    toast(`[DEBUG] URL: ${cancelUrl}\nMETHOD: PATCH\nbody: ${JSON.stringify({ cancel_reason: reason.trim() || '회원 취소 요청' })}`, { duration: 10000 })
    // ──────────────────────────────────────────────────────────────────

    setCancelLoading(true)
    try {
      const res = await fetch(cancelUrl, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: reason.trim() || '회원 취소 요청' }),
      })

      // ─── DEBUG: 응답 상태 표시 ─────────────────────────────────────
      const rawText = await res.text()
      toast(`[DEBUG] STATUS: ${res.status}\nRESP: ${rawText.substring(0, 200)}`, { duration: 15000 })
      // ──────────────────────────────────────────────────────────────

      const data = JSON.parse(rawText)
      if (!res.ok) {
        throw new Error(data.detail ?? '주문 취소에 실패했습니다')
      }
      setOrder(prev => prev ? { ...prev, order_status: 'CANCELLED', status_label: '취소' } : null)
      setShowCancelModal(false)
      toast.success('주문이 취소됐습니다. 환불은 3~5 영업일 내 처리됩니다.')
    } catch (err: any) {
      toast.error(err.message ?? '주문 취소 중 오류가 발생했습니다')
    } finally {
      setCancelLoading(false)
    }
  }

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

  const subtotal  = order.items.reduce((s, i) => s + i.subtotal, 0)
  const canCancel = order.order_status === 'PAID'

  return (
    <>
      {showCancelModal && (
        <CancelModal
          orderNo={order.order_no}
          totalAmount={order.total_amount}
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
          loading={cancelLoading}
        />
      )}

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
                      {item.product_code && (
                        <p className="text-xs text-neutral-400 font-mono">상품코드 {item.product_code}</p>
                      )}
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

          {order.tracking_no && (
            <section className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
              <SectionTitle>배송 추적</SectionTitle>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <p>택배사: {order.tracking_company ?? '-'}</p>
                <p>운송장 번호: {order.tracking_no}</p>
              </div>
            </section>
          )}

          <p className="text-center text-xs text-neutral-400">
            주문일시: {formatDate(order.created_at)}
          </p>

          {canCancel && (
            <section className="rounded-3xl border border-red-100 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">주문 취소</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    결제완료 상태에서만 취소 가능합니다. 상품 준비 시작 후에는 취소할 수 없습니다.
                  </p>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="shrink-0 rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400"
                >
                  주문 취소
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
