'use client'

import { Link } from '@/components/Link'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const links = [
  { nameKey: 'settings' as const, link: '/account' },
  { nameKey: 'wishlists' as const, link: '/account-wishlists' },
  { nameKey: 'ordersHistory' as const, link: '/orders' },
  { nameKey: 'changePassword' as const, link: '/account-password' },
  { nameKey: 'billing' as const, link: '/account-billing' },
]

const PageTab = () => {
  const t = useTranslations('Account')
  const pathname = usePathname()

  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {links.map((item) => {
          let isActive = pathname === item.link
          if (item.link === '/orders' && pathname.includes('/orders/')) {
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
