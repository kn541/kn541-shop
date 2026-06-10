'use client'
/**
 * KN541 내쇼핑몰 — 수동주문 4단계 위저드 (페이지용)
 * 직접 추천 회원만 대상 · POST /myshop/proxy-orders
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import KakaoAddressInput, { type AddressValue } from '@/components/common/KakaoAddressSearch'
import { toast } from 'react-hot-toast'
import { formatPriceKo } from '@/lib/formatPrice'
import { MypageApiError } from '@/lib/mypage/api'
import { useProfile } from '@/lib/mypage/useProfile'
import {
  calcProxyOrderTotals,
  createMyshopProxyOrder,
  fetchDirectReferrals,
  fetchMemberAddresses,
  filterReferrals,
  searchProxyOrderProducts,
  type ProxyOrderMember,
  type ProxyOrderProductRow,
  type ProxyOrderSavedAddress,
  type ProxyOrderSelectedItem,
} from '@/lib/mypage/proxyOrder'

const STEPS = ['회원 선택', '상품 선택', '배송지 입력', '확인'] as const

const MEMO_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '문 앞에 놓아주세요', label: '문 앞에 놓아주세요' },
  { value: '경비실에 맡겨주세요', label: '경비실에 맡겨주세요' },
  { value: '직접 받겠습니다', label: '직접 받겠습니다' },
  { value: '택배함에 넣어주세요', label: '택배함에 넣어주세요' },
  { value: '__custom__', label: '직접 입력' },
]

export default function ProxyOrderWizard() {
  const router = useRouter()
  const { data: profile, loading: profileLoading } = useProfile()

  const [step, setStep] = useState(0)

  // Step 1
  const [referrals, setReferrals] = useState<ProxyOrderMember[]>([])
  const [referralsLoading, setReferralsLoading] = useState(true)
  const [memberKeyword, setMemberKeyword] = useState('')
  const [selectedMember, setSelectedMember] = useState<ProxyOrderMember | null>(null)

  // Step 2
  const [productKeyword, setProductKeyword] = useState('')
  const [productLoading, setProductLoading] = useState(false)
  const [productResults, setProductResults] = useState<ProxyOrderProductRow[]>([])
  const [selectedItems, setSelectedItems] = useState<ProxyOrderSelectedItem[]>([])

  // Step 3
  const [savedAddresses, setSavedAddresses] = useState<ProxyOrderSavedAddress[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [useManualAddress, setUseManualAddress] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [address, setAddress] = useState<AddressValue>({ zipcode: '', address1: '', address2: '' })
  const [memoSelect, setMemoSelect] = useState('')
  const [deliveryMemo, setDeliveryMemo] = useState('')

  // Step 4
  const [adminMemo, setAdminMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredReferrals = useMemo(
    () => filterReferrals(referrals, memberKeyword),
    [referrals, memberKeyword],
  )

  const { productSubtotal, shippingTotal, orderTotal } = useMemo(
    () => calcProxyOrderTotals(selectedItems),
    [selectedItems],
  )

  const loadReferrals = useCallback(async (userId: string) => {
    setReferralsLoading(true)
    try {
      const list = await fetchDirectReferrals(userId)
      setReferrals(list)
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '추천 회원 목록을 불러오지 못했습니다.'
      toast.error(msg)
      setReferrals([])
    } finally {
      setReferralsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile?.user_id) void loadReferrals(profile.user_id)
  }, [profile?.user_id, loadReferrals])

  const searchProducts = async () => {
    setProductLoading(true)
    try {
      const items = await searchProxyOrderProducts(productKeyword)
      setProductResults(items)
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '상품 검색에 실패했습니다.'
      toast.error(msg)
      setProductResults([])
    } finally {
      setProductLoading(false)
    }
  }

  const addProduct = (row: ProxyOrderProductRow) => {
    const pid = row.id
    if (!pid) return
    const existing = selectedItems.find(i => i.product_id === pid)
    if (existing) {
      setSelectedItems(prev =>
        prev.map(i =>
          i.product_id === pid ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i,
        ),
      )
      return
    }
    setSelectedItems(prev => [
      ...prev,
      {
        product_id: pid,
        product_name: row.product_name ?? '(상품명 없음)',
        sale_price: Number(row.sale_price ?? 0),
        stock_qty: Number(row.stock_qty ?? 0),
        thumbnail_url: row.thumbnail_url,
        shipping_fee: Number(row.shipping_fee ?? 0),
        quantity: 1,
      },
    ])
  }

  const loadAddresses = useCallback(async (userId: string) => {
    setAddressLoading(true)
    try {
      const items = await fetchMemberAddresses(userId)
      setSavedAddresses(items)
      if (items.length > 0) {
        const def = items.find(a => a.is_default) ?? items[0]
        setSelectedAddressId(def.id)
        setUseManualAddress(false)
        setRecipientName(def.recipient_name)
        setRecipientPhone(def.recipient_phone)
        setAddress({
          zipcode: def.zip_code,
          address1: def.address1,
          address2: def.address2 ?? '',
        })
        setDeliveryMemo(def.delivery_memo ?? '')
        setMemoSelect('')
      } else {
        setUseManualAddress(true)
        setSelectedAddressId('')
      }
    } catch {
      setUseManualAddress(true)
      setSavedAddresses([])
    } finally {
      setAddressLoading(false)
    }
  }, [])

  useEffect(() => {
    if (step === 2 && selectedMember?.user_id) {
      void loadAddresses(selectedMember.user_id)
    }
  }, [step, selectedMember?.user_id, loadAddresses])

  const applySavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId)
    const addr = savedAddresses.find(a => a.id === addrId)
    if (!addr) return
    setRecipientName(addr.recipient_name)
    setRecipientPhone(addr.recipient_phone)
    setAddress({ zipcode: addr.zip_code, address1: addr.address1, address2: addr.address2 ?? '' })
    setDeliveryMemo(addr.delivery_memo ?? '')
    setMemoSelect('')
  }

  const resolvedMemo = memoSelect === '__custom__' ? deliveryMemo : (memoSelect || deliveryMemo)

  const validateAddress = (): boolean => {
    if (!recipientName.trim()) {
      toast.error('수령인명을 입력해 주세요.')
      return false
    }
    if (!recipientPhone.trim()) {
      toast.error('전화번호를 입력해 주세요.')
      return false
    }
    if (!address.zipcode || !address.address1.trim()) {
      toast.error('주소를 입력해 주세요.')
      return false
    }
    return true
  }

  const goNext = () => {
    if (step === 0 && !selectedMember) {
      toast.error('회원을 선택해 주세요.')
      return
    }
    if (step === 1 && selectedItems.length === 0) {
      toast.error('상품을 1개 이상 추가해 주세요.')
      return
    }
    if (step === 2 && !validateAddress()) return
    setStep(s => Math.min(3, s + 1))
  }

  const handleSubmit = async () => {
    if (!selectedMember) return
    setSubmitting(true)
    try {
      await createMyshopProxyOrder({
        target_user_id: selectedMember.user_id,
        items: selectedItems.map(i => ({
          product_id: i.product_id,
          option_id: null,
          quantity: i.quantity,
        })),
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.replace(/\D/g, ''),
        zip_code: address.zipcode,
        address1: address.address1.trim(),
        address2: address.address2.trim() || null,
        delivery_memo: resolvedMemo.trim() || null,
        admin_memo: adminMemo.trim() || null,
      })
      toast.success('수동주문이 생성되었습니다.')
      router.push('/orders')
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '수동주문 생성에 실패했습니다.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (profileLoading || referralsLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">수동주문</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          직접 추천 회원을 대신해 주문을 생성합니다. 결제는 무통장입금으로 접수됩니다.
        </p>
      </div>

      {/* 스텝 인디케이터 */}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i === step
                ? 'bg-primary-600 text-white'
                : i < step
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {selectedMember && step > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm dark:border-primary-800 dark:bg-primary-900/20">
          <span className="font-medium">{selectedMember.name}</span>
          {selectedMember.member_no && (
            <span className="text-neutral-500">회원번호 {selectedMember.member_no}</span>
          )}
          {selectedMember.phone && (
            <span className="text-neutral-500">{selectedMember.phone}</span>
          )}
        </div>
      )}

      {/* Step 1 — 직접 추천 회원 */}
      {step === 0 && (
        <div className="space-y-4">
          <input
            type="search"
            value={memberKeyword}
            onChange={e => setMemberKeyword(e.target.value)}
            placeholder="회원번호 / 이름 / 전화번호로 검색"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900"
          />
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">회원번호</th>
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">전화번호</th>
                  <th className="px-4 py-3 text-right font-medium">선택</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                      {referrals.length === 0
                        ? '직접 추천 회원이 없습니다.'
                        : '검색 결과가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map(m => (
                    <tr key={m.user_id} className="border-t border-neutral-100 dark:border-neutral-800">
                      <td className="px-4 py-3">{m.member_no || '-'}</td>
                      <td className="px-4 py-3">{m.name}</td>
                      <td className="px-4 py-3">{m.phone || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => { setSelectedMember(m); setStep(1) }}
                          className="rounded-lg border border-primary-500 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 2 — 상품 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={productKeyword}
              onChange={e => setProductKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void searchProducts() }}
              placeholder="상품명 / 상품코드로 검색"
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900"
            />
            <ButtonPrimary className="shrink-0" disabled={productLoading} onClick={() => void searchProducts()}>
              {productLoading ? '검색 중…' : '검색'}
            </ButtonPrimary>
          </div>

          <div className="space-y-2">
            {productResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                {productLoading ? '검색 중…' : '검색 결과가 없습니다.'}
              </p>
            ) : (
              productResults.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-800">
                      No img
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.product_name}</p>
                    <p className="text-sm text-primary-600">{formatPriceKo(Number(p.sale_price ?? 0))}</p>
                    <p className="text-xs text-neutral-400">재고 {p.stock_qty ?? 0}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduct(p)}
                    className="shrink-0 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    추가
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <h3 className="mb-3 text-sm font-semibold">선택된 상품</h3>
              <div className="space-y-3">
                {selectedItems.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-neutral-500">{formatPriceKo(item.sale_price)} · 재고 {item.stock_qty}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={e => {
                        const n = Math.max(1, Math.min(99, Number(e.target.value) || 1))
                        setSelectedItems(prev =>
                          prev.map(i => (i.product_id === item.product_id ? { ...i, quantity: n } : i)),
                        )
                      }}
                      className="w-16 rounded-lg border border-neutral-200 px-2 py-1 text-center text-sm dark:border-neutral-600 dark:bg-neutral-900"
                    />
                    <span className="w-24 text-right text-sm font-medium">
                      {formatPriceKo(item.sale_price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedItems(prev => prev.filter(i => i.product_id !== item.product_id))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 text-right text-sm">
                <p>상품금액: {formatPriceKo(productSubtotal)}</p>
                <p>배송비: {shippingTotal === 0 ? '무료' : formatPriceKo(shippingTotal)}</p>
                <p className="text-base font-bold text-primary-600">합계: {formatPriceKo(orderTotal)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — 배송지 */}
      {step === 2 && (
        <div className="space-y-4">
          {addressLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {savedAddresses.length > 0 && (
                <select
                  value={useManualAddress ? '__manual__' : selectedAddressId}
                  onChange={e => {
                    if (e.target.value === '__manual__') {
                      setUseManualAddress(true)
                      setSelectedAddressId('')
                    } else {
                      setUseManualAddress(false)
                      applySavedAddress(e.target.value)
                    }
                  }}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                >
                  {savedAddresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.recipient_name} — {a.address1}{a.is_default ? ' (기본)' : ''}
                    </option>
                  ))}
                  <option value="__manual__">직접 입력</option>
                </select>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">수령인명</span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    disabled={!useManualAddress && savedAddresses.length > 0 && !!selectedAddressId}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">전화번호</span>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    disabled={!useManualAddress && savedAddresses.length > 0 && !!selectedAddressId}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900"
                  />
                </label>
                <div className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">주소</span>
                  <KakaoAddressInput value={address} onChange={setAddress} />
                </div>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">배송메모</span>
                  <select
                    value={memoSelect}
                    onChange={e => setMemoSelect(e.target.value)}
                    className="mb-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                  >
                    {MEMO_OPTIONS.map(o => (
                      <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {memoSelect === '__custom__' && (
                    <input
                      type="text"
                      value={deliveryMemo}
                      onChange={e => setDeliveryMemo(e.target.value)}
                      placeholder="배송 메모를 입력하세요"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                    />
                  )}
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 4 — 확인 */}
      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
          <section>
            <h3 className="text-sm font-semibold">대상 회원</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {selectedMember?.name} ({selectedMember?.member_no || selectedMember?.user_id})
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold">상품</h3>
            <ul className="mt-1 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              {selectedItems.map(i => (
                <li key={i.product_id}>
                  {i.product_name} × {i.quantity} — {formatPriceKo(i.sale_price * i.quantity)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-semibold">합계: {formatPriceKo(orderTotal)} (배송비 포함)</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold">배송지</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {recipientName} / {recipientPhone}<br />
              [{address.zipcode}] {address.address1} {address.address2}
              {resolvedMemo && <><br />메모: {resolvedMemo}</>}
            </p>
          </section>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">메모 (선택)</span>
            <textarea
              value={adminMemo}
              onChange={e => setAdminMemo(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="주문 관련 메모"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            />
          </label>

          <p className="text-xs text-amber-600">
            결제방식: 무통장입금 · 결제상태: 입금 대기(PENDING)
          </p>
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex flex-wrap justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        {step > 0 ? (
          <ButtonSecondary type="button" onClick={() => setStep(s => s - 1)} disabled={submitting}>
            이전
          </ButtonSecondary>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <ButtonPrimary type="button" onClick={goNext}>
            다음
          </ButtonPrimary>
        ) : (
          <ButtonPrimary type="button" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? '생성 중…' : '주문 생성'}
          </ButtonPrimary>
        )}
      </div>
    </div>
  )
}
