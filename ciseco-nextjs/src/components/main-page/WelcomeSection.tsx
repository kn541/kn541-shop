'use client'

// 디자인 원본 .welcome + .quick-icons (순서: best → mall → new → reserve → value → office → kn541)

import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { Link } from '@/shared/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import './kn541-main.css'

const QUICK_ORDER = ['best', 'mall', 'new', 'reserve', 'value', 'office', 'kn541'] as const
type QuickKey = (typeof QUICK_ORDER)[number]

export function WelcomeSection() {
  const t = useTranslations('MainPage')
  const [active, setActive] = useState<QuickKey>('best')

  const tiles: Record<
    QuickKey,
    { label: string; href: string; img: string; todo?: boolean }
  > = {
    best: {
      label: t('tileBest'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.best,
      todo: true,
    },
    mall: { label: t('tileMall'), href: '/myshop', img: MAIN_PAGE_ASSETS.categories.mall },
    new: { label: t('tileNew'), href: '/products', img: MAIN_PAGE_ASSETS.categories.new },
    reserve: {
      label: t('tileReserve'),
      href: '/products?product_type=002',
      img: MAIN_PAGE_ASSETS.categories.reserve,
    },
    value: {
      label: t('tileValueShort'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.value,
      todo: true,
    },
    office: {
      label: t('tileOfficeShort'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.office,
      todo: true,
    },
    kn541: {
      label: t('tileKn541'),
      href: '#',
      img: MAIN_PAGE_ASSETS.categories.kn541,
      todo: true,
    },
  }

  return (
    <section className="welcome container mx-auto px-4 pt-[72px] pb-[34px]">
      <div className="welcome-mobile mb-6 flex items-center justify-between rounded-[5px] border border-kn541-green px-5 py-2.5 text-[14px] font-normal leading-[17px] tracking-[-0.02em] text-kn541-green md:hidden">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
          <path
            fill="#05C368"
            d="M2.63 10.13H5.97V6.78H2.63v3.35zm1.23-2.11h.87v.87h-.87v-.87zm0 4.23h.87v.87h-.87v-.87zm2.97 0h3.33v-3.35H6.83v3.35zm1.24-2.11h.87v.87h-.87v-.87zm2.97 0h3.34v-3.35h-3.34v3.35zm1.23-2.11h.87v.87h-.87v-.87zM6.83 6.78h3.34V3.43H6.83v3.35zm1.24-2.12h.87v.87h-.87v-.87zm4.2-3.51h-.45V0H9.86v.96H3.86V0H2.63v.96H2.18C.98.96 0 1.95 0 3.16v11.65C0 16.01.98 17 2.18 17h12.64c1.2 0 2.18-.99 2.18-2.19V3.16C17 1.95 16.02.96 14.82.96zm-12.64 1.25h12.64c.52 0 .95.42.95.95v.98H1.24V3.16c0-.52.41-.95.94-.95zm12.64 13.55H2.18c-.52 0-.95-.42-.95-.95V5.38h15.76v9.43c0 .52-.41.95-.94.95h.03z"
          />
        </svg>
        <span>{t('welcomePromoLine')}</span>
        <svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden>
          <path
            d="M0.25 14.77c-.15-.15-.23-.35-.23-.57s.09-.41.25-.57L6.28 7.51.25 1.39C-.02 1.13-.02.74.25.48c.13-.13.3-.2.48-.2s.35.07.48.2l6.58 6.69c.16.16.24.36.24.58s-.09.42-.24.57L1.37 14.77c-.15.15-.35.23-.56.23-.22 0-.41-.07-.56-.23z"
            fill="#05C368"
          />
        </svg>
      </div>
      <p className="eyebrow mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 md:hidden">
        {t('welcomeEyebrow')}
      </p>
      <h2 className="welcome-description mx-auto mt-2 max-w-xl text-center text-[16px] font-medium text-kn541-black md:hidden">
        {t('welcomeTitle')}
      </h2>
      <h2 className="welcome-description mt-8 hidden text-center text-[16px] font-normal text-[#999] md:block">
        {t('welcomeTitle')}
      </h2>

      <div className="quick-icons" aria-label={t('tilesAria')}>
        {QUICK_ORDER.map((key) => {
          const item = tiles[key]
          const body = (
            <>
              <span className="icon-wrap">
                <Image src={item.img} alt="" width={75} height={75} className="object-contain" />
              </span>
              {item.label}
            </>
          )
          const cls = active === key ? 'quick-icon is-active' : 'quick-icon'
          if (item.todo) {
            return (
              <button
                key={key}
                type="button"
                className={cls}
                data-todo="route-tbd"
                onClick={() => setActive(key)}
              >
                {body}
              </button>
            )
          }
          return (
            <Link
              key={key}
              href={item.href}
              className={cls}
              onClick={() => setActive(key)}
            >
              {body}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
