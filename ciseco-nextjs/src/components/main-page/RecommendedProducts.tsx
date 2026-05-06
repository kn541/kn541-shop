import { MainProductCard } from '@/components/main-page/MainProductCard'
import { getRecommendedProductsForMain } from '@/lib/api/products'
import { Link } from '@/shared/link'
import { getTranslations } from 'next-intl/server'

export async function RecommendedProducts() {
  const t = await getTranslations('MainPage')
  const items = await getRecommendedProductsForMain(4)

  if (!items.length) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#05C368' }}>
            {t('recommendedEyebrow')}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900 sm:text-xl dark:text-neutral-100">
            {t('recommendedTitle')}
          </h2>
        </div>
        <Link href="/products" className="text-sm font-medium" style={{ color: '#05C368' }}>
          {t('viewAll')}
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {items.map((p) => (
          <MainProductCard key={p.product_id} mode="api" product={p} compact />
        ))}
      </div>
    </section>
  )
}
