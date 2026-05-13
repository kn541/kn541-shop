'use client'

// 정렬 메뉴 — next-intl + URL ?sort= 연동
// KN541: 최신순 | 판매량순 | 상품평순 | 낮은가격순 | 높은가격순

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrangeByLettersAZIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import { FC, Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

import {
  PRODUCT_SORT_VALUES,
  type ProductSortValue,
  normalizeProductSortParam,
} from '@/lib/product-list-sort'

type SortOption = { name: string; value: ProductSortValue }

type Props = {
  className?: string
  /** 데모/특수 페이지용으로만 사용. 기본은 번역된 KN541 5종 정렬 */
  filterOptions?: SortOption[]
}

export const FilterSortByMenuListBox: FC<Props> = ({ className, filterOptions }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('ProductSort')

  const defaultOptions: SortOption[] = useMemo(
    () =>
      PRODUCT_SORT_VALUES.map((value) => ({
        value,
        name: t(value),
      })),
    [t],
  )

  const options = filterOptions ?? defaultOptions
  const optionValues = new Set(options.map((o) => o.value))

  const rawSort = searchParams.get('sort')
  const normalizedFromUrl = normalizeProductSortParam(rawSort)
  const currentSort = optionValues.has(normalizedFromUrl) ? normalizedFromUrl : options[0].value

  const [selectedOption, setSelectedOption] = useState(currentSort)

  useEffect(() => {
    setSelectedOption(currentSort)
  }, [currentSort])

  const handleChange = (value: ProductSortValue) => {
    setSelectedOption(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectedLabel = options.find((item) => item.value === selectedOption)?.name ?? options[0].name

  return (
    <div className={clsx('product-sort-by-list-box flex shrink-0', className)}>
      <Listbox value={selectedOption} onChange={handleChange}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
              'ring-1 ring-neutral-300 dark:ring-neutral-700',
            )}
          >
            <HugeiconsIcon icon={ArrangeByLettersAZIcon} size={18} />
            <span className="ms-2">{selectedLabel}</span>
            <ChevronDownIcon className="ml-3 size-4" aria-hidden="true" />
          </ListboxButton>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <ListboxOptions className="absolute right-0 z-50 mt-2 max-h-60 w-52 overflow-auto rounded-xl bg-white py-1 text-sm text-neutral-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700">
              {options.map((item) => (
                <ListboxOption
                  key={item.value}
                  className={({ focus: active }) =>
                    clsx(
                      'relative flex cursor-default py-2 ps-10 pe-4 select-none',
                      active && 'bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-neutral-200',
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
