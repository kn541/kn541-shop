/**
 * 메인 헤더 카테고리 네비 — 디자인 원본 index.html + cursor_작업지시_디자인정합성_v1.md
 * 6개 홈 탭 + 11개 카테고리 = 17개 한 줄(가로 스크롤)
 * 카테고리 슬롯은 getRootCategories() + buildMainCategoryTabs()로 채움; API 실패 시 FALLBACK_CATEGORY_TABS
 */

import type { Category } from '@/lib/api/categories'

export type HomeNavTab = {
  key: string
  label: string
  href: string
  dataTodo?: boolean
}

export const HOME_TABS: HomeNavTab[] = [
  { key: 'home', label: '홈', href: '/' },
  { key: 'best', label: '베스트상품', href: '#', dataTodo: true },
  { key: 'new', label: '신상품', href: '/products' },
  { key: 'recommend', label: '추천상품', href: '#', dataTodo: true },
  { key: 'reserve', label: '사전예약상품', href: '/products?product_type=002' },
  { key: 'valueup', label: '벨류업상품', href: '#', dataTodo: true },
]

/** API 장애 시 메인 헤더 카테고리 탭 폴백(정적 11건, href는 기존과 동일 # + dataTodo) */
export const FALLBACK_CATEGORY_TABS: HomeNavTab[] = [
  { key: 'home-deco', label: '생활/홈데코', href: '#', dataTodo: true },
  { key: 'appliance', label: '가전/컴퓨터/디지털', href: '#', dataTodo: true },
  { key: 'kitchen', label: '주방용품', href: '#', dataTodo: true },
  { key: 'beauty', label: '뷰티', href: '#', dataTodo: true },
  { key: 'sports', label: '자동차/스포츠', href: '#', dataTodo: true },
  { key: 'kids', label: '유아동/주니어', href: '#', dataTodo: true },
  { key: 'travel', label: '여행', href: '#', dataTodo: true },
  { key: 'fashion', label: '패션/잡화', href: '#', dataTodo: true },
  { key: 'health', label: '건강/헬스', href: '#', dataTodo: true },
  { key: 'outdoor', label: '캠핑/등산/낚시', href: '#', dataTodo: true },
  { key: 'food', label: '식품', href: '#', dataTodo: true },
]

export const MAIN_NAV_TABS: HomeNavTab[] = [...HOME_TABS, ...FALLBACK_CATEGORY_TABS]

/** depth=1 루트 카테고리 → 컬렉션 페이지 링크(쇼 라우트 `/collections/[handle]`과 동일 패턴) */
export function buildMainCategoryTabs(categories: Category[]): HomeNavTab[] {
  return [...categories]
    .filter((c) => c.is_active && c.depth === 1)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      key: c.category_code,
      label: c.category_name,
      href: `/collections/${c.category_code}`,
    }))
}
