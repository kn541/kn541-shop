import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '비밀번호 변경',
  description: '계정 비밀번호 변경',
}

export default function AccountPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
