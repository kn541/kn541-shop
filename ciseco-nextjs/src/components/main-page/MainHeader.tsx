'use client'

// 메인 페이지 전용 헤더 — 디자인 원본 site-header (전역 Header.tsx 미변경)

import { Link } from '@/components/Link'
import { useAside } from '@/components/aside/aside'
import { HOME_TABS, type HomeNavTab } from '@/data/home-tabs'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { usePathname, useRouter } from '@/i18n/navigation'
import clsx from 'clsx'
import { useLocale, useTranslations } from 'next-intl'
import { FormEventHandler, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const ICON = {
  search: '/images/main-v1/icons/icon-search.svg',
  heart: '/images/main-v1/icons/icon-heart.svg',
  cart: '/images/main-v1/icons/icon-cart.svg',
  my: '/images/main-v1/icons/icon-my.svg',
} as const

const LANGS = [
  { code: 'ko' as const, label: '한국어', flag: MAIN_PAGE_ASSETS.flags.ko },
  { code: 'en' as const, label: 'English', flag: MAIN_PAGE_ASSETS.flags.en },
  { code: 'zh' as const, label: '中文', flag: MAIN_PAGE_ASSETS.flags.cn },
]

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="13" height="7" viewBox="0 0 13 7" fill="none" className={className} aria-hidden>
      <path
        d="M0.200808 0.215664C0.329552 0.0891104 0.504071 0.0180263 0.686029 0.0180263C0.867987 0.0180263 1.04251 0.0891103 1.17125 0.215664L6.40797 5.36969L11.6447 0.215664C11.7286 0.126707 11.8354 0.0616771 11.9537 0.0274245C12.072 -0.00682867 12.1976 -0.00903595 12.317 0.0210348C12.4365 0.0511061 12.5456 0.112342 12.6327 0.19829C12.7198 0.284239 12.7817 0.391719 12.812 0.509406C12.8425 0.626886 12.8403 0.750279 12.8056 0.866643C12.771 0.983008 12.7052 1.08806 12.6151 1.17078L6.89319 6.80236C6.76445 6.92892 6.58993 7 6.40797 7C6.22601 7 6.05149 6.92892 5.92275 6.80236L0.200808 1.17078C0.0722242 1.04407 7.81465e-08 0.872306 8.04303e-08 0.693222C8.27142e-08 0.514136 0.0722242 0.342375 0.200808 0.215664Z"
        fill="#121212"
      />
    </svg>
  )
}

export type MainHeaderProps = {
  categoryTabs: HomeNavTab[]
}

