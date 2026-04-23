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
          <div className="mx-auto max-w-4xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold xl:text-4xl">{t('title')}</h2>
              <AccountHeaderInfo />
            </div>

            <Divider className="mt-10" />
            <PageTab />
            <Divider />
          </div>
        </div>
        <div className="mx-auto max-w-4xl pt-14 pb-[5.5rem] sm:pt-16 md:pb-24 lg:pb-32">
          {children}
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
