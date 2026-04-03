// KN541 쇼핑몰 — 헤더 컴포넌트
// 구조:
//   1행: 로고 | (flex-1 공간) | LangSwitcher + SearchBtn + CartBtn
//   2행: 카테고리 네비 (1단 가로 나열, 마우스오버 2단 드롭다운)

import Logo from '@/components/Logo'
import CartBtn from './CartBtn'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import LangSwitcher from './LangSwitcher'
import SearchBtnPopover from './SearchBtnPopover'
import CategoryNav from './CategoryNav'

export default function Header() {
  return (
    // z-50: 드롭다운(z-[100])이 항상 위에 오도록 헤더도 충분히 높게
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-neutral-900">
      {/* 1행: 로고 + 우측 버튼들 */}
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <SearchBtnPopover />
          <CartBtn />
          <div className="lg:hidden">
            <HamburgerBtnMenu />
          </div>
        </div>
      </div>

      {/* 2행: 카테고리 네비 — overflow-visible 필수 (드롭다운이 아래로 나와야 함) */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 overflow-visible">
        <div className="container mx-auto px-4 py-1 overflow-visible">
          <CategoryNav />
        </div>
      </div>
    </header>
  )
}
