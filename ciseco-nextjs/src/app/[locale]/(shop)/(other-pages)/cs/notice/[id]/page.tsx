// KN541 공지사항 상세 페이지
// 어드민 API: GET /notices/{id}
// blog/[handle] 템플릿 기반

import { Divider } from '@/components/Divider'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MegaphoneIcon, ArrowLeftIcon, EyeIcon, PinIcon } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

async function fetchNotice(id: string) {
  try {
    const res = await fetch(`${BASE}/notices/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const notice = await fetchNotice(id)
  return {
    title: notice ? `${notice.title} | 공지사항 | KN541` : '공지사항 | KN541',
  }
}

export const dynamic = 'force-dynamic'

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const notice = await fetchNotice(id)

  if (!notice) return notFound()

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="pt-8 pb-16 lg:pt-12 lg:pb-24">
      <div className="container mx-auto max-w-3xl">
        {/* 뒤로가기 */}
        <Link
          href="/ko/cs/notice"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          공지사항 목록
        </Link>

        {/* 헤더 */}
        <header className="mb-8">
          {/* 핀 배지 */}
          {notice.is_pinned && (
            <div className="mb-3 flex items-center gap-1.5">
              <PinIcon className="h-3.5 w-3.5 rotate-45 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">공지</span>
            </div>
          )}

          <h1 className="text-2xl font-semibold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {notice.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{formatDate(notice.created_at)}</span>
            <span className="flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {notice.view_count?.toLocaleString() || 0}
            </span>
          </div>

          <Divider className="mt-6" />
        </header>

        {/* 본문 */}
        <div
          className="prose prose-sm mx-auto max-w-none sm:prose lg:prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: notice.content || '' }}
        />

        <Divider className="my-10" />

        {/* 하단 네비게이션 */}
        <div className="flex justify-center">
          <Link
            href="/ko/cs/notice"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            목록으로
          </Link>
        </div>
      </div>
    </div>
  )
}
