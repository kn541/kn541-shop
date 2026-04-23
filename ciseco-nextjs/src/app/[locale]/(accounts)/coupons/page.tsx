'use client'

import { useState } from 'react'
import BigTabs from '@/components/mypage/BigTabs'
import { useCoupons } from '@/lib/mypage/useCoupons'
import type { CouponStatus, CouponItem } from '@/lib/mypage/types'
import { useTranslations } from 'next-intl'

type TabKey = CouponStatus

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
    <div
      className={`mb-3 rounded-2xl border-2 p-4 ${
        soon ? 'border-amber-400' : 'border-neutral-200 dark:border-neutral-600'
      } ${dim ? 'bg-neutral-100 opacity-70 dark:bg-neutral-800/80' : 'bg-white dark:bg-neutral-900'}`}
    >
      <div
        className={`mb-2 text-2xl font-extrabold ${
          dim ? 'text-neutral-400' : 'text-primary-600 dark:text-primary-400'
        }`}
      >
        {coupon.discount_amount != null
          ? `${coupon.discount_amount.toLocaleString('ko-KR')}원 할인`
          : coupon.discount_rate != null
            ? `${coupon.discount_rate}% 할인`
            : '할인 쿠폰'}
      </div>
      <div className="mb-2 text-lg font-semibold">{coupon.name}</div>
      <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
        {coupon.target_label}
        {coupon.min_order_amount != null &&
          ` · 최소 주문 ${coupon.min_order_amount.toLocaleString('ko-KR')}원`}
      </div>
      <div
        className={`text-sm ${soon ? 'font-bold text-amber-600' : 'text-neutral-500 dark:text-neutral-400'}`}
      >
        {soon && '⚠️ 만료 임박 · '}
        {used ? '사용 완료' : expired ? '만료됨' : ''}
        {!used && `⏳ ${new Date(coupon.valid_until).toLocaleDateString('ko-KR')} 까지`}
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const t = useTranslations('Account')
  const [tab, setTab] = useState<TabKey>('AVAILABLE')
  const { data, loading } = useCoupons(tab)
  const counts = data?.status_counts ?? { AVAILABLE: 0, USED: 0, EXPIRED: 0 }

  return (
    <div className="flex flex-col gap-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('coupons')}</h1>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'AVAILABLE', label: '사용 가능', badge: counts.AVAILABLE },
          { value: 'USED', label: '사용 완료' },
          { value: 'EXPIRED', label: '만료' },
        ]}
      />

      <div>
        {loading && (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</div>
        )}

        {!loading && data?.items.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">🎁</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">
              {tab === 'AVAILABLE' ? '사용 가능한 쿠폰이 없어요.' : '내역이 없어요.'}
            </div>
          </div>
        )}

        {!loading && data?.items.map(coupon => <CouponCard key={coupon.coupon_id} coupon={coupon} />)}
      </div>
    </div>
  )
}
