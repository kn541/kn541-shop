'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import { usePoints } from '@/lib/mypage/usePoints'
import type { PointChangeType } from '@/lib/mypage/types'

type TabKey = 'ALL' | 'EARN' | 'USE'

const CHANGE_COLOR: Record<string, { color: string; prefix: string }> = {
  EARN:   { color: 'var(--mp-color-success)', prefix: '+' },
  USE:    { color: 'var(--mp-color-danger)',  prefix: '' },
  EXPIRE: { color: '#A6A4B0',                prefix: '' },
  CANCEL: { color: 'var(--mp-color-success)', prefix: '+' },
}

const TAB_TO_FILTER: Record<TabKey, PointChangeType | 'ALL'> = {
  ALL: 'ALL', EARN: 'EARN', USE: 'USE',
}

export default function PointsPage() {
  const [tab, setTab] = useState<TabKey>('ALL')
  const { data, loading } = usePoints(TAB_TO_FILTER[tab])

  return (
    <>
      <BackHeader title='적립금' />

      {/* 잔액 크게 */}
      <div style={{
        background: '#fff', padding: '32px 24px',
        borderBottom: '1px solid var(--mp-color-border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>
          사용 가능 적립금
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--mp-color-primary)', lineHeight: 1.1 }}>
          💰 {(data?.current_balance ?? 0).toLocaleString('ko-KR')}
          <span style={{ fontSize: 24, fontWeight: 600 }}> 원</span>
        </div>
        {data && data.this_month_earned > 0 && (
          <div style={{ fontSize: 15, color: 'var(--mp-color-success)', marginTop: 12 }}>
            ↑ 이번달 적립 {data.this_month_earned.toLocaleString('ko-KR')}원
          </div>
        )}
      </div>

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL',  label: '전체' },
          { value: 'EARN', label: '적립' },
          { value: 'USE',  label: '사용' },
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>내역이 없어요.</div>
          </div>
        )}

        {!loading && data?.items.map(item => {
          const style = CHANGE_COLOR[item.change_type] ?? CHANGE_COLOR.USE
          const d = new Date(item.occurred_at)
          return (
            <div key={item.ledger_id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 0', borderBottom: '1px solid var(--mp-color-border)',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.reason}</div>
                <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
                  {d.toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: style.color }}>
                  {style.prefix}{item.amount.toLocaleString('ko-KR')}원
                </div>
                <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
                  잔액 {item.balance_after.toLocaleString('ko-KR')}원
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
