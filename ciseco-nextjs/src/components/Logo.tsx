'use client'

// KN541 쇼핑몰 — 로고 컴포넌트
// Supabase Storage assets 버킷의 CI 로고 사용 (admin/shop/scm 공통)
// 다크/라이트 모드 자동 전환 (.dark 클래스 + prefers-color-scheme 감지)

import { Link } from '@/components/Link'
import React, { useEffect, useState } from 'react'

// KN541 CI 로고 (Supabase 공용 자산) - admin/shop/scm 공통 사용
const LOGO_LIGHT_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/assets/kn541-logo.png'
const LOGO_DARK_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/assets/kn541-logo-dark.png'

export interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  // 다크 모드 감지: Tailwind html.dark 클래스 우선, 없으면 OS 설정
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const detectDark = () => {
      const htmlHasDark = document.documentElement.classList.contains('dark')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(htmlHasDark || prefersDark)
    }

    detectDark()

    // .dark 클래스 토글 감지 (수동 다크 모드 전환 대응)
    const observer = new MutationObserver(detectDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // 시스템 prefers-color-scheme 변경 감지
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', detectDark)

    return () => {
      observer.disconnect()
      media.removeEventListener('change', detectDark)
    }
  }, [])

  const logoSrc = isDark ? LOGO_DARK_URL : LOGO_LIGHT_URL

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="KN541"
        style={{ height: '40px', width: 'auto' }}
        className="object-contain"
      />
    </Link>
  )
}

export default Logo
