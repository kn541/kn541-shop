// KN541 쇼핑몰 — 로고 컴포넌트
// Supabase Storage logos/logo1.svg 사용

import { Link } from '@/components/Link'
import Image from 'next/image'
import React from 'react'

// ★ 새 로고 URL (Supabase Storage logos 버킷)
const LOGO_URL = 'https://qxmcbdqmmiyrrhenufaj.supabase.co/storage/v1/object/public/logos/logo1.svg'

export interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt="KN541"
        style={{ height: '40px', width: 'auto' }}
        className="object-contain"
      />
    </Link>
  )
}

export default Logo
