import { MainProductCard } from '@/components/main-page/MainProductCard'
import { getMainDisplayProducts } from '@/lib/api/products'
import { getTranslations } from 'next-intl/server'

export async function RecommendedProducts() {
  const t = await getTranslations('MainPage')
  const items = await getMainDisplayProducts('001')

  if (!items.length) {
    return null
  }

  return (
    <section className="product-section container mx-auto px-4 py-8 md:py-[34px] md:pb-[78px]">
      <div className="section-heading mb-5 flex flex-col gap-2">
        <div>
          <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none tracking-[-0.02em] text-kn541-black">
            {t('recommendedEyebrow')}
          </p>
          <h2 className="m-0 text-[16px] font-normal leading-tight text-[#999]">{t('recommendedTitle')}</h2>
        </div>
      </div>
      <div className="product-rail final-rail">
        {items.map((p) => (
          <MainProductCard key={p.product_id} mode="api" product={p} compact />
        ))}
      </div>
    </section>
  )
}
