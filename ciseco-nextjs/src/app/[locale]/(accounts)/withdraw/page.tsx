'use client'

import { useState } from 'react'
import { Link } from '@/components/Link'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import L3Guard from '@/components/mypage/L3Guard'
import { MOCK_WITHDRAWALS, MOCK_DIVIDEND_SUMMARY } from '@/lib/mypage/mocks'
import type { WithdrawalStatus } from '@/lib/mypage/types'

type TabKey = 'ALL' | WithdrawalStatus

const STATUS_STYLE: Record<WithdrawalStatus, { bg: string; color: string; label: string }> = {
  REQUESTED: { bg: '#FFF3E0', color: '#E65100', label: '처리 중' },
  APPROVED: { bg: '#EFF6FF', color: '#1D4ED8', label: '승인됨' },
  PAID: { bg: '#E9F7EF', color: '#1E8449', label: '지급 완료' },
  REJECTED: { bg: '#FDEDEC', color: '#C0392B', label: '반려' },
}

function WithdrawContent() {
  const [tab, setTab] = useState<TabKey>('ALL')
  const { items, status_counts } = MOCK_WITHDRAWALS
  const balance = MOCK_DIVIDEND_SUMMARY.withdrawable_balance

  const hasRequested = items.some(i => i.status === 'REQUESTED')

  const filtered = tab === 'ALL' ? items : items.filter(i => i.status === tab)

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">출금 신청</h1>

      <div className="rounded-2xl border border-neutral-200 bg-white py-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-1.5 text-sm text-neutral-500 dark:text-neutral-400">💰 출금 가능 잔액</div>
        <div className="mb-5 text-4xl font-black text-violet-600">{balance.toLocaleString('ko-KR')}원</div>

        {hasRequested ? (
          <div className="mx-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[15px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            ⏳ 처리 중인 신청이 있습니다. 완료 후 새로 신청할 수 있어요.
          </div>
        ) : (
          <div className="px-4">
            <Link href="/withdraw/new" className="block w-full">
              <BigButton fullWidth>새 출금 신청하기</BigButton>
            </Link>
          </div>
        )}
      </div>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL', label: '전체', badge: items.length },
          { value: 'REQUESTED', label: '신청중', badge: status_counts.REQUESTED },
          { value: 'PAID', label: '완료' },
          { value: 'REJECTED', label: '반려' },
        ]}
      />

      <div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💸</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">출금 내역이 없어요.</div>
          </div>
        ) : (
          filtered.map(item => {
            const st = STATUS_STYLE[item.status]
            return (
              <div
                key={item.withdrawal_id}
                className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="mb-1.5 text-xl font-extrabold">
                      {item.requested_amount.toLocaleString('ko-KR')}원
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.bank_name} {item.bank_account_masked}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      신청 {new Date(item.requested_at).toLocaleDateString('ko-KR')}
                      {item.paid_at && ` · 지급 ${new Date(item.paid_at).toLocaleDateString('ko-KR')}`}
                    </div>
                    {item.rejected_reason && (
                      <div className="mt-1.5 text-sm text-red-600">반려 사유: {item.rejected_reason}</div>
                    )}
                  </div>
                  <span
                    className="h-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default function WithdrawPage() {
  return (
    <L3Guard
      embedded
      title="출금 신청"
      lockBenefits={['수당 출금 신청', '출금 내역 조회', '계좌 관리']}
    >
      <WithdrawContent />
    </L3Guard>
  )
}
