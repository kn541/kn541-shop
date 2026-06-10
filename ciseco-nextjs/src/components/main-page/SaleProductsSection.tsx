import { MainProductCard } from '@/components/main-page/MainProductCard'
import { ProductRail } from '@/components/main-page/ProductRail'
import { getMainDisplayProducts } from '@/lib/api/products'
import { getTranslations } from 'next-intl/server'

/** 메인 진열 section_code=004 (할인 상품) — 어드민 수동 선택만 표시, 전체보기 없음 */
export async function SaleProductsSection() {
  const t = await getTranslations('MainPage')
  const items = await getMainDisplayProducts('004')

  if (!items.length) {
    return null
  }

  return (
    <section className="product-section sale-product-section container mx-auto px-4 py-8 md:py-[34px] md:pb-[78px]">
      <div className="section-heading mb-5 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none tracking-[-0.02em] text-kn541-black">
            {t('saleEyebrow')}
          </p>
          <h2 className="m-0 text-[16px] font-normal leading-tight text-[#999]">{t('saleTitle')}</h2>
        </div>
      </div>
      <ProductRail>
        {[...items].map((p) => (
          <MainProductCard key={p.product_id} mode="api" product={p} />
        ))}
      </ProductRail>
    </section>
  )
}
