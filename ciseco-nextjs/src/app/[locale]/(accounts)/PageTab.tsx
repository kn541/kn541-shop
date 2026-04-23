'use client'

import { Link } from '@/components/Link'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

const links = [
  { nameKey: 'settings' as const, link: '/account' },
  { nameKey: 'wishlists' as const, link: '/account-wishlists' },
  { nameKey: 'ordersHistory' as const, link: '/orders' },
  { nameKey: 'myshop' as const, link: '/myshop' },
  { nameKey: 'commission' as const, link: '/commission' },
  { nameKey: 'addresses' as const, link: '/addresses' },
  { nameKey: 'changePassword' as const, link: '/account-password' },
]

type PageTabVariant = 'tabs' | 'sidebar'

interface PageTabProps {
  /** 기본: 계정 페이지 상단 가로 탭. sidebar: 마이페이지 좌측 세로 메뉴 */
  variant?: PageTabVariant
}

const PageTab = ({ variant = 'tabs' }: PageTabProps) => {
  const t = useTranslations('Account')
  const pathname = usePathname()
  const { user } = useAuth()

  // 유료회원(006)만 내 쇼핑몰 + 수당현황 탭 노출
  const visibleLinks = links.filter(item => {
    if (item.link === '/myshop' && user?.user_type !== '006') return false
    if (item.link === '/commission' && user?.user_type !== '006') return false
    return true
  })

  const linkIsActive = (item: (typeof links)[number]) => {
    let isActive = pathname === item.link
    if (item.link === '/orders' && (pathname.includes('/orders/') || pathname.startsWith('/mypage/orders'))) {
      isActive = true
    }
    if (
      item.link === '/myshop' &&
      (pathname.startsWith('/myshop') || pathname.startsWith('/mypage/shop'))
    ) {
      isActive = true
    }
    return isActive
  }

  if (variant === 'sidebar') {
    return (
      <nav aria-label={t('title')} className="flex flex-col gap-0.5 px-2 py-3">
        {visibleLinks.map(item => {
          const isActive = linkIsActive(item)
          return (
            <Link
              key={item.link}
              href={item.link}
              className={`block w-full rounded-lg border-l-4 py-3 pl-4 pr-3 text-left text-sm transition-colors ${
                isActive
                  ? 'border-primary-500 bg-primary-50 font-semibold text-neutral-950 dark:bg-neutral-800/80 dark:text-neutral-100'
                  : 'border-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/50'
              }`}
            >
              {t(item.nameKey)}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {visibleLinks.map((item) => {
          const isActive = linkIsActive(item)

          return (
            <Link
              key={item.link}
              href={item.link}
              className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                isActive
                  ? 'border-primary-500 font-medium text-neutral-950 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              {t(item.nameKey)}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default PageTab
