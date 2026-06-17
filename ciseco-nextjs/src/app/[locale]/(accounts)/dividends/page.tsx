'use client'

import { Link } from '@/components/Link'
import BigButton from '@/components/mypage/BigButton'
import SectionHeader from '@/components/mypage/SectionHeader'
import L3Guard from '@/components/mypage/L3Guard'
import WithdrawModal from '@/components/mypage/WithdrawModal'
import {
  useDividendSummary,
  type CommissionSummaryItem,
} from '@/lib/mypage/useDividendSummary'
import { useWithdrawSummary } from '@/lib/mypage/useWithdrawSummary'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * 유형별 집계 카드 (M5-2: BE rule_type_code 기반, 하드코딩 없음)
 * DividendColors/MLM/EQUITY/AGIT 의존 제거
 */
function TypeCard({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-2 text-xs font-bold text-neutral-600 dark:text-neutral-300">
        {label}
      </div>
      <div className="text-base font-extrabold">{amount.toLocaleString('ko-KR')}</div>
      <div className="text-xs text-neutral-500">GWCP</div>
    </div>
  )
}

/** 최근 배당 행 (M5-2: BE 실 필드 기반, DividendCard 대체) */
function RecentRow({ item }: { item: CommissionSummaryItem }) {
  const dateStr = item.created_at ? item.created_at.slice(0, 10) : ''
  const isNegative = item.amount < 0
  const amountDisplay = isNegative
    ? `${item.amount.toLocaleString('ko-KR')}GWCP`
    : `+${item.amount.toLocaleString('ko-KR')}GWCP`

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--mp-radius-lg)',
        border: '1px solid var(--mp-color-border)',
        padding: 14,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                background: '#F3F4F6',
                color: '#374151',
                borderRadius: 20,
                padding: '2px 9px',
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
            <span style={{ fontSize: 12, color: 'var(--mp-color-text-muted)' }}>
              {dateStr}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: isNegative
              ? 'var(--mp-color-error, #DC2626)'
              : 'var(--mp-color-success)',
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

function DashboardContent() {
  const t = useTranslations('Account')
  const { data, loading, error } = useDividendSummary()
  // 출금 요약 — 출금가능잔액 + 계좌 보유여부(팝업 입력란 노출 판정)
  const { data: withdrawSummary, loading: wLoading, reload: reloadWithdraw } = useWithdrawSummary()
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  // BE recent_items에서 rule_type_code → label 맵 구성
  // total_by_type 등 집계 섹션 라벨에 활용 (없으면 코드 그대로 표시)
  const labelsMap: Record<string, string> = {}
  for (const item of (data?.recent_items ?? [])) {
    if (!labelsMap[item.commission_type]) {
      labelsMap[item.commission_type] = item.commission_type_label
    }
  }

  // 출금 가능 잔액 — 출금 summary 우선(동일 소스), 폴백으로 dividends summary
  const balance =
    withdrawSummary?.withdrawable_balance ?? data?.withdrawable_balance ?? 0
  const thisMonth = data?.this_month_by_type ?? {}
  const totalByType = data?.total_by_type ?? {}
  const totalAll = Object.values(totalByType).reduce((a, b) => a + b, 0)
  const recentItems = data?.recent_items ?? []

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('dividends')}</h1>

      {loading && (
        <div className="py-12 text-center text-neutral-400">불러오는 중...</div>
      )}

      {!loading && error && (
        <div className="py-12 text-center text-neutral-500">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* 배당 포인트 잔액 + 출금 신청 */}
          <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
              💰 출금 가능 잔액
            </div>
            <div className="mb-1 text-4xl font-black text-violet-600 sm:text-5xl">
              {balance.toLocaleString('ko-KR')}
            </div>
            <div className="mb-5 text-xl font-semibold text-violet-600">GWCP</div>

            <div className="px-6">
              <button
                type="button"
                disabled={wLoading || balance <= 0}
                onClick={() => setWithdrawOpen(true)}
                className="w-full rounded-full bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {balance > 0 ? '출금 요청' : '출금 가능 잔액 없음'}
              </button>
              <p className="mt-2 text-xs text-neutral-400">
                동사가치배당금을 현금으로 출금 신청합니다 (현금 최대 50%, 나머지 포인트 전환)
              </p>
            </div>
          </div>

          {/* 이번 달 배당 */}
          <SectionHeader title="이번 달 배당" />
          {Object.keys(thisMonth).length === 0 ? (
            <div className="py-4 text-center text-sm text-neutral-400">
              이번 달 배당 내역이 없어요.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 px-1">
              {Object.entries(thisMonth).map(([code, amount]) => (
                <TypeCard
                  key={code}
                  label={labelsMap[code] ?? code}
                  amount={amount}
                />
              ))}
            </div>
          )}

          {/* 누적 배당 */}
          <SectionHeader title="누적 배당" />
          <div className="mx-1 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 flex justify-between">
              <span className="text-[15px] font-semibold">총 누적</span>
              <span className="text-lg font-extrabold">
                {totalAll.toLocaleString('ko-KR')}GWCP
              </span>
            </div>
            {Object.keys(totalByType).length === 0 ? (
              <div className="py-2 text-sm text-neutral-400">
                누적 배당 내역이 없어요.
              </div>
            ) : (
              Object.entries(totalByType).map(([code, amount]) => (
                <div
                  key={code}
                  className="flex items-center justify-between border-t border-neutral-200 py-2 dark:border-neutral-700"
                >
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {labelsMap[code] ?? code}
                  </span>
                  <span className="text-[15px] font-bold">
                    {amount.toLocaleString('ko-KR')}GWCP
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 전체 배당 */}
          <div className="mx-1">
            <div className="flex items-center justify-between py-4">
              <span className="text-base font-bold">전체 배당</span>
              <Link
                href="/dividends/history"
                className="text-sm font-semibold text-primary-600"
              >
                전체 ▶
              </Link>
            </div>
            {recentItems.length === 0 ? (
              <div className="py-4 text-center text-sm text-neutral-400">
                전체 배당 내역이 없어요.
              </div>
            ) : (
              recentItems.map(item => (
                <RecentRow key={item.commission_id} item={item} />
              ))
            )}
          </div>

          <div className="px-1 pb-8">
            <Link href="/tree" className="block w-full">
              <BigButton fullWidth variant="secondary">
                조직도 보기 ▶
              </BigButton>
            </Link>
          </div>

          {withdrawSummary && (
            <WithdrawModal
              open={withdrawOpen}
              summary={withdrawSummary}
              onClose={() => setWithdrawOpen(false)}
              onApplied={reloadWithdraw}
            />
          )}
        </>
      )}
    </>
  )
}

export default function DividendsPage() {
  return (
    <L3Guard
      embedded
      title="배당 현황"
      lockBenefits={[
        '541 배당 실시간 확인',
        '동사가치 · 아지트 배당 내역',
        '조직도 조회',
      ]}
    >
      <DashboardContent />
    </L3Guard>
  )
}
