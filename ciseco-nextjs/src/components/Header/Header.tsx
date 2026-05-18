// KN541 쇼핑몰 — 헤더
// 1행 (3열 그리드): 좌(로고) | 중(검색폼) | 우(장바구니·로그인or마이페이지·태극기)
// 2행: 카테고리 네비 (홈 + 카테고리 DB + 사전예약/벨류업)

import Logo from '@/components/Logo'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import LangSwitcher from './LangSwitcher'
import SearchBox from './SearchBox'
import CategoryNav from './CategoryNav'
import HeaderUserBar from './HeaderUserBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-neutral-900">
      {/* 1행: 좌 로고 / 중 검색 / 우 유틸 (3열 그리드) */}
      <div className="container mx-auto grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4 px-4">

        {/* 좌: 로고 */}
        <Logo />

        {/* 중: 검색폼 (가운데 항상 표시, 모바일에선 숨김) */}
        <div className="hidden md:flex w-full justify-center">
          <SearchBox />
        </div>
        {/* 모바일에서 grid 균형 유지용 빈 칸 */}
        <div className="md:hidden" />

        {/* 우: 회원명 / 장바구니 / 로그인·회원가입 또는 로그아웃·마이페이지 / 구분선 / 태극기 */}
        <div className="flex items-center gap-1 sm:gap-2">

          <HeaderUserBar />

          {/* 구분선 */}
          <span className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          {/* 언어선택 (태극기 드롭다운) */}
          <LangSwitcher />

          {/* 모바일 햄버거 */}
          <div className="lg:hidden ml-1">
            <HamburgerBtnMenu />
          </div>
        </div>
      </div>

      {/* 2행: 카테고리 네비 */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 overflow-visible">
        <div className="container mx-auto px-4 py-1 overflow-visible">
          <CategoryNav />
        </div>
      </div>
    </header>
  )
}
