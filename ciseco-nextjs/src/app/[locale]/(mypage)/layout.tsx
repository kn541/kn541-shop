import type { ReactNode } from 'react'
import BottomTabBar from '@/components/mypage/BottomTabBar'

export default function MypageLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-mypage-root
      style={{
        minHeight: '100vh',
        background: 'var(--mp-color-bg)',
        paddingBottom: 64,
      }}
    >
      {children}
      <BottomTabBar />
    </div>
  )
}
