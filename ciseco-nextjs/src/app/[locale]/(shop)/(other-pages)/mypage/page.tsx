'use client'
// KN541 마이페이지 홈 — 주요 메뉴 바로가기

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBagIcon,
  MapPinIcon,
  UserIcon,
  KeyIcon,
  HeartIcon,
  CurrencyDollarIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

interface UserInfo {
  name?: string
  username?: string
  user_type?: string
  member_no?: string
}

const USER_TYPE_LABEL: Record<string, string> = {
  '001': '관리자',
  '002': '일반회원',
  '003': '준회원',
  '004': '정회원',
  '005': '우수회원',
  '006': '창업회원',
}

export default function MypageHome() {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'ko'

  const [user, setUser]     = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.replace(`/${locale}`); return }

    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, router])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  const isStartup = user?.user_type === '006' || Number(user?.user_type) >= 4
  const typeLabel = USER_TYPE_LABEL[user?.user_type ?? ''] ?? '회원'

  const menus = [
    { href: `/${locale}/mypage/orders`,        icon: ShoppingBagIcon,       label: '주문 내역',     desc: '주문 현황 및 배송 조회' },
    { href: `/${locale}/mypage/addresses`,     icon: MapPinIcon,            label: '배송지 관리',   desc: '배송지 추가·수정·삭제' },
    { href: `/${locale}/mypage/profile`,       icon: UserIcon,              label: '프로필',        desc: '내 정보 수정' },
    { href: `/${locale}/mypage/change-password`, icon: KeyIcon,             label: '비밀번호 변경', desc: '비밀번호 재설정' },
    { href: `/${locale}/mypage/wishlists`,     icon: HeartIcon,             label: '위시리스트',    desc: '찜한 상품 목록' },
    ...(isStartup ? [
      { href: `/${locale}/mypage/commission`,  icon: CurrencyDollarIcon,    label: '수당 현황',     desc: '누적 수당 및 정산 내역' },
      { href: `/${locale}/mypage/myshop`,      icon: BuildingStorefrontIcon, label: '내 쇼핑몰',    desc: '아지트몰 관리' },
    ] : []),
  ]

  return (
    <div className="container py-12 max-w-3xl">
      {/* 인사 */}
      <div className="mb-8 rounded-3xl bg-neutral-50 dark:bg-neutral-800 px-8 py-6">
        {user ? (
          <>
            <p className="text-sm text-neutral-500">{typeLabel}</p>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {user.name ?? user.username ?? '회원'}님, 환영합니다!
            </h1>
            {user.member_no && (
              <p className="text-xs text-neutral-400 mt-1">회원번호 {user.member_no}</p>
            )}
          </>
        ) : (
          <p className="text-neutral-500">회원 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {menus.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 transition hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20">
            <Icon className="h-6 w-6 text-neutral-400 group-hover:text-primary-600 transition-colors" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
