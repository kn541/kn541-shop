// KN541 쇼핑몰 — 로고 컴포넌트
// Supabase Storage brands/white_logo.png 사용

import { Link } from '@/components/Link'
import Image from 'next/image'
import React from 'react'

const LOGO_URL = 'https://qxmcbdqmmiyrrhenufaj.supabase.co/storage/v1/object/public/brands/white_logo.png'

export interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src={LOGO_URL}
        alt="KN541"
        width={400}
        height={133}
        style={{ height: '36px', width: 'auto' }}
        className="object-contain"
        priority
      />
    </Link>
  )
}

export default Logo
