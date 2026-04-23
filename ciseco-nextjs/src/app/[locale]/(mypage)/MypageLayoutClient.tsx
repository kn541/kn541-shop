'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import BottomTabBar from '@/components/mypage/BottomTabBar'
import PageTab from '@/app/[locale]/(accounts)/PageTab'

export default function MypageLayoutClient({ children }: { children: ReactNode }) {
  const t = useTranslations('Account')

  return (
    <div
      data-mypage-root
      className="min-h-screen bg-[var(--mp-color-bg)]"
    >
      <div className="flex min-h-screen">
        {/* 데스크톱: 계정 메뉴(PageTab) 좌측 사이드바 — (accounts)/PageTab과 동일 링크·권한 */}
        <aside
          className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-neutral-200 md:bg-white md:dark:border-neutral-700 md:dark:bg-neutral-900"
        >
          <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto">
            <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {t('title')}
              </p>
            </div>
            <PageTab variant="sidebar" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* 모바일만 하단 탭 (md 이상에서는 숨김) */}
      <BottomTabBar />
    </div>
  )
}
