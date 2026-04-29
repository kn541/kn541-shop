'use client'
// KN541 결제 페이지 — 토스페이먼츠 API 개별 연동
// feat: "회원정보와 동일" 체크박스 — /auth/me에서 이름·전화번호·이메일 자동 채움

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LockClosedIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import KakaoAddressInput, { AddressValue } from '@/components/common/KakaoAddressSearch'
import { Link } from '@/shared/link'
import { useCart, calcItemShipping } from '@/lib/cart-context'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

const MEMO_OPTIONS = [
  { value: '',            label: '선택해 주세요' },
  { value: '문앞에 두고 가주세요', label: '문앞에 두고 가주세요' },
  { value: '경비실에 맡겨주세요',  label: '경비실에 맡겨주세요' },
  { value: '택배함에 넣어주세요',  label: '택배함에 넣어주세요' },
  { value: '직접 수령하겠습니다',  label: '직접 수령하겠습니다' },
  { value: '__DIRECT__',          label: '직접 입력' },
]

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

type PayMethod = 'CARD' | 'EASY_PAY' | 'VIRTUAL_ACCOUNT' | 'TRANSFER'

interface SavedAddress {
  id: string
  address_name?: string
  recipient_name: string
  recipient_phone: string
  zip_code: string
  address1: string
  address2?: string
  delivery_memo?: string
  is_default: boolean
}

