// KN541 CS 공지 — GET /cs/notices (실패 시 정적 더미 3건)

import { Metadata } from 'next'
import NoticeListClient from './NoticeListClient'

export const metadata: Metadata = {
  title: '공지사항 | KN541',
  description: 'KN541 쇼핑몰 공지사항을 확인하세요.',
}

export const dynamic = 'force-dynamic'

const DUMMY_NOTICES = [
  {
    id: 'dummy-notice-1',
    title: '[안내] KN541 배송 및 교환 안내',
    is_pinned: true,
    notice_target: '001',
    view_count: 0,
    created_at: '2026-04-01T10:00:00+09:00',
  },
  {
    id: 'dummy-notice-2',
    title: '회원 혜택 및 적립금 정책 변경',
    is_pinned: false,
    notice_target: '001',
    view_count: 0,
    created_at: '2026-03-20T09:00:00+09:00',
  },
  {
    id: 'dummy-notice-3',
    title: '시스템 점검 사전 안내',
    is_pinned: false,
    notice_target: '001',
    view_count: 0,
    created_at: '2026-03-10T14:00:00+09:00',
  },
]

async function fetchNotices(page: number = 1) {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
  try {
    const res = await fetch(`${BASE}/cs/notices?page=${page}&size=15`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('notices failed')
    const json = await res.json()
    const items = json.data?.items ?? json.data
    if (!Array.isArray(items) || items.length === 0) {
      return { items: DUMMY_NOTICES, total: DUMMY_NOTICES.length, fallback: true as const }
    }
    return {
      items,
      total: json.data?.total ?? items.length,
      fallback: false as const,
    }
  } catch {
    return { items: DUMMY_NOTICES, total: DUMMY_NOTICES.length, fallback: true as const }
  }
}

export default async function NoticePage() {
  const { items, total, fallback } = await fetchNotices(1)

  return <NoticeListClient initialItems={items} total={total} apiFailed={fallback} />
}
