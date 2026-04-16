// 사용자 인사 + 등급 chip + 적립금/쿠폰 요약 바
import type { MypageHomeResponse } from '@/lib/mypage/types'

const LEVEL_MAP = {
  L1: { label: '일반회원', bg: '#E9E9E9',       color: '#1E1E2F' },
  L2: { label: '마이샵회원', bg: '#28C76F1A', color: '#28C76F' },
  L3: { label: '유료회원', bg: '#7367F01A', color: '#7367F0' },
} as const

interface Props {
  data: MypageHomeResponse
}

export default function UserGreeting({ data }: Props) {
  const { user, summary } = data
  const level = LEVEL_MAP[user.member_level]

  return (
    <div style={{ padding: '20px 16px 16px', background: '#fff', borderBottom: '1px solid var(--mp-color-border)' }}>
      {/* 이름 + 등급 chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{user.name} 님</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          background: level.bg, color: level.color,
          borderRadius: 20, padding: '4px 12px',
        }}>
          {level.label}
        </span>
      </div>

      {/* 적립금 | 쿠폰 요약 바 */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'var(--mp-color-bg)',
        borderRadius: 'var(--mp-radius)',
        overflow: 'hidden',
        border: '1px solid var(--mp-color-border)',
      }}>
        <div style={{
          flex: 1, padding: '12px 16px', textAlign: 'center',
          borderRight: '1px solid var(--mp-color-border)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 4 }}>적립금</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {summary.points.toLocaleString('ko-KR')}원
          </div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 4 }}>쿠폰</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {summary.coupons}장
          </div>
        </div>
        {summary.orders_pending > 0 && (
          <div style={{
            flex: 1, padding: '12px 16px', textAlign: 'center',
            borderLeft: '1px solid var(--mp-color-border)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 4 }}>처리중</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--mp-color-warning)' }}>
              {summary.orders_pending}건
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
