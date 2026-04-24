// KN541 전체 페이지 로딩 스피너 컴포넌트
// 로고 회전 + 페이드 애니메이션

import React from 'react'

const LOGO_URL = 'https://qxmcbdqmmiyrrhenufaj.supabase.co/storage/v1/object/public/brands/white_logo.png'

export default function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-900 transition-opacity duration-300">
      {/* 로고 + 회전 애니메이션 */}
      <div className="relative flex items-center justify-center">
        {/* 회전 링 */}
        <div className="absolute h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-primary-500 border-r-primary-300" />
        {/* 로고 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt="KN541"
          className="h-10 w-auto animate-pulse"
        />
      </div>
      {/* 로딩 텍스트 */}
      <p className="mt-6 text-sm text-neutral-400 dark:text-neutral-500 animate-pulse">
        로딩 중...
      </p>
    </div>
  )
}
