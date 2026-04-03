'use client'
// KN541 쇼핑몰 — 검색 팝오버
// 폼을 화면 정중앙에 노출 (max-w-2xl, mx-auto)

import { useRouter } from '@/i18n/navigation'
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { Divider } from '../Divider'

const SearchBtnPopover = () => {
  const t = useTranslations('Search')
  const router = useRouter()

  return (
    <Popover>
      <PopoverButton className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800">
        <HugeiconsIcon icon={Search01Icon} size={22} color="currentColor" strokeWidth={1.5} />
      </PopoverButton>

      <PopoverPanel
        transition
        className="header-popover-full-panel absolute inset-x-0 top-0 -z-10 bg-white/95 backdrop-blur-sm pt-20 text-neutral-950 shadow-2xl transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 dark:border-b dark:border-white/10 dark:bg-neutral-900/95 dark:text-neutral-100"
      >
        <div className="container mx-auto px-4">
          {/* 검색 폼: 화면 정중앙 */}
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400">
              상품 검색
            </p>
            <form
              className="flex w-full max-w-2xl items-center rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:border-neutral-400 focus-within:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-500"
              onSubmit={(e) => {
                e.preventDefault()
                const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim()
                if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
                else router.push('/search')
              }}
            >
              <HugeiconsIcon icon={Search01Icon} size={22} color="currentColor" strokeWidth={1.5} className="shrink-0 text-neutral-400" />
              <input
                data-autofocus
                autoFocus
                type="text"
                className="flex-1 !border-none bg-transparent px-3 py-0.5 text-base !ring-0 placeholder:text-neutral-300 focus-visible:outline-none dark:placeholder:text-neutral-600"
                name="q"
                placeholder="찾으시는 상품을 검색하세요..."
                aria-label={t('ariaLabel')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <CloseButton className="-m-1 inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-neutral-400 transition-all duration-200 hover:rotate-90 hover:text-neutral-900 dark:hover:text-white">
                <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" strokeWidth={1.5} />
              </CloseButton>
            </form>
            <p className="mt-3 text-xs text-neutral-300 dark:text-neutral-600">
              Enter 키로 검색 · ESC로 닫기
            </p>
          </div>

          <Divider className="my-2 block md:hidden" />
          <div className="block pb-4 text-xs/6 text-neutral-500 md:hidden">{t('searchMobileHelp')}</div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

export default SearchBtnPopover
