/**
 * 메인 헤더 카테고리 네비 — 디자인 원본 index.html + cursor_작업지시_디자인정합성_v1.md
 * 6개 홈 탭 + 11개 카테고리 = 17개 한 줄(가로 스크롤)
 */

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

export const CATEGORY_TABS: HomeNavTab[] = [
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

export const MAIN_NAV_TABS: HomeNavTab[] = [...HOME_TABS, ...CATEGORY_TABS]
