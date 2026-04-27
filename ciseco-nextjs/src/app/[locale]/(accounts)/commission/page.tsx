'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'react-hot-toast'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import type { CommissionMonthResponse, CommissionMonthRow } from '@/lib/mypage/types'
import { useProfile } from '@/lib/mypage/useProfile'

function monthOptions(count = 12) {
  const out: string[] = []
  const d = new Date()
  for (let i = 0; i < count; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    const y = x.getFullYear()
    const m = String(x.getMonth() + 1).padStart(2, '0')
    out.push(`${y}-${m}`)
  }
  return out
}

function normalizeRows(res: CommissionMonthResponse): CommissionMonthRow[] {
  if (Array.isArray(res.items) && res.items.length) return res.items
  if (Array.isArray(res.rows) && res.rows.length) return res.rows
  return []
}

export default function CommissionPage() {
  const router = useRouter()
  const { data: profile, loading: profileLoading } = useProfile()
  const months = useMemo(() => monthOptions(14), [])
  const [month, setMonth] = useState(() => months[0] ?? '')
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CommissionMonthRow[]>([])
  const [monthTotal, setMonthTotal] = useState<number | null>(null)

  const isStartup = profile?.user_type === '006'

  const load = useCallback(async () => {
    if (!month) return
    setLoading(true)
    try {
      const data = await mypageFetch<CommissionMonthResponse>(`/my/commissions?month=${encodeURIComponent(month)}`)
      setRows(normalizeRows(data))
      const mt = data.month_total
      if (typeof mt === 'number') setMonthTotal(mt)
      else {
        const sum = normalizeRows(data).reduce((acc, r) => acc + Number(r.amount ?? 0), 0)
        setMonthTotal(sum)
      }
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) {
        router.replace('/login')
        return
      }
      toast.error('수당 내역을 불러오지 못했습니다.')
      setRows([])
      setMonthTotal(0)
    } finally {
      setLoading(false)
    }
  }, [month, router])

  useEffect(() => {
    if (profileLoading) return
    if (!isStartup) {
      setLoading(false)
      return
    }
    void load()
  }, [profileLoading, isStartup, load])

  const statusLabel: Record<string, string> = {
    PENDING: '대기',
    PROCESSING: '처리중',
    COMPLETED: '지급완료',
    CANCELLED: '취소',
  }
  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    PROCESSING: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    COMPLETED: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    CANCELLED: 'text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!isStartup) {
    return (
      <div className="flex flex-col gap-y-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">수당 현황</h1>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
            창업회원 전용 메뉴입니다.
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            서초그린케어(창업) 회원만 월별 수당 내역을 확인할 수 있습니다.
          </p>
          <p className="mt-4 text-xs text-neutral-400">고객센터: 070-4436-0928 (KN541)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">수당 현황</h1>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-500">조회 월</span>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {months.map(m => {
              const [y, mo] = m.split('-')
              return (
                <option key={m} value={m}>
                  {y}년 {Number(mo)}월
                </option>
              )
            })}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">해당 월 합계</p>
          <p className="mt-1 text-2xl font-bold">
            {loading ? '…' : (monthTotal ?? 0).toLocaleString('ko-KR')}원
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">건수</p>
          <p className="mt-1 text-2xl font-bold">{loading ? '…' : rows.length}건</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">해당 월 수당 내역이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((item, idx) => {
            const id = String(item.id ?? `row-${idx}`)
            const st = String(item.status ?? '')
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <div>
                  <p className="text-sm font-medium">{String(item.rule_name ?? '수당')}</p>
                  {item.from_member_name != null && (
                    <p className="text-xs text-neutral-500">추천인: {String(item.from_member_name)}</p>
                  )}
                  {item.created_at != null && (
                    <p className="text-xs text-neutral-400">
                      {new Date(String(item.created_at)).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Number(item.amount ?? 0).toLocaleString('ko-KR')}원</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColor[st] || 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                    }`}
                  >
                    {statusLabel[st] || st || '-'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
