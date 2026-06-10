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
  // 포인트 타입 필터 (undefined = 전체). 백엔드 balances에서 동적 구성 — 코드값 하드코딩 없음.
  const [pointType, setPointType] = useState<string | undefined>(undefined)
  const { data, loading } = usePoints(TAB_TO_FILTER[tab], pointType)

  const balances = data?.balances ?? []
  const hasTypes = balances.length > 0
  const selectedName = pointType
    ? balances.find(b => b.point_type === pointType)?.point_type_name ?? '적립금'
    : null
  const headerLabel = pointType ? `${selectedName} 잔액` : '보유 적립금'
  const headerAmount = pointType
    ? (data?.current_balance ?? 0)
    : (data?.total_balance ?? data?.current_balance ?? 0)
  // 전체 보기 + 타입 정보가 있을 때만 내역에 타입 컬럼 노출 (구버전 백엔드 graceful)
  const showTypeCol = !pointType && hasTypes

  return (
    <div className="flex flex-col gap-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('points')}</h1>

      <div
        className="rounded-2xl border border-neutral-200 bg-white py-8 text-center dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">{headerLabel}</div>
        <div className="text-4xl font-extrabold text-primary-600 sm:text-5xl">
          💰 {headerAmount.toLocaleString('ko-KR')}
          <span className="text-2xl font-semibold"> 원</span>
        </div>
        {!pointType && hasTypes && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {balances.map(b => (
              <span
                key={b.point_type}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {b.point_type_name} {b.balance.toLocaleString('ko-KR')}원
              </span>
            ))}
          </div>
        )}
        {data && data.this_month_earned > 0 && (
          <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            ↑ 이번달 적립 {data.this_month_earned.toLocaleString('ko-KR')}원
          </div>
        )}
      </div>

      {/* 포인트 타입 탭 — 백엔드가 balances를 내려줄 때만 노출 */}
      {hasTypes && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPointType(undefined)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !pointType
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            전체
          </button>
          {balances.map(b => (
            <button
              key={b.point_type}
              onClick={() => setPointType(b.point_type)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pointType === b.point_type
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {b.point_type_name}
            </button>
          ))}
        </div>
      )}

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL', label: '전체' },
          { value: 'EARN', label: '적립' },
          { value: 'USE', label: '사용' },
        ]}
      />

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
        {loading && (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</div>
        )}

        {!loading && data?.items.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💰</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">내역이 없어요.</div>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">일시</th>
                <th className="px-4 py-3">구분</th>
                {showTypeCol && <th className="px-4 py-3">타입</th>}
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3 text-right">금액</th>
                <th className="px-4 py-3 text-right">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.items.map(item => {
                const style = CHANGE_COLOR[item.change_type] ?? CHANGE_COLOR.USE
                const d = new Date(item.occurred_at)
                const typeKo =
                  item.change_type === 'EARN'
                    ? '적립'
                    : item.change_type === 'USE'
                      ? '사용'
                      : item.change_type === 'EXPIRE'
                        ? '소멸'
                        : item.change_type === 'CANCEL'
                          ? '취소복원'
                          : item.change_type
                return (
                  <tr key={item.ledger_id} className="bg-white dark:bg-neutral-900">
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-medium">{typeKo}</td>
                    {showTypeCol && (
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-500 dark:text-neutral-400">
                        {item.point_type_name ?? '-'}
                      </td>
                    )}
                    <td className="max-w-[200px] px-4 py-3 text-neutral-800 dark:text-neutral-200">
                      {item.reason}
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right text-base font-bold"
                      style={{ color: style.color }}
                    >
                      {style.prefix}
                      {item.amount.toLocaleString('ko-KR')}원
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-neutral-600 dark:text-neutral-300">
                      {item.balance_after.toLocaleString('ko-KR')}원
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
