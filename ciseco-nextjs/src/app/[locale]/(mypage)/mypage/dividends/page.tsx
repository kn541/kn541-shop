'use client'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import BackHeader from '@/components/mypage/BackHeader'
import BigButton from '@/components/mypage/BigButton'
import SectionHeader from '@/components/mypage/SectionHeader'
import L3Guard from '@/components/mypage/L3Guard'
import DividendCard from '@/components/mypage/DividendCard'
import { DIVIDEND_COLORS } from '@/lib/mypage/dividendColors'
import { MOCK_DIVIDEND_SUMMARY } from '@/lib/mypage/mocks'
import type { DividendType } from '@/lib/mypage/types'

const TYPES: DividendType[] = ['MLM', 'EQUITY', 'AGIT']

function TypeCard({ type, amount }: { type: DividendType; amount: number }) {
  const c = DIVIDEND_COLORS[type]
  return (
    <div style={{
      flex: 1, background: c.bg, borderRadius: 'var(--mp-radius-lg)',
      padding: '14px 10px', textAlign: 'center',
      border: `1px solid ${c.color}33`,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{amount.toLocaleString('ko-KR')}</div>
      <div style={{ fontSize: 12, color: c.color }}>원</div>
    </div>
  )
}

function DashboardContent() {
  const locale = useLocale()
  const s = MOCK_DIVIDEND_SUMMARY
  const totalAll = Object.values(s.total_by_type).reduce((a, b) => a + b, 0)

  return (
    <>
      <BackHeader title='수당 현황' />

      {/* 출금 가능 잔액 — text-4xl + 보라 */}
      <div style={{
        background: '#fff', padding: '32px 24px 24px',
        borderBottom: '1px solid var(--mp-color-border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>
          💰 출금 가능 잔액
        </div>
        <div style={{
          fontSize: 48, fontWeight: 900,
          color: '#7C3AED',           // 보라 (MLM 색상)
          lineHeight: 1.1, marginBottom: 4,
        }}>
          {s.withdrawable_balance.toLocaleString('ko-KR')}
        </div>
        <div style={{ fontSize: 20, color: '#7C3AED', fontWeight: 600, marginBottom: 24 }}>원</div>

        <Link href={`/${locale}/mypage/withdraw/new`}>
          <BigButton fullWidth>출금 신청하기</BigButton>
        </Link>
      </div>

      {/* 이번 달 배당 — 3유형 색상 카드 */}
      <SectionHeader title='이번 달 배당' />
      <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
        {TYPES.map(t => (
          <TypeCard key={t} type={t} amount={s.this_month_by_type[t]} />
        ))}
      </div>

      {/* 누적 배당 */}
      <SectionHeader title='누적 배당' />
      <div style={{
        margin: '0 16px',
        background: '#fff', borderRadius: 'var(--mp-radius-lg)',
        border: '1px solid var(--mp-color-border)', padding: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>총 누적</span>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{totalAll.toLocaleString('ko-KR')}원</span>
        </div>
        {TYPES.map(t => {
          const c = DIVIDEND_COLORS[t]
          return (
            <div key={t} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderTop: '1px solid var(--mp-color-border)',
            }}>
              <span style={{ fontSize: 14, color: c.color, fontWeight: 600 }}>
                {c.icon} {c.label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                {s.total_by_type[t].toLocaleString('ko-KR')}원
              </span>
            </div>
          )
        })}
      </div>

      {/* 최근 배당 5건 */}
      <div style={{ margin: '0 16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0 8px',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>최근 배당</span>
          <Link href={`/${locale}/mypage/dividends/history`} style={{
            fontSize: 14, color: 'var(--mp-color-primary)', fontWeight: 600,
          }}>전체 ▶</Link>
        </div>
        {s.recent_items.map(item => (
          <DividendCard key={item.dividend_id} item={item} />
        ))}
      </div>

      {/* 조직도 보기 */}
      <div style={{ padding: '8px 16px 32px' }}>
        <Link href={`/${locale}/mypage/tree`}>
          <BigButton fullWidth variant='secondary'>조직도 보기 ▶</BigButton>
        </Link>
      </div>
    </>
  )
}

export default function DividendsPage() {
  return (
    <L3Guard
      title='수당 현황'
      lockBenefits={['541 배당 실시간 확인', '동사가치 · 아지트 배당 내역', '출금 신청 및 조직도 조회']}
    >
      <DashboardContent />
    </L3Guard>
  )
}
