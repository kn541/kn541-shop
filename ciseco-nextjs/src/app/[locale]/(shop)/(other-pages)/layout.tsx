// 빌드 시 API 호출로 인한 SSG 타임아웃 방지
export const dynamic = 'force-dynamic'

import { ApplicationLayout } from '../application-layout'

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
