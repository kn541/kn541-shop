'use client'
// KN541 쇼핑몰 — 마이페이지 > 주문 내역
// API: GET /orders?member_id={id}&page=1&size=10

import { useState, useEffect } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface Order {
  id: number
  order_number: string
  created_at: string
  total_amount: number
  status: string
  items: { product_name: string; quantity: number; price: number }[]
}

const STATUS_MAP: Record<string, string> = {
  pending: '결제대기',
  paid: '결제완료',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
  refunded: '환불',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipping: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
  refunded: 'bg-red-100 text-red-600',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    fetch(`${BASE}/orders?page=${page}&size=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          setOrders(res.data.items ?? [])
          setTotal(res.data.total ?? 0)
        }
      })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">주문 내역</h2>

      {loading ? (
        <div className="py-16 text-center text-neutral-400">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 py-16 text-center text-neutral-400 dark:border-neutral-700">
          주문 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400">{order.created_at?.slice(0, 10)}</p>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    주문번호 {order.order_number ?? `#${order.id}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                  {STATUS_MAP[order.status] ?? order.status}
                </span>
              </div>
              {order.items?.map((item, i) => (
                <p key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.product_name} × {item.quantity}
                </p>
              ))}
              <div className="mt-3 border-t border-neutral-100 pt-3 text-right dark:border-neutral-700">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {(order.total_amount ?? 0).toLocaleString()}원
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-xl text-sm font-medium transition ${p === page ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
