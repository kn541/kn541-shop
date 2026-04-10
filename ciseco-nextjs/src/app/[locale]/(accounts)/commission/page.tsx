'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

interface Commission {
  id: string
  amount: string
  status: string
  created_at: string
  rule_name?: string
  from_member_name?: string
}

export default function CommissionPage() {
  const router = useRouter()
  const [items, setItems] = useState<Commission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [monthTotal, setMonthTotal] = useState(0)

  useEffect(() => {
    fetchCommissions()
  }, [])

  async function fetchCommissions() {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { router.push('/login'); return }
      const me = await fetch(`${BASE}/auth/me`, { headers: getHeaders() })
      if (me.status === 401) { router.push('/login'); return }
      const meData = await me.json()
      const userId = meData.data?.user_id

      const r = await fetch(`${BASE}/commissions?member_id=${userId}&page=1&size=20`, { headers: getHeaders() })
      const data = await r.json()
      const list = data.data?.items || []
      setItems(list)
      setTotal(data.data?.total || 0)

      // 이번 달 수당 합계
      const thisMonth = new Date().toISOString().slice(0, 7)
      const monthSum = list
        .filter((c: Commission) => c.created_at?.startsWith(thisMonth))
        .reduce((sum: number, c: Commission) => sum + Number(c.amount || 0), 0)
      setMonthTotal(monthSum)
    } catch {
      toast.error('수당 내역을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: '대기', PROCESSING: '처리중', COMPLETED: '지급완료', CANCELLED: '취소'
  }
  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    PROCESSING: 'text-blue-600 bg-blue-50',
    COMPLETED: 'text-green-600 bg-green-50',
    CANCELLED: 'text-neutral-400 bg-neutral-100',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">수당 현황</h1>

      {/* 이번 달 요약 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">이번 달 수당</p>
          <p className="mt-1 text-2xl font-bold">{monthTotal.toLocaleString()}원</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">전체 수당 건수</p>
          <p className="mt-1 text-2xl font-bold">{total}건</p>
        </div>
      </div>

      {/* 수당 목록 */}
      {items.length === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">수당 내역이 없습니다</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <div>
                <p className="text-sm font-medium">{item.rule_name || '수당'}</p>
                {item.from_member_name && (
                  <p className="text-xs text-neutral-500">추천인: {item.from_member_name}</p>
                )}
                <p className="text-xs text-neutral-400">{new Date(item.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(item.amount).toLocaleString()}원</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[item.status] || 'text-neutral-500 bg-neutral-100'}`}>
                  {statusLabel[item.status] || item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
