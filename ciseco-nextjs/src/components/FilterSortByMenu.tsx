'use client'

// 정렬 메뉴 — 한국어 + URL 쿼리 파라미터 연동
// fix: 영어 정렬 옵션 → 한국어
// feat: useRouter로 ?sort=xxx URL 파라미터 업데이트 → page.tsx에서 백엔드 전달

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrangeByLettersAZIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC, Fragment, useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// ★ 한국어 정렬 옵션
export const SORT_OPTIONS = [
  { name: '최신순', value: 'newest' },
  { name: '가격 낮은순', value: 'price_asc' },
  { name: '가격 높은순', value: 'price_desc' },
  { name: '오래된순', value: 'oldest' },
  { name: '상품명 ㄱ-ㅎ', value: 'name_asc' },
  { name: '상품명 ㅎ-ㄱ', value: 'name_desc' },
]

type Props = {
  className?: string
  filterOptions?: { name: string; value: string }[]
}

export const FilterSortByMenuListBox: FC<Props> = ({ className, filterOptions = SORT_OPTIONS }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL의 sort 파라미터와 동기화
  const currentSort = searchParams.get('sort') || filterOptions[0].value
  const [selectedOption, setSelectedOption] = useState(currentSort)

  useEffect(() => {
    setSelectedOption(currentSort)
  }, [currentSort])

  const handleChange = (value: string) => {
    setSelectedOption(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    // ★ 정렬 변경 시 page=1로 초기화
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={clsx('product-sort-by-list-box flex shrink-0', className)}>
      <Listbox value={selectedOption} onChange={handleChange}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
              'ring-1 ring-neutral-300 dark:ring-neutral-700'
            )}
          >
            <HugeiconsIcon icon={ArrangeByLettersAZIcon} size={18} />
            <span className="ms-2">{filterOptions.find((item) => item.value === selectedOption)?.name ?? filterOptions[0].name}</span>
            <ChevronDownIcon className="ml-3 size-4" aria-hidden="true" />
          </ListboxButton>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <ListboxOptions className="absolute right-0 z-50 mt-2 max-h-60 w-52 overflow-auto rounded-xl bg-white py-1 text-sm text-neutral-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700">
              {filterOptions.map((item) => (
                <ListboxOption
                  key={item.value}
                  className={({ focus: active }) =>
                    clsx(
                      'relative flex cursor-default py-2 ps-10 pe-4 select-none',
                      active && 'bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-neutral-200'
                    )
                  }
                  value={item.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={clsx('block truncate', selected && 'font-medium')}>{item.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-primary-700 dark:text-neutral-200">
                          <CheckIcon className="size-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
