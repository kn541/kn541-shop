'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { MegaphoneIcon } from '@heroicons/react/24/outline'

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
  apiFailed,
}: {
  initialItems: NoticeItem[]
  total: number
  apiFailed?: boolean
}) {
  const router = useRouter()
  const [items, setItems] = useState<NoticeItem[]>(initialItems)
  const [currentTotal, setCurrentTotal] = useState(total)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const pinned = items.filter(n => n.is_pinned)
  const normal = items.filter(n => !n.is_pinned)
  const totalPages = Math.ceil(currentTotal / PAGE_SIZE)

  const fetchPage = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/cs/notices?page=${p}&size=${PAGE_SIZE}`)
      if (!res.ok) throw new Error('fail')
      const json = await res.json()
      const nextItems = json.data?.items ?? json.data ?? []
      if (Array.isArray(nextItems) && nextItems.length > 0) {
        setItems(nextItems)
        setCurrentTotal(json.data?.total ?? nextItems.length)
        setPage(p)
      }
    } catch {
      // 유지
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  const goDetail = (id: string) => {
    if (id.startsWith('dummy-')) return
    router.push(`/cs/notice/${id}`)
  }

  return (
    <div className="container py-16 lg:py-24">
      <div className="mb-10 flex items-center gap-3">
        <MegaphoneIcon className="h-7 w-7 text-neutral-700 dark:text-neutral-300" />
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          공지사항
        </h1>
      </div>

      {apiFailed && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          공지 API 연결에 실패하여 예시 목록을 표시합니다.
        </p>
      )}

      {pinned.length > 0 && (
        <div className="mb-2">
          {pinned.map(n => (
            <NoticeRow key={n.id} notice={n} pinned onClick={() => goDetail(n.id)} formatDate={formatDate} />
          ))}
        </div>
      )}

      {pinned.length > 0 && normal.length > 0 && (
        <div className="my-1 border-t-2 border-neutral-200 dark:border-neutral-700" />
      )}

      {items.length === 0 && !loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-400">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {normal.map(n => (
            <NoticeRow key={n.id} notice={n} onClick={() => goDetail(n.id)} formatDate={formatDate} />
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
        </div>
      )}

      {!apiFailed && totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => void fetchPage(p)}
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
  notice,
  pinned = false,
  onClick,
  formatDate,
}: {
  notice: NoticeItem
  pinned?: boolean
  onClick: () => void
  formatDate: (d: string) => string
}) {
  const isDummy = notice.id.startsWith('dummy-')
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDummy}
      className={[
        'flex w-full items-center gap-4 px-2 py-4 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        pinned ? 'bg-blue-50/50 dark:bg-blue-950/20' : '',
        isDummy ? 'cursor-default opacity-80' : '',
      ].join(' ')}
    >
      <div className="flex w-12 shrink-0 items-center justify-center">
        {notice.is_pinned ? (
          <span className="text-lg" title="고정 공지">
            📌
          </span>
        ) : pinned ? (
          <span className="text-xs text-neutral-400">{notice.view_count}</span>
        ) : (
          <span className="text-xs text-neutral-400">{notice.view_count}</span>
        )}
      </div>

      <span className="flex-1 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {notice.title}
      </span>

      <span className="shrink-0 text-xs text-neutral-400">{formatDate(notice.created_at)}</span>
    </button>
  )
}
