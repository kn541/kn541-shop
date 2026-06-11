'use client'
// KN541 결제 페이지 — 토스페이먼츠 API 개별 연동
// feat: 무통장입금(BANK_TRANSFER) 결제수단 추가 — 신한은행 140-014-744885
// fix: 결제 팝업 취소 후 재시도 시 중복 주문 생성 버그 수정
//   원인: 팝업 취소 → isSubmitting=false → 재클릭 → 매번 새 주문 생성
//   수정: pendingOrderRef로 기존 PENDING 주문 캐시, 재시도 시 재사용
// fix: 간편결제(EASY_PAY) → 토스페이(pay.toss.im) 연동으로 전환
// fix: 결제수단 간편결제·카드·무통장입금 노출
// fix: 무통장입금 결제완료 후 장바구니 리다이렉트 방지 (paymentCompleteRef)

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

import { apiUrl } from '@/lib/api/base'

// ── 무통장 입금 계좌 정보 ──────────────────────────────────────────────────
const BANK_ACCOUNT = {
  bank:   '신한은행',
  number: '140-014-744885',
  holder: '(주)케이엔541',
} as const

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

type PayMethod = 'CARD' | 'EASY_PAY' | 'VIRTUAL_ACCOUNT' | 'TRANSFER' | 'BANK_TRANSFER'

