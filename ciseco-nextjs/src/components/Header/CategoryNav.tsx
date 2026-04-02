'use client'
// KN541 쇼핑몰 — 카테고리 네비게이션 컴포넌트
// DB categories 테이블에서 depth=1,2 카테고리를 가져와 헤더에 표시
// 마우스 오버 시 2단 카테고리 드롭다운 표시

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface Category {
  id: string
  category_code: string
  category_name: string
  depth: number
  parent_id: string | null
  sort_order: number
}

interface CategoryWithChildren extends Category {
  children: Category[]
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE}/categories`)
        const json = await res.json()
        if (json.status === 'success') {
          const all: Category[] = json.data.items ?? json.data
          const depth1 = all.filter(c => c.depth === 1).sort((a, b) => a.sort_order - b.sort_order)
          const depth2 = all.filter(c => c.depth === 2)
          const merged: CategoryWithChildren[] = depth1.map(p => ({
            ...p,
            children: depth2.filter(c => c.parent_id === p.id).sort((a, b) => a.sort_order - b.sort_order),
          }))
          setCategories(merged)
        }
      } catch {
        // 카테고리 로드 실패 시 빈 배열 유지
      }
    }
    fetchCategories()
  }, [])

  const handleMouseEnter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenId(id)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 120)
  }

  if (categories.length === 0) return null

  return (
    <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="relative"
          onMouseEnter={() => handleMouseEnter(cat.id)}
          onMouseLeave={handleMouseLeave}
        >
          {/* 1단 카테고리 버튼 */}
          <Link
            href={`/products?category=${cat.category_code}`}
            className={`
              whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
              ${openId === cat.id
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
              }
            `}
          >
            {cat.category_name}
          </Link>

          {/* 2단 드롭다운 */}
          {cat.children.length > 0 && openId === cat.id && (
            <div
              className="absolute left-0 top-full pt-1 z-50"
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="min-w-[160px] rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900 py-1.5">
                {cat.children.map(sub => (
                  <Link
                    key={sub.id}
                    href={`/products?category=${sub.category_code}`}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    {sub.category_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
