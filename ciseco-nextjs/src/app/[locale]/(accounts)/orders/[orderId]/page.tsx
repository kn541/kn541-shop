'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { useOrderDetail } from '@/lib/mypage/useOrderDetail'
import type { OrderDetailLineItem } from '@/lib/mypage/types'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { canCancelOrderStatus, orderStatusLabelKo, showTrackingStatus } from '@/lib/mypage/orderStatusKo'

const PLACEHOLDER = '/placeholder-product.jpg'

function lineName(row: OrderDetailLineItem) {
  return row.product_name || row.name || '상품'
}

function lineQty(row: OrderDetailLineItem) {
  return row.quantity ?? row.qty ?? 1
}

function linePrice(row: OrderDetailLineItem) {
  return row.unit_price ?? row.price ?? row.line_amount ?? row.amount ?? 0
}

function lineThumb(row: OrderDetailLineItem) {
  const u = row.thumbnail_url || row.image_url
  return u?.trim() ? u : PLACEHOLDER
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const t = useTranslations('Account')
  const { data, loading, error, refetch } = useOrderDetail(orderId)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const rawStatus = data?.order_status || data?.status || ''
  const statusKo = orderStatusLabelKo(rawStatus)
  const canCancel = canCancelOrderStatus(rawStatus)
  const showTrack = showTrackingStatus(rawStatus)
  const tracking = data?.tracking_number || data?.invoice_no

  const addr = data?.shipping_address
  const recipient = addr?.recipient_name || data?.recipient_name
  const phone = addr?.recipient_phone || data?.recipient_phone
  const zip = addr?.zip_code || data?.zip_code
  const a1 = addr?.address1 || data?.address1
  const a2 = addr?.address2 || data?.address2

  const items = data?.items ?? []

  const handleCancel = async () => {
    setCanceling(true)
    try {
      await mypageFetch<unknown>(`/mypage/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ cancel_reason: '고객 취소' }),
      })
      toast.success('주문이 취소되었습니다.')
      setCancelOpen(false)
      await refetch()
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '취소 처리에 실패했습니다.'
      toast.error(msg)
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('ordersHistory')}</h1>
        <p className="text-red-600 dark:text-red-400">{error || '주문을 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">주문 상세</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            주문번호 <span className="font-medium text-neutral-800 dark:text-neutral-200">{data.order_no || data.order_id}</span>
          </p>
        </div>
        {canCancel && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          >
            주문취소
          </button>
        )}
      </div>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700 sm:grid-cols-2">
        <div>
          <p className="text-xs text-neutral-500">주문일시</p>
          <p className="font-medium">
            {new Date(data.created_at || data.ordered_at || '').toLocaleString('ko-KR') || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">상태</p>
          <p className="font-medium">{statusKo}</p>
        </div>
        {showTrack && tracking && (
          <div className="sm:col-span-2">
            <p className="text-xs text-neutral-500">송장번호</p>
            <p className="font-medium">{tracking}</p>
          </div>
        )}
        {data.payment_method && (
          <div>
            <p className="text-xs text-neutral-500">결제수단</p>
            <p className="font-medium">{data.payment_method}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-neutral-500">결제금액</p>
          <p className="text-lg font-bold text-primary-600">
            {(data.total_amount ?? 0).toLocaleString('ko-KR')}원
          </p>
        </div>
      </div>

      {data.consult_notices && data.consult_notices.length > 0 && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-900/50 dark:bg-sky-950/30">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-sky-900 dark:text-sky-100">
            <span aria-hidden>📋</span> 섭외 안내
          </h2>
          <ul className="space-y-3">
            {data.consult_notices.map(entry => {
              const raw = entry.posted_at || ''
              const line = raw
                ? new Date(raw).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : '—'
              return (
                <li
                  key={entry.id}
                  className="rounded-xl border border-sky-100 bg-white p-4 text-sm shadow-sm dark:border-sky-900/40 dark:bg-neutral-900/80"
                >
                  <p className="text-xs text-sky-700/80 dark:text-sky-300/90">{line}</p>
                  <p className="mt-2 whitespace-pre-wrap text-neutral-800 dark:text-neutral-100">
                    {entry.message || '—'}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {(recipient || a1) && (
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">배송지</h2>
          <p className="text-sm">
            {recipient} {phone && `· ${phone}`}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {zip && `[${zip}] `}
            {a1} {a2}
          </p>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">상품 목록</h2>
        <ul className="space-y-4">
          {items.length === 0 ? (
            <li className="text-sm text-neutral-500">상품 정보가 없습니다.</li>
          ) : (
            items.map((row, idx) => {
              const thumb = lineThumb(row)
              const pid = row.product_id || `line-${idx}`
              return (
                <li
                  key={pid}
                  className="flex gap-4 rounded-xl border border-neutral-100 p-3 dark:border-neutral-800"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <Image
                      src={thumb}
                      alt={lineName(row)}
                      fill
                      className="object-cover"
                      unoptimized={thumb.startsWith('http')}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{lineName(row)}</p>
                    <p className="text-sm text-neutral-500">
                      수량 {lineQty(row)} · {Number(linePrice(row)).toLocaleString('ko-KR')}원
                    </p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">주문을 취소할까요?</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              취소 후 복구할 수 없습니다. 계속하시겠습니까?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                disabled={canceling}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium dark:border-neutral-600"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={canceling}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {canceling ? '처리 중…' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
