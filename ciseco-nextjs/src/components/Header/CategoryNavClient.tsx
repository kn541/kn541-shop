'use client'
// KN541 쇼핑몰 — 카테고리 네비 클라이언트 컴포넌트
// hover 인터랙션 전담 (서버에서 받은 데이터를 props로 수신)

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
    // overflow-visible 필수 — auto/hidden이면 드롭다운이 잘림
    <nav className="hidden lg:flex items-center gap-0.5 overflow-visible">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="relative flex-shrink-0"
          onMouseEnter={() => enter(cat.id)}
          onMouseLeave={leave}
        >
          {/* 1단 카테고리 탭 */}
          <Link
            href={`/products?category=${encodeURIComponent(cat.category_code)}`}
            className={[
              'block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              openId === cat.id
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white',
            ].join(' ')}
          >
            {cat.category_name}
          </Link>

          {/* 2단 드롭다운 — z-[100]으로 헤더(z-50) 위에 표시 */}
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
                        href={`/products?category=${encodeURIComponent(sub.category_code)}`}
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
