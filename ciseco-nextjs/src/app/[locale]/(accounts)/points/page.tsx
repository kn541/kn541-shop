'use client'

import { useState } from 'react'
import BigTabs from '@/components/mypage/BigTabs'
import { usePoints } from '@/lib/mypage/usePoints'
import type { PointChangeType } from '@/lib/mypage/types'
import { useTranslations } from 'next-intl'

type TabKey = 'ALL' | 'EARN' | 'USE'

const CHANGE_COLOR: Record<string, { color: string; prefix: string }> = {
  EARN: { color: 'var(--mp-color-success)', prefix: '+' },
  USE: { color: 'var(--mp-color-danger)', prefix: '' },
  EXPIRE: { color: '#A6A4B0', prefix: '' },
  CANCEL: { color: 'var(--mp-color-success)', prefix: '+' },
}

const TAB_TO_FILTER: Record<TabKey, PointChangeType | 'ALL'> = {
  ALL: 'ALL',
  EARN: 'EARN',
  USE: 'USE',
}

export default function PointsPage() {
  const t = useTranslations('Account')
  const [tab, setTab] = useState<TabKey>('ALL')
  const { data, loading } = usePoints(TAB_TO_FILTER[tab])

  return (
    <div className="flex flex-col gap-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('points')}</h1>

      <div
        className="rounded-2xl border border-neutral-200 bg-white py-8 text-center dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">사용 가능 적립금</div>
        <div className="text-4xl font-extrabold text-primary-600 sm:text-5xl">
          💰 {(data?.current_balance ?? 0).toLocaleString('ko-KR')}
          <span className="text-2xl font-semibold"> 원</span>
        </div>
        {data && data.this_month_earned > 0 && (
          <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            ↑ 이번달 적립 {data.this_month_earned.toLocaleString('ko-KR')}원
          </div>
        )}
      </div>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL', label: '전체' },
          { value: 'EARN', label: '적립' },
          { value: 'USE', label: '사용' },
        ]}
      />

      <div>
        {loading && (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</div>
        )}

        {!loading && data?.items.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💰</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">내역이 없어요.</div>
          </div>
        )}

        {!loading &&
          data?.items.map(item => {
            const style = CHANGE_COLOR[item.change_type] ?? CHANGE_COLOR.USE
            const d = new Date(item.occurred_at)
            return (
              <div
                key={item.ledger_id}
                className="flex items-center justify-between border-b border-neutral-200 py-4 dark:border-neutral-700"
              >
                <div>
                  <div className="mb-1 text-base font-semibold">{item.reason}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {d.toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: style.color }}>
                    {style.prefix}
                    {item.amount.toLocaleString('ko-KR')}원
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    잔액 {item.balance_after.toLocaleString('ko-KR')}원
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
