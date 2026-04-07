'use client'
// KN541 쇼핑몰 — 마이페이지 공통 레이아웃
// 로그인 체크 + 좌측 탭 메뉴

import { useEffect, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: '내 정보', href: '/mypage/profile', icon: '👤' },
  { label: '주문 내역', href: '/mypage/orders', icon: '📦' },
  { label: '내 쇼핑몰', href: '/mypage/myshop', icon: '🏪' },
  { label: '수당 현황', href: '/mypage/commission', icon: '💰' },
  { label: '배송지 관리', href: '/mypage/addresses', icon: '📍' },
]

export default function MypageLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push(`/login?redirect=${pathname}`)
    }
  }, [router, pathname])

  return (
    <div className="container py-10 lg:py-14">
      <h1 className="mb-8 text-2xl font-bold text-neutral-900 dark:text-neutral-100">마이페이지</h1>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* 좌측 탭 메뉴 */}
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map(tab => {
              // locale prefix 포함된 pathname에서 탭 매칭
              const isActive = pathname.includes(tab.href.replace('/mypage', 'mypage'))
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition
                    ${isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* 본문 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
