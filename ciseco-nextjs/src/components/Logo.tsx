// KN541 쇼핑몰 — 로고 컴포넌트
// public/kn541-logo.png 이미지 사용 (Cursor에서 실제 PNG로 교체 필요)

import { Link } from '@/components/Link'
import Image from 'next/image'
import React from 'react'

export interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/kn541-logo.png"
        alt="KN541"
        width={120}
        height={40}
        className="h-9 w-auto object-contain"
        priority
      />
    </Link>
  )
}

export default Logo
