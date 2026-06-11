'use client'
// KN541 쇼핑몰 — 헤더 중앙 검색폼 (항상 표시)
// 폼 제출 시 /search?q=... 로 이동
// fix(2026-06-11): 검색 결과 페이지에서 헤더 검색바가 빈 칸으로 보이던 문제 —
//                  URL의 ?q= 값을 입력값에 동기화

import { usePathname, useRouter } from '@/i18n/navigation'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function SearchBox() {
  const router = useRouter()
  const pathname = usePathname()
  const tCommon = useTranslations('Common')
  const tSearch = useTranslations('Search')
  const [q, setQ] = useState('')

  // 페이지 이동 시 URL의 q 파라미터를 검색바에 반영
  // (/search?q=커피 진입 시 "커피" 표시, 다른 페이지로 가면 비움)
  useEffect(() => {
    const urlQ = new URLSearchParams(window.location.search).get('q') ?? ''
    setQ(urlQ)
  }, [pathname])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    else router.push('/search')
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex h-9 w-full max-w-md items-center rounded-full border border-primary-500 bg-white px-4 transition-shadow focus-within:shadow-sm dark:border-primary-400 dark:bg-neutral-800"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={tCommon('searchPlaceholder')}
        aria-label={tSearch('ariaLabel')}
        className="flex-1 border-none bg-transparent text-sm text-neutral-700 outline-none ring-0 placeholder:text-neutral-400 focus:ring-0 dark:text-neutral-200 dark:placeholder:text-neutral-500"
        autoComplete="off"
      />
      <button
        type="submit"
        aria-label={tCommon('search')}
        className="ml-2 flex items-center justify-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        <HugeiconsIcon icon={Search01Icon} size={18} color="currentColor" strokeWidth={1.5} />
      </button>
    </form>
  )
}
