'use client'

import { Link } from '@/components/Link'
import BigButton from '@/components/mypage/BigButton'
import SectionHeader from '@/components/mypage/SectionHeader'
import L3Guard from '@/components/mypage/L3Guard'
import DividendCard from '@/components/mypage/DividendCard'
import { DIVIDEND_COLORS } from '@/lib/mypage/dividendColors'
import { MOCK_DIVIDEND_SUMMARY } from '@/lib/mypage/mocks'
import type { DividendType } from '@/lib/mypage/types'
import { useTranslations } from 'next-intl'

const TYPES: DividendType[] = ['MLM', 'EQUITY', 'AGIT']

function TypeCard({ type, amount }: { type: DividendType; amount: number }) {
  const c = DIVIDEND_COLORS[type]
  return (
    <div
      className="flex-1 rounded-2xl border p-3 text-center"
      style={{ background: c.bg, borderColor: `${c.color}33` }}
    >
      <div className="mb-1 text-xl">{c.icon}</div>
      <div className="mb-2 text-xs font-bold" style={{ color: c.color }}>
        {c.label}
      </div>
      <div className="text-base font-extrabold">{amount.toLocaleString('ko-KR')}</div>
      <div className="text-xs" style={{ color: c.color }}>
        원
      </div>
    </div>
  )
}

function DashboardContent() {
  const t = useTranslations('Account')
  const s = MOCK_DIVIDEND_SUMMARY
  const totalAll = Object.values(s.total_by_type).reduce((a, b) => a + b, 0)

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('dividends')}</h1>

      <div className="rounded-2xl border border-neutral-200 bg-white py-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">💰 출금 가능 잔액</div>
        <div className="mb-1 text-4xl font-black text-violet-600 sm:text-5xl">
          {s.withdrawable_balance.toLocaleString('ko-KR')}
        </div>
        <div className="mb-6 text-xl font-semibold text-violet-600">원</div>
        <div className="px-4">
          <Link href="/withdraw/new" className="block w-full">
            <BigButton fullWidth>출금 신청하기</BigButton>
          </Link>
        </div>
      </div>

      <SectionHeader title="이번 달 배당" />
      <div className="flex gap-2.5 px-1">
        {TYPES.map(ty => (
          <TypeCard key={ty} type={ty} amount={s.this_month_by_type[ty]} />
        ))}
      </div>

      <SectionHeader title="누적 배당" />
      <div className="mx-1 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-3 flex justify-between">
          <span className="text-[15px] font-semibold">총 누적</span>
          <span className="text-lg font-extrabold">{totalAll.toLocaleString('ko-KR')}원</span>
        </div>
        {TYPES.map(ty => {
          const c = DIVIDEND_COLORS[ty]
          return (
            <div
              key={ty}
              className="flex items-center justify-between border-t border-neutral-200 py-2 dark:border-neutral-700"
            >
              <span className="text-sm font-semibold" style={{ color: c.color }}>
                {c.icon} {c.label}
              </span>
              <span className="text-[15px] font-bold">{s.total_by_type[ty].toLocaleString('ko-KR')}원</span>
            </div>
          )
        })}
      </div>

      <div className="mx-1">
        <div className="flex items-center justify-between py-4">
          <span className="text-base font-bold">최근 배당</span>
          <Link href="/dividends/history" className="text-sm font-semibold text-primary-600">
            전체 ▶
          </Link>
        </div>
        {s.recent_items.map(item => (
          <DividendCard key={item.dividend_id} item={item} />
        ))}
      </div>

      <div className="px-1 pb-8">
        <Link href="/tree" className="block w-full">
          <BigButton fullWidth variant="secondary">
            조직도 보기 ▶
          </BigButton>
        </Link>
      </div>
    </>
  )
}

export default function DividendsPage() {
  return (
    <L3Guard
      embedded
      title="수당 현황"
      lockBenefits={['541 배당 실시간 확인', '동사가치 · 아지트 배당 내역', '출금 신청 및 조직도 조회']}
    >
      <DashboardContent />
    </L3Guard>
  )
}
