'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

const TABS = [
  { icon: '🏠', label: '홈',   hrefSuffix: '' },
  { icon: '🛍️', label: '쇼핑',  hrefSuffix: '/products' },
  { icon: '🏪', label: '내몰',  hrefSuffix: '/mypage/shop' },
  { icon: '👤', label: '마이',  hrefSuffix: '/mypage' },
]

export default function BottomTabBar() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav
      aria-label='하단 내비게이션'
      className='mp-bottom-tab-bar md:hidden'
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#fff',
        borderTop: '1px solid var(--mp-color-border)',
        display: 'flex',
        zIndex: 50,
      }}
    >
      {TABS.map((t) => {
        const href = `/${locale}${t.hrefSuffix}`
        const active =
          t.hrefSuffix === ''
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(`/${locale}${t.hrefSuffix}`)
        return (
          <Link
            key={t.hrefSuffix}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: active
                ? 'var(--mp-color-primary)'
                : 'var(--mp-color-text-muted)',
              fontWeight: active ? 700 : 500,
              gap: 2,
            }}
          >
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <span style={{ fontSize: 12 }}>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