export default function MainHeader({ categoryTabs }: MainHeaderProps) {
  const tAccount = useTranslations('Account')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { open: openAside } = useAside()

  const navTabs = useMemo(() => [...HOME_TABS, ...categoryTabs], [categoryTabs])

  const [q, setQ] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [underline, setUnderline] = useState({ left: 0, width: 0 })
  const innerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (pathname === '/' || pathname === '') {
      setActiveTabIndex(0)
      return
    }
    const idx = navTabs.findIndex((tab) => {
      if (!tab.href || tab.href === '#' || tab.dataTodo) return false
      if (tab.href === '/') return pathname === '/' || pathname === ''
      const base = tab.href.split('?')[0]
      if (pathname === base) return true
      if (base !== '/' && pathname.startsWith(`${base}/`)) return true
      return false
    })
    if (idx >= 0) setActiveTabIndex(idx)
  }, [pathname, navTabs])

  const updateUnderline = useCallback(() => {
    const inner = innerRef.current
    const el = tabRefs.current[activeTabIndex]
    if (!inner || !el) return
    setUnderline({ left: el.offsetLeft, width: el.offsetWidth })
  }, [activeTabIndex])

  useLayoutEffect(() => {
    updateUnderline()
  }, [activeTabIndex, updateUnderline])

  useEffect(() => {
    window.addEventListener('resize', updateUnderline)
    return () => window.removeEventListener('resize', updateUnderline)
  }, [updateUnderline])

  const onSearch: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const openCartOrLogin = useCallback(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.push('/login')
      return
    }
    openAside('cart')
  }, [router, openAside])

  const currentLang = LANGS.find((l) => l.code === locale) ?? LANGS[0]

  return (
    <header
      className="site-header sticky top-0 z-20 flex flex-col bg-white"
      style={{ borderBottom: '1px solid rgba(181, 181, 181, 0.45)' }}
    >
      {/* PC 1행 */}
      <div className="mx-auto hidden w-full max-w-[min(1280px,100%)] items-center justify-between py-[18px] md:flex px-4">
        <Link href="/" className="logo-link block h-[27px] w-[151px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAIN_PAGE_ASSETS.logos.main}
            alt="KN541"
            className="size-full object-contain"
            width={151}
            height={27}
          />
        </Link>
        <div className="header-right-box flex items-center gap-[22px]">
          <form
            role="search"
            className="search-box flex h-[35px] w-[360px] shrink-0 items-center rounded-[5px] border border-kn541-green bg-white"
            onSubmit={onSearch}
          >
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="검색어를 입력해 주세요"
              className="min-w-0 flex-1 border-0 bg-transparent py-0 pr-3 pl-[14px] text-[16px] font-normal text-kn541-black outline-none placeholder:text-[#b5b5b5]"
            />
            <button
              type="submit"
              className="grid h-full w-[53px] flex-[0_0_53px] place-items-center border-0 bg-transparent p-0"
              aria-label="검색"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ICON.search} alt="" width={19} height={19} className="size-[19px]" />
            </button>
          </form>
          <div className="header-actions flex items-center gap-4">
            <Link
              href="/account-wishlists"
              className="block h-[20px] w-[23.72px] p-0"
              title={tAccount('wishlist')}
              aria-label={tAccount('wishlist')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ICON.heart} alt="" width={24} height={20} className="size-full object-contain" />
            </Link>
            <button
              type="button"
              className="block h-[21px] w-[22px] border-0 bg-transparent p-0"
              aria-label="장바구니"
              onClick={openCartOrLogin}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ICON.cart} alt="" width={22} height={21} className="size-full object-contain" />
            </button>
            <Link href="/account" className="block h-[21px] w-[24px] p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ICON.my} alt="" width={24} height={21} className="size-full object-contain" />
            </Link>
          </div>
          <span className="header-divider h-[30px] w-px shrink-0 bg-kn541-black" aria-hidden />
          <div className={clsx('language-select relative', langOpen && 'is-open')} ref={langRef}>
            <button
              type="button"
              className="language-toggle flex h-[35px] w-full items-center gap-2 border-0 bg-transparent p-0 text-[16px] font-normal text-kn541-black"
              aria-expanded={langOpen}
              onClick={(e) => {
                e.stopPropagation()
                setLangOpen((o) => !o)
              }}
            >
              <span className="flex w-full items-center gap-2">
                <ChevronDown className={clsx('transition-transform', langOpen && '-rotate-90')} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentLang.flag}
                  alt=""
                  width={23}
                  height={23}
                  className="size-[23px] rounded-full object-cover"
                />
              </span>
            </button>
            <div
              className={clsx(
                'language-menu absolute top-[31px] right-0 z-[99] w-[105px] overflow-hidden rounded-[5px] border border-[#b5b5b5] bg-white shadow-[0_14px_30px_rgba(18,18,18,0.12)]',
                langOpen ? 'block' : 'hidden'
              )}
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={clsx(
                    'flex h-[35px] w-full items-center gap-2 px-3 text-left text-[16px] font-normal hover:bg-[#ebebeb]',
                    l.code === locale && 'is-selected bg-[rgba(5,195,104,0.15)]'
                  )}
                  onClick={() => {
                    setLangOpen(false)
                    router.replace(pathname, { locale: l.code })
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.flag} alt="" width={23} height={23} className="size-[23px] rounded-full object-cover" />
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 상단 */}
      <div className="mx-auto flex w-full max-w-[min(1280px,100%)] items-center px-5 py-2 md:hidden">
        <Link href="/" className="logo-link block h-[21px] w-[120px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAIN_PAGE_ASSETS.logos.main}
            alt="KN541"
            className="size-full object-contain"
            width={120}
            height={21}
          />
        </Link>
        <form
          className="search-form relative ml-8 flex h-[38px] w-[calc(100%-190px)] min-w-0 items-center rounded-[19px] border-0 bg-kn541-search-bg px-3"
          onSubmit={onSearch}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent pr-[30px] text-[14px] text-[#121212] outline-none placeholder:text-[#9b9b9b]"
            placeholder="검색어를 입력해 주세요"
          />
          <button
            type="submit"
            className="absolute right-2 inline-flex size-5 items-center justify-center border-0 bg-transparent p-0"
            aria-label="검색"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON.search} alt="" width={18} height={18} className="size-[18px]" />
          </button>
        </form>
        <button
          type="button"
          className="btn-cart ml-[15px] border-0 bg-transparent p-0"
          aria-label="장바구니"
          onClick={openCartOrLogin}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON.cart} alt="" width={23} height={22} className="h-[22px] w-[23px]" />
        </button>
      </div>

      {/* 카테고리 네비 */}
      <div className="category-container mx-auto flex w-full max-w-[1280px] items-center justify-between gap-2 px-4 md:px-0">
        <nav className="category-nav flex min-w-0 max-w-[970px] flex-1 items-center overflow-hidden bg-white" aria-label="주요 카테고리">
          <div
            ref={innerRef}
            className="category-nav-inner relative flex h-12 w-full items-center gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {navTabs.map((tab, i) => {
              const active = activeTabIndex === i
              return (
                <button
                  key={tab.key}
                  type="button"
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  className={clsx(
                    'nav-tab flex-shrink-0 cursor-pointer border-0 bg-transparent text-[16px] font-normal leading-[19px] tracking-[-0.02em] text-nowrap',
                    active ? 'font-semibold text-kn541-green' : 'text-kn541-black'
                  )}
                  data-todo={tab.dataTodo ? 'route-tbd' : undefined}
                  onClick={() => {
                    setActiveTabIndex(i)
                    if (tab.dataTodo || tab.href === '#') return
                    router.push(tab.href)
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
            <div
              className="nav-tab-underline pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-t-sm bg-kn541-green transition-[left,width] duration-200 ease-out md:hidden"
              style={{ width: underline.width, transform: `translateX(${underline.left}px)` }}
            />
          </div>
        </nav>
        <div className="category-nav-auth flex shrink-0 items-center gap-1 md:hidden">
          <Link
            href="/login"
            className="nav-auth-btn whitespace-nowrap rounded-[5px] bg-white px-2 py-1 text-[16px] font-normal text-kn541-black"
          >
            로그인
          </Link>
          <div className="nav-line mx-0.5 h-px w-[15px] rotate-90 border border-[#B5B5B5]" aria-hidden />
          <Link
            href="/signup"
            className="nav-auth-btn primary whitespace-nowrap rounded-[5px] bg-white px-2 py-1 text-[16px] font-normal text-kn541-green"
          >
            회원가입
          </Link>
        </div>
      </div>
    </header>
  )
}
