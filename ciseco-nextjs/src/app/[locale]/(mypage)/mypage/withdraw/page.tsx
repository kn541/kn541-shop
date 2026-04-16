'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import L3Guard from '@/components/mypage/L3Guard'
import { MOCK_WITHDRAWALS, MOCK_DIVIDEND_SUMMARY } from '@/lib/mypage/mocks'
import type { WithdrawalStatus } from '@/lib/mypage/types'

type TabKey = 'ALL' | WithdrawalStatus

const STATUS_STYLE: Record<WithdrawalStatus, { bg: string; color: string; label: string }> = {
  REQUESTED: { bg: '#FFF3E0', color: '#E65100', label: '처리 중' },
  APPROVED:  { bg: '#EFF6FF', color: '#1D4ED8', label: '승인됨' },
  PAID:      { bg: '#E9F7EF', color: '#1E8449', label: '지급 완료' },
  REJECTED:  { bg: '#FDEDEC', color: '#C0392B', label: '반려' },
}

function WithdrawContent() {
  const locale = useLocale()
  const [tab, setTab] = useState<TabKey>('ALL')
  const { items, status_counts } = MOCK_WITHDRAWALS
  const balance = MOCK_DIVIDEND_SUMMARY.withdrawable_balance

  const hasRequested = items.some(i => i.status === 'REQUESTED')

  const filtered = tab === 'ALL' ? items : items.filter(i => i.status === tab)

  return (
    <>
      <BackHeader title='출금 신청' />

      {/* 출금 가능 잔액 + 신청 버튼 */}
      <div style={{
        background: '#fff', padding: '24px 16px',
        borderBottom: '1px solid var(--mp-color-border)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, color: 'var(--mp-color-text-muted)', marginBottom: 6 }}>
          💰 출금 가능 잔액
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: '#7C3AED', marginBottom: 20 }}>
          {balance.toLocaleString('ko-KR')}원
        </div>

        {hasRequested ? (
          <div style={{
            background: '#FFF9E6', border: '1px solid #FDE68A',
            borderRadius: 'var(--mp-radius)', padding: '12px 16px',
            fontSize: 15, color: '#92400E',
          }}>
            ⏳ 처리 중인 신청이 있습니다. 완료 후 새로 신청할 수 있어요.
          </div>
        ) : (
          <Link href={`/${locale}/mypage/withdraw/new`}>
            <BigButton fullWidth>새 출금 신청하기</BigButton>
          </Link>
        )}
      </div>

      {/* 내역 탭 */}
      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL',       label: '전체',      badge: items.length },
          { value: 'REQUESTED', label: '신청중',    badge: status_counts.REQUESTED },
          { value: 'PAID',      label: '완료' },
          { value: 'REJECTED',  label: '반려' },
        ]}
      />

      <div style={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>출금 내역이 없어요.</div>
          </div>
        ) : (
          filtered.map(item => {
            const st = STATUS_STYLE[item.status]
            return (
              <div key={item.withdrawal_id} style={{
                background: '#fff', borderRadius: 'var(--mp-radius-lg)',
                border: '1px solid var(--mp-color-border)',
                padding: 16, marginBottom: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                      {item.requested_amount.toLocaleString('ko-KR')}원
                    </div>
                    {/* 계좌: 내역에서 마스킹 */}
                    <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)' }}>
                      {item.bank_name} {item.bank_account_masked}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>
                      신청 {new Date(item.requested_at).toLocaleDateString('ko-KR')}
                      {item.paid_at && ` · 지급 ${new Date(item.paid_at).toLocaleDateString('ko-KR')}`}
                    </div>
                    {item.rejected_reason && (
                      <div style={{ fontSize: 14, color: 'var(--mp-color-danger)', marginTop: 6 }}>
                        반려 사유: {item.rejected_reason}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    background: st.bg, color: st.color,
                    borderRadius: 20, padding: '4px 12px', flexShrink: 0,
                  }}>{st.label}</span>
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
    <L3Guard title='출금 신청' lockBenefits={['수당 출금 신청', '출금 내역 조회', '계좌 관리']}>
      <WithdrawContent />
    </L3Guard>
  )
}