export default function CheckoutPage() {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'ko'
  const { items, selectedIds, clearCart } = useCart()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = getToken()
    if (!token) {
      router.replace(`/${locale}`)
    }
  }, [locale, router])

  const orderableItems = items.filter(
    i => selectedIds.has(i.id) && i.productId?.includes('-')
  )
  const skippedCount = items.filter(i => !i.productId?.includes('-')).length

  const orderTotal    = orderableItems.reduce((s, i) => s + (Number(i.price)||0) * (Number(i.quantity)||0), 0)
  const orderShipping = orderableItems.reduce((s, i) => s + calcItemShipping(i), 0)
  const total         = orderTotal + orderShipping

  const [savedAddresses, setSavedAddresses]       = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm]             = useState(false)
  const [saveNewAddress, setSaveNewAddress]       = useState(false)

  const [form, setForm]             = useState({ name: '', phone: '', email: '', memo: '' })
  const [address, setAddress]       = useState<AddressValue>({ zipcode: '', address1: '', address2: '' })
  const [memoSelect, setMemoSelect] = useState('')

  const [payMethod, setPayMethod]       = useState<PayMethod>('CARD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const paymentRef = useRef<any>(null)
  const [sameAsMember, setSameAsMember] = useState(false)
  const [memberInfo, setMemberInfo]     = useState<{ name: string; phone: string; email: string } | null>(null)

  useEffect(() => {
    if (!mounted) return
    if (!getToken()) return
    if (orderableItems.length === 0) router.replace(`/${locale}/cart`)
  }, [mounted, orderableItems.length, locale, router])

  useEffect(() => {
    if (!mounted) return
    const token = getToken()
    if (!token) { setShowNewForm(true); return }
    fetch(`${BASE}/my/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const addrs: SavedAddress[] = data?.data?.items ?? []
        setSavedAddresses(addrs)
        if (addrs.length > 0) {
          const def = addrs.find(a => a.is_default) ?? addrs[0]
          setSelectedAddressId(def.id)
          applyAddress(def)
        } else {
          setShowNewForm(true)
        }
      })
      .catch(() => setShowNewForm(true))
  }, [mounted])

  useEffect(() => {
    if (!mounted || orderableItems.length === 0) return
    let active = true
    async function initPayment() {
      try {
        const token = getToken()
        const configRes = await fetch(`${BASE}/payments/config`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!configRes.ok) throw new Error('결제 설정을 불러올 수 없습니다')
        const { data: { client_key } } = await configRes.json()

        const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
        const tossPayments = await loadTossPayments(client_key)

        let customerKey = ANONYMOUS
        if (token) {
          try {
            const meRes = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            if (meRes.ok) {
              const uid = (await meRes.json()).data?.user_id
              if (uid) customerKey = uid
            }
          } catch {}
        }
        const payment = tossPayments.payment({ customerKey })
        if (active) paymentRef.current = payment
      } catch (err: any) {
        if (active) toast.error(err.message ?? '결제 초기화에 실패했습니다')
      }
    }
    initPayment()
    return () => { active = false; paymentRef.current = null }
  }, [mounted, orderableItems.length])

  function applyAddress(addr: SavedAddress) {
    const savedMemo = addr.delivery_memo ?? ''
    const isPreset  = MEMO_OPTIONS.some(o => o.value === savedMemo && o.value !== '__DIRECT__' && o.value !== '')
    setMemoSelect(isPreset ? savedMemo : (savedMemo ? '__DIRECT__' : ''))
    setForm(f => ({ ...f, name: addr.recipient_name, phone: addr.recipient_phone, memo: savedMemo }))
    setAddress({ zipcode: addr.zip_code, address1: addr.address1, address2: addr.address2 ?? '' })
  }

  function handleSelectAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id); applyAddress(addr); setShowNewForm(false)
  }

  function handleMemoSelect(val: string) {
    setMemoSelect(val)
    setForm(f => ({ ...f, memo: val !== '__DIRECT__' ? val : '' }))
  }

  const handlePay = async () => {
    if (isSubmitting) return
    if (!form.name.trim())   { toast.error('수령자 이름을 입력해 주세요.'); return }
    if (!form.phone.trim())  { toast.error('휴대폰 번호를 입력해 주세요.'); return }
    if (!address.address1)   { toast.error('배송지 주소를 입력해 주세요.'); return }
    if (!paymentRef.current) { toast.error('결제 로드 중입니다. 잠시 후 다시 시도해 주세요.'); return }

    setIsSubmitting(true)
    try {
      const token = getToken()
      if (!token) { toast.error('로그인이 필요합니다.'); router.push(`/${locale}`); return }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      if (showNewForm && saveNewAddress) {
        try {
          await fetch(`${BASE}/my/addresses`, {
            method: 'POST', headers,
            body: JSON.stringify({
              recipient_name: form.name.trim(), recipient_phone: form.phone.trim(),
              zip_code: address.zipcode, address1: address.address1,
              address2: address.address2 ?? '', delivery_memo: form.memo || null,
              is_default: savedAddresses.length === 0,
            }),
          })
        } catch {}
      }

      const orderBody = {
        items: orderableItems.map(i => ({ product_id: i.productId, option_id: null, quantity: Number(i.quantity)||1 })),
        recipient_name: form.name.trim(), recipient_phone: form.phone.trim(),
        zip_code: address.zipcode, address1: address.address1,
        address2: address.address2 ?? '', delivery_memo: form.memo,
        payment_method: 'TOSS',
      }
      const orderRes  = await fetch(`${BASE}/orders`, { method: 'POST', headers, body: JSON.stringify(orderBody) })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.detail ?? '주문 생성에 실패했습니다')
      const { order_id, order_no, total_amount, skipped_product_ids: skippedProducts } = orderData.data
      if (Array.isArray(skippedProducts) && skippedProducts.length > 0) {
        toast(`판매 불가·종료된 상품 ${skippedProducts.length}건은 주문에서 제외되었습니다.`, { icon: 'ℹ️' })
      }

      const orderName = orderableItems.length === 1
        ? orderableItems[0].name
        : `${orderableItems[0].name} 외 ${orderableItems.length - 1}건`

      const prepareRes  = await fetch(`${BASE}/payments/prepare`, {
        method: 'POST', headers,
        body: JSON.stringify({ order_id, amount: Math.round(total_amount), order_name: orderName }),
      })
      const prepareData = await prepareRes.json()
      if (!prepareRes.ok) throw new Error(prepareData.detail ?? '결제 사전등록에 실패했습니다')

      const origin = window.location.origin
      const baseParams = {
        orderId:             order_no,
        orderName,
        customerName:        form.name.trim(),
        customerEmail:       form.email.trim() || undefined,
        customerMobilePhone: form.phone.replace(/[^0-9]/g, ''),
        successUrl: `${origin}/${locale}/payment/success?internal_order_id=${order_id}`,
        failUrl:    `${origin}/${locale}/payment/fail?internal_order_id=${order_id}`,
        amount: { currency: 'KRW', value: Math.round(total_amount) } as const,
      }

      if (payMethod === 'EASY_PAY') {
        await paymentRef.current.requestPayment({ method: 'EASY_PAY', ...baseParams })
      } else if (payMethod === 'CARD') {
        await paymentRef.current.requestPayment({ method: 'CARD', ...baseParams })
      } else if (payMethod === 'VIRTUAL_ACCOUNT') {
        await paymentRef.current.requestPayment({ method: 'VIRTUAL_ACCOUNT', ...baseParams })
      } else {
        await paymentRef.current.requestPayment({ method: 'TRANSFER', ...baseParams })
      }

    } catch (err: any) {
      const msg = err?.message ?? '결제 요청 중 오류가 발생했습니다.'
      if (!msg.includes('취소')) toast.error(msg)
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100'
  const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

  if (!mounted || !getToken()) return null
  if (orderableItems.length === 0) return null

  const PAY_METHODS: { key: PayMethod; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'EASY_PAY',        label: '간편결제', desc: '카카오페이·토스페이·네이버페이 등', icon: <DevicePhoneMobileIcon className="h-5 w-5" /> },
    { key: 'CARD',            label: '신용카드', desc: '비자카드, 마스터카드 등',            icon: <CreditCardIcon className="h-5 w-5" /> },
    { key: 'VIRTUAL_ACCOUNT', label: '가상계좌', desc: '무통장 입금',                        icon: <BuildingLibraryIcon className="h-5 w-5" /> },
    { key: 'TRANSFER',        label: '계좌이체', desc: '실시간 계좌이체',                    icon: <BuildingLibraryIcon className="h-5 w-5" /> },
  ]

  const MemoInput = () => (
    <div className="sm:col-span-2">
      <label className={labelCls}>배송 메모 (선택)</label>
      <select className={inputCls} value={memoSelect} onChange={e => handleMemoSelect(e.target.value)}>
        {MEMO_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {memoSelect === '__DIRECT__' && (
        <input
          className={`${inputCls} mt-2`}
          placeholder="배송 메모를 직접 입력해 주세요"
          type="text" maxLength={100}
          value={form.memo}
          onChange={e => setForm({ ...form, memo: e.target.value })}
        />
      )}
    </div>
  )

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">결제</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
          <span className="text-neutral-400">장바구니</span><span>›</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">결제</span><span>›</span>
          <span className="text-neutral-400">완료</span>
        </div>
      </div>

      {skippedCount > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          <span>외부 상품 {skippedCount}건은 주문에서 제외됩니다.</span>
        </div>
      )}

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-8">
          {/* STEP 1 — 배송지 */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">1</span>
              배송 정보
            </h2>

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewForm(true)
                  setSameAsMember(false)
                  setSelectedAddressId(null)
                  setMemoSelect('')
                  setForm((f) => ({ ...f, name: '', phone: '', memo: '' }))
                  setAddress({ zipcode: '', address1: '', address2: '' })
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  showNewForm
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'
                }`}
              >
                새 배송지 입력
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewForm(false)
                  setSameAsMember(false)
                  if (savedAddresses.length > 0) {
                    const sel = savedAddresses.find((a) => a.id === selectedAddressId) ?? savedAddresses[0]
                    setSelectedAddressId(sel.id)
                    applyAddress(sel)
                  }
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  !showNewForm
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'
                }`}
              >
                저장된 배송지 ({savedAddresses.length})
              </button>
            </div>

            {!showNewForm && savedAddresses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-600">
                <p className="mb-2 text-sm text-neutral-400">저장된 배송지가 없습니다</p>
                <Link href="/addresses" className="text-sm font-medium text-primary-600 hover:underline">
                  배송지 관리에서 등록하기
                </Link>
              </div>
            )}

            {!showNewForm && savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectAddress(addr)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className={`h-4 w-4 shrink-0 mt-0.5 ${selectedAddressId === addr.id ? 'text-primary-600' : 'text-neutral-400'}`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{addr.recipient_name}</span>
                            {addr.address_name && (
                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-700">{addr.address_name}</span>
                            )}
                            {addr.is_default && (
                              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30">기본</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-neutral-500">{addr.recipient_phone}</p>
                          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                            [{addr.zip_code}] {addr.address1} {addr.address2}
                          </p>
                        </div>
                      </div>
                      {selectedAddressId === addr.id && <CheckCircleIcon className="h-5 w-5 shrink-0 text-primary-600" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showNewForm && (
              <div className="space-y-4 pt-2">
                {/* 회원정보와 동일 체크 */}
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                  <input
                    type="checkbox"
                    checked={sameAsMember}
                    onChange={async (e) => {
                      const checked = e.target.checked
                      setSameAsMember(checked)
                      if (checked) {
                        if (memberInfo) {
                          setForm(f => ({ ...f, name: memberInfo.name, phone: memberInfo.phone, email: memberInfo.email }))
                        } else {
                          try {
                            const token = getToken()
                            if (!token) return
                            const res = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                            if (res.ok) {
                              const d = (await res.json()).data
                              const info = { name: d?.name ?? '', phone: d?.phone ?? '', email: d?.email ?? '' }
                              setMemberInfo(info)
                              setForm(f => ({ ...f, name: info.name, phone: info.phone, email: info.email }))
                            }
                          } catch {}
                        }
                      } else {
                        setForm(f => ({ ...f, name: '', phone: '', email: '' }))
                      }
                    }}
                    className="h-4 w-4 rounded border-primary-300 text-primary-600"
                  />
                  회원정보와 동일
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>수령자 이름 *</label>
                    <input className={inputCls} placeholder="홍길동" type="text"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>휴대폰 *</label>
                    <input className={inputCls} placeholder="010-0000-0000" type="tel"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>이메일 (선택)</label>
                    <input className={inputCls} placeholder="example@email.com" type="email"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <KakaoAddressInput value={address} onChange={setAddress} label="주소 *"
                      inputClassName={inputCls} labelClassName={labelCls} />
                  </div>
                  <MemoInput />
                </div>
                {getToken() && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600" />
                    이 배송지를 저장하기
                  </label>
                )}
              </div>
            )}

            {!showNewForm && selectedAddressId && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>이메일 (선택)</label>
                  <input className={inputCls} placeholder="example@email.com" type="email"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <MemoInput />
              </div>
            )}
          </section>

          {/* STEP 2 — 결제 수단 */}
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">2</span>
              결제 수단
            </h2>

            {payMethod === 'EASY_PAY' && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <DevicePhoneMobileIcon className="h-4 w-4 shrink-0" />
                <span>결제하기 버튼을 누르면 카카오페이·토스페이·네이버페이 등 간편결제 선택 팝업이 뜹니다.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAY_METHODS.map(m => (
                <button key={m.key} onClick={() => setPayMethod(m.key)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                    payMethod === m.key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                  }`}>
                  <span className={payMethod === m.key ? 'text-primary-600' : 'text-neutral-400'}>{m.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${payMethod === m.key ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-800 dark:text-neutral-200'}`}>{m.label}</p>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-tight">{m.desc}</p>
                  </div>
                  {payMethod === m.key && <CheckCircleIcon className="h-4 w-4 text-primary-600" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="hidden border-l border-neutral-200 lg:block dark:border-neutral-700" />

        {/* 주문 요약 */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="sticky top-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-5 font-bold text-neutral-900 dark:text-neutral-100">주문 상품 ({orderableItems.length})</h3>
            <div className="space-y-4">
              {orderableItems.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" unoptimized />}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                      {item.option && <p className="text-xs text-neutral-400">{item.option}</p>}
                      <p className="text-xs text-neutral-400">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {((Number(item.price)||0)*(Number(item.quantity)||1)).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-neutral-200 dark:border-neutral-700" />

            <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>상품금액</span><span>{orderTotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={orderShipping === 0 ? 'font-medium text-green-600' : ''}>
                  {orderShipping === 0 ? '무료' : `${orderShipping.toLocaleString()}원`}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

            <div className="flex items-center justify-between">
              <span className="font-bold">총 결제금액</span>
              <span className="text-xl font-bold text-primary-600">{total.toLocaleString()}원</span>
            </div>

            <ButtonPrimary className="mt-6 w-full" onClick={handlePay} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  처리 중...
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
