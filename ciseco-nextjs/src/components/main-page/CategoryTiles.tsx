'use client'

import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { Link } from '@/shared/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

type TileKey = 'best' | 'new' | 'reserve' | 'value' | 'office' | 'mall' | 'kn541'

const TILE_ORDER: TileKey[] = ['best', 'new', 'reserve', 'value', 'office', 'mall', 'kn541']

export function CategoryTiles() {
  const t = useTranslations('MainPage')

  const items: {
    key: TileKey
    label: string
    href: string
    img: string
    dataTodo?: string
    /** 백엔드/브랜드 등 후속 라우트용 주석은 소스에만 유지 */
  }[] = [
    {
      key: 'best',
      label: t('tileBest'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.best,
      dataTodo: 'route-tbd',
      // TODO: 백엔드 sort=best 추가 후 실제 목록 라우트로 교체
    },
    { key: 'new', label: t('tileNew'), href: '/products', img: MAIN_PAGE_ASSETS.categories.new },
    {
      key: 'reserve',
      label: t('tileReserve'),
      href: '/products?product_type=002',
      img: MAIN_PAGE_ASSETS.categories.reserve,
    },
    {
      key: 'value',
      label: t('tileValue'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.value,
      dataTodo: 'route-tbd',
      // TODO: 벨류업 페이지 신설 후
    },
    {
      key: 'office',
      label: t('tileOffice'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.office,
      dataTodo: 'route-tbd',
      // TODO: 카테고리 매핑 필요
    },
    { key: 'mall', label: t('tileMall'), href: '/myshop', img: MAIN_PAGE_ASSETS.categories.mall },
    {
      key: 'kn541',
      label: t('tileKn541'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.kn541,
      dataTodo: 'route-tbd',
      // TODO: 브랜드 페이지 신설 후
    },
  ]

  const byKey = Object.fromEntries(items.map((i) => [i.key, i])) as Record<
    TileKey,
    (typeof items)[0]
  >

  return (
    <div
      className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-7 sm:gap-4 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
      aria-label={t('tilesAria')}
    >
      {TILE_ORDER.map((key) => {
        const item = byKey[key]
        const inner = (
          <>
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 sm:h-16 sm:w-16 dark:bg-neutral-800">
              <Image src={item.img} alt="" width={64} height={64} className="object-contain" />
            </span>
            <span className="mt-2 max-w-[4.5rem] text-center text-[11px] font-medium text-neutral-800 sm:max-w-none sm:text-xs dark:text-neutral-200">
              {item.label}
            </span>
          </>
        )
        if (item.href === '#' || item.dataTodo) {
          return (
            <a
              key={key}
              href={item.href}
              data-todo={item.dataTodo}
              className="flex min-w-[4.5rem] shrink-0 flex-col items-center sm:min-w-0"
            >
              {inner}
            </a>
          )
        }
        return (
          <Link
            key={key}
            href={item.href}
            className="flex min-w-[4.5rem] shrink-0 flex-col items-center sm:min-w-0"
          >
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
