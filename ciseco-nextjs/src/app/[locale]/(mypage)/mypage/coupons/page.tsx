'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import { useCoupons } from '@/lib/mypage/useCoupons'
import type { CouponStatus, CouponItem } from '@/lib/mypage/types'

type TabKey = CouponStatus

// 만료 7일 이내 여부
function isExpiringSoon(validUntil: string) {
  const diff = new Date(validUntil).getTime() - Date.now()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

function CouponCard({ coupon }: { coupon: CouponItem }) {
  const soon = coupon.status === 'AVAILABLE' && isExpiringSoon(coupon.valid_until)
  const expired = coupon.status === 'EXPIRED'
  const used = coupon.status === 'USED'
  const dim = expired || used

  return (
    <div style={{
      background: dim ? '#F8F7FA' : '#fff',
      borderRadius: 'var(--mp-radius-lg)',
      border: `2px solid ${soon ? 'var(--mp-color-warning)' : 'var(--mp-color-border)'}`,
      padding: 18, marginBottom: 12,
      opacity: dim ? 0.7 : 1,
    }}>
      {/* 할인 금액 */}
      <div style={{
        fontSize: 28, fontWeight: 800,
        color: dim ? 'var(--mp-color-text-muted)' : 'var(--mp-color-primary)',
        marginBottom: 6,
      }}>
        {coupon.discount_amount != null
          ? `${coupon.discount_amount.toLocaleString('ko-KR')}원 할인`
          : coupon.discount_rate != null
          ? `${coupon.discount_rate}% 할인`
          : '할인 쿠폰'}
      </div>

      {/* 쿠폰명 */}
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{coupon.name}</div>

      {/* 조건 */}
      <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>
        {coupon.target_label}
        {coupon.min_order_amount != null && ` · 최소 주문 ${coupon.min_order_amount.toLocaleString('ko-KR')}원`}
      </div>

      {/* 유효기간 */}
      <div style={{
        fontSize: 14,
        color: soon ? 'var(--mp-color-warning)' : 'var(--mp-color-text-muted)',
        fontWeight: soon ? 700 : 400,
      }}>
        {soon && '⚠️ 만료 임박 · '}
        {used ? '사용 완료' : expired ? '만료됨' : ''}
        {!used && `⏳ ${new Date(coupon.valid_until).toLocaleDateString('ko-KR')} 까지`}
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const [tab, setTab] = useState<TabKey>('AVAILABLE')
  const { data, loading } = useCoupons(tab)
  const counts = data?.status_counts ?? { AVAILABLE: 0, USED: 0, EXPIRED: 0 }

  return (
    <>
      <BackHeader title='쿠폰함' />

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'AVAILABLE', label: '사용 가능', badge: counts.AVAILABLE },
          { value: 'USED',      label: '사용 완료' },
          { value: 'EXPIRED',   label: '만료' },
        ]}
      />

      <div style={{ padding: 16 }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--mp-color-text-muted)', padding: 32 }}>
            불러오는 중…
          </div>
        )}

        {!loading && data?.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>
              {tab === 'AVAILABLE' ? '사용 가능한 쿠폰이 없어요.' : '내역이 없어요.'}
            </div>
          </div>
        )}

        {!loading && data?.items.map(coupon => (
          <CouponCard key={coupon.coupon_id} coupon={coupon} />
        ))}
      </div>
    </>
  )
}
