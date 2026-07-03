'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { useOrderDetail } from '@/lib/mypage/useOrderDetail'
import type { OrderDetailLineItem } from '@/lib/mypage/types'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { canCancelOrderStatus, orderStatusLabelKo, showTrackingStatus, deliveryStatusLabelKo, showItemTrackingButton, paymentMethodLabelKo, formatKST } from '@/lib/mypage/orderStatusKo'
import { formatPrice } from '@/lib/formatPrice'

const PLACEHOLDER = '/placeholder-product.jpg'

function lineName(row: OrderDetailLineItem) {
  return row.product_name || row.name || '상품'
}

function lineQty(row: OrderDetailLineItem) {
  return row.quantity ?? row.qty ?? 1
}

function linePrice(row: OrderDetailLineItem) {
  return row.sale_price ?? row.unit_price ?? row.price ?? row.line_amount ?? row.amount ?? 0
}

function lineSubtotal(row: OrderDetailLineItem) {
  if (row.subtotal != null) return row.subtotal
  return Number(linePrice(row)) * lineQty(row)
}

function lineThumb(row: OrderDetailLineItem) {
  const u = row.thumbnail_url || row.image_url
  return u?.trim() ? u : PLACEHOLDER
}

type TrackingStep = { time?: string; where?: string; kind?: string; telno?: string; remark?: string }
type TrackingResult = { trackingDetails?: TrackingStep[]; lastStateDetail?: string; completeYN?: string; error?: string; mock?: boolean; message?: string }

