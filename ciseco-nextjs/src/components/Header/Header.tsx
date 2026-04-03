// KN541 쇼핑몰 — 헤더
// 1행: [로고] | [검색(중앙 팝오버)] | [국기드롭다운] [알림] [주문배송] [장바구니] [로그인/회원명+님] [마이페이지]
// 2행: 카테고리 네비

import Logo from '@/components/Logo'
import CartBtn from './CartBtn'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import LangSwitcher from './LangSwitcher'
import SearchBtnPopover from './SearchBtnPopover'
import CategoryNav from './CategoryNav'
import HeaderUserActions from './HeaderUserActions'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-neutral-900">
      {/* 1행: 로고 + 우측 액션들 */}
      <div className="container mx-auto flex h-14 items-center justify-between px-4 gap-2">

        {/* 좌측: 로고 */}
        <Logo />

        {/* 우측: 전체 액션 영역 */}
        <div className="flex items-center gap-1">

          {/* 검색 버튼 (클릭 시 중앙 폼 팝오버) */}
          <SearchBtnPopover />

          {/* 구분선 */}
          <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          {/* 언어선택 (국기 드롭다운) */}
          <LangSwitcher />

          {/* 구분선 */}
          <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          {/* 회원 액션: 로그인/회원명+님/알림/주문배송/마이페이지 */}
          <HeaderUserActions />

          {/* 구분선 */}
          <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

          {/* 장바구니 */}
          <CartBtn />

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
