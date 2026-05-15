'use client'

import { useState } from 'react'
import { Link } from '@/components/Link'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import L3Guard from '@/components/mypage/L3Guard'
import { formatDateDot } from '@/lib/mypage/formatDateDot'
import type { WithdrawalStatus } from '@/lib/mypage/types'
import { useWithdrawableBalance } from '@/lib/mypage/useWithdrawableBalance'
import { useWithdrawals, type WithdrawTabKey } from '@/lib/mypage/useWithdrawals'

const STATUS_STYLE: Record<WithdrawalStatus, { bg: string; color: string; label: string }> = {
  REQUESTED: { bg: '#FFF3E0', color: '#E65100', label: '처리 중' },
  APPROVED: { bg: '#EFF6FF', color: '#1D4ED8', label: '승인됨' },
  PAID: { bg: '#E9F7EF', color: '#1E8449', label: '지급 완료' },
  REJECTED: { bg: '#FDEDEC', color: '#C0392B', label: '반려' },
}

function pillForStatus(code: string) {
  if (code in STATUS_STYLE) return STATUS_STYLE[code as WithdrawalStatus]
  return { bg: '#F3F4F6', color: '#374151', label: code }
}

function WithdrawContent() {
  const [tab, setTab] = useState<WithdrawTabKey>('ALL')
  const { balance, loading: balLoading, error: balError } = useWithdrawableBalance()
  const { data, loading: listLoading, error: listError } = useWithdrawals(tab)

  const items = data?.items ?? []
  const counts = data?.status_counts
  const hasRequested = (counts?.REQUESTED ?? 0) > 0

  const balanceText =
    balLoading && balance == null ? '…' : (balance ?? 0).toLocaleString('ko-KR')

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">출금 신청</h1>

      {balError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {balError}
        </div>
      )}
      {listError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {listError}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white py-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-1.5 text-sm text-neutral-500 dark:text-neutral-400">💰 출금 가능 잔액</div>
        <div className="mb-5 text-4xl font-black text-violet-600">
          {balanceText}원
        </div>

        {hasRequested ? (
          <div className="mx-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[15px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            ⏳ 처리 중인 신청이 있습니다. 완료 후 새로 신청할 수 있어요.
          </div>
        ) : (
          <div className="px-4">
            <Link href="/withdraw/new" className="block w-full">
              <BigButton fullWidth disabled={balLoading && balance == null}>
                새 출금 신청하기
              </BigButton>
            </Link>
          </div>
        )}
      </div>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as WithdrawTabKey)}
        tabs={[
          { value: 'ALL', label: '전체', badge: counts?.ALL ?? 0 },
          { value: 'REQUESTED', label: '신청중', badge: counts?.REQUESTED ?? 0 },
          { value: 'PAID', label: '완료', badge: counts?.PAID ?? 0 },
          { value: 'REJECTED', label: '반려', badge: counts?.REJECTED ?? 0 },
        ]}
      />

      <div>
        {listLoading ? (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">💸</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">출금 내역이 없어요.</div>
          </div>
        ) : (
          items.map(item => {
            const st = pillForStatus(item.status)
            const bankLine = [item.bank_name, item.bank_account_masked].filter(Boolean).join(' ')
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
                    {bankLine ? (
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{bankLine}</div>
                    ) : null}
                    <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      신청 {formatDateDot(item.requested_at)}
                      {item.paid_at ? ` · 지급 ${formatDateDot(item.paid_at)}` : ''}
                    </div>
                    {item.rejected_reason ? (
                      <div className="mt-1.5 text-sm text-red-600">반려 사유: {item.rejected_reason}</div>
                    ) : null}
                  </div>
                  <span
                    className="h-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {item.status_label || st.label}
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
