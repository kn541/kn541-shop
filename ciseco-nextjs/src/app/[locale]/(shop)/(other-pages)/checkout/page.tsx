'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import KakaoAddressInput, { AddressValue } from '@/components/common/KakaoAddressSearch'

const DEMO_ITEMS = [
  { id: '1', name: '레더 토트백', qty: 1, price: 85000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop' },
  { id: '2', name: '캐주얼 레더 잠퍼', qty: 2, price: 120000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop' },
]
const subtotal = DEMO_ITEMS.reduce((s, i) => s + i.price * i.qty, 0)
const shipping = subtotal >= 30000 ? 0 : 3000
const total = subtotal + shipping

const PAY_METHODS = [
  { id: 'card', label: '신용카드' },
  { id: 'kakao', label: '카카오페이' },
  { id: 'naver', label: '네이버페이' },
  { id: 'transfer', label: '무통장입금' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [payMethod, setPayMethod] = useState('card')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', email: '', memo: '',
  })
  const [address, setAddress] = useState<AddressValue>({
    zipcode: '', address1: '', address2: '',
  })

  const handlePay = async () => {
    if (!form.name || !form.phone || !address.address1) {
      alert('수령자 정보를 모두 입력해 주세요.')
      return
    }
    if (!agreed) { alert('구매 조건에 동의해 주세요.'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    router.push('/ko/order-successful')
  }

  const input = 'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100'
  const label = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
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
        {/* 왼쪽: 배송정보 + 결제수단 */}
        <div className="flex-1 space-y-8">

          {/* STEP 1 — 배송 정보 */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">1</span>
              배송 정보
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>수령자 이름 *</label>
                <input className={input} placeholder="홍길동"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={label}>휴대폰 *</label>
                <input className={input} placeholder="010-0000-0000"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={label}>이메일</label>
                <input className={input} placeholder="example@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              {/* ★ 카카오 주소 검색 */}
              <div className="sm:col-span-2">
                <KakaoAddressInput
                  value={address}
                  onChange={setAddress}
                  label="주소 *"
                  inputClassName={input}
                  labelClassName={label}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label}>배송 메모 (선택)</label>
                <select className={input} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}>
                  <option value="">선택해 주세요</option>
                  <option>문앞에 두고 가주세요</option>
                  <option>경비실에 맡겨주세요</option>
                  <option>택배함에 넣어주세요</option>
                  <option>직접 수령하겠습니다</option>
                </select>
              </div>
            </div>
          </section>

          {/* STEP 2 — 결제 수단 */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">2</span>
              결제 수단
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAY_METHODS.map((m) => (
                <button key={m.id} onClick={() => setPayMethod(m.id)}
                  className={`rounded-2xl border-2 py-3 text-sm font-medium transition-all ${
                    payMethod === m.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
            {payMethod === 'card' && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={label}>카드번호</label>
                  <input className={input} placeholder="0000 - 0000 - 0000 - 0000" />
                </div>
                <div>
                  <label className={label}>유효기간</label>
                  <input className={input} placeholder="MM / YY" />
                </div>
                <div>
                  <label className={label}>CVC</label>
                  <input className={input} placeholder="000" />
                </div>
              </div>
            )}
            {payMethod === 'transfer' && (
              <div className="mt-5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm font-semibold">입금 계좌</p>
                <p className="mt-1 text-sm text-neutral-600">신한은행 110-000-000000 (주)케이엔541</p>
                <p className="mt-1 text-xs text-neutral-400">주문일 3일 이내 미입금 시 자동 취소</p>
              </div>
            )}
          </section>

          {/* 동의 */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
            <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded" />
            <label htmlFor="agree" className="cursor-pointer text-sm text-neutral-600 dark:text-neutral-400">
              구매조건 및 개인정보 처리에 동의합니다. (필수)
            </label>
          </div>
        </div>

        <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

        {/* 주문 요약 */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-5 font-bold text-neutral-900 dark:text-neutral-100">주문 상품</h3>
            <div className="space-y-4">
              {DEMO_ITEMS.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-neutral-400">×{item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold">{(item.price * item.qty).toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="my-5 border-t border-neutral-200 dark:border-neutral-700" />
            <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between"><span>상품금액</span><span>{subtotal.toLocaleString()}원</span></div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={shipping === 0 ? 'font-medium text-green-600' : ''}>
                  {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
                </span>
              </div>
            </div>
            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />
            <div className="flex items-center justify-between">
              <span className="font-bold">총 결제금액</span>
              <span className="text-xl font-bold text-primary-600">{total.toLocaleString()}원</span>
            </div>
            <ButtonPrimary className="mt-6 w-full" onClick={handlePay} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  결제 중...
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
