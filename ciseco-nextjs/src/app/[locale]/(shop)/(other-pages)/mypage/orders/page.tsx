'use client'
// KN541 마이페이지 주문 목록
// GET /mypage/orders — admin orders 테이블 기반, 해당 회원 필터링

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

interface OrderSummary {
  order_id: string
  order_no: string
  order_status: string
  status_label: string
  total_amount: number
  item_count: number
  first_product_name?: string
  first_thumbnail_url?: string
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PREPARING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  REFUNDED:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PAID', label: '결제완료' },
  { key: 'PREPARING', label: '준비중' },
  { key: 'SHIPPED', label: '배송중' },
  { key: 'DELIVERED', label: '배송완료' },
  { key: 'CANCELLED', label: '취소' },
]

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders]         = useState<OrderSummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('ALL')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const SIZE = 10

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/ko/login?redirect=/ko/mypage/orders'); return }

    setLoading(true)
    const params = new URLSearchParams({
      status: activeTab,
      page: String(page),
      size: String(SIZE),
    })
    fetch(`${BASE}/mypage/orders?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setOrders(data?.data?.items ?? [])
        setTotal(data?.data?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab, page, router])

  const totalPages = Math.ceil(total / SIZE)

  const formatDate = (iso: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">주문 내역</h1>

      {/* 상태 탭 */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1) }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-3xl border border-neutral-200 p-5 dark:border-neutral-700">
              <div className="flex gap-4">
                <div className="h-16 w-14 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBagIcon className="mb-4 h-16 w-16 text-neutral-300" />
          <p className="text-neutral-500">주문 내역이 없습니다.</p>
          <button onClick={() => router.push('/ko/products')}
            className="mt-4 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700">
            쇼핑 시작하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <button key={order.order_id}
              onClick={() => router.push(`/ko/mypage/orders/${order.order_id}`)}
              className="w-full rounded-3xl border border-neutral-200 p-5 text-left transition hover:border-primary-300 hover:shadow-sm dark:border-neutral-700 dark:hover:border-primary-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {order.first_thumbnail_url ? (
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <Image src={order.first_thumbnail_url} alt={order.first_product_name ?? ''}
                        fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                  ) : (
                    <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <ShoppingBagIcon className="h-7 w-7 text-neutral-300" />
                    </div>
                  )}
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {order.first_product_name ?? '상품 정보 없음'}
                      {order.item_count > 1 && (
                        <span className="ml-1 text-neutral-400"> 외 {order.item_count - 1}건</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatDate(order.created_at)} · 주문번호 {order.order_no}
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {order.total_amount.toLocaleString('ko-KR')}원
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.order_status] ?? STATUS_COLOR['PENDING']}`}>
                    {order.status_label}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-neutral-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-neutral-700">
            이전
          </button>
          <span className="text-sm text-neutral-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-neutral-700">
            다음
          </button>
        </div>
      )}
    </div>
  )
}
