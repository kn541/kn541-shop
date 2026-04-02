import Logo from '@/components/Logo'
import { CustomLink } from '@/data/types'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import React from 'react'
import Link from 'next/link'

interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '1',
    title: '고객센터',
    menus: [
      { href: '/faq', label: '자주 묻는 질문 (FAQ)' },
      { href: '/cs/inquiry', label: '1:1 문의' },
      { href: '/cs/notice', label: '공지사항' },
    ],
  },
  {
    id: '2',
    title: '쇼핑 안내',
    menus: [
      { href: '/terms/order', label: '주문/결제 안내' },
      { href: '/terms/delivery', label: '배송 안내' },
      { href: '/terms/return', label: '반품/교환 안내' },
      { href: '/terms/point', label: '포인트 적립 안내' },
    ],
  },
  {
    id: '3',
    title: '회원 서비스',
    menus: [
      { href: '/login', label: '로그인' },
      { href: '/signup', label: '회원가입' },
      { href: '/mypage', label: '마이페이지' },
      { href: '/terms/membership', label: '회원등급 안내' },
    ],
  },
  {
    id: '4',
    title: '입점/파트너',
    menus: [
      { href: '/vendor-inquiry', label: '입점문의' },
      { href: '/terms/supplier', label: '공급사 안내' },
    ],
  },
]

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, idx) => (
            <li key={idx}>
              <Link
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
                {...(item.href.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative border-t py-20 lg:pt-28 lg:pb-24">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        {/* 로고 + SNS */}
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <Logo />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 />
          </div>
          {/* 입점문의 배너 버튼 */}
          <div className="col-span-4 mt-2">
            <Link
              href="/vendor-inquiry"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-700 hover:text-white dark:border-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-300 dark:hover:text-neutral-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              입점문의
            </Link>
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>

      {/* 하단 카피라이트 */}
      <div className="container mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-700">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} KN541. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100">
              개인정보처리방침
            </Link>
            <Link href="/terms/service" className="hover:text-neutral-900 dark:hover:text-neutral-100">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
