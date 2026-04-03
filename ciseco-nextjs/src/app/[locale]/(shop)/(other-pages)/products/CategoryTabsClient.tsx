'use client'
// KN541 상품목록 — 카테고리 탭 (클라이언트)
// useSearchParams()로 현재 활성 카테고리 읽기 → 반드시 Suspense 안에서 사용

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Category {
  id: string
  category_code: string
  category_name: string
}

interface Props {
  categories: Category[]
}

export default function CategoryTabsClient({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const handleClick = (code: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (code) {
      params.set('category', code)
    } else {
      params.delete('category')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 탭 */}
      <button
        onClick={() => handleClick(null)}
        className={[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          !activeCategory
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white',
        ].join(' ')}
      >
        전체
      </button>

      {/* 카테고리별 탭 */}
      {categories.map((cat) => {
        const isActive = activeCategory === cat.category_code
        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.category_code)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white',
            ].join(' ')}
          >
            {cat.category_name}
          </button>
        )
      })}
    </div>
  )
}
