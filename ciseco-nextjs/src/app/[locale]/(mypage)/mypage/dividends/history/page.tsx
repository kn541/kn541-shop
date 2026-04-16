'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
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
  ALL:        '전체',
  CUSTOM:     '직접입력',
}

function HistoryContent() {
  const [tab, setTab]       = useState<TabKey>('ALL')
  const [period, setPeriod] = useState<PeriodKey>('THIS_MONTH')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const allItems = MOCK_DIVIDEND_HISTORY.items

  const filtered = allItems.filter(item => {
    const byType = tab === 'ALL' || item.dividend_type === tab

    if (!byType) return false
    if (period === 'CUSTOM') {
      if (dateFrom && item.dividend_date < dateFrom) return false
      if (dateTo   && item.dividend_date > dateTo)   return false
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
      <BackHeader title='배당 내역' />

      {/* 철 4종 탭 */}
      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL',    label: '전체' },
          { value: 'MLM',    label: `${DIVIDEND_COLORS.MLM.icon} 541배당` },
          { value: 'EQUITY', label: `${DIVIDEND_COLORS.EQUITY.icon} 동사가치` },
          { value: 'AGIT',   label: `${DIVIDEND_COLORS.AGIT.icon} 아지트` },
        ]}
      />

      {/* 기간 필터 */}
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--mp-color-border)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(k => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              style={{
                padding: '6px 14px', border: '1px solid',
                borderColor: period === k ? 'var(--mp-color-primary)' : 'var(--mp-color-border)',
                borderRadius: 20, fontSize: 14, fontWeight: period === k ? 700 : 400,
                background: period === k ? 'var(--mp-color-primary)' : '#fff',
                color: period === k ? '#fff' : 'var(--mp-color-text)', cursor: 'pointer',
              }}
            >{PERIOD_LABELS[k]}</button>
          ))}
        </div>
        {period === 'CUSTOM' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ flex: 1, height: 44, padding: '0 10px', border: '1px solid var(--mp-color-border)', borderRadius: 8, fontSize: 15 }}
            />
            <span style={{ color: 'var(--mp-color-text-muted)' }}>~</span>
            <input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ flex: 1, height: 44, padding: '0 10px', border: '1px solid var(--mp-color-border)', borderRadius: 8, fontSize: 15 }}
            />
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        {/* 합계 */}
        {filtered.length > 0 && (
          <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 12, textAlign: 'right' }}>
            합계 <strong style={{ color: 'var(--mp-color-success)', fontSize: 16 }}>
              +{totalAmount.toLocaleString('ko-KR')}원
            </strong>
          </div>
        )}

        {/* 내역 리스트 */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>선택한 기간에 내역이 없어요.</div>
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
    <L3Guard title='배당 내역'>
      <HistoryContent />
    </L3Guard>
  )
}
