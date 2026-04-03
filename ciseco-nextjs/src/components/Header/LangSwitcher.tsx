'use client'
// KN541 쇼핑몰 — 언어 선택 (국기 아이콘 + 드롭다운 레이어)
// 한국 🇰🇷 / 미국 🇺🇸 / 중국 🇨🇳 국기 클릭 시 레이어 팝오버

import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useTransition, useState, useRef, useEffect } from 'react'

const LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', name: '한국' },
  { code: 'en', label: 'English', flag: '🇺🇸', name: 'USA' },
  { code: 'zh', label: '中文',    flag: '🇨🇳', name: '中国' },
] as const

type LangCode = (typeof LANGS)[number]['code']

export default function LangSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGS.find(l => l.code === locale) ?? LANGS[0]

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLang = (code: LangCode) => {
    setOpen(false)
    startTransition(() => {
      router.replace(pathname, { locale: code })
    })
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      {/* 현재 국기 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        aria-label="언어 선택"
        className="flex items-center gap-1 rounded-full px-2 py-1.5 text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors select-none"
      >
        <span>{current.flag}</span>
        <svg
          className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 레이어 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10 z-[200] overflow-hidden">
          {LANGS.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => switchLang(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors
                ${locale === lang.code
                  ? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700'
                }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs text-neutral-400">{lang.label}</div>
              </div>
              {locale === lang.code && (
                <svg className="ml-auto w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