/** 결제 팝업 취소 후 재시도에서 재사용되는 pending 주문 정보 */
interface PendingOrder {
  order_id:     string
  order_no:     string
  total_amount: number
}

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

  const isDigitalOnly =
    orderableItems.length > 0 &&
    orderableItems.every(i => i.product_type === '005')

  const orderTotal    = orderableItems.reduce((s, i) => s + (Number(i.price)||0) * (Number(i.quantity)||0), 0)
  const orderShipping = orderableItems.reduce((s, i) => s + calcItemShipping(i), 0)
  const total         = orderTotal + orderShipping
  const summaryTotal  = isDigitalOnly ? orderTotal : total

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
  const [digitalOrdererLoading, setDigitalOrdererLoading] = useState(false)

  const pendingOrderRef = useRef<PendingOrder | null>(null)

  // ── 결제 완료 후 cart 빈 체크 방지 ──────────────────────────────────────
  const paymentCompleteRef = useRef(false)

  useEffect(() => {
    pendingOrderRef.current = null
  }, [
    form.name, form.phone, address.address1, address.address2, address.zipcode,
    orderableItems.length,
  ])

  useEffect(() => {
    if (!mounted) return
    if (!isDigitalOnly) return
    const token = getToken()
    if (!token) return
    let cancelled = false
    setDigitalOrdererLoading(true)
    ;(async () => {
      try {
        const meRes = await fetch(apiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
        if (!meRes.ok) throw new Error('회원 정보를 불러올 수 없습니다.')
        const d = (await meRes.json()).data
        const info = {
          name: String(d?.name ?? d?.full_name ?? ''),
          phone: String(d?.phone ?? ''),
          email: String(d?.email ?? ''),
        }
        if (cancelled) return
        setMemberInfo(info)
        setForm(f => ({ ...f, name: info.name, phone: info.phone, email: info.email || f.email }))
      } catch {
        if (!cancelled) toast.error('회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      } finally {
        if (!cancelled) setDigitalOrdererLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [mounted, isDigitalOnly])

  useEffect(() => {
    if (!mounted) return
    if (!getToken()) return
    if (paymentCompleteRef.current) return
    if (orderableItems.length === 0) router.replace(`/${locale}/cart`)
  }, [mounted, orderableItems.length, locale, router])

  useEffect(() => {
    if (!mounted) return
    if (isDigitalOnly) return
    const token = getToken()
    if (!token) { setShowNewForm(true); return }
    fetch(apiUrl('/my/addresses'), { headers: { Authorization: `Bearer ${token}` } })
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
  }, [mounted, isDigitalOnly])

  useEffect(() => {
    if (!mounted || orderableItems.length === 0) return
    let active = true
    async function initPayment() {
      try {
        const token = getToken()
        const configRes = await fetch(apiUrl('/payments/config'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!configRes.ok) throw new Error('결제 설정을 불러올 수 없습니다')
        const { data: { client_key } } = await configRes.json()

        const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
        const tossPayments = await loadTossPayments(client_key)

        let customerKey = ANONYMOUS
        if (token) {
          try {
            const meRes = await fetch(apiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
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

    let payName = form.name.trim()
    let payPhone = form.phone.trim()
    let payEmail = form.email.trim()

    if (isDigitalOnly) {
      if (digitalOrdererLoading) { toast.error('회원 정보를 불러오는 중입니다.'); return }
      if (!payName)  { toast.error('회원 이름이 등록되어 있지 않습니다.'); return }
      if (!payPhone) { toast.error('회원 전화번호가 등록되어 있지 않습니다.'); return }
    } else {
      if (!form.name.trim())   { toast.error('수령자 이름을 입력해 주세요.'); return }
      if (!form.phone.trim())  { toast.error('휴대폰 번호를 입력해 주세요.'); return }
      if (!address.address1)   { toast.error('배송지 주소를 입력해 주세요.'); return }
    }

    if (payMethod !== 'EASY_PAY' && payMethod !== 'BANK_TRANSFER' && !paymentRef.current) {
      toast.error('결제 로드 중입니다. 잠시 후 다시 시도해 주세요.'); return
    }

    setIsSubmitting(true)
    try {
      const token = getToken()
      if (!token) { toast.error('로그인이 필요합니다.'); router.push(`/${locale}`); return }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      if (!isDigitalOnly && showNewForm && saveNewAddress) {
        try {
          await fetch(apiUrl('/my/addresses'), {
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

      // ── 무통장입금 ─────────────────────────────────────────────────────────
      if (payMethod === 'BANK_TRANSFER') {
        pendingOrderRef.current = null
        const orderBody = isDigitalOnly
          ? { items: orderableItems.map(i => ({ product_id: i.productId, option_id: i.optionId ?? null, quantity: Number(i.quantity)||1 })), recipient_name: payName, recipient_phone: payPhone, zip_code: '', address1: '디지털상품', address2: '', delivery_memo: '', payment_method: 'BANK_TRANSFER' }
          : { items: orderableItems.map(i => ({ product_id: i.productId, option_id: i.optionId ?? null, quantity: Number(i.quantity)||1 })), recipient_name: form.name.trim(), recipient_phone: form.phone.trim(), zip_code: address.zipcode, address1: address.address1, address2: address.address2 ?? '', delivery_memo: form.memo, payment_method: 'BANK_TRANSFER' }
        const orderRes  = await fetch(apiUrl('/orders'), { method: 'POST', headers, body: JSON.stringify(orderBody) })
        const orderData = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderData.detail ?? '주문 생성에 실패했습니다')
        paymentCompleteRef.current = true
        clearCart()
        router.push(`/${locale}/order-successful?order_id=${orderData.data.order_id}`)
        return
      }

      // ── 토스 결제 공통: 주문 생성 (중복 방지) ─────────────────────────────
      let currentOrder = pendingOrderRef.current

      if (!currentOrder) {
        const orderBody = isDigitalOnly
          ? { items: orderableItems.map(i => ({ product_id: i.productId, option_id: i.optionId ?? null, quantity: Number(i.quantity)||1 })), recipient_name: payName, recipient_phone: payPhone, zip_code: '', address1: '디지털상품', address2: '', delivery_memo: '', payment_method: 'TOSS' }
          : { items: orderableItems.map(i => ({ product_id: i.productId, option_id: i.optionId ?? null, quantity: Number(i.quantity)||1 })), recipient_name: form.name.trim(), recipient_phone: form.phone.trim(), zip_code: address.zipcode, address1: address.address1, address2: address.address2 ?? '', delivery_memo: form.memo, payment_method: 'TOSS' }
        const orderRes  = await fetch(apiUrl('/orders'), { method: 'POST', headers, body: JSON.stringify(orderBody) })
        const orderData = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderData.detail ?? '주문 생성에 실패했습니다')

        const { order_id, order_no, total_amount, skipped_product_ids: skippedProducts } = orderData.data
        if (Array.isArray(skippedProducts) && skippedProducts.length > 0) {
          toast(`판매 불가·종료된 상품 ${skippedProducts.length}건은 주문에서 제외되었습니다.`, { icon: 'ℹ️' })
        }
        currentOrder = { order_id, order_no, total_amount }
        pendingOrderRef.current = currentOrder
      }

      const { order_id, order_no, total_amount } = currentOrder

      const orderName = orderableItems.length === 1
        ? orderableItems[0].name
        : `${orderableItems[0].name} 외 ${orderableItems.length - 1}건`

      const origin = window.location.origin

      // ── 토스페이 (간편결제) ──────────────────────────────────────────────
      if (payMethod === 'EASY_PAY') {
        pendingOrderRef.current = null
        const tosspayRes = await fetch(apiUrl('/payments/tosspay/create'), {
          method: 'POST', headers,
          body: JSON.stringify({
            order_id,
            amount:         Math.round(total_amount),
            order_name:     orderName,
            ret_url:        `${origin}/${locale}/payment/tosspay/success?internal_order_id=${order_id}`,
            ret_cancel_url: `${origin}/${locale}/payment/tosspay/cancel?internal_order_id=${order_id}`,
          }),
        })
        const tosspayData = await tosspayRes.json()
        if (!tosspayRes.ok) throw new Error(tosspayData.detail ?? '토스페이 결제 생성에 실패했습니다')
        window.location.href = tosspayData.data.checkout_page
        return
      }

      // ── 토스페이먼츠 (카드 등) ───────────────────────────────────────────
      const prepareRes  = await fetch(apiUrl('/payments/prepare'), {
        method: 'POST', headers,
        body: JSON.stringify({ order_id, amount: Math.round(total_amount), order_name: orderName }),
      })
      const prepareData = await prepareRes.json()
      if (!prepareRes.ok) throw new Error(prepareData.detail ?? '결제 사전등록에 실패했습니다')

      const baseParams = {
        orderId:             order_no,
        orderName,
        customerName:        payName,
        customerEmail:       payEmail || undefined,
        customerMobilePhone: payPhone.replace(/[^0-9]/g, ''),
        successUrl: `${origin}/${locale}/payment/success?internal_order_id=${order_id}`,
        failUrl:    `${origin}/${locale}/payment/fail?internal_order_id=${order_id}`,
        amount: { currency: 'KRW', value: Math.round(total_amount) } as const,
      }

      if (payMethod === 'CARD') {
        await paymentRef.current.requestPayment({ method: 'CARD', ...baseParams })
      } else if (payMethod === 'VIRTUAL_ACCOUNT') {
        await paymentRef.current.requestPayment({
          method: 'VIRTUAL_ACCOUNT',
          ...baseParams,
          virtualAccount: { cashReceipt: { type: '미발행' }, useEscrow: false },
        })
      } else {
        await paymentRef.current.requestPayment({ method: 'TRANSFER', ...baseParams })
      }

      pendingOrderRef.current = null

    } catch (err: any) {
      const msg = err?.message ?? '결제 요청 중 오류가 발생했습니다.'
      const isCancellation = msg.includes('취소') || msg.toLowerCase().includes('cancel')

      if (!isCancellation) {
        pendingOrderRef.current = null
        toast.error(msg)
      }

      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100'
  const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

  if (!mounted || !getToken()) return null
  if (orderableItems.length === 0 && !paymentCompleteRef.current) return null

  const PAY_METHODS: { key: PayMethod; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'EASY_PAY',      label: '간편결제',   desc: '카카오페이·토스페이·네이버페이 등', icon: <DevicePhoneMobileIcon className="h-5 w-5" /> },
    { key: 'CARD',          label: '신용카드',   desc: '비자카드, 마스터카드 등',            icon: <CreditCardIcon className="h-5 w-5" /> },
    { key: 'BANK_TRANSFER', label: '무통장입금', desc: '신한은행 입금 후 주문 확정',          icon: <BuildingLibraryIcon className="h-5 w-5" /> },
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
          {isDigitalOnly && (
            <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">1</span>
                주문자 정보
              </h2>
              {digitalOrdererLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : (
                <>
                  <p className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
                    디지털 콘텐츠 상품으로 배송이 필요하지 않습니다.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>이름</label>
                      <input className={`${inputCls} cursor-not-allowed bg-neutral-100 opacity-90 dark:bg-neutral-800`}
                        type="text" value={form.name} readOnly disabled autoComplete="name" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>휴대폰</label>
                      <input className={`${inputCls} cursor-not-allowed bg-neutral-100 opacity-90 dark:bg-neutral-800`}
                        type="tel" value={form.phone} readOnly disabled autoComplete="tel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>이메일 (영수증·주문 확인 발송)</label>
                      <input className={inputCls} placeholder="example@email.com" type="email"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {!isDigitalOnly && (
          <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">1</span>
              배송 정보
            </h2>

            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button"
                onClick={() => { setShowNewForm(true); setSameAsMember(false); setSelectedAddressId(null); setMemoSelect(''); setForm((f) => ({ ...f, name: '', phone: '', memo: '' })); setAddress({ zipcode: '', address1: '', address2: '' }) }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${showNewForm ? 'bg-primary-600 text-white' : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'}`}>
                새 배송지 입력
              </button>
              <button type="button"
                onClick={() => { setShowNewForm(false); setSameAsMember(false); if (savedAddresses.length > 0) { const sel = savedAddresses.find((a) => a.id === selectedAddressId) ?? savedAddresses[0]; setSelectedAddressId(sel.id); applyAddress(sel) } }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${!showNewForm ? 'bg-primary-600 text-white' : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300'}`}>
                저장된 배송지 ({savedAddresses.length})
              </button>
            </div>

            {!showNewForm && savedAddresses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-600">
                <p className="mb-2 text-sm text-neutral-400">저장된 배송지가 없습니다</p>
                <Link href="/addresses" className="text-sm font-medium text-primary-600 hover:underline">배송지 관리에서 등록하기</Link>
              </div>
            )}

            {!showNewForm && savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {savedAddresses.map((addr) => (
                  <button key={addr.id} type="button" onClick={() => handleSelectAddress(addr)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${selectedAddressId === addr.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className={`h-4 w-4 shrink-0 mt-0.5 ${selectedAddressId === addr.id ? 'text-primary-600' : 'text-neutral-400'}`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{addr.recipient_name}</span>
                            {addr.address_name && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-700">{addr.address_name}</span>}
                            {addr.is_default && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30">기본</span>}
                          </div>
                          <p className="mt-0.5 text-sm text-neutral-500">{addr.recipient_phone}</p>
                          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">[{addr.zip_code}] {addr.address1} {addr.address2}</p>
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
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                  <input type="checkbox" checked={sameAsMember}
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
                            const res = await fetch(apiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
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
          )}

          {/* 결제 수단 */}
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

            <div className="grid grid-cols-3 gap-3">
              {PAY_METHODS.map(m => (
                <button key={m.key} onClick={() => setPayMethod(m.key)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${payMethod === m.key ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'}`}>
                  <span className={payMethod === m.key ? 'text-primary-600' : 'text-neutral-400'}>{m.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${payMethod === m.key ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-800 dark:text-neutral-200'}`}>{m.label}</p>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-tight">{m.desc}</p>
                  </div>
                  {payMethod === m.key && <CheckCircleIcon className="h-4 w-4 text-primary-600" />}
                </button>
              ))}
            </div>

            {/* 무통장입금 계좌 안내 박스 */}
            {payMethod === 'BANK_TRANSFER' && (
              <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-900/20">
                <div className="mb-3 flex items-center gap-2">
                  <BuildingLibraryIcon className="h-5 w-5 text-amber-600" />
                  <p className="font-bold text-amber-800 dark:text-amber-300">무통장 입금 계좌 안내</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-400">은행</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-200">{BANK_ACCOUNT.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-400">계좌번호</span>
                    <span className="font-bold tracking-widest text-amber-900 dark:text-amber-200">{BANK_ACCOUNT.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-400">예금주</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-200">{BANK_ACCOUNT.holder}</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-200 pt-2.5 dark:border-amber-700">
                    <span className="text-amber-700 dark:text-amber-400">입금금액</span>
                    <span className="text-xl font-bold text-amber-900 dark:text-amber-200">
                      {summaryTotal.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                  ⚠️ 주문 후 3일 이내 미입금 시 주문이 자동 취소됩니다.
                </p>
              </div>
            )}
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
              {!isDigitalOnly && (
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={orderShipping === 0 ? 'font-medium text-green-600' : ''}>
                  {orderShipping === 0 ? '무료' : `${orderShipping.toLocaleString()}원`}
                </span>
              </div>
              )}
            </div>

            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />

            <div className="flex items-center justify-between">
              <span className="font-bold">총 결제금액</span>
              <span className="text-xl font-bold text-primary-600">{summaryTotal.toLocaleString()}원</span>
            </div>

            <ButtonPrimary className="mt-6 w-full" onClick={handlePay}
              disabled={isSubmitting || (isDigitalOnly && digitalOrdererLoading)}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  처리 중...
                </span>
              ) : payMethod === 'BANK_TRANSFER' ? (
                <span className="flex items-center gap-2">
                  <BuildingLibraryIcon className="h-4 w-4" />
                  {summaryTotal.toLocaleString()}원 주문하기
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LockClosedIcon className="h-4 w-4" />
                  {summaryTotal.toLocaleString()}원 결제하기
                </span>
              )}
            </ButtonPrimary>

            {payMethod === 'BANK_TRANSFER' && (
              <p className="mt-3 text-center text-xs text-amber-600">
                주문 후 {BANK_ACCOUNT.bank} {BANK_ACCOUNT.number}으로<br/>
                {summaryTotal.toLocaleString()}원 입금해 주세요
              </p>
            )}

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
