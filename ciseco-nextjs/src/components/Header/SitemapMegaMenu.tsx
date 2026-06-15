'use client'

// KN541 쇼핑몰 — 상단 메뉴바 "바로가기" 메가메뉴 (데스크톱 lg 이상)
// 클릭 시 헤더 하단 전체폭 패널로 사이트맵 노출.
// 로그인 상태(useHeaderUser) + 회원등급(useEffectiveUserType)에 따라 마이페이지 항목을 동적으로 노출.
// 패널 위치: 부모(헤더, sticky)를 기준으로 absolute inset-x-0 top-full → 헤더 하단 전체폭.

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { useLocale } from 'next-intl'
import { Link } from '@/components/Link'
import { useHeaderUser } from '@/hooks/useHeaderUser'
import { useEffectiveUserType } from '@/hooks/useEffectiveUserType'
import { getSitemap, type SitemapGroup, type SitemapItem } from '@/data/sitemap'

export default function SitemapMegaMenu() {
  const locale = useLocale()
  const sm = getSitemap(locale)
  const { isMounted, isLoggedIn } = useHeaderUser()
  const { isPaidMember, isGeneralMember } = useEffectiveUserType()

  const filterItems = (items: SitemapItem[]) =>
    items.filter((it) => {
      if (it.visibility === 'paidOnly') return isPaidMember
      if (it.visibility === 'generalOnly') return isGeneralMember
      return true
    })

  const renderGroupBody = (group: SitemapGroup, close: () => void) => {
    // 로그인 후에만 의미있는 그룹인데 비로그인 상태 → 로그인 안내
    if (group.authOnly && isMounted && !isLoggedIn) {
      return (
        <div className="mt-3 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/60">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{sm.loginPrompt}</p>
          <Link
            href="/login"
            onClick={() => close()}
            className="mt-2 inline-flex rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            {sm.loginCta}
          </Link>
        </div>
      )
    }

    const items = group.authOnly ? filterItems(group.items) : group.items
    return (
      <ul className="mt-3 space-y-2.5">
        {items.map((it) => (
          <li key={it.label + it.href}>
            <Link
              href={it.href}
              onClick={() => close()}
              className="text-sm text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Popover className="group flex-shrink-0">
      <PopoverButton className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-primary-600 transition-colors hover:bg-primary-50 focus:outline-hidden dark:text-primary-400 dark:hover:bg-primary-900/20">
        {sm.shortcut}
        <ChevronDownIcon className="size-4 transition-transform group-data-open:rotate-180" aria-hidden="true" />
      </PopoverButton>

      <Transition
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <PopoverPanel className="header-popover-full-panel absolute inset-x-0 top-full z-[100] w-full">
          {({ close }) => (
            <div className="border-t border-neutral-100 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
                  {sm.groups.map((group) => (
                    <div key={group.heading}>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {group.heading}
                      </p>
                      {renderGroupBody(group, close)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}
