'use client'
// KN541 공지사항 목록 — 클라이언트 컴포넌트
// 핀 공지 상단 고정 / 페이지네이션 / 클릭 시 상세 이동

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MegaphoneIcon, PinIcon } from 'lucide-react'

interface NoticeItem {
  id: string
  title: string
  is_pinned: boolean
  notice_target: string
  view_count: number
  created_at: string
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
const PAGE_SIZE = 15

export default function NoticeListClient({
  initialItems,
  total,
}: {
  initialItems: NoticeItem[]
  total: number
}) {
  const router = useRouter()
  const [items, setItems] = useState<NoticeItem[]>(initialItems)
  const [currentTotal, setCurrentTotal] = useState(total)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const pinned = items.filter((n) => n.is_pinned)
  const normal = items.filter((n) => !n.is_pinned)
  const totalPages = Math.ceil(currentTotal / PAGE_SIZE)

  const fetchPage = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/notices?notice_target=001&page=${p}&size=${PAGE_SIZE}`)
      const json = await res.json()
      setItems(json.data?.items || [])
      setCurrentTotal(json.data?.total || 0)
      setPage(p)
    } catch {
      // 네트워크 오류 시 무시
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  const goDetail = (id: string) => router.push(`/ko/cs/notice/${id}`)

  return (
    <div className="container py-16 lg:py-24">
      {/* 헤더 */}
      <div className="mb-10 flex items-center gap-3">
        <MegaphoneIcon className="h-7 w-7 text-neutral-700 dark:text-neutral-300" />
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          공지사항
        </h1>
      </div>

      {/* 핀 공지 */}
      {pinned.length > 0 && (
        <div className="mb-2">
          {pinned.map((n) => (
            <NoticeRow key={n.id} notice={n} pinned onClick={() => goDetail(n.id)} formatDate={formatDate} />
          ))}
        </div>
      )}

      {/* 구분선 */}
      {pinned.length > 0 && normal.length > 0 && (
        <div className="my-1 border-t-2 border-neutral-200 dark:border-neutral-700" />
      )}

      {/* 일반 공지 */}
      {items.length === 0 && !loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-400">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {normal.map((n) => (
            <NoticeRow key={n.id} notice={n} onClick={() => goDetail(n.id)} formatDate={formatDate} />
          ))}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchPage(p)}
              className={[
                'h-9 w-9 rounded-full text-sm font-medium transition',
                p === page
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-400',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NoticeRow({
  notice, pinned = false, onClick, formatDate,
}: {
  notice: NoticeItem
  pinned?: boolean
  onClick: () => void
  formatDate: (d: string) => string
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex w-full items-center gap-4 px-2 py-4 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        pinned ? 'bg-blue-50/50 dark:bg-blue-950/20' : '',
      ].join(' ')}
    >
      {/* 핀 아이콘 or 조회수 */}
      <div className="flex w-10 shrink-0 items-center justify-center">
        {pinned ? (
          <PinIcon className="h-4 w-4 rotate-45 text-blue-500" />
        ) : (
          <span className="text-xs text-neutral-400">{notice.view_count}</span>
        )}
      </div>

      {/* 제목 */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {pinned && (
          <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            공지
          </span>
        )}
        <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {notice.title}
        </span>
      </div>

      {/* 날짜 */}
      <span className="shrink-0 text-xs text-neutral-400">{formatDate(notice.created_at)}</span>
    </button>
  )
}
