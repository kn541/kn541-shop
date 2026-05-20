'use client'

import './kn541-main.css'
import { useAside } from '@/components/aside/aside'
import { Link } from '@/shared/link'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

function IconMenu() {
  return (
    <svg width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden>
      <path d="M17 0H0V1.05H17V0Z" fill="#121212" />
      <path d="M17 6.4751H0V7.5251H17V6.4751Z" fill="#121212" />
      <path d="M17 12.9502H0V14.0002H17V12.9502Z" fill="#121212" />
    </svg>
  )
}

function IconReserve() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
      <path
        d="M14.8245 0.961014H14.3795V0H13.1435V0.961014H3.86476V0H2.6287V0.961014H2.18371C0.980611 0.961014 0 1.94688 0 3.15643V14.8046C0 16.0141 0.980611 17 2.18371 17H14.8245C16.0276 17 17.0082 16.0141 17.0082 14.8046V3.15643C17.0082 1.94688 16.0276 0.961014 14.8245 0.961014ZM2.18371 2.2037H14.8245C15.3437 2.2037 15.7722 2.62622 15.7722 3.15643V4.13402H1.23606V3.15643C1.23606 2.6345 1.65633 2.2037 2.18371 2.2037Z"
        fill="#121212"
      />
    </svg>
  )
}

function IconHomeFab() {
  return (
    <svg width="60" height="58" viewBox="0 0 60 58" fill="none" aria-hidden className="block">
      <circle cx="30" cy="26" r="26" fill="url(#mbHomeGrad)" />
      <defs>
        <linearGradient id="mbHomeGrad" x1="4" y1="26" x2="56" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B1FA63" />
          <stop offset="1" stopColor="#05C368" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function IconHomeGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="relative z-[1]">
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8.5Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="20" height="17" viewBox="0 0 20 17" fill="none" aria-hidden>
      <path
        d="M11.7538 8.28512H8.24621C3.69309 8.28512 0 11.8985 0 16.3634V16.9918H20V16.3634C20 11.8985 16.3069 8.27686 11.7538 8.27686V8.28512ZM1.29005 15.7598C1.60202 12.2705 4.60371 9.5254 8.24621 9.5254H11.7538C15.3963 9.5254 18.3895 12.2705 18.7099 15.7598H1.29005Z"
        fill="#121212"
      />
      <path
        d="M10.0001 7.25973C12.0406 7.25973 13.7016 5.63911 13.7016 3.62986C13.7016 1.62062 12.0406 0 10.0001 0C7.95963 0 6.29858 1.62062 6.29858 3.62986C6.29858 5.63911 7.9512 7.25973 10.0001 7.25973Z"
        fill="#121212"
      />
    </svg>
  )
}

function IconWish() {
  return (
    <svg width="20" height="17" viewBox="0 0 20 17" fill="none" aria-hidden>
      <path
        d="M15.1412 1.2835C16.1024 1.2835 17.0046 1.6575 17.6792 2.346C18.3537 3.026 18.7331 3.9355 18.7331 4.9045C18.7331 5.8735 18.3621 6.783 17.6792 7.463L9.99789 15.2065L2.31661 7.463C0.916948 6.052 0.916948 3.757 2.31661 2.346C2.99115 1.666 3.89334 1.2835 4.85455 1.2835C5.81577 1.2835 6.71796 1.6575 7.3925 2.346L9.10413 4.0715C9.34865 4.318 9.67749 4.4455 9.99789 4.4455C10.3183 4.4455 10.6471 4.318 10.8917 4.0715L12.6117 2.3375C13.2863 1.6575 14.1884 1.275 15.1497 1.275M15.1412 0.0085C13.9018 0.0085 12.6539 0.4845 11.7095 1.445L9.98946 3.179L8.27782 1.4535C7.33347 0.4845 6.09401 0.0085 4.85455 0.0085C3.61509 0.0085 2.3672 0.4845 1.42285 1.445C-0.474283 3.349 -0.474283 6.4515 1.42285 8.364L9.99789 17.0085L18.5729 8.3555C20.4701 6.443 20.4701 3.349 18.5729 1.4365C17.6286 0.4845 16.3807 0 15.1412 0V0.0085Z"
        fill="#121212"
      />
    </svg>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { open: openAside } = useAside()
  const locale = pathname.split('/')[1] || 'ko'
  const homeHref = `/${locale}`
  const segs = pathname.split('/').filter(Boolean)
  const isHome = segs.length === 1 && segs[0] === locale

  return (
    <nav className="mobile-bottom" aria-label="모바일 하단 메뉴">
      <button type="button" className="mb-btn" onClick={() => openAside('sidebar-navigation')}>
        <span>
          <IconMenu />
        </span>
        전체메뉴
      </button>
      <Link href="/products?product_type=002" className="mb-btn" scroll={false}>
        <span>
          <IconReserve />
        </span>
        사전예약
      </Link>
      <Link href={homeHref} className={clsx('mb-btn home', isHome && 'is-active')} scroll={false}>
        <span className="relative flex h-[58px] w-[60px] items-center justify-center">
          <IconHomeFab />
          <span className="absolute inset-0 flex items-center justify-center pb-1">
            <IconHomeGlyph />
          </span>
        </span>
        홈
      </Link>
      <Link href={`/${locale}/myshop`} className="mb-btn" scroll={false}>
        <span>
          <IconUser />
        </span>
        내 정보
      </Link>
      <button type="button" className="mb-btn" onClick={() => toast('찜 목록은 준비 중입니다.')}>
        <span>
          <IconWish />
        </span>
        찜
      </button>
    </nav>
  )
}
