import MainHeader from '@/components/main-page/MainHeader'
import { ApplicationLayout } from '../application-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApplicationLayout header={<MainHeader />}>{children}</ApplicationLayout>
}
