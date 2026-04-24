'use client'
// KN541 쇼핑몰 — 헤더 우측 유저 액션 영역
// fix: hydration mismatch 방지 — isMounted 패턴으로 SSR/CSR 불일치 해소
// fix: 로그아웃 시 메인 페이지로 이동

import { useEffect, useState, useRef } from 'react'
import { useLocale } from 'next-intl'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface UserInfo {
  name: string
  user_id: string
}

function BellIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default function HeaderUserActions() {
  const locale = useLocale()
  const [isMounted, setIsMounted] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const token = localStorage.getItem('access_token')
    if (!token || !BASE) { setLoading(false); return }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setUser({ name: json.data.name ?? json.data.username ?? '회원', user_id: json.data.user_id })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isMounted])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 로그아웃 → 토큰 삭제 + 메인 페이지로 이동
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = `/${locale}`
  }

  if (!isMounted) {
    return <div className="h-9 w-36" />
  }

  if (loading) {
    return <div className="flex items-center gap-2 h-9 w-36 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
  }

  /* ─── 비로그인 ─── */
  if (!user) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        <a href={`/${locale}/login`}
          className="rounded-full px-3 py-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors">
          로그인
        </a>
        <span className="text-neutral-200 dark:text-neutral-700">|</span>
        <a href={`/${locale}/signup`}
          className="rounded-full px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors">
          회원가입
        </a>
      </div>
    )
  }

  /* ─── 로그인 상태 ─── */
  return (
    <div className="flex items-center gap-0.5">

      {/* 회원명+님 */}
      <a href={`/${locale}/account`}
        className="hidden sm:flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap">
        <span>{user.name}</span>
        <span className="text-neutral-500 font-normal">님</span>
      </a>

      {/* 알림 */}
      <div ref={notifRef} className="relative">
        <button type="button" onClick={() => setNotifOpen(v => !v)} aria-label="알림"
          className="relative -m-1 flex items-center justify-center rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <BellIcon />
          <span className="absolute top-2 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10 z-[200] p-4">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">알림</p>
            <p className="text-sm text-neutral-400">새 알림이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 주문/배송 */}
      <a href={`/${locale}/orders`} aria-label="주문/배송" title="주문/배송"
        className="-m-1 flex items-center justify-center rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <PackageIcon />
      </a>

      {/* 마이페이지 */}
      <a href={`/${locale}/account`} aria-label="마이페이지" title="마이페이지"
        className="-m-1 flex items-center justify-center rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <UserIcon />
      </a>

      {/* 로그아웃 */}
      <button type="button" onClick={handleLogout}
        className="ml-1 hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        로그아웃
      </button>
    </div>
  )
}
