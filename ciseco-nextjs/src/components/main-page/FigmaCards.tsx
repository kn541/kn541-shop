import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/shared/link'

const FIGMA_ORDER = [
  MAIN_PAGE_ASSETS.featured.figma.rice,
  MAIN_PAGE_ASSETS.featured.figma.shampoo,
  MAIN_PAGE_ASSETS.featured.figma.blueBooks,
  MAIN_PAGE_ASSETS.featured.figma.orangeBooks,
  MAIN_PAGE_ASSETS.featured.figma.tumbler,
] as const

export async function FigmaCards() {
  const t = await getTranslations('MainPage')

  return (
    <section className="container mx-auto px-4 py-6" aria-label={t('figmaAria')}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        {FIGMA_ORDER.map((src, i) => (
          <Link
            key={src}
            href="#"
            data-todo="route-tbd"
            className="relative block aspect-[164/200] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
          >
            <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px) 50vw, 20vw" />
            <span className="sr-only">
              {t('figmaCardLabel', { n: i + 1 })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
