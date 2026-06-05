'use client'
// KN541 쇼핑몰 — 헤더 중앙 검색폼 (항상 표시)
// 폼 제출 시 /search?q=... 로 이동

import { useRouter } from '@/i18n/navigation'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function SearchBox() {
  const router = useRouter()
  const tCommon = useTranslations('Common')
  const tSearch = useTranslations('Search')
  const [q, setQ] = useState('')

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
