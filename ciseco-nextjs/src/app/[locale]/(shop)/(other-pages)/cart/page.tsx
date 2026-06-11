'use client'
// KN541 장바구니 페이지
// fix: 폐쇄몰 — 비로그인 시 로그인 페이지로 이동
// fix: NcInputNumber key 추가
// fix: i18n — 하드코딩 문자열 전체 t() 치환 (Cart 섹션)
// fix: 로케일 이중 접두 제거 — /ko/ko/products, /ko/ko/checkout 에러 수정

import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog'
import NcInputNumber from '@/components/NcInputNumber'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { TrashIcon, ShoppingBagIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useCart, calcItemShipping } from '@/lib/cart-context'
import { useCartEventDiscount } from '@/hooks/useCartEventDiscount'
import toast from 'react-hot-toast'

type PendingCartDelete =
  | { kind: 'item'; id: string }
  | { kind: 'selected' }

export default function CartPage() {
  const router = useRouter()
  const t = useTranslations('Cart')
  const [pendingDelete, setPendingDelete] = useState<PendingCartDelete | null>(null)
  const pendingDeleteRef = useRef<PendingCartDelete | null>(null)
  const {
    items, selectedIds,
    removeItem, removeSelected, updateQty,
    toggleSelect, toggleSelectAll, isAllSelected,
    selectedPrice, selectedShipping, selectedTotal,
  } = useCart()

  const { byProductId: eventByPid, totalDiscount: eventDiscountTotal } =
    useCartEventDiscount(items, selectedIds)
  const payableTotal = Math.max(0, selectedTotal - eventDiscountTotal)

  // ★ 비로그인 가드 — 폐쇄몰: 로그인 없으면 로그인으로
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/login')
      return
    }
    setAuthChecked(true)
  }, [router])

  // 인증 확인 전 로딩
  if (!authChecked) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  const selectedCount = selectedIds.size
  const soldOutIds    = new Set(items.filter(i => (i.stockQty ?? 99) <= 0).map(i => i.id))
  const hasSelectedSoldOut = [...selectedIds].some(id => soldOutIds.has(id))

  const handleCheckout = () => {
    if (selectedCount === 0) { toast.error(t('checkoutNoSelection')); return }
    if (hasSelectedSoldOut) { toast.error(t('checkoutHasSoldOut')); return }
    // next-intl router는 자동으로 로케일 접두를 붙이므로 경로만 전달
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBagIcon className="mx-auto mb-6 h-20 w-20 text-neutral-300" />
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">{t('empty')}</h2>
        <p className="mt-3 text-neutral-500">{t('emptyHint')}</p>
        {/* next-intl Link는 자동으로 로케일 접두를 붙이므로 경로만 전달 */}
        <ButtonPrimary href="/products" className="mt-8">{t('continueShopping')}</ButtonPrimary>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900">
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-sm text-neutral-500">{t('lineItemCount', { count: items.length })}</p>
          {selectedCount > 0 && (
            <p className="mt-1 text-sm font-medium text-primary-600">{t('selectedCount', { count: selectedCount })}</p>
          )}
        </div>

        {soldOutIds.size > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
            <span>{t('soldOutWarning', { count: soldOutIds.size })}</span>
          </div>
        )}

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            {/* 전체선택 툴바 */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                {t('selectAllWithCounts', { selected: selectedCount, total: items.length })}
              </label>
              {selectedCount > 0 && (
                <button
                  onClick={() => {
                    const p = { kind: 'selected' as const }
                    pendingDeleteRef.current = p
                    setPendingDelete(p)
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {t('deleteSelectedWithCount', { count: selectedCount })}
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {items.map(item => {
                const price        = Number(item.price) || 0
                const qty          = Number(item.quantity) || 1
                const ev           = eventByPid[item.productId]
                const lineGross    = price * qty
                const lineFinal    = ev?.event_id
                  ? Math.max(0, lineGross - (ev.discount_amount ?? 0))
                  : lineGross
                const itemShipping = calcItemShipping(item)
                const isSelected   = selectedIds.has(item.id)
                const isSoldOut    = soldOutIds.has(item.id)
                const maxQty       = (item.stockQty && item.stockQty > 0) ? item.stockQty : 99

                return (
                  <div key={item.id}
                    className={`flex gap-4 py-6 transition-opacity ${
                      isSelected && !isSoldOut ? '' : 'opacity-50'
                    }`}>
                    <div className="flex items-center pt-1">
                      <input type="checkbox" checked={isSelected} onChange={() => !isSoldOut && toggleSelect(item.id)}
                        disabled={isSoldOut}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed" />
                    </div>

                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-32 sm:w-28">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill
                          className="object-cover object-center" sizes="130px" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-300">
                          <ShoppingBagIcon className="h-10 w-10" />
                        </div>
                      )}
                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                          <span className="text-xs font-bold text-white">{t('soldOutBadge')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 sm:text-base">
                            {item.name}
                          </h3>
                          {item.option && <p className="mt-1 text-xs text-neutral-500">{item.option}</p>}
                          {ev?.event_name && (
                            <span className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                              {t('eventLabel', { name: ev.event_name })}
                            </span>
                          )}
                          {isSoldOut ? (
                            <p className="mt-1 text-xs font-medium text-red-500">{t('soldOutBadge')}</p>
                          ) : (
                            <p className="mt-1 text-xs text-neutral-400">
                              {t('shippingFeeLabel')}: {itemShipping === 0
                                ? <span className="font-medium text-green-600">{t('shippingFree')}</span>
                                : `${itemShipping.toLocaleString('ko-KR')}원`
                              }
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const p = { kind: 'item' as const, id: item.id }
                            pendingDeleteRef.current = p
                            setPendingDelete(p)
                          }}
                          className="ml-2 shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                          aria-label={t('removeAriaLabel')}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        {/* ★ key={item.id}로 수량 컴포넌트 재마운트 보장 */}
                        {isSoldOut ? (
                          <span className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-400">{t('soldOutBadge')}</span>
                        ) : (
                          <NcInputNumber key={item.id} defaultValue={qty} min={1} max={maxQty}
                            onChange={val => updateQty(item.id, val)} />
                        )}
                        <div className="text-right">
                          <p className={`text-base font-semibold ${
                            isSoldOut ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'
                          } ${ev?.event_id && !isSoldOut ? 'text-red-600' : ''}`}>
                            {lineFinal.toLocaleString('ko-KR')}원
                          </p>
                          {ev?.event_id && !isSoldOut && lineFinal < lineGross && (
                            <p className="text-xs text-neutral-400 line-through">
                              {lineGross.toLocaleString('ko-KR')}원
                            </p>
                          )}
                          <p className="text-xs text-neutral-400">{t('unitPrice', { price: price.toLocaleString('ko-KR') })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6">
              {/* next-intl Link는 자동으로 로케일 접두를 붙이므로 경로만 전달 */}
              <Link href="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                <span>←</span><span>{t('continueShopping')}</span>
              </Link>
            </div>
          </div>

          <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

          {/* 주문 요약 */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
              <h3 className="mb-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('orderSummary')}</h3>
              <p className="mb-5 text-xs text-neutral-500">{t('selectedBasisCount', { count: selectedCount })}</p>

              {selectedCount === 0 ? (
                <div className="py-6 text-center text-sm text-neutral-400">{t('checkoutNoSelectionBtn')}</div>
              ) : (
                <div className="space-y-3 text-sm">
                  {items.filter(i => selectedIds.has(i.id)).map(item => (
                    <div key={item.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span className="line-clamp-1 max-w-[60%]">
                        {item.name} ×{Number(item.quantity) || 1}
                        {soldOutIds.has(item.id) && <span className="ml-1 text-red-400">({t('soldOutBadge')})</span>}
                      </span>
                      <span>{((Number(item.price)||0)*(Number(item.quantity)||1)).toLocaleString('ko-KR')}원</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>{t('productAmount')}</span><span>{selectedPrice.toLocaleString('ko-KR')}원</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shippingFeeLabel')}</span>
                  <span className={selectedShipping === 0 ? 'font-medium text-green-600' : ''}>
                    {selectedShipping === 0 ? t('shippingFree') : `${selectedShipping.toLocaleString('ko-KR')}원`}
                  </span>
                </div>
                {eventDiscountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>{t('eventDiscount')}</span>
                    <span>-{eventDiscountTotal.toLocaleString('ko-KR')}원</span>
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{t('totalPayment')}</span>
                <span className="text-xl font-bold text-primary-600">
                  {payableTotal.toLocaleString('ko-KR')}원
                </span>
              </div>

              <ButtonPrimary
                className="mt-6 w-full"
                disabled={selectedCount === 0 || hasSelectedSoldOut}
                onClick={handleCheckout}
              >
                {hasSelectedSoldOut
                  ? t('checkoutSoldOutBtn')
                  : selectedCount > 0
                  ? t('checkoutOrderBtn', { count: selectedCount })
                  : t('checkoutNoSelectionBtn')
                }
              </ButtonPrimary>

              <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-neutral-900">
                <p className="mb-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">{t('precautions')}</p>
                <ul className="space-y-1 text-xs text-neutral-500">
                  <li>• {t('noteDirectDeposit')}</li>
                  <li>• {t('noteDelivery')}</li>
                  <li>• {t('noteExchangeReturn')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onClose={() => {
          pendingDeleteRef.current = null
          setPendingDelete(null)
        }}
        title={
          pendingDelete?.kind === 'selected'
            ? t('deleteSelectedConfirmTitle')
            : pendingDelete?.kind === 'item'
              ? t('deleteItemConfirmTitle')
              : undefined
        }
        message={
          pendingDelete?.kind === 'selected'
            ? t('deleteSelectedConfirmMessage', { count: selectedCount })
            : pendingDelete?.kind === 'item'
              ? t('deleteItemConfirmMessage')
              : undefined
        }
        onConfirm={async () => {
          const p = pendingDeleteRef.current
          if (p?.kind === 'item') removeItem(p.id)
          else if (p?.kind === 'selected') removeSelected()
        }}
      />
    </div>
  )
}
