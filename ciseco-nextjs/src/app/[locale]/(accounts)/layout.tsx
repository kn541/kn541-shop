// 빌드 시 API 호출로 인한 SSG 타임아웃 방지
export const dynamic = 'force-dynamic'

import { Divider } from '@/components/Divider'
import Footer from '@/components/Footer'
import Header2 from '@/components/Header/Header2'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import { getTranslations } from 'next-intl/server'
import React, { FC } from 'react'
import PageTab from './PageTab'
import AccountsMobileBar from './AccountsMobileBar'
import AccountHeaderInfo from './AccountHeaderInfo'

interface Props {
  children?: React.ReactNode
}

const Layout: FC<Props> = async ({ children }) => {
  const t = await getTranslations('Account')

  return (
    <>
      <Header2 />
      <div className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold xl:text-4xl">{t('title')}</h2>
              <AccountHeaderInfo />
            </div>
            <Divider className="mt-10" />
          </div>
        </div>

        {/* 2컬럼: 왼쪽 사이드바 메뉴 + 오른쪽 콘텐츠 */}
        <div className="mx-auto max-w-6xl flex gap-8 pt-8 pb-[5.5rem] md:pb-24 lg:pb-32">
          {/* 왼쪽 사이드바 — 데스크톱에서만 표시 */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28 rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <PageTab variant="sidebar" />
            </div>
          </aside>

          {/* 콘텐츠 영역 */}
          <div className="w-full min-w-0">
            {/* 모바일: 상단 가로 탭 (lg 미만에서만 표시) */}
            <div className="lg:hidden mb-6">
              <PageTab variant="tabs" />
              <Divider />
            </div>

            {children}
          </div>
        </div>
      </div>
      <AccountsMobileBar />
      <Footer />

      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </>
  )
}

export default Layout
