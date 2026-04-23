'use client'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import { useMyShop } from '@/lib/mypage/useMyShop'

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

/** GET /myshop/dashboard — 백엔드가 제공하는 집계만 표시 */
export default function ShopSalesPage() {
  const { dashboard, loading, error } = useMyShop(true)

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  if (loading || !dashboard) {
    return (
      <>
        <BackHeader title='판매 실적' />
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
      </>
    )
  }

  const monthSales = parseFloat(dashboard.month_sales) || 0
  const pending = parseFloat(dashboard.pending_commission) || 0
  const avg =
    dashboard.month_orders > 0
      ? Math.round(monthSales / dashboard.month_orders)
      : 0

  return (
    <>
      <BackHeader title='판매 실적' />

      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          아래 수치는 서버의 <strong>이번 달·오늘</strong> 집계 기준입니다. (GET /myshop/dashboard)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <StatCard label='오늘 방문' value={`${dashboard.today_visits.toLocaleString('ko-KR')}명`} />
          <StatCard label='이번 달 주문' value={`${dashboard.month_orders}건`} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <StatCard
            label='이번 달 매출'
            value={`${monthSales.toLocaleString('ko-KR')}원`}
          />
          <StatCard
            label='평균 주문금액'
            value={dashboard.month_orders > 0 ? `${avg.toLocaleString('ko-KR')}원` : '-'}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <StatCard
            label='미지급 수당 (대기)'
            value={`${pending.toLocaleString('ko-KR')}원`}
            sub='commission_pool PENDING 합계'
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label='담은 상품 수' value={`${dashboard.product_count}개`} />
          <StatCard label='진열 중 상품' value={`${dashboard.active_product_count}개`} />
        </div>

        <div style={{
          background: '#fff', borderRadius: 'var(--mp-radius-lg)',
          border: '1px solid var(--mp-color-border)',
          padding: 16,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>공유 링크</div>
          {Object.entries(dashboard.share_links ?? {}).map(([k, url]) => (
            <div key={k} style={{ fontSize: 13, marginBottom: 8, wordBreak: 'break-all' }}>
              <span style={{ color: 'var(--mp-color-text-muted)' }}>{k}: </span>
              <a href={url} target='_blank' rel='noreferrer' style={{ color: 'var(--mp-color-primary)' }}>{url}</a>
            </div>
          ))}
        </div>

        {dashboard.month_orders === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mp-color-text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 18 }}>이번 달 주문이 아직 없어요.</div>
            <div style={{ fontSize: 15, marginTop: 8 }}>상품을 공유해서 첫 주문을 받아보세요!</div>
          </div>
        )}
      </div>
    </>
  )
}
