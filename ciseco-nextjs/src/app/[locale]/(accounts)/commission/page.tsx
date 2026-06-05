'use client'
// fix: /my/commissions → /mypage/dividends/history 로 변경
// 백엔드에 /my/commissions 엔드포인트 없음
// 기존 /mypage/dividends/history API를 월별 from/to 파라미터로 호출

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'react-hot-toast'
import L3Guard from '@/components/mypage/L3Guard'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { useTranslations } from 'next-intl'

interface CommissionItem {
  commission_id: string
  commission_type: string
  commission_type_label: string
  status: string
  status_label: string
  amount: number
  created_at?: string
  from_member_name?: string
}

interface CommissionHistoryResponse {
  items: CommissionItem[]
  total: number
  page: number
  size: number
}

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

/** 월의 마지막 날 구하기 */
function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return {
    from: `${month}-01`,
    to:   `${month}-${String(lastDay).padStart(2, '0')}`,
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T'))
  if (isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function CommissionContent() {
  const t      = useTranslations('Commission')
  const router = useRouter()
  const months = useMemo(() => monthOptions(14), [])
  const [month, setMonth] = useState(() => months[0] ?? '')
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CommissionItem[]>([])
  const [monthTotal, setMonthTotal] = useState<number>(0)

  const load = useCallback(async () => {
    if (!month) return
    setLoading(true)
    try {
      const { from, to } = monthRange(month)
      const data = await mypageFetch<CommissionHistoryResponse>(
        `/mypage/dividends/history?from=${from}&to=${to}&size=100`
      )
      const items = data.items ?? []
      setRows(items)
      const sum = items.reduce((acc, r) => acc + Number(r.amount ?? 0), 0)
      setMonthTotal(sum)
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) {
        router.replace('/login')
        return
      }
      toast.error(t('loadError'))
      setRows([])
      setMonthTotal(0)
    } finally {
      setLoading(false)
    }
  }, [month, router, t])

  useEffect(() => {
    void load()
  }, [load])

  const statusColor: Record<string, string> = {
    PENDING:    'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    SETTLED:    'text-green-600 bg-green-50 dark:bg-green-900/20',
    PROCESSING: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    CANCELLED:  'text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
    REVERSAL:   'text-red-500 bg-red-50 dark:bg-red-900/20',
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-500">{t('filterMonth')}</span>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {months.map(m => {
              const [y, mo] = m.split('-')
              return (
                <option key={m} value={m}>
                  {t('monthLabel', { year: y, month: Number(mo) })}
                </option>
              )
            })}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">{t('monthTotal')}</p>
          <p className="mt-1 text-2xl font-bold">
            {loading ? '…' : monthTotal.toLocaleString('ko-KR')}원
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">{t('count')}</p>
          <p className="mt-1 text-2xl font-bold">{loading ? '…' : rows.length}건</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">{t('empty')}</div>
      ) : (
        <div className="space-y-3">
          {rows.map((item, idx) => {
            const id = item.commission_id || `row-${idx}`
            const st = item.status || ''
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <div>
                  <p className="text-sm font-medium">{item.commission_type_label || item.commission_type || t('defaultType')}</p>
                  {item.created_at && (
                    <p className="text-xs text-neutral-400">{formatDate(item.created_at)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Number(item.amount ?? 0).toLocaleString('ko-KR')}원</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColor[st] || 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                    }`}
                  >
                    {item.status_label || st || '-'}
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

export default function CommissionPage() {
  const t = useTranslations('Commission')
  return (
    <L3Guard embedded title={t('title')} lockBenefits={[t('lockBenefit1'), t('lockBenefit2')]}>
      <CommissionContent />
    </L3Guard>
  )
}
