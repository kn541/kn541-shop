import Logo from '@/components/Logo'
import CartBtn from './CartBtn'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import LangSwitcher from './LangSwitcher'
import SearchBtnPopover from './SearchBtnPopover'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm dark:bg-neutral-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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
    </header>
  )
}
