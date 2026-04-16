'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import OrderCard from '@/components/mypage/OrderCard'
import { useOrders } from '@/lib/mypage/useOrders'
import type { OrderStatus } from '@/lib/mypage/types'

type TabKey = 'ALL' | 'SHIPPING' | 'DELIVERED' | 'CANCELED'

const TAB_TO_STATUS: Record<TabKey, OrderStatus | 'ALL'> = {
  ALL: 'ALL',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELED: 'CANCELED',
}

export default function OrdersPage() {
  const locale = useLocale()
  const [tab, setTab] = useState<TabKey>('ALL')
  const { data, loading } = useOrders({ status: TAB_TO_STATUS[tab] })
  const counts = data?.status_counts

  return (
    <>
      <BackHeader title='주문내역' />

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

      <div style={{ padding: '16px 16px 16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--mp-color-text-muted)', padding: '32px 0' }}>
            불러오는 중…
          </div>
        )}

        {!loading && data?.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>
              주문 내역이 없어요.
            </div>
          </div>
        )}

        {!loading && data?.items.map(order => (
          <div key={order.order_id} style={{ marginBottom: 12 }}>
            <OrderCard
              order={order}
              detailHref={`/${locale}/mypage/orders/${order.order_id}`}
            />
          </div>
        ))}
      </div>
    </>
  )
}
