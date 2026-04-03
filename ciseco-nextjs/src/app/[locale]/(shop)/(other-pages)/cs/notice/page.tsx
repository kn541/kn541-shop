// KN541 공지사항 목록 페이지
// 어드민 API: GET /notices?notice_target=001 (쇼핑몰 공개)
// 핀 공지 상단 고정, 일반 공지 목록

import { Metadata } from 'next'
import NoticeListClient from './NoticeListClient'

export const metadata: Metadata = {
  title: '공지사항 | KN541',
  description: 'KN541 쇼핑몰 공지사항을 확인하세요.',
}

export const dynamic = 'force-dynamic'

async function fetchNotices(page: number = 1) {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
  try {
    const res = await fetch(
      `${BASE}/notices?notice_target=001&page=${page}&size=15`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { items: [], total: 0 }
    const json = await res.json()
    return {
      items: json.data?.items || [],
      total: json.data?.total || 0,
    }
  } catch {
    return { items: [], total: 0 }
  }
}

export default async function NoticePage() {
  const { items, total } = await fetchNotices(1)

  return <NoticeListClient initialItems={items} total={total} />
}
