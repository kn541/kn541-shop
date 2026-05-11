import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { getMainDisplayProducts } from '@/lib/api/products'
import { getTranslations } from 'next-intl/server'

export async function BestProducts() {
  const t = await getTranslations('MainPage')
  const images = MAIN_PAGE_ASSETS.featured.best
  const items = await getMainDisplayProducts('003')

  if (!items.length) {
    return null
  }

  return (
    <section
      className="best-section mt-7 py-16 pb-[84px]"
      style={{
        background: 'linear-gradient(180deg, var(--color-kn541-best-gradient-start, #c9e9aa) 0%, #fff 30%)',
      }}
    >
      <div className="best-inner container mx-auto px-4">
        <div className="best-heading mb-10 flex flex-col gap-6 md:mb-[52px] md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="best-heading-text md:hidden">
            <p className="best-sub-title text-[55px] font-medium leading-none text-kn541-black">{t('bestEyebrow')}</p>
            <h2 className="best-title mt-2 text-[28px] font-semibold tracking-[-0.56px] text-kn541-black">
              {t('bestTitle')}
            </h2>
            <p className="best-description mt-2 text-[16px] font-normal tracking-[-0.32px] text-kn541-black">
              {t('bestDescription')}
            </p>
          </div>
          <div className="section-heading hidden md:flex md:items-start md:justify-between md:gap-8">
            <div>
              <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none text-kn541-black">{t('bestTitle')}</p>
              <p className="text-[16px] font-normal text-[#999]">{t('bestDescription')}</p>
            </div>
          </div>
          <div className="best-heading-image relative shrink-0 md:ml-auto md:min-h-[284px] md:w-[498px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt=""
              className="aspect-[249/142] max-h-[284px] w-full max-w-[498px] object-contain md:mr-[106px]"
            />
          </div>
        </div>
        <div className="best-grid grid grid-cols-2 justify-center gap-x-[55px] gap-y-10 md:grid-cols-4">
          {items.slice(0, 10).map((p) => (
            <MainProductCard key={p.product_id} mode="api" product={p} compact />
          ))}
        </div>
        <button
          type="button"
          className="more-button mx-auto mt-12 flex h-[50px] w-full max-w-[500px] cursor-not-allowed items-center justify-center gap-2 rounded-[5px] border border-[#b5b5b5] text-[16px] font-normal text-kn541-black opacity-70"
          disabled
        >
          {t('bestLoadMore')}
        </button>
      </div>
    </section>
  )
}
