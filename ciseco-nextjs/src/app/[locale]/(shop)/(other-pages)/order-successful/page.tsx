'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { CheckCircleIcon, HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const ORDER_NUMBER = `KN-${Date.now().toString().slice(-8)}`

const DEMO_ITEMS = [
  { id: '1', name: '레더 토트백', qty: 1, price: 85000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop' },
  { id: '2', name: '캐주얼 레더 잠퍼', qty: 2, price: 120000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop' },
]
const subtotal = DEMO_ITEMS.reduce((s, i) => s + i.price * i.qty, 0)
const shipping = 0
const total = subtotal + shipping

export default function OrderSuccessfulPage() {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">

        {/* 성공 애니메이션 */}
        <div className={`text-center transition-all duration-700 ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' }`}>
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-14 w-14 text-green-500" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">결제 완료</p>
          <h1 className="mt-3 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">
            주문이 접수되었습니다!
          </h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">
            주문을 접수했습니다. 결제 확인 이메일을 발송해 드리겠습니다.
          </p>
        </div>

        {/* 주문번호 */}
        <div className={`mt-8 rounded-3xl border border-green-200 bg-green-50 p-5 text-center transition-all duration-700 delay-150 ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' } dark:border-green-800 dark:bg-green-900/20`}>
          <p className="text-sm text-neutral-500">주문번호</p>
          <p className="mt-1 text-2xl font-bold tracking-wider text-green-700 dark:text-green-400">{ORDER_NUMBER}</p>
          <p className="mt-1 text-xs text-neutral-400">하단에 주문 내역을 확인하실 수 있습니다</p>
        </div>

        {/* 주문 상품 목록 */}
        <div className={`mt-8 transition-all duration-700 delay-200 ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' }`}>
          <h2 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">주문 상품</h2>
          <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
            {DEMO_ITEMS.map((item, idx) => (
              <div key={item.id} className={`flex gap-4 p-4 ${ idx === 0 ? 'rounded-t-3xl' : '' } ${ idx === DEMO_ITEMS.length - 1 ? 'rounded-b-3xl' : '' }`}>
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                    <p className="text-sm text-neutral-400">×{item.qty}</p>
                  </div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {(item.price * item.qty).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className={`mt-6 space-y-3 text-sm transition-all duration-700 delay-300 ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' }`}>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>상품금액</span><span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>배송비</span><span className="text-green-600 font-medium">무료</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
            <span>실결제금액</span><span className="text-primary-600">{total.toLocaleString()}원</span>
          </div>
        </div>

        {/* 배송정보 */}
        <div className={`mt-6 rounded-2xl bg-neutral-50 p-5 text-sm transition-all duration-700 delay-[400ms] ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' } dark:bg-neutral-800`}>
          <p className="mb-2 font-semibold text-neutral-800 dark:text-neutral-200">배송 안내</p>
          <div className="space-y-1 text-neutral-500 dark:text-neutral-400">
            <p>• 결제 확인 후 영업일 기준 2~3일 내 출고 예정입니다.</p>
            <p>• 출고 시 등록하신 이메일로 송장번호를 안내드리겠습니다.</p>
            <p>• 배송 문의: 고객센터 1588-0000</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className={`mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700 delay-500 ${ show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0' }`}>
          <ButtonPrimary href="/ko" className="flex-1">
            <HomeIcon className="mr-2 h-5 w-5" />
            홈으로 가기
          </ButtonPrimary>
          <Link
            href="/ko/products"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            켜핑 계속하기
          </Link>
        </div>

        {/* 감사 메시지 */}
        <p className={`mt-10 text-center text-sm text-neutral-400 transition-all duration-700 delay-[600ms] ${ show ? 'opacity-100' : 'opacity-0' }`}>
          KN541을 이용해 주셔서 감사합니다 🙏
        </p>
      </div>
    </main>
  )
}
