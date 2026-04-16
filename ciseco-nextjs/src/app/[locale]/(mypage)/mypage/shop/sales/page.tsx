'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import { MOCK_SHOP_SALES } from '@/lib/mypage/mocks'
import type { ShopSalesPeriod } from '@/lib/mypage/types'

type TabKey = ShopSalesPeriod

const TAB_LABELS: Record<TabKey, string> = {
  TODAY: '오늘',
  WEEK:  '이번주',
  MONTH: '이번달',
  ALL:   '전체',
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: '16px 14px', flex: 1,
    }}>
      <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function ShopSalesPage() {
  const [tab, setTab] = useState<TabKey>('MONTH')
  const stats = MOCK_SHOP_SALES[tab]

  // 간단 CSS 바 차트 (recharts 미설치 → 자체 구현)
  const maxRevenue = Math.max(...stats.daily_series.map(d => d.revenue), 1)

  return (
    <>
      <BackHeader title='판매 실적' />

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={Object.entries(TAB_LABELS).map(([value, label]) => ({ value, label }))}
      />

      <div style={{ padding: 16 }}>
        {/* 통계 카드 3개 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label='주문 건수' value={`${stats.order_count}건`} />
          <StatCard
            label='총 매출'
            value={`${stats.total_revenue.toLocaleString('ko-KR')}원`}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <StatCard
            label='평균 주문금액'
            value={stats.order_count > 0 ? `${stats.avg_order_value.toLocaleString('ko-KR')}원` : '-'}
          />
        </div>

        {/* 일별 매출 추이 (데이터 있을 때만) */}
        {stats.daily_series.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 'var(--mp-radius-lg)',
            border: '1px solid var(--mp-color-border)',
            padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>일별 매출 추이</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {stats.daily_series.map(d => (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    background: 'var(--mp-color-primary)',
                    height: `${Math.max(4, Math.round((d.revenue / maxRevenue) * 64))}px`,
                  }} />
                  <div style={{ fontSize: 11, color: 'var(--mp-color-text-muted)' }}>{d.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 최근 주문 (개인정보 노출 없음 — 주문번호+상품명+금액만) */}
        <div style={{
          background: '#fff', borderRadius: 'var(--mp-radius-lg)',
          border: '1px solid var(--mp-color-border)',
          padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>최근 주문</div>

          {stats.recent_orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mp-color-text-muted)', fontSize: 15 }}>
              아직 주문이 없어요.
            </div>
          ) : (
            stats.recent_orders.map(o => (
              <div key={o.order_no} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--mp-color-border)',
              }}>
                <div>
                  {/* 구매자 개인정보 절대 노출 금지 — 주문번호/상품명/금액만 */}
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {o.main_item_name}{o.item_count > 1 ? ` 외 ${o.item_count - 1}건` : ''}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 2 }}>
                    {new Date(o.ordered_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {o.amount.toLocaleString('ko-KR')}원
                </div>
              </div>
            ))
          )}
        </div>

        {/* 인기 상품 TOP 5 */}
        {stats.top_products.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 'var(--mp-radius-lg)',
            border: '1px solid var(--mp-color-border)',
            padding: 16,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>인기 상품 TOP {stats.top_products.length}</div>
            {stats.top_products.map((p, i) => (
              <div key={p.product_id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < stats.top_products.length - 1 ? '1px solid var(--mp-color-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--mp-color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{p.product_name}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mp-color-primary)' }}>
                  {p.sold_count}건
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {stats.order_count === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mp-color-text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 18 }}>아직 판매 실적이 없어요.</div>
            <div style={{ fontSize: 15, marginTop: 8 }}>상품을 공유해서 첫 주문을 받아보세요!</div>
          </div>
        )}
      </div>
    </>
  )
}
