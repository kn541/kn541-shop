'use client'
// KN541 쇼핑몰 — 카테고리 네비 클라이언트 컴포넌트
// 메뉴 구조: 홈(정적) → 카테고리 DB(동적) → 구분선 → 사전예약/벨류업(정적)
// 카테고리는 hover 시 2단 드롭다운, 정적 항목은 단순 링크

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface Category {
  id: string
  category_code: string
  category_name: string
  is_active?: boolean
  children?: Category[]
}

export default function CategoryNavClient({ categories }: { categories: Category[] }) {
  const locale = useLocale()
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenId(id)
  }

  const leave = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150)
  }

  const staticLinkBase =
    'block flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap'

  return (
    <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto whitespace-nowrap scrollbar-hide">

      {/* 홈 (정적, 좌측 첫번째) */}
      <Link
        href={`/${locale}`}
        className={`${staticLinkBase} text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20`}
      >
        홈
      </Link>

      {/* 카테고리 DB (동적, hover 드롭다운) */}
      {categories.map(cat => (
        <div
          key={cat.id}
          className="relative flex-shrink-0"
          onMouseEnter={() => enter(cat.id)}
          onMouseLeave={leave}
        >
          {/* 1단 카테고리 */}
          <Link
            href={`/${locale}/products?cid=${cat.id}`}
            className={[
              'block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              openId === cat.id
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white',
            ].join(' ')}
          >
            {cat.category_name}
          </Link>

          {/* 2단 드롭다운 */}
          {cat.children && cat.children.length > 0 && openId === cat.id && (
            <div
              className="absolute left-0 top-full z-[100] pt-2"
              onMouseEnter={() => enter(cat.id)}
              onMouseLeave={leave}
            >
              <ul className="min-w-[160px] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                {cat.children
                  .filter(sub => sub.is_active !== false)
                  .map(sub => (
                    <li key={sub.id}>
                      <Link
                        href={`/${locale}/products?cid=${sub.id}`}
                        className="block px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                      >
                        {sub.category_name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* 구분선 */}
      <span className="mx-2 h-3 w-px flex-shrink-0 bg-neutral-200 dark:bg-neutral-700" />

      {/* 사전예약 (정적) */}
      <Link
        href={`/${locale}/preorder`}
        className={`${staticLinkBase} text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20`}
      >
        사전예약
      </Link>

      {/* 벨류업 (정적) */}
      <Link
        href={`/${locale}/value-up`}
        className={`${staticLinkBase} text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20`}
      >
        벨류업
      </Link>
    </nav>
  )
}