function TrackingPanel({ trackingNo, trackingCompany, hasTrackingNo }: { trackingNo: string; trackingCompany?: string; hasTrackingNo: boolean }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [open, setOpen] = useState(false)

  const handleTrack = async () => {
    if (open) { setOpen(false); return }
    if (!hasTrackingNo) { toast('송장번호가 아직 등록되지 않았습니다.', { icon: 'ℹ️' }); return }
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        tracking_no: trackingNo.replace(/-/g, ''),
        ...(trackingCompany ? { company: trackingCompany } : {}),
      })
      const info = await mypageFetch<TrackingResult>(`/tracking?${qs.toString()}`)
      if (info?.error) { toast.error('잠시 후 다시 시도하세요.'); return }
      setResult(info); setOpen(true)
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '잠시 후 다시 시도하세요.')
    } finally { setLoading(false) }
  }

  return (
    <div className="mt-2">
      <button type="button" onClick={() => void handleTrack()} disabled={loading}
        className="rounded-lg border border-primary-300 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-950/30">
        {loading ? '조회 중…' : open ? '닫기' : hasTrackingNo ? '배송조회' : '배송조회 (송장 미등록)'}
      </button>
      {open && result && (
        <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/60">
          {result.mock ? (
            <p className="text-xs text-neutral-500">{result.message || '배송 정보를 불러올 수 없습니다.'}</p>
          ) : result.lastStateDetail ? (
            <p className="mb-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              현재 상태: {result.lastStateDetail}{result.completeYN === 'Y' && ' ✅'}
            </p>
          ) : null}
          {Array.isArray(result.trackingDetails) && result.trackingDetails.length > 0 ? (
            <ul className="space-y-1.5">
              {result.trackingDetails.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="shrink-0 text-neutral-400">{step.time ?? ''}</span>
                  <span className="shrink-0 font-medium text-neutral-700 dark:text-neutral-300">{step.where ?? ''}</span>
                  <span>{step.kind ?? ''}</span>
                </li>
              ))}
            </ul>
          ) : !result.mock ? (
            <p className="text-xs text-neutral-500">배송 단계 정보가 없습니다.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const t = useTranslations('Account')
  const { data, loading, error, refetch } = useOrderDetail(orderId)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const rawStatus = data?.order_status || data?.status || ''
  const statusKo = orderStatusLabelKo(rawStatus)
  const canCancel = canCancelOrderStatus(rawStatus)
  const showTrack = showTrackingStatus(rawStatus)
  const tracking = data?.tracking_no || data?.tracking_number || data?.invoice_no

  const addr = data?.shipping_address
  const recipient = addr?.recipient_name || data?.recipient_name
  const phone = addr?.recipient_phone || data?.recipient_phone
  const zip = addr?.zip_code || data?.zip_code
  const a1 = addr?.address1 || data?.address1
  const a2 = addr?.address2 || data?.address2
  const items = data?.items ?? []

  // fix(#4): PATCH→POST, cancel_reason→reason — 백엔드 POST /mypage/orders/{id}/cancel 일치
  const handleCancel = async () => {
    setCanceling(true)
    try {
      await mypageFetch<unknown>(`/mypage/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: '고객 취소' }),
      })
      toast.success('주문이 취소되었습니다.')
      setCancelOpen(false)
      await refetch()
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '취소 처리에 실패했습니다.')
    } finally { setCanceling(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col gap-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('ordersHistory')}</h1>
      <p className="text-red-600 dark:text-red-400">{error || '주문을 찾을 수 없습니다.'}</p>
    </div>
  )

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
          <button type="button" onClick={() => setCancelOpen(true)}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30">
            주문취소
          </button>
        )}
      </div>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700 sm:grid-cols-2">
        <div><p className="text-xs text-neutral-500">주문일시</p>
          <p className="font-medium">{formatKST(data.created_at || data.ordered_at)}</p></div>
        <div><p className="text-xs text-neutral-500">상태</p><p className="font-medium">{statusKo}</p></div>
        {showTrack && tracking && (
          <div className="sm:col-span-2"><p className="text-xs text-neutral-500">송장번호</p><p className="font-medium">{tracking}</p></div>
        )}
        {data.payment_method && (
          <div><p className="text-xs text-neutral-500">결제수단</p><p className="font-medium">{paymentMethodLabelKo(data.payment_method)}</p></div>
        )}
        <div className="sm:col-span-2 mt-1 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">주문금액</span>
            <span className="font-medium">{formatPrice(data.product_amount ?? data.total_amount ?? 0)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-neutral-500">배송비</span>
            <span className="font-medium">{formatPrice(data.shipping_amount ?? 0)}</span>
          </div>
          {(data.discount_amount ?? 0) > 0 && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-neutral-500">할인</span>
              <span className="font-medium text-red-600">-{formatPrice(data.discount_amount ?? 0)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
            <span className="text-base font-semibold">총 결제금액</span>
            <span className="text-lg font-bold text-primary-600">{formatPrice(data.total_amount ?? 0)}</span>
          </div>
        </div>
      </div>

      {(recipient || a1) && (
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">배송지</h2>
          <p className="text-sm">{recipient} {phone && `· ${phone}`}</p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{zip && `[${zip}] `}{a1} {a2}</p>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">상품 목록</h2>
        <ul className="space-y-4">
          {items.length === 0 ? (
            <li className="text-sm text-neutral-500">상품 정보가 없습니다.</li>
          ) : items.map((row, idx) => {
            const thumb = lineThumb(row)
            const pid = row.product_id || `line-${idx}`
            const itemTrackingNo = row.tracking_no || row.tracking_number || ''
            const itemDeliveryStatus = row.delivery_status || ''
            const canShowTracking = showTrack || showItemTrackingButton(itemDeliveryStatus)
            const deliveryLabel = deliveryStatusLabelKo(itemDeliveryStatus)
            return (
              <li key={pid} className="flex gap-4 rounded-xl border border-neutral-100 p-3 dark:border-neutral-800">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={thumb} alt={lineName(row)} fill className="object-cover" unoptimized={thumb.startsWith('http')} />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <p className="font-medium">{lineName(row)}</p>
                  {row.product_code && <p className="text-xs text-neutral-400 font-mono">상품코드 {row.product_code}</p>}
                  <p className="text-sm text-neutral-500">
                    {formatPrice(Number(linePrice(row)))} × {lineQty(row)}
                  </p>
                  {itemDeliveryStatus && (
                    <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      📦 {deliveryLabel}
                      {itemTrackingNo && <span className="ml-2 font-mono text-neutral-500">{itemTrackingNo}{row.tracking_company && ` (${row.tracking_company})`}</span>}
                    </p>
                  )}
                  {canShowTracking && itemTrackingNo && (
                    <TrackingPanel
                      trackingNo={itemTrackingNo}
                      trackingCompany={row.tracking_company || undefined}
                      hasTrackingNo={!!itemTrackingNo}
                    />
                  )}
                </div>
                <p className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatPrice(lineSubtotal(row))}
                </p>
              </li>
            )
          })}
        </ul>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">주문을 취소할까요?</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">취소 후 복구할 수 없습니다. 계속하시겠습니까?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setCancelOpen(false)} disabled={canceling}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium dark:border-neutral-600">닫기</button>
              <button type="button" onClick={() => void handleCancel()} disabled={canceling}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {canceling ? '처리 중…' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
