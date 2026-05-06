import MainHeader from '@/components/main-page/MainHeader'
import { ApplicationLayout } from '../application-layout'
import { buildMainCategoryTabs, FALLBACK_CATEGORY_TABS } from '@/data/home-tabs'
import { getRootCategories } from '@/lib/api/categories'

export default async function Layout({ children }: { children: React.ReactNode }) {
  let categoryTabs = FALLBACK_CATEGORY_TABS
  try {
    const roots = await getRootCategories()
    const built = buildMainCategoryTabs(roots)
    if (built.length > 0) categoryTabs = built
  } catch {
    /* API 실패 시 정적 폴백 */
  }

  return (
    <ApplicationLayout header={<MainHeader categoryTabs={categoryTabs} />}>{children}</ApplicationLayout>
  )
}
