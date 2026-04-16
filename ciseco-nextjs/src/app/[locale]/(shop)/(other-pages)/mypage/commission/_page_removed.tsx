'use client'
// KN541 쇼핑몰 — 마이페이지 > 수당 현황
// API: GET /commissions?page=1&size=20

import { useState, useEffect } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface Commission {
  id: number
  amount: number
  type: string
  status: string
  created_at: string
  description: string
}

export default function CommissionPage() {
  const [items, setItems] = useState<Commission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetch(`${BASE}/commissions?page=1&size=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          setItems(res.data.items ?? [])
          setTotal(res.data.total ?? 0)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const thisMonth = items
    .filter(i => i.created_at?.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)

  if (loading) return <div className="py-16 text-center text-neutral-400">불러오는 중...</div>

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">수당 현황</h2>

      {/* 이번 달 요약 */}
      <div className="mb-6 rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-100 dark:text-neutral-900">
        <p className="mb-1 text-sm opacity-70">이번 달 수당</p>
        <p className="text-3xl font-bold">{thisMonth.toLocaleString()}원</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 py-16 text-center text-neutral-400 dark:border-neutral-700">
          수당 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {item.description || item.type || '수당'}
                </p>
                <p className="text-xs text-neutral-400">{item.created_at?.slice(0, 10)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  +{(item.amount ?? 0).toLocaleString()}원
                </p>
                <span className={`text-xs ${item.status === 'paid' ? 'text-green-600' : 'text-neutral-400'}`}>
                  {item.status === 'paid' ? '지급완료' : '처리중'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
