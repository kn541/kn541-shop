'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import { useInquiries } from '@/lib/mypage/useInquiries'
import type { InquiryStatus, InquiryItem } from '@/lib/mypage/types'

type TabKey = 'ALL' | 'WAITING' | 'ANSWERED'

const STATUS_STYLE: Record<InquiryStatus, { bg: string; color: string }> = {
  WAITING:  { bg: '#FFF3E0', color: '#E65100' },
  ANSWERED: { bg: '#E9F7EF', color: '#1E8449' },
}

function InquiryRow({ item, locale }: { item: InquiryItem; locale: string }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_STYLE[item.status]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          cursor: 'pointer', padding: 16, textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, flexShrink: 0,
            background: st.bg, color: st.color,
            borderRadius: 20, padding: '3px 8px', marginTop: 2,
          }}>
            {item.status_label}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{item.subject}</div>
            <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>
              {new Date(item.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
          <span style={{ fontSize: 20, color: 'var(--mp-color-text-muted)', flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--mp-color-border)', padding: 16 }}>
          <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{item.content}</div>
          {item.answer && (
            <div style={{
              background: '#F8F7FA', borderRadius: 8, padding: 14,
              borderLeft: '4px solid var(--mp-color-primary)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mp-color-primary)', marginBottom: 8 }}>
                ✔️ 답변 — {item.answered_at && new Date(item.answered_at).toLocaleDateString('ko-KR')}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7 }}>{item.answer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function InquiriesPage() {
  const locale = useLocale()
  const [tab, setTab] = useState<TabKey>('ALL')
  const { data, loading } = useInquiries(tab === 'ALL' ? 'ALL' : tab as InquiryStatus)

  return (
    <>
      <BackHeader
        title='1:1 문의'
        rightAction={
          <Link href={`/${locale}/mypage/inquiries/new`}>
            <button style={{
              background: 'var(--mp-color-primary)', color: '#fff',
              border: 'none', borderRadius: 20, padding: '8px 14px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              + 문의하기
            </button>
          </Link>
        }
      />

      <BigTabs
        value={tab}
        onChange={v => setTab(v as TabKey)}
        tabs={[
          { value: 'ALL',      label: '전체',      badge: data?.status_counts.ALL ?? 0 },
          { value: 'WAITING',  label: '답변대기', badge: data?.status_counts.WAITING ?? 0 },
          { value: 'ANSWERED', label: '답변완료' },
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
            <div style={{ fontSize: 56, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>문의 내역이 없어요.</div>
            <div style={{ marginTop: 20 }}>
              <Link href={`/${locale}/mypage/inquiries/new`}>
                <BigButton variant='primary'>첫 문의 등록하기</BigButton>
              </Link>
            </div>
          </div>
        )}

        {!loading && data?.items.map(item => (
          <InquiryRow key={item.inquiry_id} item={item} locale={locale} />
        ))}
      </div>
    </>
  )
}
