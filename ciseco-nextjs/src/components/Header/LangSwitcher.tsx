'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'
import clsx from 'clsx'

export default function LangSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchLang = (next: 'ko' | 'en') => {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <div className={clsx('flex items-center gap-1 text-sm font-medium', className)}>
      <button
        onClick={() => switchLang('ko')}
        disabled={isPending}
        className={clsx(
          'px-2 py-1 rounded-lg transition-colors',
          locale === 'ko'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        )}
      >
        KO
      </button>
      <span className="text-neutral-300 dark:text-neutral-600">|</span>
      <button
        onClick={() => switchLang('en')}
        disabled={isPending}
        className={clsx(
          'px-2 py-1 rounded-lg transition-colors',
          locale === 'en'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        )}
      >
        EN
      </button>
    </div>
  )
}
