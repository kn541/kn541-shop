import CartBtn from './CartBtn'
import { HamburgerBtnMenu } from './HamburgerBtnMenu'
import Logo from '../Logo'
import { SearchBtnPopover } from './SearchBtnPopover'
import LangSwitcher from './LangSwitcher'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm dark:bg-neutral-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 좌측: 로고 */}
        <Logo />

        {/* 우측: 언어전환 + 검색 + 장바구니 + 햄버거 */}
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <SearchBtnPopover />
          <CartBtn />
          <HamburgerBtnMenu className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}
