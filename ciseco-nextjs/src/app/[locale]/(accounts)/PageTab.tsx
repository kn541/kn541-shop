'use client'

import { Link } from '@/components/Link'
import { usePathname } from '@/i18n/navigation'
import { useEffectiveUserType } from '@/hooks/useEffectiveUserType'
import { useTranslations } from 'next-intl'

type LinkItem = {
  nameKey:
    | 'settings'
    | 'wishlists'
    | 'ordersHistory'
    | 'points'
    | 'coupons'
    | 'packages'
    | 'commission'
    | 'dividends'
    | 'referralTree'
    | 'myshop'
    | 'withdraw'
    | 'addresses'
    | 'upgradePaid'
  link: string
  paidOnly?: boolean
  generalOnly?: boolean
}

const links: LinkItem[] = [
  { nameKey: 'settings', link: '/account' },
  { nameKey: 'wishlists', link: '/account-wishlists' },
  { nameKey: 'ordersHistory', link: '/orders' },
  { nameKey: 'points', link: '/points' },
  { nameKey: 'coupons', link: '/coupons' },
  { nameKey: 'packages', link: '/packages' },
  { nameKey: 'commission', link: '/commission', paidOnly: true },
  { nameKey: 'dividends', link: '/dividends', paidOnly: true },
  { nameKey: 'referralTree', link: '/tree', paidOnly: true },
  { nameKey: 'myshop', link: '/myshop', paidOnly: true },
  { nameKey: 'withdraw', link: '/withdraw', paidOnly: true },
  { nameKey: 'addresses', link: '/addresses' },
  // generalOnly: 002(일반회원)에게만 노출. 목적지: /packages (유료전환 구매 페이지)
  { nameKey: 'upgradePaid', link: '/packages', generalOnly: true },
]

type PageTabVariant = 'tabs' | 'sidebar'

interface PageTabProps {
  variant?: PageTabVariant
}

const PageTab = ({ variant = 'tabs' }: PageTabProps) => {
  const t = useTranslations('Account')
  const pathname = usePathname()
  const { loading, isPaidMember, isGeneralMember } = useEffectiveUserType()

  const visibleLinks = links.filter((item) => {
    if (item.paidOnly && !isPaidMember) return false
    if (item.generalOnly && !isGeneralMember) return false
    return true
  })

  const linkIsActive = (item: LinkItem) => {
    let isActive = pathname === item.link
    if (item.link === '/orders' && pathname.includes('/orders/')) isActive = true
    if (item.link === '/myshop' && pathname.startsWith('/myshop')) isActive = true
    if (item.link === '/dividends' && pathname.startsWith('/dividends')) isActive = true
    if (item.link === '/withdraw' && pathname.startsWith('/withdraw')) isActive = true
    if (item.link === '/packages' && pathname.startsWith('/packages')) isActive = true
    return isActive
  }

  if (loading) {
    if (variant === 'sidebar') {
      return (
        <nav className="flex flex-col gap-2 px-2 py-3">
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </nav>
      )
    }
    return <div className="h-14" />
  }

  if (variant === 'sidebar') {
    return (
      <nav aria-label={t('title')} className="flex flex-col gap-0.5 px-2 py-3">
        {visibleLinks.map((item) => {
          const isActive = linkIsActive(item)
          return (
            <Link
              key={item.nameKey}
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
              key={item.nameKey}
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
