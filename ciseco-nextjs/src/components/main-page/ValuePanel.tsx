import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { getTranslations } from 'next-intl/server'

export async function ValuePanel() {
  const t = await getTranslations('MainPage')
  const sample = [...MAIN_PAGE_ASSETS.products, ...MAIN_PAGE_ASSETS.featured.best.slice(0, 2)]

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#05C368' }}>
            {t('valueEyebrow')}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900 sm:text-xl dark:text-neutral-100">
            {t('valueTitle')}
          </h2>
        </div>
        <a
          href="#"
          data-todo="route-tbd"
          className="text-sm font-medium"
          style={{ color: '#05C368' }}
        >
          {t('viewAll')}
        </a>
        {/* TODO: 벨류업 페이지 신설 후 */}
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="relative aspect-[358/200] w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 lg:max-w-md dark:bg-neutral-800">
          <img src={MAIN_PAGE_ASSETS.decorations.valuePanel} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 to-transparent p-6 text-white">
            <h3 className="text-lg font-bold">{t('valuePanelHeading')}</h3>
            <p className="mt-1 text-sm text-white/90 whitespace-pre-line">{t('valuePanelCopy')}</p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {sample.slice(0, 6).map((src) => (
            <MainProductCard key={src} mode="placeholder" imageUrl={src} compact />
          ))}
        </div>
      </div>
    </section>
  )
}
