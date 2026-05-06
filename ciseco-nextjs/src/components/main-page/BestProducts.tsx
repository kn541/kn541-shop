import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { getTranslations } from 'next-intl/server'

// TODO: 백엔드 sort=best 추가 후 fetch로 교체 — 현재는 디자인 샘플(플레이스홀더)만 표시

export async function BestProducts() {
  const t = await getTranslations('MainPage')
  const images = MAIN_PAGE_ASSETS.featured.best

  return (
    <section className="bg-neutral-50 py-10 dark:bg-neutral-900/40">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('bestEyebrow')}</p>
            <h2 className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('bestTitle')}</h2>
            <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">{t('bestDescription')}</p>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">{t('bestPlaceholderNote')}</p>
          </div>
          <a
            href="#"
            data-todo="route-tbd"
            className="hidden text-sm font-medium sm:inline"
            style={{ color: '#05C368' }}
          >
            {t('viewAll')}
          </a>
        </div>
        <div className="relative mb-6 hidden aspect-[3/1] max-h-48 overflow-hidden rounded-xl sm:block">
          <img src={images[0]} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.slice(0, 10).map((src) => (
            <MainProductCard key={src} mode="placeholder" imageUrl={src} compact />
          ))}
        </div>
        <button type="button" className="mx-auto mt-8 flex items-center gap-1 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium opacity-70 dark:border-neutral-600" disabled>
          {t('bestLoadMore')}
        </button>
      </div>
    </section>
  )
}
