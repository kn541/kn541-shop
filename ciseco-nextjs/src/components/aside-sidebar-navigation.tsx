// KN541 쇼핑몰 — 모바일 사이드바 네비게이션
// getNavigation() 정적 데이터 → KN541 카테고리 API 데이터로 교체
// URL: /ko/products?cid=UUID 방식 사용

import { getCategories } from '@/lib/api/categories'
import SidebarNavigation from './Header/Navigation/SidebarNavigation'
import Aside from './aside'
import type { TNavigationItem } from '@/data/navigation'

interface Props {
  className?: string
}

const AsideSidebarNavigation = async ({ className }: Props) => {
  // KN541 카테고리 API에서 동적 로드
  let navigationMenu: TNavigationItem[] = []
  try {
    const allCats = await getCategories()

    // depth=1 카테고리 → TNavigationItem 변환
    const depth1 = allCats
      .filter((c) => c.depth === 1 && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)

    navigationMenu = depth1.map((cat) => {
      // depth=2 자식 (children 배열 또는 flat에서 parent_id 기준)
      const children: TNavigationItem[] =
        (cat.children ?? allCats.filter((c) => c.parent_id === cat.id && c.is_active))
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((sub: any) => ({
            id: String(sub.id),
            name: sub.category_name,
            href: `/ko/products?cid=${sub.id}`,
          }))

      return {
        id: String(cat.id),
        name: cat.category_name,
        href: `/ko/products?cid=${cat.id}`,
        ...(children.length > 0 ? { type: 'dropdown' as const, children } : {}),
      }
    })
  } catch {
    // 폴백: 빈 메뉴
    navigationMenu = []
  }

  return (
    <Aside openFrom="right" type="sidebar-navigation" logoOnHeading contentMaxWidthClassName="max-w-md">
      <div className="flex h-full flex-col">
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
          <SidebarNavigation data={navigationMenu} />
        </div>
      </div>
    </Aside>
  )
}

export default AsideSidebarNavigation
