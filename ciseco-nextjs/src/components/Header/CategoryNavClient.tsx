'use client'
// KN541 쇼핑몰 — 카테고리 네비 클라이언트 컴포넌트
// fix: /ko/products?cid={id(UUID)} 방식으로 변경 (category_code 특수문자 문제 해소)

import { useRef, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  category_code: string
  category_name: string
  is_active?: boolean
  children?: Category[]
}

export default function CategoryNavClient({ categories }: { categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenId(id)
  }

  const leave = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150)
  }

  return (
    <nav className="hidden lg:flex items-center gap-0.5 overflow-visible">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="relative flex-shrink-0"
          onMouseEnter={() => enter(cat.id)}
          onMouseLeave={leave}
        >
          {/* 1단 카테고리 — cid=UUID 사용, /ko/ prefix 포함 */}
          <Link
            href={`/ko/products?cid=${cat.id}`}
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
                        href={`/ko/products?cid=${sub.id}`}
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
    </nav>
  )
}
