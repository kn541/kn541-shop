'use client'

import { useState } from 'react'
import BigTabs from '@/components/mypage/BigTabs'
import L3Guard from '@/components/mypage/L3Guard'
import DividendCard from '@/components/mypage/DividendCard'
import { DIVIDEND_COLORS } from '@/lib/mypage/dividendColors'
import { MOCK_DIVIDEND_HISTORY } from '@/lib/mypage/mocks'
import type { DividendType } from '@/lib/mypage/types'

type TabKey = 'ALL' | DividendType
type PeriodKey = 'THIS_MONTH' | 'LAST_MONTH' | 'ALL' | 'CUSTOM'

const PERIOD_LABELS: Record<PeriodKey, string> = {
  THIS_MONTH: '이번달',
  LAST_MONTH: '지난달',
  ALL: '전체',
  CUSTOM: '직접입력',
}

function HistoryContent() {
  const [tab, setTab] = useState<TabKey>('ALL')
  const [period, setPeriod] = useState<PeriodKey>('THIS_MONTH')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const allItems = MOCK_DIVIDEND_HISTORY.items

  const filtered = allItems.filter(item => {
    const byType = tab === 'ALL' || item.dividend_type === tab
    if (!byType) return false
    if (period === 'CUSTOM') {
      if (dateFrom && item.dividend_date < dateFrom) return false
      if (dateTo && item.dividend_date > dateTo) return false
    } else if (period === 'THIS_MONTH') {
      return item.dividend_date.startsWith('2026-04')
    } else if (period === 'LAST_MONTH') {
      return item.dividend_date.startsWith('2026-03')
    }
    return true
  })

  const totalAmount = filtered.reduce((s, i) => s + i.amount, 0)

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">배당 내역</h1>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL', label: '전체' },
          { value: 'MLM', label: `${DIVIDEND_COLORS.MLM.icon} 541배당` },
          { value: 'EQUITY', label: `${DIVIDEND_COLORS.EQUITY.icon} 동사가치` },
          { value: 'AGIT', label: `${DIVIDEND_COLORS.AGIT.icon} 아지트` },
        ]}
      />

      <div className="border-b border-neutral-200 bg-white py-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap gap-2 px-4">
          {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                period === k
                  ? 'border-primary-500 bg-primary-500 font-bold text-white'
                  : 'border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900'
              }`}
            >
              {PERIOD_LABELS[k]}
            </button>
          ))}
        </div>
        {period === 'CUSTOM' && (
          <div className="mt-2 flex items-center gap-2 px-4">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-neutral-200 px-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            />
            <span className="text-neutral-500">~</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-neutral-200 px-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            />
          </div>
        )}
      </div>

      <div>
        {filtered.length > 0 && (
          <div className="mb-3 text-right text-sm text-neutral-500 dark:text-neutral-400">
            합계{' '}
            <strong className="text-base text-emerald-600">+{totalAmount.toLocaleString('ko-KR')}원</strong>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💰</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">선택한 기간에 내역이 없어요.</div>
          </div>
        ) : (
          filtered.map(item => <DividendCard key={item.dividend_id} item={item} />)
        )}
      </div>
    </>
  )
}

export default function DividendHistoryPage() {
  return (
    <L3Guard embedded title="배당 내역">
      <HistoryContent />
    </L3Guard>
  )
}
