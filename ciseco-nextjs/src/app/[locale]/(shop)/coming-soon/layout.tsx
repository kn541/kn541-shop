// 빌드 시 API 호출로 인한 SSG 타임아웃 방지
export const dynamic = 'force-dynamic'

import Header from '@/components/Header/Header'
import { FC } from 'react'
import { ApplicationLayout } from '../application-layout'

interface Props {
  children?: React.ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <ApplicationLayout header={<Header />} footer={<div />}>
      {children}
    </ApplicationLayout>
  )
}

export default Layout
