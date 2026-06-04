'use client'

import { useState, useMemo } from 'react'
import L3Guard from '@/components/mypage/L3Guard'
import {
  useDividendHistory,
  type CommissionHistoryItem,
} from '@/lib/mypage/useDividendHistory'

type PeriodKey = 'THIS_MONTH' | 'LAST_MONTH' | 'ALL' | 'CUSTOM'

const PERIOD_LABELS: Record<PeriodKey, string> = {
  THIS_MONTH: '이번달',
  LAST_MONTH: '지난달',
  ALL: '전체',
  CUSTOM: '직접입력',
}

/** 기간 키 → from/to YYYY-MM-DD (실제 오늘 날짜 기준, 하드코딩 없음) */
function periodToDates(
  period: PeriodKey,
  customFrom: string,
  customTo: string,
): { from: string | undefined; to: string | undefined } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (period === 'THIS_MONTH') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from: fmt(first), to: fmt(last) }
  }
  if (period === 'LAST_MONTH') {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: fmt(first), to: fmt(last) }
  }
  if (period === 'CUSTOM') {
    return { from: customFrom || undefined, to: customTo || undefined }
  }
  // ALL — 날짜 필터 없음
  return { from: undefined, to: undefined }
}

/**
 * 배당 내역 행 컴포넌트 (M5: BE 실 필드 기반)
 * DividendCard 대체 — MLM/EQUITY/AGIT 하드코딩 없음
 */
function CommissionRow({ item }: { item: CommissionHistoryItem }) {
  const dateStr = item.created_at.slice(0, 10)
  const isNegative = item.amount < 0
  const amountDisplay = isNegative
    ? `${item.amount.toLocaleString('ko-KR')}원`
    : `+${item.amount.toLocaleString('ko-KR')}원`
  const amountColor = isNegative
    ? 'var(--mp-color-error, #DC2626)'
    : 'var(--mp-color-success)'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--mp-radius-lg)',
        border: '1px solid var(--mp-color-border)',
        padding: 16,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                background: '#F3F4F6',
                color: '#374151',
                borderRadius: 20,
                padding: '3px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              {item.commission_type_label}
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--mp-color-text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.status_label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
              {dateStr}
            </span>
          </div>
          {item.pay_timing != null && (
            <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
              {item.pay_timing === 'INSTANT' ? '즉시 지급' : item.pay_timing}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: amountColor,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {amountDisplay}
        </div>
      </div>
    </div>
  )
}

function HistoryContent() {
  const [period, setPeriod] = useState<PeriodKey>('THIS_MONTH')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { from, to } = useMemo(
    () => periodToDates(period, dateFrom, dateTo),
    [period, dateFrom, dateTo],
  )

  const { data, loading, error } = useDividendHistory(from, to)

  const items = data?.items ?? []
  const totalAmount = items.reduce((s, i) => s + i.amount, 0)

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">배당 내역</h1>

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
        {loading && (
          <div className="py-12 text-center text-neutral-400">불러오는 중...</div>
        )}

        {!loading && error && (
          <div className="py-12 text-center">
            <div className="mb-2 text-neutral-500">{error}</div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mb-3 text-right text-sm text-neutral-500 dark:text-neutral-400">
            합계{' '}
            <strong
              className="text-base"
              style={{
                color:
                  totalAmount >= 0
                    ? 'var(--mp-color-success)'
                    : 'var(--mp-color-error, #DC2626)',
              }}
            >
              {totalAmount >= 0 ? '+' : ''}
              {totalAmount.toLocaleString('ko-KR')}원
            </strong>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💰</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">
              선택한 기간에 내역이 없어요.
            </div>
          </div>
        )}

        {!loading && !error && items.map(item => (
          <CommissionRow key={item.commission_id} item={item} />
        ))}
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
