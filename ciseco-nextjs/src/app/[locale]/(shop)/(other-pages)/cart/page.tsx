'use client'
// KN541 장바구니 페이지 — 상품별 배송비 적용

import Prices from '@/components/Prices'
import NcInputNumber from '@/components/NcInputNumber'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { CheckIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart, calcItemShipping } from '@/lib/cart-context'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQty, totalPrice, totalShipping } = useCart()
  const total = totalPrice + totalShipping

  // 장바구니 비어있을 때
  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBagIcon className="mx-auto mb-6 h-20 w-20 text-neutral-300" />
        <h2 className="text-2xl font-semibold text-neutral-700">장바구니가 비어 있습니다</h2>
        <p className="mt-3 text-neutral-500">마음에 드는 상품을 담아보세요.</p>
        <ButtonPrimary href="/ko/products" className="mt-8">
          쇼핑 계속하기
        </ButtonPrimary>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900">
      <main className="container py-16 lg:pt-20 lg:pb-28">
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">장바구니</h1>
          <p className="mt-2 text-sm text-neutral-500">
            선택하신 상품 {items.reduce((s, i) => s + i.quantity, 0)}개
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* 상품 목록 */}
          <div className="flex-1">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {items.map((item) => {
                const itemShipping = calcItemShipping(item)
                return (
                  <div key={item.id} className="flex gap-5 py-6 sm:gap-8">
                    {/* 이미지 */}
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-36 sm:w-32">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover object-center"
                          sizes="150px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-300">
                          <ShoppingBagIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                            {item.name}
                          </h3>
                          {item.option && (
                            <p className="mt-1 text-sm text-neutral-500">{item.option}</p>
                          )}
                          {/* 상품별 배송비 표시 */}
                          <p className="mt-1 text-xs text-neutral-400">
                            배송비: {itemShipping === 0 ? '무료' : `${itemShipping.toLocaleString('ko-KR')}원`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800 shrink-0"
                          aria-label="삭제"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <NcInputNumber
                          defaultValue={item.quantity}
                          min={1}
                          max={99}
                          onChange={(val) => updateQty(item.id, val)}
                        />
                        <div className="text-right">
                          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            {(item.price * item.quantity).toLocaleString('ko-KR')}원
                          </p>
                          <p className="text-xs text-neutral-400">
                            단가 {item.price.toLocaleString('ko-KR')}원
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 쇼핑 계속 */}
            <div className="mt-6">
              <Link href="/ko/products" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                <span>←</span>
                <span>쇼핑 계속하기</span>
              </Link>
            </div>
          </div>

          {/* 구분선 */}
          <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

          {/* 주문 요약 */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
              <h3 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-100">주문 요약</h3>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span className="line-clamp-1 max-w-[60%]">{item.name} ×{item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('ko-KR')}원</span>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>소계</span>
                  <span>{totalPrice.toLocaleString('ko-KR')}원</span>
                </div>
                {/* 상품별 배송비 상세 */}
                {items.map((item) => {
                  const fee = calcItemShipping(item)
                  return (
                    <div key={item.id} className="flex justify-between text-xs pl-2">
                      <span className="text-neutral-400 line-clamp-1 max-w-[65%]">
                        └ {item.name} 배송비
                      </span>
                      <span className={fee === 0 ? 'text-green-600' : ''}>
                        {fee === 0 ? '무료' : `${fee.toLocaleString('ko-KR')}원`}
                      </span>
                    </div>
                  )
                })}
                <div className="flex justify-between font-medium border-t border-neutral-100 pt-2 dark:border-neutral-700">
                  <span>총 배송비</span>
                  <span className={totalShipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {totalShipping === 0 ? '무료' : `${totalShipping.toLocaleString('ko-KR')}원`}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-neutral-200 dark:border-neutral-700" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">총 결제 금액</span>
                <span className="text-xl font-bold text-primary-600">{total.toLocaleString('ko-KR')}원</span>
              </div>

              <ButtonPrimary
                className="mt-6 w-full"
                onClick={() => router.push('/ko/checkout')}
              >
                주문하기
              </ButtonPrimary>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>안전한 결제 시스템으로 보호됩니다</span>
              </div>

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
