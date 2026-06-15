'use client'

// KN541 쇼핑몰 — 모바일 햄버거 사이드바 "사이트맵" 섹션
// 카테고리 네비 하단에 그룹별 접기/펼치기(Disclosure)로 노출.
// 로그인 상태(useHeaderUser) + 회원등급(useEffectiveUserType) 연동.
// 링크 클릭 시 useClose()로 사이드바 자동 닫힘.
// 구분: 그룹 사이에 옅은 가로 헤어라인(보일듯 말듯).

import { Disclosure, DisclosureButton, DisclosurePanel, useClose } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { useLocale } from 'next-intl'
import { Link } from '@/shared/link'
import { useHeaderUser } from '@/hooks/useHeaderUser'
import { useEffectiveUserType } from '@/hooks/useEffectiveUserType'
import { getSitemap, type SitemapGroup, type SitemapItem } from '@/data/sitemap'

export default function SitemapMobileSection() {
  const locale = useLocale()
  const sm = getSitemap(locale)
  const close = useClose()
  const { isMounted, isLoggedIn } = useHeaderUser()
  const { isPaidMember, isGeneralMember } = useEffectiveUserType()

  const filterItems = (items: SitemapItem[]) =>
    items.filter((it) => {
      if (it.visibility === 'paidOnly') return isPaidMember
      if (it.visibility === 'generalOnly') return isGeneralMember
      return true
    })

  const renderGroupBody = (group: SitemapGroup) => {
    if (group.authOnly && isMounted && !isLoggedIn) {
      return (
        <li className="px-3 py-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{sm.loginPrompt}</span>
          <Link
            href="/login"
            onClick={close}
            className="ml-1 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            {sm.loginCta}
          </Link>
        </li>
      )
    }

    const items = group.authOnly ? filterItems(group.items) : group.items
    return items.map((it) => (
      <li key={it.label + it.href}>
        <Link
          href={it.href}
          onClick={close}
          className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {it.label}
        </Link>
      </li>
    ))
  }

  return (
    <div className="border-t border-neutral-200 px-2 py-4 dark:border-neutral-700">
      <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {sm.title}
      </p>
      <ul className="flex flex-col">
        {sm.groups.map((group) => (
          <Disclosure
            key={group.heading}
            as="li"
            className="border-t border-neutral-100 first:border-t-0 dark:border-neutral-800/70"
          >
            <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800">
              <span>{group.heading}</span>
              <ChevronDownIcon
                className="h-4 w-4 text-neutral-500 transition-transform group-data-open:rotate-180"
                aria-hidden="true"
              />
            </DisclosureButton>
            <DisclosurePanel as="ul" className="pb-1 pl-3">
              {renderGroupBody(group)}
            </DisclosurePanel>
          </Disclosure>
        ))}
      </ul>
    </div>
  )
}
