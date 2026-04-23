'use client'

import { useState } from 'react'
import BigTabs from '@/components/mypage/BigTabs'
import OrderCard from '@/components/mypage/OrderCard'
import { useOrders } from '@/lib/mypage/useOrders'
import type { OrderStatus } from '@/lib/mypage/types'
import { useLocale, useTranslations } from 'next-intl'

type TabKey = 'ALL' | 'SHIPPING' | 'DELIVERED' | 'CANCELED'

const TAB_TO_STATUS: Record<TabKey, OrderStatus | 'ALL'> = {
  ALL: 'ALL',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELED: 'CANCELED',
}

export default function OrdersPage() {
  const locale = useLocale()
  const t = useTranslations('Account')
  const [tab, setTab] = useState<TabKey>('ALL')
  const { data, loading } = useOrders({ status: TAB_TO_STATUS[tab] })
  const counts = data?.status_counts

  return (
    <div className="flex flex-col gap-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('ordersHistory')}</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          최근 주문 상태를 확인하고 배송을 조회하세요.
        </p>
      </div>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL',       label: '전체',       badge: counts?.ALL ?? 0 },
          { value: 'SHIPPING',  label: '배송중',     badge: counts?.SHIPPING ?? 0 },
          { value: 'DELIVERED', label: '배송완료' },
          { value: 'CANCELED',  label: '취소·반품' },
        ]}
      />

      <div className="pb-4">
        {loading && (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
            불러오는 중…
          </div>
        )}

        {!loading && data?.items.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">📦</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">
              주문 내역이 없어요.
            </div>
          </div>
        )}

        {!loading && data?.items.map(order => (
          <div key={order.order_id} className="mb-3">
            <OrderCard
              order={order}
              detailHref={`/${locale}/orders/${order.order_id}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
