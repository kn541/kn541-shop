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

const PageTab = () => {
  const t = useTranslations('Account')
  const pathname = usePathname()
  const { user } = useAuth()

  // 유료회원(006)만 내 쇼핑몰 + 수당현황 탭 노출
  const visibleLinks = links.filter(item => {
    if (item.link === '/myshop' && user?.user_type !== '006') return false
    if (item.link === '/commission' && user?.user_type !== '006') return false
    return true
  })

  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {visibleLinks.map((item) => {
          let isActive = pathname === item.link
          if (item.link === '/orders' && pathname.includes('/orders/')) {
            isActive = true
          }
          if (item.link === '/myshop' && pathname.startsWith('/myshop')) {
            isActive = true
          }

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
