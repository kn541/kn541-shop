'use client'
// KN541 주문완료 페이지 — 결제 상세 정보 전체 노출
// feat: 무통장입금(BANK_TRANSFER) 주문 시 계좌·입금금액 안내 박스 추가
// fix: 가상계좌 입금안내 강조 박스 추가
// fix: i18n — 하드코딩 한국어 → t() 키 치환

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import {
  CheckCircleIcon, HomeIcon, ShoppingBagIcon,
  ClipboardDocumentListIcon, ExclamationTriangleIcon,
  CreditCardIcon, BuildingLibraryIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

import { apiUrl } from '@/lib/api/base'
import { formatPrice } from '@/lib/formatPrice'

// ── 무통장 입금 계좌 정보 ──────────────────────────────────────────────────
const BANK_ACCOUNT = {
  bank:   '신한은행',
  number: '140-014-744885',
  holder: '(주)케이엔541',
} as const

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

interface VirtualAccount {
  bank_name?: string
  account_number?: string
  due_date?: string
  account_type?: string
}

interface OrderDetail {
  order_id: string
  order_no: string
  order_status: string
  status_label: string
  total_amount: number
  shipping_fee: number
  recipient_name: string
  address1: string
  address2?: string
  payment_method?: string
  payment_status?: string
  payment_key_masked?: string
  paid_at?: string
  virtual_account?: VirtualAccount
  created_at: string
  items: {
    item_id: string
    product_name: string
    option_name?: string
    quantity: number
    sale_price: number
    subtotal: number
    thumbnail_url?: string
  }[]
}

const METHOD_KEY_MAP: Record<string, string> = {
  CARD:             'methodCard',
  VIRTUAL_ACCOUNT:  'methodVA',
  TRANSFER:         'methodTransfer',
  TOSS:             'methodToss',
  KAKAO:            'methodKakao',
  EASY_PAY:         'methodEasyPay',
  BANK_TRANSFER:    'methodBankTransfer',
  '카드':           'methodCard',
  '가상계좌':       'methodVA',
  '계좌이체':       'methodTransfer',
}

function isVirtualAccount(method?: string) {
  return method === 'VIRTUAL_ACCOUNT' || method === '가상계좌'
}

function isBankTransfer(method?: string) {
  return method === 'BANK_TRANSFER'
}

function formatDateKo(iso?: string) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    return d.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function RowItem({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className={highlight ? 'font-semibold text-primary-600' : 'text-neutral-700 dark:text-neutral-300'}>
        {value}
      </span>
    </div>
  )
}

function OrderContent() {
  const t      = useTranslations('OrderSuccessful')
  const params = useSearchParams()

  const orderId = params.get('order_id')
  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow]       = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
    if (!orderId) { setLoading(false); return }
    const token = getToken()
    if (!token)   { setLoading(false); return }

    fetch(apiUrl(`/mypage/orders/${orderId}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setOrder(data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const subtotal = order?.items.reduce((s, i) => s + i.subtotal, 0) ?? 0
  const shipping = order?.shipping_fee ?? 0
  const total    = order?.total_amount ?? (subtotal + shipping)
  const isVA     = isVirtualAccount(order?.payment_method)
  const isBT     = isBankTransfer(order?.payment_method)
  const detailOrderId = orderId ?? order?.order_id ?? ''

  const getMethodLabel = (method?: string): string => {
    if (!method) return ''
    if (method === 'BANK_TRANSFER') return '무통장입금'
    const key = METHOD_KEY_MAP[method]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return key ? t(key as any) : method
  }

  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">

        {/* 성공 아이콘 */}
        <div className={`text-center transition-all duration-700 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-14 w-14 text-green-500" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
            {isBT ? '주문 완료' : t('paymentComplete')}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-4xl">
            {isBT ? '주문이 접수되었습니다' : t('title')}
          </h1>
          <p className="mt-3 text-neutral-500">
            {isBT ? '아래 계좌로 입금해 주시면 주문이 확정됩니다.' : t('subtitle')}
          </p>
        </div>

        {/* 주문번호 */}
        <div className={`mt-8 rounded-3xl border border-green-200 bg-green-50 p-5 text-center transition-all duration-700 delay-150 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:border-green-800 dark:bg-green-900/20`}>
          <p className="text-sm text-neutral-500">{t('orderNumberLabel')}</p>
          {loading ? (
            <div className="mt-2 h-8 w-48 animate-pulse rounded-lg bg-green-200 mx-auto dark:bg-green-800" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-wider text-green-700 dark:text-green-400">
              {order?.order_no ?? t('orderNumberLoading')}
            </p>
          )}
        </div>

        {/* ★ 무통장입금 계좌 안내 박스 */}
        {!loading && isBT && (
          <div className={`mt-6 rounded-3xl border-2 border-amber-400 bg-amber-50 p-6 transition-all duration-700 delay-[180ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:border-amber-600 dark:bg-amber-900/20`}>
            <div className="mb-4 flex items-center gap-2">
              <BuildingLibraryIcon className="h-6 w-6 text-amber-600" />
              <p className="text-lg font-bold text-amber-800 dark:text-amber-300">무통장 입금 안내</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3 dark:bg-amber-900/30">
                <span className="text-sm text-amber-700 dark:text-amber-400">은행</span>
                <span className="font-bold text-amber-900 dark:text-amber-200">{BANK_ACCOUNT.bank}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3 dark:bg-amber-900/30">
                <span className="text-sm text-amber-700 dark:text-amber-400">계좌번호</span>
                <span className="text-lg font-bold tracking-widest text-amber-900 dark:text-amber-200">
                  {BANK_ACCOUNT.number}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3 dark:bg-amber-900/30">
                <span className="text-sm text-amber-700 dark:text-amber-400">예금주</span>
                <span className="font-bold text-amber-900 dark:text-amber-200">{BANK_ACCOUNT.holder}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-400/30 px-4 py-3 dark:bg-amber-800/40">
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">입금금액</span>
                <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-white/40 px-4 py-3 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400 space-y-1">
              <p>• 입금자명은 <strong>주문자명 또는 회원명</strong>으로 해주세요.</p>
              <p>• 주문 후 <strong>3일 이내 미입금 시 주문이 자동 취소</strong>됩니다.</p>
              <p>• 입금 확인 후 배송이 진행됩니다.</p>
            </div>
          </div>
        )}

        {/* ★ 가상계좌 입금 안내 */}
        {!loading && isVA && (
          <div className={`mt-6 rounded-3xl border-2 border-amber-400 bg-amber-50 p-5 transition-all duration-700 delay-[180ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:border-amber-600 dark:bg-amber-900/20`}>
            <div className="mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              <p className="font-bold text-amber-800 dark:text-amber-300">{t('vaTitle')}</p>
            </div>
            {order?.virtual_account ? (
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-400">{t('vaBank')}</span>
                  <span className="font-semibold text-amber-900 dark:text-amber-200">{order.virtual_account.bank_name ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-400">{t('vaAccount')}</span>
                  <span className="font-bold text-lg tracking-widest text-amber-900 dark:text-amber-200">{order.virtual_account.account_number ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-400">{t('vaDueDate')}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {order.virtual_account.due_date ? formatDateKo(order.virtual_account.due_date) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-400">{t('vaAmount')}</span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">{formatPrice(total)}</span>
                </div>
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">{t('vaWarning')}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-700">{t('vaLoading')}</p>
            )}
          </div>
        )}

        {/* 주문 상품 */}
        <div className={`mt-8 transition-all duration-700 delay-200 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="mb-4 font-semibold">{t('itemsSectionTitle')}</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="h-14 w-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : order?.items && order.items.length > 0 ? (
            <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
              {order.items.map((item, idx) => (
                <div key={item.item_id} className={`flex gap-4 p-4 ${idx === 0 ? 'rounded-t-3xl' : ''} ${idx === order.items.length - 1 ? 'rounded-b-3xl' : ''}`}>
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.thumbnail_url ? (
                      <Image src={item.thumbnail_url} alt={item.product_name} fill className="object-cover" sizes="56px" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBagIcon className="h-6 w-6 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="font-medium line-clamp-1">{item.product_name}</p>
                      {item.option_name && <p className="text-xs text-neutral-400">{item.option_name}</p>}
                      <p className="text-sm text-neutral-400">×{item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">{t('itemsLoading')}</p>
          )}
        </div>

        {/* 결제 요약 */}
        <div className={`mt-6 space-y-3 text-sm transition-all duration-700 delay-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <RowItem label={t('productAmount')} value={`${formatPrice(subtotal)}`} />
          <RowItem label={t('shippingFee')}
            value={shipping === 0 ? <span className="text-green-600 font-medium">{t('shippingFree')}</span> : `${formatPrice(shipping)}`}
          />
          <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
            <RowItem label={isBT ? '입금금액' : t('actualPayment')}
              value={`${formatPrice(total)}`} highlight />
          </div>
        </div>

        {/* 결제 정보 */}
        {!loading && (order?.payment_method || order?.paid_at) && (
          <div className={`mt-6 rounded-2xl border border-neutral-200 p-4 transition-all duration-700 delay-[320ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:border-neutral-700`}>
            <div className="mb-3 flex items-center gap-2">
              <BuildingLibraryIcon className="h-4 w-4 text-neutral-400" />
              <p className="text-sm font-semibold">{t('paymentInfoTitle')}</p>
            </div>
            <div className="space-y-2">
              {order?.payment_method && (
                <RowItem label={t('payMethod')} value={getMethodLabel(order.payment_method)} />
              )}
              {order?.paid_at && (
                <RowItem label={t('payDatetime')} value={formatDateKo(order.paid_at) ?? '-'} />
              )}
              {!isVA && !isBT && order?.payment_key_masked && (
                <RowItem label={t('payKey')} value={order.payment_key_masked} />
              )}
              {order?.payment_status && (
                <RowItem label={t('payStatus')}
                  value={
                    order.payment_status === 'PAID' || order.payment_status === 'DONE'
                      ? <span className="text-green-600 font-medium">{t('payStatusPaid')}</span>
                      : order.payment_status === 'WAITING_FOR_DEPOSIT'
                      ? <span className="text-amber-600 font-medium">{t('payStatusWaiting')}</span>
                      : isBT && order.payment_status === 'PENDING'
                      ? <span className="text-amber-600 font-medium">입금 대기중</span>
                      : order.payment_status
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* 배송지 */}
        {order?.recipient_name && (
          <div className={`mt-6 rounded-2xl border border-neutral-200 p-4 text-sm transition-all duration-700 delay-[350ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:border-neutral-700`}>
            <p className="mb-2 font-semibold">{t('shippingTitle')}</p>
            <p className="text-neutral-600 dark:text-neutral-400">{order.recipient_name}</p>
            <p className="text-neutral-500">{order.address1} {order.address2}</p>
          </div>
        )}

        {/* 배송 안내 */}
        <div className={`mt-4 rounded-2xl bg-neutral-50 p-5 text-sm transition-all duration-700 delay-[400ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} dark:bg-neutral-800`}>
          <p className="mb-2 font-semibold">{t('deliveryTitle')}</p>
          <ul className="space-y-1 text-neutral-500">
            {isBT ? (
              <>
                <li>• 입금 확인 후 배송이 시작됩니다.</li>
                <li>• 3일 이내 미입금 시 주문이 자동 취소됩니다.</li>
              </>
            ) : isVA ? (
              <>
                <li>• {t('deliveryVAPre')}</li>
                <li>• {t('deliveryVAWarn')}</li>
              </>
            ) : (
              <li>• {t('deliveryNormal')}</li>
            )}
            <li>• {t('deliveryTrack')}</li>
            <li>• {t('deliveryPhone')}</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className={`mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700 delay-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <ButtonPrimary href="/" className="flex-1">
            <HomeIcon className="mr-2 h-5 w-5" />{t('btnHome')}
          </ButtonPrimary>
          {detailOrderId ? (
            <Link href={`/orders/${detailOrderId}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300">
              <ClipboardDocumentListIcon className="h-5 w-5" />{t('btnOrderDetail')}
            </Link>
          ) : null}
          <Link href="/products"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300">
            <ShoppingBagIcon className="h-5 w-5" />{t('btnKeepShopping')}
          </Link>
        </div>

        <p className={`mt-10 text-center text-sm text-neutral-400 transition-all duration-700 delay-[600ms] ${show ? 'opacity-100' : 'opacity-0'}`}>
          {t('footer')}
        </p>
      </div>
    </main>
  )
}

export default function OrderSuccessfulPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <OrderContent />
    </Suspense>
  )
}
