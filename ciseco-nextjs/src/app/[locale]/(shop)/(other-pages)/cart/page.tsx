'use client'
// KN541 장바구니 페이지
// fix: 폐쇄몰 — 비로그인 시 메인 페이지로 이동
// fix: locale 동적화, NcInputNumber key 추가

import NcInputNumber from '@/components/NcInputNumber'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { TrashIcon, ShoppingBagIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCart, calcItemShipping } from '@/lib/cart-context'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'ko'
  const {
    items, selectedIds,
    removeItem, removeSelected, updateQty,
    toggleSelect, toggleSelectAll, isAllSelected,
    selectedPrice, selectedShipping, selectedTotal,
  } = useCart()

  // ★ 비로그인 가드 — 폐쇄몰: 로그인 없으면 메인으로
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace(`/${locale}`)
      return
    }
    setAuthChecked(true)
  }, [locale, router])

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
    if (selectedCount === 0) { toast.error('상품을 선택해 주세요.'); return }
    if (hasSelectedSoldOut) { toast.error('품절된 상품이 포함되어 있습니다. 선택을 해제해 주세요.'); return }
    router.push(`/${locale}/checkout`)
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBagIcon className="mx-auto mb-6 h-20 w-20 text-neutral-300" />
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">장바구니가 비어 있습니다</h2>
        <p className="mt-3 text-neutral-500">마음에 드는 상품을 담아보세요.</p>
        <ButtonPrimary href={`/${locale}/products`} className="mt-8">쇼핑 계속하기</ButtonPrimary>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900">
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">장바구니</h1>
          <p className="mt-2 text-sm text-neutral-500">총 {items.length}개 상품</p>
        </div>

        {soldOutIds.size > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
            <span>품절된 상품 {soldOutIds.size}개가 있습니다. 주문 전 삭제하거나 선택 해제해 주세요.</span>
          </div>
        )}

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            {/* 전체선택 툴바 */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                전체선택 ({selectedCount}/{items.length})
              </label>
              {selectedCount > 0 && (
                <button onClick={removeSelected}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <TrashIcon className="h-3.5 w-3.5" />
                  선택삭제 ({selectedCount})
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {items.map(item => {
                const price        = Number(item.price) || 0
                const qty          = Number(item.quantity) || 1
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
                          <span className="text-xs font-bold text-white">품절</span>
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
                          {isSoldOut ? (
                            <p className="mt-1 text-xs font-medium text-red-500">품절</p>
                          ) : (
                            <p className="mt-1 text-xs text-neutral-400">
                              배송비: {itemShipping === 0
                                ? <span className="font-medium text-green-600">무료</span>
                                : `${itemShipping.toLocaleString('ko-KR')}원`
                              }
                            </p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="ml-2 shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                          aria-label="삭제">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        {/* ★ key={item.id}로 수량 컴포넌트 재마운트 보장 */}
                        {isSoldOut ? (
                          <span className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-400">품절</span>
                        ) : (
                          <NcInputNumber key={item.id} defaultValue={qty} min={1} max={maxQty}
                            onChange={val => updateQty(item.id, val)} />
                        )}
                        <div className="text-right">
                          <p className={`text-base font-semibold ${
                            isSoldOut ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'
                          }`}>
                            {(price * qty).toLocaleString('ko-KR')}원
                          </p>
                          <p className="text-xs text-neutral-400">단가 {price.toLocaleString('ko-KR')}원</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6">
              <Link href={`/${locale}/products`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                <span>←</span><span>쇼핑 계속하기</span>
              </Link>
            </div>
          </div>

          <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

          {/* 주문 요약 */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
              <h3 className="mb-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">주문 요약</h3>
              <p className="mb-5 text-xs text-neutral-500">선택 상품 {selectedCount}개 기준</p>

              {selectedCount === 0 ? (
                <div className="py-6 text-center text-sm text-neutral-400">상품을 선택해 주세요</div>
              ) : (
                <div className="space-y-3 text-sm">
                  {items.filter(i => selectedIds.has(i.id)).map(item => (
                    <div key={item.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span className="line-clamp-1 max-w-[60%]">
                        {item.name} ×{Number(item.quantity) || 1}
                        {soldOutIds.has(item.id) && <span className="ml-1 text-red-400">(품절)</span>}
                      </span>
                      <span>{((Number(item.price)||0)*(Number(item.quantity)||1)).toLocaleString('ko-KR')}원</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>상품금액</span><span>{selectedPrice.toLocaleString('ko-KR')}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className={selectedShipping === 0 ? 'font-medium text-green-600' : ''}>
                    {selectedShipping === 0 ? '무료' : `${selectedShipping.toLocaleString('ko-KR')}원`}
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">총 결제금액</span>
                <span className="text-xl font-bold text-primary-600">{selectedTotal.toLocaleString('ko-KR')}원</span>
              </div>

              <ButtonPrimary
                className="mt-6 w-full"
                disabled={selectedCount === 0 || hasSelectedSoldOut}
                onClick={handleCheckout}
              >
                {hasSelectedSoldOut
                  ? '품절 상품 포함 (선택 해제 필요)'
                  : selectedCount > 0
                  ? `선택 ${selectedCount}개 주문하기`
                  : '상품을 선택해 주세요'
                }
              </ButtonPrimary>

              <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-neutral-900">
                <p className="mb-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">유의사항</p>
                <ul className="space-y-1 text-xs text-neutral-500">
                  <li>• 무통장 입금: 3일 이내</li>
                  <li>• 배송: 결제 확인 후 2~3일</li>
                  <li>• 교환/반품: 수령 7일 이내</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
